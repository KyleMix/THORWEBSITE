import { NextResponse } from 'next/server';
import { getProduct, getSettings } from '@/lib/content';
import { stripe } from '@/lib/stripe';
import { takeStock } from '@/lib/stock';
import { abs } from '@/lib/site';

export const runtime = 'nodejs';

/**
 * Creates a Stripe Checkout session. Stock is RESERVED here (atomic decrement)
 * so two people can't both check out the last original; the webhook gives it
 * back if the session expires unpaid. Prices come from Keystatic, never the client.
 */
export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Checkout is not connected yet. Use the inquiry form.' }, { status: 503 });
  const { slug, framing } = (await req.json().catch(() => ({}))) as { slug?: string; framing?: boolean };
  const [p, s] = await Promise.all([getProduct(slug ?? ''), getSettings()]);
  if (!p) return NextResponse.json({ error: 'Unknown product.' }, { status: 404 });
  if (p.sold) return NextResponse.json({ error: 'That one is sold.' }, { status: 409 });

  const left = await takeStock(p.slug, p.inventory, 1);
  if (left === null) return NextResponse.json({ error: 'Just sold out.' }, { status: 409 });

  const addFrame = framing && p.framing === 'optional' && p.framingCents > 0;
  const line = [{
    quantity: 1,
    price_data: { currency: 'usd', unit_amount: p.priceCents, product_data: { name: p.title, description: `${p.kind === 'original' ? 'Original' : p.edition || 'Print'}${p.size ? ` · ${p.size}` : ''}`, images: [abs(p.imgs[0].img.src)] } },
  }, ...(addFrame ? [{ quantity: 1, price_data: { currency: 'usd', unit_amount: p.framingCents, product_data: { name: `Framing — ${p.title}` } } }] : [])];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: line,
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: s.shippingFlatCents, currency: 'usd' }, display_name: `Flat rate from ${s.shipsFrom}`, delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 14 } } } }],
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: { slug: p.slug, kind: p.kind, framing: addFrame ? '1' : '0', seed: String(p.inventory) },
      success_url: abs('/shop/success?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: abs(`/shop/${p.slug}`),
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    // give the reservation back
    const { setStock, getStock } = await import('@/lib/stock');
    await setStock(p.slug, (await getStock(p.slug, p.inventory)) + 1);
    console.error('[checkout]', e);
    return NextResponse.json({ error: 'Stripe rejected the checkout. Try again.' }, { status: 502 });
  }
}
