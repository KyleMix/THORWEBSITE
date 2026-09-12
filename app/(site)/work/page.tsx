import type { Metadata } from 'next';
import Link from 'next/link';
import { getWorks, getSettings, STYLE_LABELS, TYPE_LABELS, STATUS_LABELS, catalogueNo } from '@/lib/content';
import { Gallery } from '@/components/Gallery';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Tattoos, available designs, original drawings, prints and live event work by Thor Becker — EngineerInk, Fullerton, CA.',
  alternates: { canonical: '/work' },
};

type SP = { type?: string; style?: string };

export default async function WorkPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [all, s] = await Promise.all([getWorks(), getSettings()]);
  const type = sp.type && TYPE_LABELS[sp.type] ? sp.type : null;
  const style = sp.style && STYLE_LABELS[sp.style] ? sp.style : null;
  const items = all.filter((w) => (!type || w.type === type) && (!style || w.styles.includes(style as never)));
  const q = (t: string | null, st: string | null) => {
    const p = new URLSearchParams();
    if (t) p.set('type', t);
    if (st) p.set('style', st);
    const str = p.toString();
    return `/work${str ? `?${str}` : ''}`;
  };
  const years = items.length ? `${Math.min(...items.map((w) => w.year))}–${Math.max(...items.map((w) => w.year))}` : '—';

  return (
    <section className="wrap" data-material="skin" style={{ paddingTop: 'calc(var(--nav-h) + var(--s4))', paddingBottom: 'var(--s6)' }}>
      {/* Masthead, set like a catalogue title page */}
      <header className="masthead">
        <h1 className="display masthead-title">The work.</h1>
        <dl className="masthead-meta">
          <div><dt>Catalogue</dt><dd>{String(items.length).padStart(3, '0')} of {String(all.length).padStart(3, '0')}</dd></div>
          <div><dt>Years</dt><dd>{years}</dd></div>
          <div><dt>Studio</dt><dd>{s.studioName}</dd></div>
          <div><dt>Located</dt><dd>{s.studioCity}</dd></div>
        </dl>
      </header>

      <nav className="filters-block" aria-label="Filter the catalogue">
        <div className="filters">
          <span className="sep mono">Type</span>
          <Link href={q(null, style)} aria-current={!type ? 'true' : undefined}>All</Link>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <Link key={k} href={q(k, style)} aria-current={type === k ? 'true' : undefined}>{v}</Link>
          ))}
        </div>
        <div className="filters">
          <span className="sep mono">Style</span>
          {Object.entries(STYLE_LABELS).map(([k, v]) => (
            <Link key={k} href={q(type, style === k ? null : k)} aria-current={style === k ? 'true' : undefined}>{v}</Link>
          ))}
          {(type || style) && <Link href="/work" className="clear">Clear ✕</Link>}
        </div>
      </nav>

      <div style={{ marginTop: 'var(--s4)' }}>
        <Gallery
          inquiryHref="/book"
          items={items.map((w) => ({
            slug: w.slug, title: w.title, year: w.year, medium: w.medium, placement: w.placement, alt: w.alt, img: w.img,
            status: w.status, statusLabel: STATUS_LABELS[w.status], caption: w.caption, span: w.span, product: w.product, type: w.type,
            no: catalogueNo(all.findIndex((x) => x.slug === w.slug)),
          }))}
        />
      </div>

      <p className="mono" style={{ marginTop: 'var(--s6)', textAlign: 'center' }}>{s.thanksLine}</p>
    </section>
  );
}
