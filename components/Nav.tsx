'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV } from '@/lib/site';
import { BrandRing } from './BrandMark';

export function Nav({ brand, socials }: { brand: string; socials: { label: string; url: string; handle: string }[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Which material is under the bar right now, so the nav can take a real
  // colour instead of blending. Hit-tests one point per frame, rAF-throttled.
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      if (open) { el.dataset.over = 'paper'; return; }
      const y = el.getBoundingClientRect().height / 2;
      const hit = document.elementsFromPoint(Math.round(window.innerWidth * 0.62), Math.round(y));
      const section = hit.find((n) => n instanceof HTMLElement && n.dataset.material) as HTMLElement | undefined;
      el.dataset.over = section?.dataset.material === 'paper' ? 'paper' : 'skin';
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [open, path]);

  const current = (href: string) => (path === href || (href !== '/' && path.startsWith(href)) ? 'page' : undefined);

  return (
    <>
      <header className="nav" ref={nav} data-over="skin">
        <Link href="/" className="nav-brand" aria-label={`${brand} — home`}>
          <BrandRing className="nav-mark" /> <span>{brand}</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={current(n.href)}>{n.label}</Link>
          ))}
          <Link href="/book" className="em" aria-current={current('/book')}>Book</Link>
        </nav>
        <button className="nav-toggle" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </header>

      <div id="menu" className="menu" data-open={open} aria-hidden={!open}>
        <div className="menu-head">
          <span className="nav-brand"><BrandRing className="nav-mark" /> <span>{brand}</span></span>
          <button className="nav-toggle" onClick={() => setOpen(false)}>Close</button>
        </div>
        <nav className="menu-list" aria-label="Menu">
          {[{ href: '/', label: 'Home' }, ...NAV, { href: '/book', label: 'Book' }].map((n, i) => (
            <Link key={n.href} href={n.href} tabIndex={open ? 0 : -1}>
              <span>{n.label}</span><span className="folio">{String(i + 1).padStart(2, '0')}</span>
            </Link>
          ))}
        </nav>
        <div className="menu-foot">
          {socials.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>{s.handle || s.label}</a>
          ))}
        </div>
      </div>
    </>
  );
}
