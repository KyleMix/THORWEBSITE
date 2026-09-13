# Brand

## The mark

``enso.svg` and `mark.svg` are a stand-in for Thor's brush ring, drawn as smooth
arcs roughened by SVG turbulence displacement so the edge breaks up like a dry
brush instead of reading as a vector circle. Both stroke in `currentColor`, so
the mark inverts automatically between the black and chalk materials.

`mark.svg` is the ring plus the roots hanging off its lower edge; use it large
and once per page. `enso.svg` is the ring alone, for the header, section marks
and empty states.

## Swapping in the real artwork

When Thor's files arrive:

1. **The ring.** Export it as SVG with a transparent background and the strokes
   set to `currentColor` (or `#FFFFFF`, then find-and-replace). Save over
   `public/brand/enso.svg` and `public/brand/mark.svg`. Nothing else changes —
   every use references those two paths.

   If you only have a raster, save a transparent PNG at 1200px as
   `public/brand/enso.png` and change `components/Enso.tsx` to render an
   `<img>`; note that a raster can't invert on the chalk material, so supply
   two files (`enso-light.png`, `enso-dark.png`) and swap on the material.

2. **The wordmark.** The header currently sets "Lampkey Artery" in Bodoni Moda
   next to the ring. To use Thor's lockup instead, replace the `<Enso>` and text
   in `components/Nav.tsx` with `<img src="/brand/wordmark.svg" alt="Lampkey Artery" height="24" />`.

3. **The favicon.** Replace `app/icon.svg`. Keep the black background plate —
   the mark is white linework and disappears on a light browser tab otherwise.

## Typography in the logo

The `@theLAMPKEYARTERY` lockup is set in a distressed typewriter face. The site
echoes it with **Courier Prime** for labels, folios and specs — a clean
typewriter, not a distressed one. The distress belongs to Thor's mark and his
artwork; keeping it out of the chrome is what lets the mark read as the one
rough thing on the page.
