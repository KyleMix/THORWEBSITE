# Brand

Thor's mark is in. The two files he supplied are the source of truth, kept here
as `src-lockup.png` and `src-emblem.png`; everything the site uses is derived
from them by `npm run brand:prepare`.

## What he supplied, and what had to be done to it

**`src-lockup.png`** — the brush ring, `@theLAMPKEYARTERY` and the roots, white
line art on a **solid black background**, no transparency.

That background had to go. The footer and the cover watermark sit on black and
would have tolerated it, but the header mark sits on black on the gallery pages
and on chalk (`#F4F2ED`) everywhere else, and a black rectangle would have shown
as a card on every light page. The artwork is white line on black, which means
its own luminance *is* the alpha channel it needs, so the script keys it: alpha
comes from luminance, RGB is forced to the site's chalk, and the antialiased
brush edges survive as partial alpha instead of a hard cutout.

**`src-emblem.png`** — the raven, lamp post and cliffs inside the ring, already
transparent, but the artwork is *black* with white line inside it. That is the
reverse of the lockup, and it means the emblem only works on the light
material: on black its ring disappears into the page and the illustration
floats. It is used on chalk only.

## Derived files

| File | From | Used for |
|---|---|---|
| `ring-sm.webp` | lockup, keyed, ring cropped, 72px | header mark |
| `ring.webp` | same, 900px | cover watermark, via `next/image` |
| `lockup.webp` | lockup, keyed, full | footer sign-off |
| `emblem.webp` | emblem, trimmed | the light material only |
| `app/icon.png` | ring on a black plate, 96px | favicon |

Cropping the ring out of the lockup is the fiddly part, and the script explains
its reasoning inline: the row-wise alpha profile shows the ring's mass to about
77% of the height, a quiet band, a spike where the handle text sits, then roots
trailing thinly to the bottom. Taking the minimum across the lower half lands
*below* the text, because the roots region is quieter than the gap. So it finds
the text instead — the first trough followed by a clear rise — and cuts there.

## If Thor sends new artwork

Replace `src-lockup.png` and `src-emblem.png` and run `npm run brand:prepare`.
If he can send **vector**, better still: an SVG with strokes set to
`currentColor` inverts natively, stays sharp at any size, and skips the keying
entirely — at which point the header mark can go back to being inlined.

A transparent-background export would also remove the need for the keying step,
though the result is the same either way.

## Typography in the lockup

`@theLAMPKEYARTERY` is set in a distressed typewriter. The site echoes it with
**Courier Prime** for labels, folios and specs — a clean typewriter, not a
distressed one. The distress belongs to Thor's mark and his artwork; keeping it
out of the chrome is what lets the mark read as the one rough thing on a page.
