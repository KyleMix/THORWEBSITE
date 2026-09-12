import 'server-only';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export type ImgMeta = { src: string; width: number; height: number; blur: string; ar: number };

/** Where each collection's uploads live, matching keystatic.config.tsx. */
export const MEDIA = {
  works: '/media/works',
  designs: '/media/designs',
  products: '/media/products',
  events: '/media/events',
  thor: '/media/thor',
} as const;

const PLACEHOLDER: Record<string, ImgMeta> = {
  skin: { src: '/media/placeholders/skin-4x5.jpg', width: 1600, height: 2000, blur: '', ar: 0.8 },
  paper: { src: '/media/placeholders/paper-4x5.jpg', width: 1600, height: 2000, blur: '', ar: 0.8 },
};

const cache = new Map<string, Promise<ImgMeta>>();

/**
 * Keystatic's reader returns the stored value of an image field, which is a
 * bare filename for entries written by hand and may be a full public path for
 * entries written by the Keystatic UI. Resolve both against the collection's
 * media directory so either shape works.
 */
export function imageMeta(value: string | null | undefined, base: string = MEDIA.works, material: 'skin' | 'paper' = 'skin'): Promise<ImgMeta> {
  if (!value) return Promise.resolve(PLACEHOLDER[material]);
  const src = value.startsWith('/') ? value : `${base}/${value}`;
  let p = cache.get(src);
  if (!p) {
    p = compute(src).catch(() => ({ ...PLACEHOLDER[material], src }));
    cache.set(src, p);
  }
  return p;
}

async function compute(src: string): Promise<ImgMeta> {
  const sharp = (await import('sharp')).default;
  const buf = await readFile(path.join(process.cwd(), 'public', src));
  const img = sharp(buf);
  const meta = await img.metadata();
  const width = meta.width ?? 1600;
  const height = meta.height ?? 2000;
  const tiny = await img.resize(16, undefined, { fit: 'inside' }).webp({ quality: 40 }).toBuffer();
  return { src, width, height, blur: `data:image/webp;base64,${tiny.toString('base64')}`, ar: width / height };
}
