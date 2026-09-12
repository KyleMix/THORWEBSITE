'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pic } from './Pic';
import type { ImgMeta } from '@/lib/images';

export function ProductGallery({ imgs }: { imgs: { img: ImgMeta; alt: string }[] }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false);
    window.addEventListener('keydown', k); document.documentElement.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.documentElement.style.overflow = ''; };
  }, [zoom]);
  const cur = imgs[i];
  return (
    <div className="pdp-gallery">
      <button type="button" className="pdp-main" onClick={() => setZoom(true)} aria-label="Zoom image" data-cursor="view" data-cursor-label="Zoom" style={{ display: 'block', width: '100%' }}>
        <Pic img={cur.img} alt={cur.alt} sizes="(min-width: 60rem) 58vw, 100vw" priority={i === 0} />
      </button>
      {imgs.length > 1 && (
        <div className="pdp-thumbs" role="group" aria-label="Product images">
          {imgs.map((im, k) => (
            <button key={k} type="button" aria-pressed={k === i} aria-label={`Show image ${k + 1} of ${imgs.length}`} onClick={() => setI(k)}>
              <Image src={im.img.src} alt="" width={96} height={96} sizes="96px" />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <div className="zoom" role="dialog" aria-modal="true" aria-label="Zoomed image" onClick={() => setZoom(false)}>
          <Image src={cur.img.src} alt={cur.alt} width={cur.img.width} height={cur.img.height} sizes="200vw" quality={90} style={{ width: 'max(100vw, 1600px)', height: 'auto' }} />
        </div>
      )}
    </div>
  );
}
