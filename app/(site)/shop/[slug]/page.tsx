import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getProducts, getSettings, money } from '@/lib/content';
import { getStock } from '@/lib/stock';
import { stripeReady } from '@/lib/stripe';
import { abs } from '@/lib/site';
import { ProductGallery } from '@/components/ProductGallery';
import { Buy } from '@/components/Buy';
import { JsonLd } from '@/components/JsonLd';

export const revalidate = 60;
export async function generateStaticParams() { return (await getProducts()).map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = await getProduct(slug); if (!p) return {};
  const desc = `${p.kind === 'original' ? 'Original' : p.edition || 'Print'} · ${p.size} · ${money(p.priceCents)}`;
  return { title: p.title, description: desc, alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { title: p.title, description: desc, images: [{ url: abs(p.imgs[0].img.src), width: p.imgs[0].img.width, height: p.imgs[0].img.height, alt: p.imgs[0].alt }] }, twitter: { card: 'summary_large_image', images: [abs(p.imgs[0].img.src)] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, s] = await Promise.all([getProduct(slug), getSettings()]);
  if (!p) notFound();
  const stock = p.sold ? 0 : await getStock(p.slug, p.inventory);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.title, image: p.imgs.map((i) => abs(i.img.src)), description: p.description,
    brand: { '@type': 'Brand', name: s.brandName }, sku: p.slug,
    offers: { '@type': 'Offer', priceCurrency: 'USD', price: (p.priceCents / 100).toFixed(2), availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut', url: abs(`/shop/${p.slug}`), shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: (s.shippingFlatCents / 100).toFixed(2), currency: 'USD' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' } } },
  };
  return (
    <>
      <section className="wrap" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s3))', paddingBottom: 'var(--s6)' }}>
        <div className="running-head"><span className="mono">{p.kind === 'original' ? 'Original' : 'Print'}</span><Link href="/shop" className="mono link">← Shop</Link></div>
        <div className="pdp" style={{ marginTop: 'var(--s4)' }}>
          <ProductGallery imgs={p.imgs} />
          <div className="pdp-info">
            <h1 className="ttl">{p.title}</h1>
            <p className="price">{money(p.priceCents)}</p>
            <dl className="spec">
              <dt>Edition</dt><dd>{p.kind === 'original' ? 'One of one' : p.edition || 'Print'}</dd>
              {p.size && <><dt>Size</dt><dd>{p.size}</dd></>}
              {p.medium && <><dt>Medium</dt><dd>{p.medium}</dd></>}
              {p.year && <><dt>Year</dt><dd>{p.year}</dd></>}
              <dt>Framing</dt><dd>{p.framing === 'included' ? 'Included' : p.framing === 'optional' ? `Optional, +${money(p.framingCents)}` : 'Unframed'}</dd>
              <dt>Shipping</dt><dd>{money(s.shippingFlatCents)} flat, from {s.shipsFrom}</dd>
            </dl>
            {p.description && <p className="caption todo">{p.description}</p>}
            <Buy slug={p.slug} title={p.title} kind={p.kind} price={money(p.priceCents)} framing={p.framing} framingPrice={money(p.framingCents)} stripe={stripeReady} seedStock={stock} soldFlag={p.sold} />
            {p.work && <Link href={`/work/${p.work}`} className="mono link">See it in Work →</Link>}
          </div>
        </div>
      </section>
      <JsonLd data={ld} />
    </>
  );
}
