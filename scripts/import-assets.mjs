#!/usr/bin/env node
/**
 * Turns /assets (from download-instagram-assets.py) into Keystatic entries.
 *
 *   assets/work/*.jpg     → content/works/*.yaml     + public/media/works/
 *   assets/designs/*.jpg  → content/designs/*.yaml   + public/media/designs/
 *   assets/events/*.jpg   → public/media/events/  (flyers; appearances are added by hand with dates)
 *   assets/thor/*.jpg     → public/media/thor/    (listed for settings/about)
 *   assets/captions.json  → caption, date, instagramUrl
 *
 * Existing entries are never overwritten. Images are re-encoded to a sane
 * max size so the repo and next/image stay fast. Alt text is left as TODO —
 * write it in Keystatic; the site treats it as required.
 *
 *   npm run import:assets            # import everything new
 *   npm run import:assets -- --clean # also delete the placeholder seed entries
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import sharp from 'sharp';
import { stringify } from 'yaml';

const ROOT = 'assets';
if (!existsSync(ROOT)) { console.error('No /assets directory. Run download-instagram-assets.py first.'); process.exit(1); }
const captions = existsSync(join(ROOT, 'captions.json')) ? JSON.parse(readFileSync(join(ROOT, 'captions.json'), 'utf8')) : {};
const clean = process.argv.includes('--clean');
const MAX = 2400;

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const firstLine = (cap) => (cap || '').split('\n').map((l) => l.trim()).filter(Boolean)[0] ?? '';

/**
 * Turns a file name into something worth showing. `ghostface-forearm.jpg`
 * becomes "Ghostface Forearm"; camera junk like `IMG_4821` or `PXL_20250103_20`
 * yields nothing, so the caller can fall back rather than publish a title that
 * has to be retyped. Naming files before import is the single biggest
 * time-saver, so this rewards it and refuses to dress up the alternative.
 */
const SMALL = new Set(['a', 'an', 'and', 'at', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
const prettyName = (base) => {
  const cleaned = base
    .replace(/^(img|dsc|dscf|pxl|vid|photo|image|screenshot|insta|post)[-_ ]?/i, '')
    .replace(/[-_]?\d{6,}([-_]\d+)*$/g, '')          // trailing timestamps / burst numbers
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || !/[a-z]{2}/i.test(cleaned)) return '';   // all digits or junk
  return cleaned
    .split(' ')
    .map((w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase()
      : w === w.toUpperCase() && w.length > 1 ? w          // keep acronyms
      : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
};

const titleFrom = (cap, base) => {
  const l = firstLine(cap).replace(/[#@][\w.]+/g, '').replace(/[^\w\s'&-]/g, ' ').replace(/\s+/g, ' ').trim();
  const t = l.split(/[.!?]/)[0].trim();
  if (t && t.length <= 60) return t;
  return prettyName(base) || base;
};
const styleGuess = (cap) => {
  const c = (cap || '').toLowerCase(); const s = [];
  if (/black ?(and|&|n) ?gr[ae]y|blackandgrey|bng/.test(c)) s.push('black-and-grey');
  if (/\bcolou?r\b/.test(c)) s.push('color');
  if (/horror|slasher|ghostface|creepy|scary/.test(c)) s.push('horror');
  if (/comic/.test(c)) s.push('comic');
  if (/woodblock|woodcut/.test(c)) s.push('woodblock');
  if (/surreal/.test(c)) s.push('bio-surreal');
  if (/pin ?up/.test(c)) s.push('pinup');
  if (/flash/.test(c)) s.push('flash');
  if (/cute|playful|kawaii|ghost cat/.test(c)) s.push('playful');
  if (/illustrat/.test(c) || s.length === 0) s.push('illustrative');
  return [...new Set(s)];
};

if (clean) {
  for (const d of ['content/works', 'content/designs']) for (const f of readdirSync(d)) rmSync(join(d, f));
  for (const d of ['public/media/works', 'public/media/designs']) for (const f of readdirSync(d)) rmSync(join(d, f));
  console.log('Removed seed entries.');
}

async function copy(src, outDir) {
  mkdirSync(outDir, { recursive: true });
  const name = basename(src, extname(src)) + '.jpg';
  const out = join(outDir, name);
  if (!existsSync(out)) await sharp(src).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  const m = await sharp(out).metadata();
  return { name, ar: (m.width ?? 1) / (m.height ?? 1) };
}

let n = 0;
for (const [folder, kind] of [['work', 'works'], ['designs', 'designs']]) {
  const dir = join(ROOT, folder);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => /\.(jpe?g|png|webp)$/i.test(x))) {
    const meta = captions[f] ?? captions[basename(f, extname(f)) + '.jpg'] ?? {};
    const cap = meta.caption ?? '';
    const base = basename(f, extname(f));
    const slug = slugify(titleFrom(cap, base)) || base.toLowerCase();
    const yamlPath = join('content', kind, `${slug}.yaml`);
    if (existsSync(yamlPath)) continue;
    const { name, ar } = await copy(join(dir, f), join('public/media', kind));
    const date = (meta.date ?? '').slice(0, 10) || null;
    const year = date ? Number(date.slice(0, 4)) : new Date().getFullYear();
    const entry = kind === 'works'
      ? { title: titleFrom(cap, base), year, type: 'tattoo', styles: styleGuess(cap), image: name, alt: 'TODO: describe this piece', medium: 'Tattoo', placement: '', status: 'healed', caption: cap, featured: false, featuredOrder: 50, hero: false, span: ar > 1.2 ? '2' : '1', product: null, design: null, instagramUrl: meta.url ?? null, date }
      : { title: titleFrom(cap, base), image: name, alt: 'TODO: describe this design', note: cap, colorOptions: ['color', 'black-and-grey'], placementIdeas: '', repeatable: false, status: 'available', tattooedWork: null, instagramUrl: meta.url ?? null, order: 50 };
    writeFileSync(yamlPath, stringify(entry));
    n++; console.log('+', kind, slug);
  }
}
for (const [folder, out] of [['events', 'public/media/events'], ['thor', 'public/media/thor']]) {
  const dir = join(ROOT, folder);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => /\.(jpe?g|png|webp)$/i.test(x))) { const { name } = await copy(join(dir, f), out); console.log('·', folder, name); }
}
if (existsSync(join(ROOT, 'video'))) { mkdirSync('public/media/video', { recursive: true }); for (const f of readdirSync(join(ROOT, 'video')).filter((x) => /\.(mp4|mov|webm|m4v)$/i.test(x))) { const o = join('public/media/video', f); if (!existsSync(o)) writeFileSync(o, readFileSync(join(ROOT, 'video', f))); console.log('·', 'video', f); } }

console.log(`\n${n} entries created. Next: open /keystatic, write alt text, set featured/hero, fix types (design/original/print/live-event) and styles.`);
