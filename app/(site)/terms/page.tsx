import type { Metadata } from 'next';
import { getSettings, money } from '@/lib/content';
export const metadata: Metadata = { title: 'Terms', alternates: { canonical: '/terms' } };
export default async function Terms() {
  const s = await getSettings();
  return (
    <section className="wrap section legal" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
      <p className="mono">Terms</p>
      <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>Deposits, refunds, shipping.</h1>
      <p className="mono" style={{ marginTop: 'var(--s2)' }}>TODO — placeholder terms for Thor to approve before launch.</p>
      <h2>Deposits</h2>
      <p>TODO — A deposit{s.depositAmount && s.depositAmount !== 'TODO' ? ` of ${s.depositAmount}` : ''} holds your appointment and is applied to the final cost of the tattoo. Deposits are non-refundable. {s.cancellationNote}</p>
      <h2>Rescheduling and cancellation</h2>
      <p>TODO — Reschedule with at least 48 hours notice and your deposit transfers to the new date. Less notice, or a no-show, forfeits the deposit. Thor may reschedule for illness or emergency; your deposit carries over.</p>
      <h2>Commissions and live events</h2>
      <p>TODO — Commissions are quoted per piece. Half is due to begin, half on completion. Live event bookings require a booking fee to hold the date, non-refundable within 14 days of the event.</p>
      <h2>Shop orders</h2>
      <p>TODO — Originals are one of one and sold as-is. Prints are signed and numbered. Orders ship flat-rate ({money(s.shippingFlatCents)}) from {s.shipsFrom} within the United States. Damaged in transit: photograph the packaging and contact us within 7 days for a replacement or refund. No returns on originals; prints may be returned unopened within 14 days for a refund less shipping.</p>
      <h2>Payment</h2>
      <p>Payments are processed by Stripe and Cal.com. This site never stores card details.</p>
    </section>
  );
}
