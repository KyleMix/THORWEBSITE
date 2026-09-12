'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Phone: the sticky action bar is the main navigation. Hidden on product pages, where Add to cart takes the slot. */
export function Bar() {
  const path = usePathname();
  if (path.startsWith('/shop/') || path.startsWith('/keystatic')) return null;
  const cur = (h: string) => (path === h || path.startsWith(h + '/') ? 'page' : undefined);
  return (
    <nav className="bar" aria-label="Quick actions">
      <Link href="/book" className="em" aria-current={cur('/book')}>Book</Link>
      <Link href="/shop" aria-current={cur('/shop')}>Shop</Link>
      <Link href="/contact" aria-current={cur('/contact')}>Contact</Link>
    </nav>
  );
}
