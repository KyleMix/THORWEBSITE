/**
 * Thor's brush ring. Inlined rather than served as <img> so it inherits
 * currentColor and inverts between the black and chalk materials; the
 * turbulence filter needs unique ids per instance or Safari reuses the first.
 * Artwork lives in public/brand/enso.svg — see public/brand/README.md to swap
 * in the real files.
 */
let n = 0;

export function Enso({
  size = 120,
  roots = false,
  className,
}: { size?: number; roots?: boolean; className?: string }) {
  const id = `lk${(n += 1)}`;
  return (
    <svg
      className={className}
      width={size}
      height={roots ? size * 1.25 : size}
      viewBox={roots ? '0 0 200 250' : '0 0 200 200'}
      aria-hidden="true"
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`${id}a`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.055" numOctaves={4} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={11} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}b`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.03" numOctaves={5} seed={29} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </defs>
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <circle cx={100} cy={102} r={72} strokeWidth={15} strokeDasharray="392 61" strokeDashoffset={330} filter={`url(#${id}a)`} opacity={0.92} />
        <circle cx={100} cy={102} r={81} strokeWidth={3.5} strokeDasharray="196 40 92 250" strokeDashoffset={300} filter={`url(#${id}b)`} opacity={0.62} />
        <circle cx={101} cy={101} r={63} strokeWidth={2.6} strokeDasharray="120 54 168 180" strokeDashoffset={250} filter={`url(#${id}b)`} opacity={0.5} />
        {roots && (
          <g strokeWidth={1.7} opacity={0.8} filter={`url(#${id}b)`}>
            <path d="M112 172c1 12-2 19 1 29c2 7 1 12-2 18" />
            <path d="M122 174c0 9 2 15 5 22c2 6 2 10 0 15" />
            <path d="M132 170c2 8 1 14 4 21" />
            <path d="M103 173c-1 8 1 13 2 19" />
            <path d="M142 164c1 6 0 11 2 16" />
          </g>
        )}
      </g>
    </svg>
  );
}
