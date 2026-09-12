import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="wrap section" data-material="paper" style={{ minHeight: '70svh', display: 'grid', alignContent: 'center', gap: '1.5rem' }}>
      <p className="mono">404</p>
      <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>That one healed over.</h1>
      <p className="prose-2">Nothing lives at this address. The work does, though.</p>
      <p><Link href="/work" className="action">See the work <span className="arrow">→</span></Link></p>
    </section>
  );
}
