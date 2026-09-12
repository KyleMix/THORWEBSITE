import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/content';
import { getStock } from '@/lib/stock';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug') ?? '';
  const p = await getProduct(slug);
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const stock = await getStock(p.slug, p.inventory);
  return NextResponse.json({ stock, sold: p.sold || stock <= 0 }, { headers: { 'cache-control': 'no-store' } });
}
