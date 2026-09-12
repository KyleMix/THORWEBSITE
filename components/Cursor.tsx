'use client';
import { useEffect, useRef } from 'react';

/**
 * Desktop-only. A small difference-blend dot that becomes a labelled ring over
 * anything marked data-cursor="view|drag|…". CSS hides it on coarse pointers
 * and under prefers-reduced-motion. One rAF write per frame.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = 0, y = 0, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      el.dataset.on = '1';
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      if (t) { el.dataset.kind = t.dataset.cursor; el.dataset.label = t.dataset.cursorLabel ?? t.dataset.cursor; }
      else { delete el.dataset.kind; el.dataset.label = ''; }
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; });
    };
    const leave = () => { el.dataset.on = '0'; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => { window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('mouseleave', leave); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
