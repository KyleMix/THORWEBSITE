import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings, getSocials } from '@/lib/content';
import { SocialRows } from '@/components/Socials';
import { InquiryForm } from '@/components/InquiryForm';

export const metadata: Metadata = { title: 'Contact', description: 'Email, Instagram and a direct message form for Thor Becker / Lampkey Artery.', alternates: { canonical: '/contact' } };

export default async function ContactPage() {
  const [s, socials] = await Promise.all([getSettings(), getSocials()]);
  return (
    <section className="wrap section" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
      <div className="running-head"><span className="mono">Contact</span><span className="folio">{s.homeCity}</span></div>
      <div className="two" style={{ marginTop: 'var(--s3)' }}>
        <div className="stack-lg">
          <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>Which do I use?</h1>
          <p className="prose-2">Want a tattoo, a drawing, or live art at your thing? That's <Link href="/book" className="link">Book</Link> — it has the calendar and the inquiry form. Want a print or an original? <Link href="/shop" className="link">Shop</Link>. Everything else lands here.</p>
          <p><a href={`mailto:${s.email}`} className="display" style={{ fontSize: 'var(--t-xl)', wordBreak: 'break-all' }}>{s.email}</a></p>
          <p className="mono">{s.studioName}<br />{s.studioCity} · {s.region}<br />Lives in {s.homeCity}</p>
        </div>
        <div className="stack-lg">
          <SocialRows socials={socials} />
          <div>
            <p className="mono" style={{ marginBottom: 'var(--s3)' }}>Direct message</p>
            <InquiryForm defaultType="other" thanks={s.thanksLine} compact />
          </div>
        </div>
      </div>
    </section>
  );
}
