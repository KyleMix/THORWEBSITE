#!/usr/bin/env node
/**
 * Precomputes dimensions and blur placeholders for everything in /public/media.
 *
 * lib/images.ts used to read each file with sharp on demand. That is fine at
 * build time, but the shop pages revalidate, and on Vercel a serverless
 * function does not have /public on its filesystem — those files are served
 * from the CDN. The read would throw, the catch would swallow it, and product
 * images would quietly turn into placeholder plates a minute after launch.
 *
 * Baking the metadata into a JSON module removes the filesystem from the
 * request path entirely, and makes revalidation cheaper than it was.
 *
 *   npm run build   (runs automatically via prebuild)
 */
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, posix } from 'node:path';

const ROOT = 'public/media';
const OUT = 'lib/image-manifest.json';

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.(jpe?g|png|webp|avif)$/i.test(name) ? [p] : [];
  });
}

const manifest = {};
for (const file of walk(ROOT)) {
  const src = '/' + posix.join(...file.split(/[\\/]/).slice(1));   // public/media/x -> /media/x
  const img = sharp(file);
  const meta = await img.metadata();
  const width = meta.width ?? 1600;
  const height = meta.height ?? 2000;
  const tiny = await img.resize(16, undefined, { fit: 'inside' }).webp({ quality: 40 }).toBuffer();
  manifest[src] = { src, width, height, ar: width / height, blur: `data:image/webp;base64,${tiny.toString('base64')}` };
}

writeFileSync(OUT, JSON.stringify(manifest, null, 0));
console.log(`image manifest: ${Object.keys(manifest).length} entries -> ${OUT}`);
