#!/usr/bin/env node
/**
 * Turns Thor's supplied logo files into the three slots the site uses.
 *
 *   npm run brand:prepare
 *
 * He supplied two PNGs:
 *   · the lockup — white brush ring + @theLAMPKEYARTERY + roots, on SOLID BLACK
 *   · the emblem — the raven/lamp illustration, black artwork on transparent
 *
 * The lockup's black background would render as a black card on the site's
 * light material, so it is keyed out here: the artwork is white line on black,
 * which means its own luminance is exactly the alpha channel it needs. RGB is
 * then forced to the site's chalk so the mark matches the type beside it, and
 * the antialiased brush edges survive as partial alpha rather than a hard
 * cutout.
 *
 * The ring alone is cropped out of the keyed lockup by reading the row-wise
 * alpha profile and cutting at the gap above the handle text, so the header
 * mark is Thor's actual brush stroke and not a redrawn approximation.
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';

const CHALK = { r: 244, g: 242, b: 237 };
const SRC_LOCKUP = 'public/brand/src-lockup.png';
const SRC_EMBLEM = 'public/brand/src-emblem.png';

if (!existsSync(SRC_LOCKUP) || !existsSync(SRC_EMBLEM)) {
  console.error(`Expected ${SRC_LOCKUP} and ${SRC_EMBLEM}. See public/brand/README.md.`);
  process.exit(1);
}

/** White-on-black line art -> chalk-on-transparent. Luminance becomes alpha. */
async function keyBlack(src) {
  const img = sharp(src).ensureAlpha();
  const { width, height } = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    // Rec. 709 luminance of the source pixel is how bright the brush was there.
    const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const a = Math.round(Math.min(1, lum * 1.08) * 255);   // slight lift; the scan is not pure white
    out[o] = CHALK.r; out[o + 1] = CHALK.g; out[o + 2] = CHALK.b; out[o + 3] = a;
  }
  return sharp(out, { raw: { width, height, channels: 4 } }).png();
}

/** Trim fully transparent margins and report the box that was kept. */
async function tightCrop(buf) {
  const img = sharp(buf);
  const { width, height } = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  let top = height, left = width, right = 0, bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * info.channels + 3] > 24) {
        if (y < top) top = y; if (y > bottom) bottom = y;
        if (x < left) left = x; if (x > right) right = x;
      }
    }
  }
  return img.extract({ left, top, width: right - left + 1, height: bottom - top + 1 }).png();
}

/**
 * The ring alone.
 *
 * The lockup's row-wise alpha has a clear shape: the ring's mass to about 77%
 * of the height, a quiet band, a spike where the handle text sits at ~82%, then
 * roots trailing thinly to the bottom. Taking the minimum over a wide lower
 * window fails, because the roots region is quieter than the gap and the cut
 * lands below the text. So find the text instead — the first trough that is
 * followed by a clear rise — and cut there.
 */
async function ringOnly(buf) {
  const img = sharp(buf);
  const { width, height } = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const raw = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    let n = 0;
    for (let x = 0; x < width; x++) if (data[(y * width + x) * info.channels + 3] > 40) n++;
    raw[y] = n;
  }
  const smooth = raw.map((_, y) => {
    let sum = 0, n = 0;
    for (let k = -8; k <= 8; k++) { const i = y + k; if (i >= 0 && i < height) { sum += raw[i]; n++; } }
    return sum / n;
  });
  const look = Math.round(height * 0.08);
  let cut = height;
  for (let y = Math.floor(height * 0.6); y < height - look; y++) {
    const here = smooth[y];
    if (here > Math.max(...smooth) * 0.3) continue;            // still in the ring's mass
    let rises = false;
    for (let k = 1; k <= look; k++) if (smooth[y + k] > here * 1.6 + 5) { rises = true; break; }
    if (rises) { cut = y; break; }                              // a trough with the text below it
  }
  return sharp(buf).extract({ left: 0, top: 0, width, height: cut }).png();
}

const keyed = await (await keyBlack(SRC_LOCKUP)).toBuffer();
const lockup = await (await tightCrop(keyed)).toBuffer();
await sharp(lockup).resize({ width: 420 }).webp({ quality: 74, alphaQuality: 82, effort: 6 }).toFile('public/brand/lockup.webp');

const ring = await (await tightCrop(await (await ringOnly(lockup)).toBuffer())).toBuffer();
// Two sizes. The brush texture is expensive to encode with alpha, and the ring
// is used at 30px in the header and as a 9%-opacity watermark — neither needs
// the detail a 900px file carries, and at 321 KB it was the heaviest resource
// on the home page by a factor of six.
// Source for next/image, which generates the per-viewport AVIF/WebP variants;
// what ships to the browser is a fraction of this.
await sharp(ring).resize({ width: 900 }).webp({ quality: 80, alphaQuality: 86, effort: 6 }).toFile('public/brand/ring.webp');
await sharp(ring).resize({ width: 72 }).webp({ quality: 82, alphaQuality: 88, effort: 6 }).toFile('public/brand/ring-sm.webp');

// Favicon: the ring on a black plate, because the mark is light linework and
// disappears on a light browser tab. Kept small and palette-quantised — at
// 512px the brush texture encoded to 131 KB, which made the favicon the
// heaviest resource on every page.
await sharp({ create: { width: 96, height: 96, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
  .composite([{ input: await sharp(ring).resize(82, 82, { fit: 'inside' }).toBuffer(), gravity: 'center' }])
  .flatten({ background: '#000000' })
  .png({ compressionLevel: 9, palette: true, colours: 32 }).toFile('app/icon.png');

// The emblem is already black-artwork-on-transparent, which is what the light
// material wants. It is used on chalk only; on black its ring disappears.
const emblem = await (await tightCrop(await sharp(SRC_EMBLEM).ensureAlpha().png().toBuffer())).toBuffer();
await sharp(emblem).resize({ width: 1000 }).webp({ quality: 88, alphaQuality: 92, effort: 6 }).toFile('public/brand/emblem.webp');

for (const f of ['ring-sm.webp', 'ring.webp', 'lockup.webp', 'emblem.webp', '../../app/icon.png']) {
  const m = await sharp('public/brand/' + f).metadata();
  console.log(`${f.padEnd(14)} ${String(m.width).padStart(5)}x${String(m.height).padEnd(5)} ${(m.size / 1024).toFixed(0).padStart(5)} KB`);
}
