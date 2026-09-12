import 'server-only';
import { Redis } from '@upstash/redis';

/**
 * Live stock lives in Upstash Redis (atomic DECR) so two buyers can't both take
 * the last print. Keystatic's `inventory` is the seed value; `sold` is a manual
 * override. Without Redis env vars this falls back to an in-process map so the
 * site still runs locally and on preview deploys.
 */
const KEY = (slug: string) => `stock:${slug}`;
const memory = new Map<string, number>();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

export const stockBackend = redis ? 'redis' : 'memory';

/** Current stock. Seeds from Keystatic on first read. */
export async function getStock(slug: string, seed: number): Promise<number> {
  if (redis) {
    const v = await redis.get<number>(KEY(slug));
    if (v === null || v === undefined) {
      await redis.set(KEY(slug), seed, { nx: true });
      return (await redis.get<number>(KEY(slug))) ?? seed;
    }
    return v;
  }
  if (!memory.has(slug)) memory.set(slug, seed);
  return memory.get(slug)!;
}

/** Atomically take `qty`. Returns remaining, or null if there wasn't enough. */
export async function takeStock(slug: string, seed: number, qty = 1): Promise<number | null> {
  if (redis) {
    await redis.set(KEY(slug), seed, { nx: true });
    const left = await redis.decrby(KEY(slug), qty);
    if (left < 0) {
      await redis.incrby(KEY(slug), qty);
      return null;
    }
    return left;
  }
  const cur = await getStock(slug, seed);
  if (cur < qty) return null;
  memory.set(slug, cur - qty);
  return cur - qty;
}

/** Manual reset (used by the README's "mark sold / restock" instructions). */
export async function setStock(slug: string, qty: number) {
  if (redis) await redis.set(KEY(slug), qty);
  else memory.set(slug, qty);
}
