import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import { imageMeta, MEDIA } from './images';

export const reader = createReader(process.cwd(), keystaticConfig);

/** Keystatic returns null for empty number/text fields; the site wants values. */
const num = (v: number | null | undefined, d = 0) => (typeof v === 'number' ? v : d);
const str = (v: string | null | undefined, d = '') => v ?? d;

export async function getSettings() {
  const s = await reader.singletons.settings.read();
  if (!s) throw new Error('content/settings.yaml is missing');
  return {
    ...s,
    artistName: str(s.artistName, 'Thor Becker'),
    brandName: str(s.brandName, 'Lampkey Artery'),
    statement: str(s.statement),
    studioName: str(s.studioName),
    studioCity: str(s.studioCity, 'Fullerton, CA'),
    region: str(s.region, 'Orange County'),
    homeCity: str(s.homeCity, 'Lake Elsinore, CA'),
    email: str(s.email, 'lampkeyart@gmail.com'),
    thanksLine: str(s.thanksLine, 'Thanks for looking.'),
    thorPhotoAlt: str(s.thorPhotoAlt),
    homeIntro: str(s.homeIntro),
    depositAmount: str(s.depositAmount),
    depositNote: str(s.depositNote),
    cancellationNote: str(s.cancellationNote),
    shippingFlatCents: num(s.shippingFlatCents, 1500),
    shipsFrom: str(s.shipsFrom, 'Lake Elsinore, CA'),
    shippingNote: str(s.shippingNote),
    instagramMain: str(s.instagramMain),
    instagramDesigns: str(s.instagramDesigns),
    inquiryIntro: str(s.inquiryIntro),
    thorImg: await imageMeta(s.thorPhoto, MEDIA.thor),
  };
}
export const getAbout = () => reader.singletons.about.read();
export const getBooking = () => reader.singletons.booking.read();

async function normWork(slug: string, e: Awaited<ReturnType<typeof reader.collections.works.read>> & {}) {
  return {
    slug,
    ...e,
    year: num(e.year, new Date().getFullYear()),
    medium: str(e.medium),
    placement: str(e.placement),
    caption: str(e.caption),
    alt: str(e.alt),
    featuredOrder: num(e.featuredOrder, 50),
    span: str(e.span, '1'),
    date: str(e.date),
    img: await imageMeta(e.image, MEDIA.works),
  };
}

export async function getWorks() {
  const all = await reader.collections.works.all();
  const list = await Promise.all(all.map(({ slug, entry }) => normWork(slug, entry)));
  // Newest first; stable, because the catalogue numbers come from this order.
  return list.sort((a, b) => b.year - a.year || b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
export async function getWork(slug: string) {
  const e = await reader.collections.works.read(slug);
  return e ? normWork(slug, e) : null;
}
export async function getFeaturedWorks() {
  const all = await getWorks();
  return all.filter((w) => w.featured).sort((a, b) => a.featuredOrder - b.featuredOrder).slice(0, 12);
}
export async function getHeroWork() {
  const all = await getWorks();
  return all.find((w) => w.hero) ?? all.find((w) => w.featured) ?? all[0] ?? null;
}

async function normDesign(slug: string, e: Awaited<ReturnType<typeof reader.collections.designs.read>> & {}) {
  return { slug, ...e, alt: str(e.alt), note: str(e.note), placementIdeas: str(e.placementIdeas), order: num(e.order, 50), img: await imageMeta(e.image, MEDIA.designs, 'paper') };
}
export async function getDesigns() {
  const all = await reader.collections.designs.all();
  const list = await Promise.all(all.map(({ slug, entry }) => normDesign(slug, entry)));
  return list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
export async function getDesign(slug: string) {
  const e = await reader.collections.designs.read(slug);
  return e ? normDesign(slug, e) : null;
}

async function normProduct(slug: string, e: Awaited<ReturnType<typeof reader.collections.products.read>> & {}) {
  return {
    slug,
    ...e,
    priceCents: num(e.priceCents, 0),
    inventory: num(e.inventory, e.kind === 'original' ? 1 : 0),
    framingCents: num(e.framingCents, 0),
    edition: str(e.edition),
    size: str(e.size),
    medium: str(e.medium),
    description: str(e.description),
    year: num(e.year, 0),
    imgs: await Promise.all(e.images.map(async (i) => ({ alt: str(i.alt), img: await imageMeta(i.image, MEDIA.products, 'paper') }))),
  };
}
export async function getProducts() {
  const all = await reader.collections.products.all();
  const list = await Promise.all(all.map(({ slug, entry }) => normProduct(slug, entry)));
  return list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));
}
export async function getProduct(slug: string) {
  const e = await reader.collections.products.read(slug);
  return e ? normProduct(slug, e) : null;
}

export async function getAppearances({ upcomingOnly = true } = {}) {
  const all = await reader.collections.appearances.all();
  const today = new Date().toISOString().slice(0, 10);
  const list = await Promise.all(
    all
      .map(({ slug, entry }) => ({ slug, ...entry, date: str(entry.date), venue: str(entry.venue), city: str(entry.city), time: str(entry.time), note: str(entry.note), flyerAlt: str(entry.flyerAlt) }))
      .filter((a) => !a.hidden && a.date && (!upcomingOnly || (a.endDate ?? a.date) >= today))
      .map(async (a) => ({ ...a, flyerImg: await imageMeta(a.flyer, MEDIA.events, 'paper') })),
  );
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTestimonials() {
  const all = await reader.collections.testimonials.all();
  return all.map(({ slug, entry }) => ({ slug, ...entry, handle: str(entry.handle) })).filter((t) => t.visible && t.quote);
}

export async function getSocials() {
  const all = await reader.collections.socials.all();
  return all
    .map(({ slug, entry }) => ({ slug, ...entry, label: str(entry.label), handle: str(entry.handle), order: num(entry.order, 50) }))
    .filter((s): s is typeof s & { url: string } => Boolean(s.visible && s.url))
    .sort((a, b) => a.order - b.order);
}

export type Work = Awaited<ReturnType<typeof getWorks>>[number];
export type Design = Awaited<ReturnType<typeof getDesigns>>[number];
export type Product = Awaited<ReturnType<typeof getProducts>>[number];
export type Appearance = Awaited<ReturnType<typeof getAppearances>>[number];
export type Social = Awaited<ReturnType<typeof getSocials>>[number];
export type Settings = Awaited<ReturnType<typeof getSettings>>;

export const STYLE_LABELS: Record<string, string> = {
  'black-and-grey': 'Black & grey', color: 'Color', illustrative: 'Illustrative', horror: 'Horror',
  playful: 'Playful', comic: 'Comic', woodblock: 'Woodblock', 'bio-surreal': 'Bio-surreal', pinup: 'Pinup', flash: 'Flash',
};
export const TYPE_LABELS: Record<string, string> = {
  tattoo: 'Tattoos', design: 'Designs', original: 'Originals', print: 'Prints', 'live-event': 'Live event',
};
export const STATUS_LABELS: Record<string, string> = {
  healed: 'Healed', fresh: 'Fresh', available: 'Available', sold: 'Sold', 'print-available': 'Print available',
};
export const KIND_LABELS: Record<string, string> = {
  'flash-day': 'Flash day', 'life-drawing': 'Life drawing', 'guest-spot': 'Guest spot', convention: 'Convention', fundraiser: 'Fundraiser', other: 'Event',
};

export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

export const catalogueNo = (i: number) => `No. ${String(Math.max(0, i) + 1).padStart(3, '0')}`;
