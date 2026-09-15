# Brand

## Current state: the mark on the site is a STAND-IN

Thor's artwork has been seen but never supplied as a file, so the ring you see
is drawn in code — arcs roughened by an SVG turbulence filter. It is an
approximation and it is not meant to survive. Replace it.

## Drop the real files here

Save them at exactly these paths and names. Every use on the site already
points at them, so there is no code to change — the upload *is* the swap.

| File | What it is | Used for |
|---|---|---|
| `ring.webp` (or `.png`) | The brush ring **alone** | Header mark, cover watermark |
| `lockup.webp` (or `.png`) | Ring + `@theLAMPKEYARTERY` + roots | Footer sign-off |
| `emblem.webp` (or `.png`) | The full illustration — raven, lamp post, cliffs inside the ring | Optional feature piece |

Upload straight to the branch:
<https://github.com/KyleMix/THORWEBSITE/upload/claude/tender-ritchie-fmgd9x/public/brand>

If you upload `.png` instead of `.webp`, say so and the three references in
`components/BrandMark.tsx` get the extension changed — that is the whole edit.

## The one thing that matters: transparency

**Export white linework on a transparent background, not on black.**

The footer and the cover watermark sit on black, so a black-background file
would look fine there. The header mark does not — it sits on black on the
gallery pages and on chalk (`#F4F2ED`) on the shop, book and about pages, and a
black rectangle would show as a box on the light ones.

With a transparent white file, the header inverts itself in CSS
(`.nav[data-over="paper"] .nav-mark { filter: invert(1) }`) and one file covers
both materials. With a black-background file it cannot, and you would have to
supply a second dark-on-light version.

Vector is better than raster if the artwork exists as one: an SVG with strokes
set to `currentColor` inverts natively and stays sharp at every size. Raster is
completely fine otherwise — 1200&nbsp;px wide is plenty for the largest use.

## After the files land

```bash
npm run brand:raster   # only if you dropped SVGs and want WebP derivatives
npm run build
```

`app/icon.svg` is the favicon and is separate — replace it with a square
version of the ring. Keep its black background plate; the mark is white
linework and vanishes on a light browser tab otherwise.

## Typography in the lockup

`@theLAMPKEYARTERY` is set in a distressed typewriter. The site echoes it with
**Courier Prime** for labels, folios and specs — a clean typewriter, not a
distressed one. The distress belongs to Thor's mark and his artwork; keeping it
out of the chrome is what lets the mark read as the one rough thing on a page.
