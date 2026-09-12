# Brand swap point

The header currently renders a text wordmark ("Lampkey Artery") with a small drawn
filament-bulb mark (`components/Icons.tsx` → `Bulb`).

When Thor's logo arrives:

1. Save it here as `public/brand/logo.svg` (monochrome, `currentColor` fill so it
   inverts correctly over both materials).
2. In `components/Nav.tsx`, replace `<Bulb /> {brand}` with
   `<img src="/brand/logo.svg" alt={brand} height="22" />`.
3. Replace `app/icon.svg` with a square version for the favicon.
