'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Pic } from './Pic';
import type { ImgMeta } from '@/lib/images';

export type FlipItem = { slug: string; title: string; year: number; medium: string; alt: string; img: ImgMeta; no: string };

/**
 * Selected works as a flip-through. Desktop: the section pins and vertical
 * scroll drives the strip horizontally (one transform per frame). Phone and
 * reduced-motion: a native, snapping horizontal scroller.
 */
export function Flip({ items, heading }: { items: FlipItem[]; heading: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current, tr = track.current;
    if (!el || !tr) return;
    const mq = window.matchMedia('(min-width: 60rem)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches || rm.matches) return;
    let raf = 0;
    const measure = () => el.style.setProperty('--w', `${tr.scrollWidth}px`);
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      el.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    measure(); tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', measure); cancelAnimationFrame(raf); };
  }, [items.length]);

  return (
    <section ref={root} className="flip" data-material="skin" style={{ ['--n' as string]: items.length }} aria-label={heading}>
      <div className="flip-sticky">
        <div className="flip-head">
          <span className="mono">{heading}</span>
          <span className="mono">{items.length} plates</span>
        </div>
        <div ref={track} className="flip-track">
          {items.map((w) => (
            <Link key={w.slug} href={`/work/${w.slug}`} className="flip-item plate" data-cursor="view" data-cursor-label="View">
              <span className="plate-img"><Pic img={w.img} alt={w.alt} sizes="(min-width: 60rem) 40vw, 78vw" /></span>
              <span className="plate-cap"><span className="ttl">{w.title}</span><span className="meta">{w.no} · {w.year}</span></span>
            </Link>
          ))}
        </div>
        <div className="flip-foot">
          <span className="mono">Scroll to turn the page</span>
          <Link href="/work" className="mono link">Full index →</Link>
        </div>
      </div>
    </section>
  );
}
