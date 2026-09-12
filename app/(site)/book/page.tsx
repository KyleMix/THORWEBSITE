import type { Metadata } from 'next';
import Link from 'next/link';
import { getBooking, getSettings, getTestimonials } from '@/lib/content';
import { CalEmbed } from '@/components/CalEmbed';
import { InquiryForm } from '@/components/InquiryForm';

export const metadata: Metadata = { title: 'Book', description: 'Book a tattoo, commission a drawing, or bring live art to your event. Fullerton, CA.', alternates: { canonical: '/book' } };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ type?: string; about?: string; design?: string }> }) {
  const sp = await searchParams;
  const [b, s, quotes] = await Promise.all([getBooking(), getSettings(), getTestimonials()]);
  const consult = process.env.NEXT_PUBLIC_CALCOM_CONSULT_EVENT ?? 'consultation';
  const session = process.env.NEXT_PUBLIC_CALCOM_SESSION_EVENT ?? 'tattoo-session';
  return (
    <>
      <section className="wrap section" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
        <div className="running-head"><span className="mono">Book</span><span className="folio">No prices on this page — every piece is quoted</span></div>
        <div className="two" style={{ marginTop: 'var(--s3)' }}>
          <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>Three ways in.</h1>
          <p className="prose-2 todo">{b?.intro}</p>
        </div>

        <div className="paths" style={{ marginTop: 'var(--s5)' }}>
          {b?.paths.map((p) => (
            <article className="path" key={p.key} id={p.key}>
              <div className="stack">
                <h2 className="ttl">{p.title}</h2>
                <p><Link href={p.key === 'tattoo' ? '#schedule' : `#inquiry`} className="action action-quiet">{p.key === 'tattoo' ? 'Schedule a consultation' : 'Send an inquiry'} <span className="arrow">→</span></Link></p>
              </div>
              <dl>
                <div><dt>What he offers</dt><dd className="todo">{p.offer}</dd></div>
                <div><dt>Turnaround</dt><dd className="todo">{p.turnaround}</dd></div>
                <div><dt>Deposit &amp; cancellation</dt><dd className="todo">{p.terms}</dd></div>
                <div><dt>What to send</dt><dd className="todo">{p.send}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" data-material="skin" id="schedule">
        <div className="running-head"><span className="mono">Schedule</span><span className="folio">Free consultation · Tattoo session (deposit {s.depositAmount || 'TODO'})</span></div>
        <div className="two" style={{ marginTop: 'var(--s3)' }}>
          <div className="stack">
            <h2 className="display" style={{ fontSize: 'var(--t-xl)' }}>Consultation first.<br />Then the chair.</h2>
            <p className="prose-2 todo">{s.depositNote}</p>
            <p className="prose-2 todo">{s.cancellationNote}</p>
            <p className="mono">Sessions: pick the date; the length is set per piece after the consult.</p>
          </div>
          <div className="stack-lg">
            <div><p className="mono" style={{ marginBottom: 'var(--s2)' }}>Free consultation</p><CalEmbed event={consult} email={s.email} label="Consultation" /></div>
            <div><p className="mono" style={{ marginBottom: 'var(--s2)' }}>Tattoo session</p><CalEmbed event={session} email={s.email} label="Tattoo session" /></div>
          </div>
        </div>
      </section>

      <section className="wrap section" data-material="paper">
        <div className="running-head"><span className="mono">Working with Thor</span><span className="folio">Idea → healed</span></div>
        <div className="two" style={{ marginTop: 'var(--s3)' }}>
          <h2 className="display" style={{ fontSize: 'var(--t-xl)' }}>How a tattoo goes.</h2>
          <ol className="steps">{b?.steps.map((st) => <li className="step" key={st.title}><div><div className="ttl">{st.title}</div><p className="todo">{st.body}</p></div></li>)}</ol>
        </div>
        <div className="two" style={{ marginTop: 'var(--s5)' }}>
          <h2 className="display" style={{ fontSize: 'var(--t-xl)' }}>How a live event goes.</h2>
          <ol className="steps">{b?.eventSteps.map((st) => <li className="step" key={st.title}><div><div className="ttl">{st.title}</div><p className="todo">{st.body}</p></div></li>)}</ol>
        </div>
      </section>

      {quotes.length > 0 && (
        <section className="wrap section-tight" data-material="paper">
          <div className="running-head"><span className="mono">Client words</span></div>
          <div className="grid cols-2" style={{ marginTop: 'var(--s3)' }}>
            {quotes.map((q) => <blockquote key={q.slug} className="stack"><p className="caption">“{q.quote}”</p><footer className="mono">{q.url ? <a href={q.url} target="_blank" rel="noopener">{q.handle || q.name}</a> : (q.handle || q.name)}</footer></blockquote>)}
          </div>
        </section>
      )}

      <section className="wrap section" data-material="paper" id="inquiry">
        <div className="running-head"><span className="mono">Inquiry</span><span className="folio">Commissions · events · anything without a date yet</span></div>
        <div className="two" style={{ marginTop: 'var(--s3)' }}>
          <h2 className="display" style={{ fontSize: 'var(--t-xl)' }}>Tell me what you're thinking.</h2>
          <InquiryForm defaultType={sp.type ?? 'commission'} about={sp.about} design={sp.design} intro={s.inquiryIntro} thanks={s.thanksLine} />
        </div>
      </section>
    </>
  );
}
