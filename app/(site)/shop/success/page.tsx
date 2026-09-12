import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/content';
import { Tracked } from './tracked';

export const metadata: Metadata = { title: 'Order received', robots: { index: false } };

export default async function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const sp = await searchParams;
  const s = await getSettings();
  return (
    <section className="wrap section" data-material="paper" style={{ minHeight: '70svh', display: 'grid', alignContent: 'center', gap: 'var(--s3)', paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
      <p className="mono">Order received</p>
      <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>{s.thanksLine}</h1>
      <p className="prose-2">A receipt is on its way to your inbox. Thor packs everything himself from {s.shipsFrom}, so give it a little while.</p>
      <p><Link href="/shop" className="action">Back to the shop <span className="arrow">→</span></Link></p>
      <Tracked sessionId={sp.session_id} />
    </section>
  );
}
