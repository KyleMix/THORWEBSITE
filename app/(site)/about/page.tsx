import type { Metadata } from 'next';
import Link from 'next/link';
import { getAbout, getSettings, getSocials, getAppearances, KIND_LABELS } from '@/lib/content';
import { imageMeta, MEDIA } from '@/lib/images';
import { Pic } from '@/components/Pic';
import { SocialInline } from '@/components/Socials';

export const metadata: Metadata = { title: 'About', description: 'Thor Becker — tattoo artist at EngineerInk in Fullerton, CA. Lives in Lake Elsinore. Co-hosts Inksomniac Life Drawing.', alternates: { canonical: '/about' } };

export default async function AboutPage() {
  const [a, s, socials, dates] = await Promise.all([getAbout(), getSettings(), getSocials(), getAppearances()]);
  const photos = await Promise.all((a?.photos ?? []).map(async (p) => ({ ...p, img: await imageMeta(p.image, MEDIA.thor) })));
  return (
    <>
      <section className="wrap section" data-material="paper" style={{ paddingTop: 'calc(var(--nav-h) + var(--s5))' }}>
        <div className="running-head"><span className="mono">About</span><span className="folio">{s.studioCity} · lives in {s.homeCity}</span></div>
        <div className="artist" style={{ marginTop: 'var(--s4)' }}>
          <div className="artist-photo">{photos[0] && <Pic img={photos[0].img} alt={photos[0].alt} sizes="(min-width: 60rem) 55vw, 100vw" priority />}</div>
          <div className="artist-copy stack-lg">
            <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>{a?.headline || s.brandName}</h1>
            <div className="prose todo" style={{ whiteSpace: 'pre-line' }}>{a?.story}</div>
            <SocialInline socials={socials} />
          </div>
        </div>
      </section>

      <section className="wrap section-tight" data-material="paper">
        <div className="two">
          <div className="stack"><span className="mono">Background</span><h2 className="display" style={{ fontSize: 'var(--t-xl)' }}>The short version.</h2></div>
          <div className="stack-lg">
            <p className="prose todo" style={{ whiteSpace: 'pre-line' }}>{a?.background}</p>
            <p className="mono">{s.studioName} · {s.studioCity} · {s.region}</p>
          </div>
        </div>
      </section>

      {photos.length > 1 && (
        <section className="wrap section-tight" data-material="skin">
          <div className="running-head"><span className="mono">The studio</span><span className="folio">{s.studioName}</span></div>
          <div className="film" style={{ marginTop: 'var(--s3)' }}>
            {photos.slice(1).map((p, i) => <div key={i}><Pic img={p.img} alt={p.alt} sizes="(min-width: 60rem) 25vw, 50vw" /></div>)}
          </div>
        </section>
      )}

      <section className="wrap section" data-material="paper">
        <div className="two">
          <div className="stack"><span className="mono">Community</span><h2 className="display" style={{ fontSize: 'var(--t-xl)' }}>Inksomniac Life Drawing, flash days.</h2></div>
          <div className="stack-lg">
            <p className="prose todo" style={{ whiteSpace: 'pre-line' }}>{a?.community}</p>
            {dates.length > 0 && (
              <ul className="dates">
                {dates.slice(0, 3).map((d) => <li key={d.slug} className="date-row"><span className="d">{new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric' })}<small>{new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}</small></span><span><span className="ttl">{d.title}</span><span className="venue">{KIND_LABELS[d.kind]} · {d.venue}</span></span></li>)}
              </ul>
            )}
            <p><Link href="/events" className="action action-quiet">All dates <span className="arrow">→</span></Link></p>
          </div>
        </div>
        {(a?.shows?.length || a?.press?.length) ? (
          <div className="two" style={{ marginTop: 'var(--s5)' }}>
            <div className="stack"><span className="mono">Shows &amp; press</span></div>
            <ul className="stack">
              {a?.shows?.map((x, i) => <li key={`s${i}`} className="todo">{x}</li>)}
              {a?.press?.map((x, i) => <li key={`p${i}`}><a href={x.url ?? '#'} className="link">{x.title}</a></li>)}
            </ul>
          </div>
        ) : null}
      </section>
    </>
  );
}
