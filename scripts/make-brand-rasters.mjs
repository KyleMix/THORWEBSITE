#!/usr/bin/env node
/**
 * Rasterises the brush ring once at build-authoring time.
 *
 * The mark is drawn as arcs roughened by an SVG turbulence filter. Inline that
 * is cheap at 26px in the header, but at 340px behind the cover name the
 * filter costs real paint time on a phone. The two large, always-on-black uses
 * therefore ship as transparent PNGs instead; the small, material-inverting
 * one stays inline so it can take currentColor.
 *
 *   npm run brand:raster      # after editing public/brand/*.svg
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const WHITE = '#F4F2ED';

// WebP, because these are decorative and every byte here is a byte the hero
// image is not getting on a throttled connection.
for (const [src, out, width] of [
  ['public/brand/enso.svg', 'public/brand/enso-ring.webp', 760],
  ['public/brand/mark.svg', 'public/brand/enso-mark.webp', 440],
]) {
  const svg = readFileSync(src, 'utf8').replaceAll('currentColor', WHITE);
  await sharp(Buffer.from(svg), { density: 300 })
    .resize({ width })
    .webp({ quality: 72, alphaQuality: 80, effort: 6 })
    .toFile(out);
  console.log('wrote', out);
}
