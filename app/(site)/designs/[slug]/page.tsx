import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDesign, getDesigns, getSettings } from '@/lib/content';
import { abs } from '@/lib/site';
import { Pic } from '@/components/Pic';
import { JsonLd } from '@/components/JsonLd';

export async function generateStaticParams() { return (await getDesigns()).map((d) => ({ slug: d.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const d = await getDesign(slug); if (!d) return {};
  return { title: `${d.title} — available design`, description: d.note?.slice(0, 160), alternates: { canonical: `/designs/${d.slug}` },
    openGraph: { title: d.title, description: d.note?.slice(0, 160), images: [{ url: abs(d.img.src), width: d.img.width, height: d.img.height, alt: d.alt }] }, twitter: { card: 'summary_large_image', images: [abs(d.img.src)] } };
}

export default async function DesignDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [d, s] = await Promise.all([getDesign(slug), getSettings()]);
  if (!d) notFound();
  const label = { available: 'Available', claimed: 'Claimed', tattooed: 'Tattooed' } as const;
  return (
    <>
      <section className="wrap" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s3))', paddingBottom: 'var(--s6)' }}>
        <div className="running-head"><span className="mono">Available design</span><Link href="/designs" className="mono link">← All designs</Link></div>
        <div className="pdp" style={{ marginTop: 'var(--s4)' }}>
          <div className="plate-img" style={{ background: 'var(--paper-2)' }}><Pic img={d.img} alt={d.alt} sizes="(min-width: 60rem) 58vw, 100vw" priority /></div>
          <div className="pdp-info">
            <h1 className="ttl">{d.title}</h1>
            <dl className="spec">
              <dt>Status</dt><dd>{label[d.status]}</dd>
              <dt>Can be done in</dt><dd>{d.colorOptions.map((c) => (c === 'color' ? 'Color' : 'Black & grey')).join(' or ')}</dd>
              {d.placementIdeas && <><dt>Placement ideas</dt><dd>{d.placementIdeas}</dd></>}
              <dt>Repeatable</dt><dd>{d.repeatable ? 'Yes — can be tattooed more than once' : 'No — one person gets it'}</dd>
            </dl>
            {d.note && <p className="caption">{d.note}</p>}
            <div className="buy">
              {d.status === 'available' ? (
                <Link href={`/book?type=tattoo&design=${encodeURIComponent(d.title)}#inquiry`} className="action action-fill">Claim this design <span className="arrow">→</span></Link>
              ) : d.status === 'tattooed' && d.tattooedWork ? (
                <Link href={`/work/${d.tattooedWork}`} className="action">See the finished tattoo <span className="arrow">→</span></Link>
              ) : (
                <span className="mono">{label[d.status]} — {d.repeatable ? 'but repeatable, so ask' : 'spoken for'}</span>
              )}
              {d.status !== 'available' && d.repeatable && <Link href={`/book?type=tattoo&design=${encodeURIComponent(d.title)}#inquiry`} className="mono link">Ask about a version →</Link>}
              {d.instagramUrl && <a href={d.instagramUrl} target="_blank" rel="noopener" className="mono link">On Instagram →</a>}
            </div>
          </div>
        </div>
      </section>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'VisualArtwork', name: d.title, image: abs(d.img.src), artform: 'Drawing', creator: { '@type': 'Person', name: s.artistName }, description: d.note }} />
    </>
  );
}
