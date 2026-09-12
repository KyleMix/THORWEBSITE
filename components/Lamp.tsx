'use client';
import { useEffect, useRef } from 'react';

/**
 * The reading lamp. One fixed layer, screen-blended, following the pointer.
 * Only lights up while the pointer is over a [data-material="skin"] section
 * (--lamp-alpha is 0 on paper). Pointer-fine only; reduced-motion hides it.
 * On phones the same idea is scroll-driven: see useNearCenter().
 */
export function Lamp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = 0, y = 0, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const skin = (e.target as HTMLElement | null)?.closest('[data-material]')?.getAttribute('data-material') !== 'paper';
      el.dataset.on = skin ? '1' : '0';
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; el.style.setProperty('--lx', `${x}px`); el.style.setProperty('--ly', `${y}px`); });
    };
    const leave = () => { el.dataset.on = '0'; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => { window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('mouseleave', leave); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="lamp" aria-hidden="true" />;
}

/** Phone: marks the .plate nearest the viewport centre with data-near="1". */
export function NearCenter({ selector = '.plate' }: { selector?: string }) {
  useEffect(() => {
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!items.length) return;
    const visible = new Set<HTMLElement>();
    let pending = false;
    const tick = () => {
      pending = false;
      const mid = window.innerHeight / 2;
      let best: HTMLElement | null = null, bestD = Infinity;
      visible.forEach((t) => {
        const r = t.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = t; }
      });
      items.forEach((t) => { t.dataset.near = t === best ? '1' : '0'; });
    };
    const io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement))); tick(); });
    items.forEach((t) => io.observe(t));
    const onScroll = () => { if (!pending) { pending = true; requestAnimationFrame(tick); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [selector]);
  return null;
}
