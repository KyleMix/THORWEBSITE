import Image from 'next/image';

/**
 * Thor's mark, in the places it appears.
 *
 * The files come from his two supplied PNGs via `npm run brand:prepare`, which
 * keys the lockup's black background out to alpha and crops the ring from it.
 *
 *   ring-sm.webp the brush ring, 72px        header
 *   ring.webp    the brush ring              cover watermark
 *   lockup.webp  ring + handle + roots       footer sign-off
 *   emblem.webp  the raven and lamp post     the light material only
 *
 * The ring and lockup are chalk linework on transparent, so they read on black
 * and are inverted in CSS on the light material. The emblem is the reverse —
 * black artwork with white line inside it — so it is used on chalk only; on
 * black its ring would vanish into the page.
 */

export function BrandRing({ className }: { className?: string }) {
  return <img src="/brand/ring-sm.webp" alt="" aria-hidden="true" className={className} width={30} height={28} decoding="async" />;
}

export function BrandWatermark({ className }: { className?: string }) {
  // Through next/image so it gets a proper srcset: it renders at 22rem on phone
  // and 30rem on desktop, which a single fixed-width file cannot serve at 2x
  // without either being flagged as low-resolution or shipping bytes a
  // 9%-opacity watermark has no business costing.
  return (
    <Image
      src="/brand/ring.webp"
      alt=""
      aria-hidden="true"
      className={className}
      width={900}
      height={846}
      sizes="(min-width: 60rem) 30rem, 22rem"
      quality={55}
      loading="lazy"
      fetchPriority="low"
    />
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return <img src="/brand/lockup.webp" alt="" aria-hidden="true" className={className} width={148} height={174} loading="lazy" decoding="async" />;
}

/** The full illustration. Light material only — see the note above. */
export function BrandEmblem({ className, width = 420 }: { className?: string; width?: number }) {
  return <img src="/brand/emblem.webp" alt="Lampkey Artery — a raven on a lamp post above a cliff, drawn inside a brush ring" className={className} width={width} height={Math.round(width * 1.273)} loading="lazy" decoding="async" />;
}
