import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getStock, setStock } from '@/lib/stock';
import { getProduct, getSettings, money } from '@/lib/content';
import { sendMail, NOTIFY } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * checkout.session.completed → stock was already reserved at checkout; confirm
 * and send the two emails. checkout.session.expired → give the reservation back.
 * Idempotent per event id (Stripe retries).
 */
const seen = new Set<string>();

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: 'not configured' }, { status: 503 });
  const sig = req.headers.get('stripe-signature') ?? '';
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return NextResponse.json({ error: `Bad signature: ${(e as Error).message}` }, { status: 400 });
  }
  if (seen.has(event.id)) return NextResponse.json({ ok: true, dup: true });
  seen.add(event.id);

  if (event.type === 'checkout.session.expired') {
    const s = event.data.object as Stripe.Checkout.Session;
    const slug = s.metadata?.slug, seed = Number(s.metadata?.seed ?? 1);
    if (slug) await setStock(slug, (await getStock(slug, seed)) + 1);
    return NextResponse.json({ ok: true });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const slug = s.metadata?.slug ?? '';
    const [p, site] = await Promise.all([getProduct(slug), getSettings()]);
    const buyer = s.customer_details?.email;
    const addr = s.shipping_details?.address ?? s.customer_details?.address;
    const addrText = addr ? [s.shipping_details?.name ?? s.customer_details?.name, addr.line1, addr.line2, `${addr.city ?? ''}, ${addr.state ?? ''} ${addr.postal_code ?? ''}`, addr.country].filter(Boolean).join('\n') : 'No address collected';
    const total = money(s.amount_total ?? 0);
    const title = p?.title ?? slug;
    const left = p ? await getStock(p.slug, p.inventory) : null;

    await sendMail({ to: NOTIFY, subject: `[Order] ${title} · ${total}`, text: `New order.\n\nItem: ${title} (${p?.kind ?? ''})${s.metadata?.framing === '1' ? ' + framing' : ''}\nTotal: ${total}\nBuyer: ${buyer}\n\nShip to:\n${addrText}\n\nStock left: ${left ?? 'n/a'}${p?.kind === 'original' ? ' — this original is now marked sold on the site.' : ''}\nStripe session: ${s.id}` });
    if (buyer) await sendMail({ to: buyer, subject: `Order received — ${title}`, text: `Thanks for the order.\n\n${title} · ${total}\n\nIt ships flat-rate from ${site.shipsFrom}, packed by Thor. Allow a week or two, and reply to this email with any questions.\n\n${site.thanksLine}\nThor` });
  }
  return NextResponse.json({ ok: true });
}
