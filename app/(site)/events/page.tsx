import type { Metadata } from 'next';
import { getAppearances, KIND_LABELS } from '@/lib/content';
import { Pic } from '@/components/Pic';

export const metadata: Metadata = { title: 'Events', description: 'Flash days, Inksomniac Life Drawing nights, guest spots and conventions.', alternates: { canonical: '/events' } };

export default async function EventsPage() {
  const [up, past] = await Promise.all([getAppearances(), getAppearances({ upcomingOnly: false })]);
  const gone = past.filter((a) => !up.some((u) => u.slug === a.slug)).reverse().slice(0, 12);
  const Row = ({ a }: { a: (typeof up)[number] }) => {
    const d = new Date(a.date + 'T12:00:00');
    return (
      <li className="date-row">
        <span className="d">{d.toLocaleDateString('en-US', { day: 'numeric' })}<small>{d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</small></span>
        <span>
          <span className="ttl">{a.link ? <a href={a.link} target="_blank" rel="noopener" className="link">{a.title}</a> : a.title}</span>
          <span className="venue">{KIND_LABELS[a.kind]} · {a.venue} · {a.city}{a.time ? ` · ${a.time}` : ''}</span>
          {a.note && <p className="prose-2" style={{ marginTop: '.5rem', fontSize: 'var(--t-sm)' }}>{a.note}</p>}
        </span>
        {a.flyer && <Pic img={a.flyerImg} alt={a.flyerAlt || ''} sizes="96px" className="flyer" />}
      </li>
    );
  };
  return (
    <section className="wrap section" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
      <div className="running-head"><span className="mono">Events</span><span className="folio">Fullerton · Orange County</span></div>
      <h1 className="display" style={{ fontSize: 'var(--t-2xl)', marginTop: 'var(--s3)' }}>Where he'll be next.</h1>
      <p className="prose-2 todo" style={{ marginTop: 'var(--s3)' }}>Flash days at the shop, Inksomniac Life Drawing (themed live-model nights, open to any local artist), and the occasional guest spot or convention.</p>
      {up.length ? <ul className="dates" style={{ marginTop: 'var(--s5)' }}>{up.map((a) => <Row key={a.slug} a={a} />)}</ul>
        : <p className="empty" style={{ marginTop: 'var(--s5)' }}>Nothing on the calendar right now. Instagram will know first.</p>}
      {gone.length > 0 && (<><div className="running-head" style={{ marginTop: 'var(--s6)' }}><span className="mono">Past</span></div><ul className="dates">{gone.map((a) => <Row key={a.slug} a={a} />)}</ul></>)}
    </section>
  );
}
