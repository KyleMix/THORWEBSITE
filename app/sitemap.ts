import type { MetadataRoute } from 'next';
import { getWorks, getDesigns, getProducts } from '@/lib/content';
import { abs } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, designs, products] = await Promise.all([getWorks(), getDesigns(), getProducts()]);
  const statics = ['', '/work', '/designs', '/shop', '/book', '/events', '/about', '/contact', '/terms', '/privacy'].map((p) => ({ url: abs(p), changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 }));
  return [
    ...statics,
    ...works.map((w) => ({ url: abs(`/work/${w.slug}`), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...designs.map((d) => ({ url: abs(`/designs/${d.slug}`), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...products.map((p) => ({ url: abs(`/shop/${p.slug}`), changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
