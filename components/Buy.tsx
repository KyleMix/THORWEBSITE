'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

type Props = { slug: string; title: string; kind: string; price: string; framing: 'none' | 'optional' | 'included'; framingPrice: string; stripe: boolean; seedStock: number; soldFlag: boolean };

/** Add to cart → Stripe Checkout. Live stock from /api/stock; sold-out keeps the piece visible and routes to inquiry. */
export function Buy({ slug, title, kind, price, framing, framingPrice, stripe, seedStock, soldFlag }: Props) {
  const [stock, setStock] = useState<number>(soldFlag ? 0 : seedStock);
  const [frame, setFrame] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    fetch(`/api/stock?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then((j) => { if (typeof j.stock === 'number') setStock(j.sold ? 0 : j.stock); }).catch(() => {});
  }, [slug]);
  const sold = stock <= 0;

  async function checkout() {
    setBusy(true); setErr('');
    track('add_to_cart', { slug, kind });
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, framing: frame }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Checkout failed.');
      window.location.href = j.url;
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  const button = sold ? (
    <Link href={`/book?type=commission&about=${encodeURIComponent(title)}#inquiry`} className="action">Sold — ask about something similar <span className="arrow">→</span></Link>
  ) : stripe ? (
    <button type="button" className="action action-fill" onClick={checkout} disabled={busy}>{busy ? 'Opening checkout…' : `Buy · ${price}`}</button>
  ) : (
    <Link href={`/book?type=commission&about=${encodeURIComponent(`Buy: ${title}`)}#inquiry`} className="action action-fill">Inquire to buy · {price} <span className="arrow">→</span></Link>
  );

  return (
    <div className="buy">
      {framing === 'optional' && !sold && (
        <label className="mono" style={{ display: 'flex', gap: '.6rem', alignItems: 'center', minHeight: '3rem' }}>
          <input type="checkbox" checked={frame} onChange={(e) => setFrame(e.target.checked)} /> Add framing (+{framingPrice})
        </label>
      )}
      {button}
      <p className="mono">{sold ? (kind === 'original' ? 'One of one · sold' : 'Sold out') : kind === 'original' ? 'One of one' : `${stock} left`}{!stripe && !sold ? ' · checkout not connected yet' : ''}</p>
      {err && <p className="notice err" role="alert">{err}</p>}
      <div className="buy-sticky">{button}</div>
    </div>
  );
}
