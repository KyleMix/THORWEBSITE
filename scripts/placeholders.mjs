/**
 * Honest placeholder plates so the site builds, lays out and reads correctly
 * before /assets exists. Each is a flat, material-matched panel carrying print
 * registration marks and its own dimensions — clearly a slot, never mistaken
 * for artwork. Replaced wholesale by `npm run import:assets`.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/media/placeholders';
mkdirSync(OUT, { recursive: true });

// Just the two lib/images.ts falls back to when a file is missing. The seeded
// plate set they replaced is gone now that the real work is in.
const specs = [
  ['skin-4x5', 1600, 2000, 'skin'],
  ['paper-4x5', 1600, 2000, 'paper'],
];

const colors = {
  skin: { bg: '#0D0D0D', mark: '#5E5C58', text: '#8A8780' },
  paper: { bg: '#E8E5DE', mark: '#A09C93', text: '#6B6760' },
};

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

for (const [name, w, h, mat] of specs) {
  const c = colors[mat];
  const u = Math.min(w, h);
  const sw = Math.max(2, u * 0.0022);      // stroke
  const m = u * 0.05;                       // margin
  const tick = u * 0.045;                   // registration tick length
  const fs = u * 0.028;
  const g = gcd(w, h);
  const ratio = `${w / g}:${h / g}`;
  const cx = w / 2, cy = h / 2;
  const r = u * 0.055;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${c.bg}"/>
  <g stroke="${c.mark}" stroke-width="${sw}" fill="none">
    <path d="M${m} ${m + tick} V${m} H${m + tick}"/>
    <path d="M${w - m - tick} ${m} H${w - m} V${m + tick}"/>
    <path d="M${w - m} ${h - m - tick} V${h - m} H${w - m - tick}"/>
    <path d="M${m + tick} ${h - m} H${m} V${h - m - tick}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}"/>
    <path d="M${cx - r * 1.7} ${cy} H${cx + r * 1.7} M${cx} ${cy - r * 1.7} V${cy + r * 1.7}"/>
  </g>
  <text x="${cx}" y="${cy + r * 3.4}" text-anchor="middle" font-family="monospace" font-size="${fs}" fill="${c.text}" letter-spacing="${fs * 0.22}">PLATE PENDING</text>
  <text x="${m}" y="${h - m - fs * 0.6}" font-family="monospace" font-size="${fs * 0.82}" fill="${c.text}" letter-spacing="${fs * 0.14}">${w} × ${h}</text>
  <text x="${w - m}" y="${h - m - fs * 0.6}" text-anchor="end" font-family="monospace" font-size="${fs * 0.82}" fill="${c.text}" letter-spacing="${fs * 0.14}">${ratio}</text>
  </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
  console.log('wrote', name, `${w}x${h}`);
}
