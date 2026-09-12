import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWork, getWorks, getSettings, STATUS_LABELS, STYLE_LABELS, catalogueNo } from '@/lib/content';
import { abs } from '@/lib/site';
import { Pic } from '@/components/Pic';
import { JsonLd } from '@/components/JsonLd';

export async function generateStaticParams() { return (await getWorks()).map((w) => ({ slug: w.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWork(slug);
  if (!w) return {};
  const desc = w.caption?.slice(0, 160) || `${w.medium} · ${w.placement}`;
  return {
    title: w.title,
    description: desc,
    alternates: { canonical: `/work/${w.slug}` },
    openGraph: { title: w.title, description: desc, images: [{ url: abs(w.img.src), width: w.img.width, height: w.img.height, alt: w.alt }] },
    twitter: { card: 'summary_large_image', images: [abs(w.img.src)] },
  };
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [w, all, s] = await Promise.all([getWork(slug), getWorks(), getSettings()]);
  if (!w) notFound();
  const i = all.findIndex((x) => x.slug === slug);
  const prev = all[(i - 1 + all.length) % all.length], next = all[(i + 1) % all.length];
  const ld = {
    '@context': 'https://schema.org', '@type': 'VisualArtwork', name: w.title, image: abs(w.img.src), dateCreated: String(w.year),
    artMedium: w.medium, artform: w.type === 'tattoo' ? 'Tattoo' : 'Drawing', creator: { '@type': 'Person', name: s.artistName }, description: w.caption,
  };
  return (
    <>
      <section className="wrap" data-material="skin" style={{ paddingTop: 'calc(var(--nav-h) + var(--s3))', paddingBottom: 'var(--s6)' }}>
        <div className="running-head"><span className="mono">{catalogueNo(i)}</span><span className="mono"><Link href={`/work/${prev.slug}`}>← Prev</Link> · <Link href="/work">Index</Link> · <Link href={`/work/${next.slug}`}>Next →</Link></span></div>
        <div className="pdp" style={{ marginTop: 'var(--s4)' }}>
          <div className="plate-img"><Pic img={w.img} alt={w.alt} sizes="(min-width: 60rem) 58vw, 100vw" priority /></div>
          <div className="pdp-info">
            <h1 className="ttl">{w.title}</h1>
            <dl className="spec">
              <dt>Year</dt><dd>{w.year}</dd>
              <dt>Medium</dt><dd>{w.medium || '—'}</dd>
              <dt>{w.type === 'tattoo' ? 'Placement' : 'Size'}</dt><dd>{w.placement || '—'}</dd>
              <dt>Status</dt><dd>{STATUS_LABELS[w.status]}</dd>
              {w.styles.length > 0 && <><dt>Style</dt><dd>{w.styles.map((k) => STYLE_LABELS[k]).join(', ')}</dd></>}
            </dl>
            {w.caption && <p className="caption">{w.caption}</p>}
            <div className="buy">
              {w.product ? <Link href={`/shop/${w.product}`} className="action action-fill">Buy <span className="arrow">→</span></Link>
                : <Link href={`/book?type=${w.type === 'tattoo' ? 'tattoo' : 'commission'}&about=${encodeURIComponent(w.title)}`} className="action">Inquire about something like this <span className="arrow">→</span></Link>}
              {w.design && <Link href={`/designs/${w.design}`} className="mono link">Started as a design →</Link>}
              {w.instagramUrl && <a href={w.instagramUrl} target="_blank" rel="noopener" className="mono link">On Instagram →</a>}
            </div>
          </div>
        </div>
      </section>
      <JsonLd data={ld} />
    </>
  );
}
