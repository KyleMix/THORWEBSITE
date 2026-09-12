'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pic } from './Pic';
import { NearCenter } from './Lamp';
import type { ImgMeta } from '@/lib/images';

export type GalleryItem = {
  slug: string; title: string; year: number; medium: string; placement: string; alt: string; img: ImgMeta;
  status: string; statusLabel: string; caption: string; span: string; product: string | null; type: string; no: string;
};

/** Plates grid + lightbox (desktop) / swipeable sheet (phone). Keyboard: ← → Esc. */
export function Gallery({ items, inquiryHref }: { items: GalleryItem[]; inquiryHref: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [cols, setCols] = useState<'1' | '2'>('1');
  useEffect(() => { try { const c = localStorage.getItem('gallery-cols'); if (c === '2') setCols('2'); } catch {} }, []);
  const toggleCols = () => { const n = cols === '1' ? '2' : '1'; setCols(n); try { localStorage.setItem('gallery-cols', n); } catch {} };

  const go = useCallback((d: number) => setOpen((o) => (o === null ? null : (o + d + items.length) % items.length)), [items.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = ''; };
  }, [open, go]);

  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open !== null) closeBtn.current?.focus(); }, [open]);

  // touch: swipe left/right to move, down to close
  const t = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { t.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!t.current) return;
    const dx = e.changedTouches[0].clientX - t.current.x, dy = e.changedTouches[0].clientY - t.current.y;
    t.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) setOpen(null);
  };

  const w = open !== null ? items[open] : null;

  return (
    <>
      <div className="cols-toggle-row">
        <button type="button" onClick={toggleCols} aria-pressed={cols === '2'} className="cols-toggle">{cols === '2' ? 'One column' : 'Two columns'}</button>
      </div>
      <div className="plates" data-cols={cols}>
        {items.map((it, i) => (
          <figure key={it.slug} className="plate" data-span={it.span} data-ar={it.img.ar > 1.3 ? 'wide' : undefined}>
            <button type="button" className="plate-img" onClick={() => setOpen(i)} aria-label={`Open ${it.title}`} data-cursor="view" data-cursor-label="View" style={{ display: 'block', width: '100%' }}>
              <Pic img={it.img} alt={it.alt} sizes="(min-width: 60rem) 33vw, (min-width: 48rem) 50vw, 100vw" priority={i < 2} />
            </button>
            <figcaption className="plate-cap">
              <span className="ttl">{it.title}</span>
              <span className="meta">{it.no} · {it.year}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <NearCenter selector=".plate" />
      {items.length === 0 && <p className="empty">Nothing here yet under that filter.</p>}

      {w && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={w.title} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="lb-head">
            <span className="mono">{w.no} · {open! + 1} / {items.length}</span>
            <button ref={closeBtn} type="button" onClick={() => setOpen(null)}>Close</button>
          </div>
          <div className="lb-body">
            <div className="lb-stage">
              <Pic img={w.img} alt={w.alt} sizes="(min-width: 60rem) calc(100vw - 20rem), 100vw" priority />
              <button type="button" className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous">←</button>
              <button type="button" className="lb-nav lb-next" onClick={() => go(1)} aria-label="Next">→</button>
            </div>
            <aside className="lb-meta">
              <h2 className="ttl">{w.title}</h2>
              <dl className="spec">
                <dt>Year</dt><dd>{w.year}</dd>
                <dt>Medium</dt><dd>{w.medium || '—'}</dd>
                <dt>{w.type === 'tattoo' ? 'Placement' : 'Size'}</dt><dd>{w.placement || '—'}</dd>
                <dt>Status</dt><dd>{w.statusLabel}</dd>
              </dl>
              {w.caption && <p className="caption">{w.caption}</p>}
              <p>
                {w.product ? (
                  <Link href={`/shop/${w.product}`} className="action action-fill">Buy <span className="arrow">→</span></Link>
                ) : (
                  <Link href={`${inquiryHref}?type=${w.type === 'tattoo' ? 'tattoo' : 'commission'}&about=${encodeURIComponent(w.title)}`} className="action">Inquire <span className="arrow">→</span></Link>
                )}
              </p>
              <p><Link href={`/work/${w.slug}`} className="mono link">Open page →</Link></p>
            </aside>
          </div>
          <div className="mono" style={{ padding: '.5rem var(--gutter)', textAlign: 'center' }}>Swipe to move · swipe down to close</div>
        </div>
      )}
    </>
  );
}
