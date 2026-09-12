import type { Metadata } from 'next';
import Link from 'next/link';
import { getDesigns, getSettings } from '@/lib/content';
import { Pic } from '@/components/Pic';

export const metadata: Metadata = { title: 'Available designs', description: 'Original drawings Thor Becker wants to tattoo. Claim one and it is yours.', alternates: { canonical: '/designs' } };

export default async function DesignsPage() {
  const [designs, s] = await Promise.all([getDesigns(), getSettings()]);
  const label = { available: 'Available', claimed: 'Claimed', tattooed: 'Tattooed' } as const;
  return (
    <section className="wrap section" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
      <div className="running-head"><span className="mono">Available designs</span><a className="mono link" href={`https://www.instagram.com/${s.instagramDesigns}/`} target="_blank" rel="noopener">@{s.instagramDesigns} →</a></div>
      <div className="two" style={{ marginTop: 'var(--s3)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>Drawings looking for skin.</h1>
        <p className="prose-2 todo">These are originals I want to tattoo. Each can be done in color or black and grey, resized, adjusted, or personalized. Claim one and it comes off the board. Claimed and tattooed ones stay up so you can see where they went.</p>
      </div>
      <div className="designs" style={{ marginTop: 'var(--s5)' }}>
        {designs.map((d) => (
          <Link key={d.slug} href={`/designs/${d.slug}`} className="design" data-status={d.status} data-cursor="view" data-cursor-label={d.status === 'available' ? 'Claim' : 'View'}>
            <span className="design-img">
              <Pic img={d.img} alt={d.alt} sizes="(min-width: 60rem) 25vw, 50vw" />
              {d.status !== 'available' && <span className="design-status">{label[d.status]}</span>}
            </span>
            <span className="ttl">{d.title}</span>
            <span className="mono">{d.colorOptions.map((c) => (c === 'color' ? 'Color' : 'B&G')).join(' / ')}{d.repeatable ? ' · Repeatable' : ' · One-off'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
