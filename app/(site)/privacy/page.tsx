import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } };
export default function Privacy() {
  return (
    <section className="wrap section legal" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
      <p className="mono">Privacy</p>
      <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>What this site keeps.</h1>
      <p className="mono" style={{ marginTop: 'var(--s2)' }}>TODO — placeholder privacy policy for Thor to approve before launch.</p>
      <h2>What we collect</h2>
      <p>Inquiry and contact forms send your name, email, message and any reference image to Thor by email (via Resend). Bookings are handled by Cal.com; shop payments and shipping addresses by Stripe. Each has its own privacy policy.</p>
      <h2>Analytics</h2>
      <p>Vercel Analytics counts page views and a handful of anonymous events (booking started, add to cart, inquiry sent, outbound social clicks). No cookies, no cross-site tracking, no personal data.</p>
      <h2>Card data</h2>
      <p>Never touches this site. Stripe Checkout and Cal.com's Stripe app handle it end to end.</p>
      <h2>Your data</h2>
      <p>Email lampkeyart@gmail.com to have any message or order record deleted.</p>
    </section>
  );
}
