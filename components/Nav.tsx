'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV } from '@/lib/site';
import { Bulb } from './Icons';

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

  const current = (href: string) => (path === href || (href !== '/' && path.startsWith(href)) ? 'page' : undefined);

  return (
    <>
      <header className="nav">
        <Link href="/" className="nav-brand" aria-label={`${brand} — home`}>
          <Bulb /> {brand}
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
          <span className="nav-brand"><Bulb /> {brand}</span>
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
