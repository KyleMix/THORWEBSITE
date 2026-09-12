import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getSettings, money } from '@/lib/content';
import { Pic } from '@/components/Pic';

export const metadata: Metadata = { title: 'Shop', description: 'Original drawings and signed prints by Thor Becker. Ships from Lake Elsinore, CA.', alternates: { canonical: '/shop' } };
export const revalidate = 300;

export default async function ShopPage() {
  const [products, s] = await Promise.all([getProducts(), getSettings()]);
  return (
    <section className="wrap section" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
      <div className="running-head"><span className="mono">Shop</span><span className="folio">Ships from {s.shipsFrom} · flat rate {money(s.shippingFlatCents)}</span></div>
      <div className="two" style={{ marginTop: 'var(--s3)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>Originals and prints.</h1>
        <p className="prose-2 todo">One-of-one drawings and signed prints. Originals go once. Prints are numbered. {s.shippingNote}</p>
      </div>
      <div className="products" style={{ marginTop: 'var(--s5)' }}>
        {products.map((p) => (
          <Link key={p.slug} href={`/shop/${p.slug}`} className="product" data-sold={p.sold || p.inventory <= 0} data-cursor="view" data-cursor-label="View">
            <span className="product-img">
              <Pic img={p.imgs[0].img} alt={p.imgs[0].alt} sizes="(min-width: 60rem) 33vw, (min-width: 40rem) 50vw, 100vw" />
              {(p.sold || p.inventory <= 0) && <span className="badge">Sold</span>}
              {!p.sold && p.kind === 'original' && <span className="badge">One of one</span>}
            </span>
            <span className="ttl">{p.title}</span>
            <span className="price">{p.kind === 'original' ? 'Original' : p.edition || 'Print'} · {money(p.priceCents)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
