export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const abs = (p: string) => `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`;
export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/designs', label: 'Designs' },
  { href: '/shop', label: 'Shop' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
