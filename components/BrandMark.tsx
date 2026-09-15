import { Enso } from './Enso';

/**
 * Thor's mark, in the three places it appears.
 *
 * Each slot reads one file from /public/brand. Those files are stand-ins until
 * Thor's artwork is supplied; dropping a real file in under the same name
 * replaces it everywhere with no code change.
 *
 *   ring.webp    the brush ring alone        header, cover watermark
 *   lockup.webp  ring + handle + roots       footer sign-off
 *   emblem.webp  the full illustration       optional feature
 *
 * The header ring sits on both the black and the chalk material. The artwork is
 * white linework, so on chalk it is inverted in CSS rather than needing a
 * second file.
 */

export function BrandRing({ size = 26, className }: { size?: number; className?: string }) {
  // Header size: small enough that the drawn stand-in costs nothing, and it
  // inherits currentColor so it inverts with the material for free.
  return <Enso size={size} className={className} />;
}

export function BrandWatermark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/ring.webp"
      alt=""
      aria-hidden="true"
      className={className}
      width={340}
      height={340}
      decoding="async"
      fetchPriority="low"
    />
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/lockup.webp"
      alt=""
      aria-hidden="true"
      className={className}
      width={132}
      height={165}
      loading="lazy"
      decoding="async"
    />
  );
}
