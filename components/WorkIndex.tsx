'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ImgMeta } from '@/lib/images';

export type IndexItem = { slug: string; title: string; year: number; medium: string; placement: string; alt: string; img: ImgMeta; no: string };

/**
 * The typographic index. Title · year · medium as a list; on desktop the piece
 * follows the cursor while a row is hovered. On phone each row carries its image.
 */
export function WorkIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const prev = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = prev.current;
    if (!el || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    let x = 0, y = 0, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; el.style.left = `${x}px`; el.style.top = `${y}px`; });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <ol className="index" onPointerLeave={() => setActive(null)}>
        {items.map((w) => (
          <li key={w.slug}>
            <Link href={`/work/${w.slug}`} className="index-row" onPointerEnter={() => setActive(w.slug)} onFocus={() => setActive(w.slug)} data-cursor="view" data-cursor-label="View">
              <span className="idx">{w.no}</span>
              <span className="ttl">{w.title}</span>
              <span className="meta">{w.year} · {w.medium}{w.placement ? ` · ${w.placement}` : ''}</span>
              <span className="thumb"><Image src={w.img.src} alt="" width={w.img.width} height={w.img.height} sizes="100vw" placeholder={w.img.blur ? 'blur' : 'empty'} blurDataURL={w.img.blur || undefined} /></span>
            </Link>
          </li>
        ))}
      </ol>
      <div ref={prev} className="preview" data-on={active ? '1' : '0'} aria-hidden="true">
        {items.map((w) => (
          <Image key={w.slug} src={w.img.src} alt="" width={w.img.width} height={w.img.height} sizes="320px" data-active={active === w.slug ? '1' : '0'} />
        ))}
      </div>
    </>
  );
}
