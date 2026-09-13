import Link from 'next/link';
import { getSettings, getFeaturedWorks, getHeroWork, getDesigns, getAppearances, getSocials, getWorks, catalogueNo, KIND_LABELS } from '@/lib/content';
import { Pic } from '@/components/Pic';
import { Flip } from '@/components/Flip';
import { WorkIndex } from '@/components/WorkIndex';
import { SocialInline } from '@/components/Socials';


export default async function Home() {
  const [s, featured, hero, designs, dates, socials, all] = await Promise.all([
    getSettings(), getFeaturedWorks(), getHeroWork(), getDesigns(), getAppearances(), getSocials(), getWorks(),
  ]);
  const no = (slug: string) => catalogueNo(all.findIndex((w) => w.slug === slug));
  const [first, last] = s.artistName.split(' ');
  const availableDesigns = designs.filter((d) => d.status === 'available').slice(0, 4);
  const igMain = socials.find((x) => x.slug === 'instagram');
  const igDesigns = socials.find((x) => x.slug === 'instagram-designs');

  return (
    <>
      {/* The cover */}
      <section className="cover" data-material="skin">
        {hero && (
          <div className="cover-art">
            <Pic img={hero.img} alt={hero.alt} sizes="(min-width: 60rem) 60vw, 100vw" priority fill quality={72} />
          </div>
        )}
        <div className="cover-body">
          <img src="/brand/enso-ring.webp" alt="" aria-hidden="true" className="cover-enso" width={340} height={340} decoding="async" fetchPriority="low" />
          <h1 className="cover-name name"><span>{first}</span><span>{last ?? ''}</span></h1>
          <div className="cover-meta">
            <span className="mono">{s.brandName}</span>
            <span className="mono">Tattoo · {s.studioCity}</span>
            <span className="mono">{s.studioName}</span>
          </div>
          <p className="lede">{s.statement}</p>
          <div className="cover-actions">
            <Link href="/book" className="action action-fill" data-cursor="view" data-cursor-label="Book">Book <span className="arrow">→</span></Link>
            <Link href="/shop" className="action" data-cursor="view" data-cursor-label="Shop">Shop</Link>
          </div>
        </div>
        <div className="cover-foot">
          {hero ? <span>Cover · {no(hero.slug)} · {hero.title}</span> : <span />}
          <span>Selected works below</span>
        </div>
      </section>

      {/* Flip-through of selected works */}
      <Flip heading="Selected works" items={featured.map((w) => ({ slug: w.slug, title: w.title, year: w.year, medium: w.medium, alt: w.alt, img: w.img, no: no(w.slug) }))} />

      {/* The artist, on paper */}
      <section className="wrap section" data-material="paper">
        <div className="running-head"><span className="mono">The artist</span><span className="folio">{s.homeCity}</span></div>
        <div className="artist" style={{ marginTop: 'var(--s4)' }}>
          <div className="artist-photo">
            {s.thorPhoto && <Pic img={s.thorImg} alt={s.thorPhotoAlt ?? s.artistName} sizes="(min-width: 60rem) 55vw, 100vw" />}
          </div>
          <div className="artist-copy stack-lg">
            <h2 className="display" style={{ fontSize: 'var(--t-2xl)' }}>Lamp, key, artery.</h2>
            <p className="prose todo">{s.homeIntro}</p>
            <p><Link href="/about" className="action action-quiet">About Thor <span className="arrow">→</span></Link></p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="wrap section-tight" data-material="paper">
        <div className="running-head"><span className="mono">Process</span><span className="folio">Sketch · stencil · skin</span></div>
        <div className="film" style={{ marginTop: 'var(--s3)' }}>
          <div className="portrait"><Pic img={{ src: '/media/placeholders/paper-9x16.jpg', width: 1125, height: 2000, blur: '', ar: 0.5625 }} alt="TODO: short vertical clip of a piece coming together" sizes="(min-width: 60rem) 25vw, 50vw" /></div>
          <div><Pic img={{ src: '/media/placeholders/paper-4x5.jpg', width: 1600, height: 2000, blur: '', ar: 0.8 }} alt="TODO: sketch" sizes="(min-width: 60rem) 25vw, 50vw" /></div>
          <div><Pic img={{ src: '/media/placeholders/paper-4x5.jpg', width: 1600, height: 2000, blur: '', ar: 0.8 }} alt="TODO: stencil" sizes="(min-width: 60rem) 25vw, 50vw" /></div>
          <div><Pic img={{ src: '/media/placeholders/skin-4x5.jpg', width: 1600, height: 2000, blur: '', ar: 0.8 }} alt="TODO: in progress" sizes="(min-width: 60rem) 25vw, 50vw" /></div>
          <div><Pic img={{ src: '/media/placeholders/skin-4x5.jpg', width: 1600, height: 2000, blur: '', ar: 0.8 }} alt="TODO: healed" sizes="(min-width: 60rem) 25vw, 50vw" /></div>
        </div>
        <p className="mono" style={{ marginTop: 'var(--s2)' }}>TODO — replace with sketches, stencils, in-progress shots, or a Reels-format clip from /assets/video.</p>
      </section>

      {/* Available designs teaser */}
      {availableDesigns.length > 0 && (
        <section className="wrap section" data-material="paper">
          <div className="running-head"><span className="mono">Available designs</span><Link href="/designs" className="mono link">All designs →</Link></div>
          <div className="designs" style={{ marginTop: 'var(--s3)' }}>
            {availableDesigns.map((d) => (
              <Link key={d.slug} href={`/designs/${d.slug}`} className="design" data-status={d.status} data-cursor="view" data-cursor-label="Claim">
                <span className="design-img"><Pic img={d.img} alt={d.alt} sizes="(min-width: 60rem) 25vw, 50vw" /></span>
                <span className="ttl">{d.title}</span>
                <span className="mono">{d.colorOptions.map((c) => (c === 'color' ? 'Color' : 'Black & grey')).join(' / ')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* The index */}
      <section className="wrap section" data-material="skin">
        <div className="running-head"><span className="mono">Index of works</span><span className="folio">{all.length} entries</span></div>
        <div style={{ marginTop: 'var(--s3)' }}>
          <WorkIndex items={all.slice(0, 8).map((w) => ({ slug: w.slug, title: w.title, year: w.year, medium: w.medium, placement: w.placement, alt: w.alt, img: w.img, no: no(w.slug) }))} />
        </div>
        <p style={{ marginTop: 'var(--s3)' }}><Link href="/work" className="action">Full index <span className="arrow">→</span></Link></p>
      </section>

      {/* Where he'll be next — hides itself when empty */}
      {dates.length > 0 && (
        <section className="wrap section-tight" data-material="skin">
          <div className="running-head"><span className="mono">Where he'll be next</span><Link href="/events" className="mono link">All dates →</Link></div>
          <ul className="dates" style={{ marginTop: 'var(--s3)' }}>
            {dates.slice(0, 3).map((a) => {
              const d = new Date(a.date + 'T12:00:00');
              return (
                <li key={a.slug} className="date-row">
                  <span className="d">{d.toLocaleDateString('en-US', { day: 'numeric' })}<small>{d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</small></span>
                  <span><span className="ttl">{a.title}</span><span className="venue">{KIND_LABELS[a.kind]} · {a.venue} · {a.city}{a.time ? ` · ${a.time}` : ''}</span></span>
                  {a.flyer && <Pic img={a.flyerImg} alt={a.flyerAlt || ''} sizes="80px" className="flyer" />}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Instagram strip */}
      <section className="wrap section-tight" data-material="skin">
        <div className="running-head">
          <span className="mono">{igMain ? <a href={igMain.url!} target="_blank" rel="noopener">@{s.instagramMain}</a> : `@${s.instagramMain}`} · latest</span>
          {igDesigns && <a href={igDesigns.url!} target="_blank" rel="noopener" className="mono link">@{s.instagramDesigns} — available flash & designs →</a>}
        </div>
        <div className="ig" style={{ marginTop: 'var(--s2)' }}>
          {all.slice(0, 6).map((w) => (
            <a key={w.slug} href={w.instagramUrl ?? igMain?.url ?? '#'} target="_blank" rel="noopener" aria-label={`${w.title} on Instagram`}>
              <Pic img={w.img} alt="" sizes="(min-width: 60rem) 16vw, 33vw" />
            </a>
          ))}
        </div>
        <p className="mono" style={{ marginTop: 'var(--s2)' }}>TODO — swap for a live embed (Behold / Instagram Basic Display) once tokens exist; until then this shows the newest six entries from Work, each linking to its post.</p>
      </section>

      {/* Contact */}
      <section className="wrap section" data-material="paper">
        <div className="two">
          <div className="stack">
            <span className="mono">Contact</span>
            <h2 className="display" style={{ fontSize: 'var(--t-2xl)' }}>Say hi.<br />Or book.</h2>
          </div>
          <div className="stack-lg">
            <p className="prose-2">Ready to book? Go straight to <Link href="/book" className="link">Book</Link>. Want a piece for the wall? <Link href="/shop" className="link">Shop</Link>. Everything else, including just saying you like the ghost cat:</p>
            <p><a href={`mailto:${s.email}`} className="display" style={{ fontSize: 'var(--t-xl)' }}>{s.email}</a></p>
            <SocialInline socials={socials} />
            <p className="mono">{s.thanksLine}</p>
          </div>
        </div>
      </section>
    </>
  );
}
