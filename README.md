# Lampkey Artery — Thor Becker

Portfolio, booking and shop for Thor Becker, tattoo artist at EngineerInk in
Fullerton, CA. Next.js App Router, Keystatic (git-based CMS), vanilla CSS,
Stripe, Cal.com, Resend. Deploys to Vercel.

```bash
npm install
npm run dev          # http://localhost:3000  ·  editor at /keystatic
```

---

## The design system, in one paragraph

Two materials, never mixed on one screen. **Skin** is the warm near-black
(`#100D0C`) that tattoo photography needs. **Paper** is bone (`#EFE8DC`), for
drawings, prints and everything you read. Every section declares
`data-material="skin"` or `"paper"` and all colours resolve through
`--bg / --fg` tokens, so the chrome never fights a piece. Type is **Fraunces**
(display, WONK axis on), **Karla** (body) and **IBM Plex Mono** (labels,
folios, specs) — self-hosted WOFF2 from `/public/fonts`, no third-party
request. The one accent colour is deliberately unset: it gets pulled from
Thor's actual work once `/assets` lands.

The signature interaction is **the lamp** — a warm light that follows the
cursor across skin sections and lifts the piece under it. On phones it becomes
scroll-driven: the plate nearest the centre of the viewport brightens. Both
are switched off entirely by `prefers-reduced-motion`.

---

## Adding a piece in Keystatic

1. Go to `/keystatic` (on the deployed site, or locally at
   `http://localhost:3000/keystatic`). Thor can do all of this from his phone.
2. **Works → Add** for a tattoo, drawing, original, print or live-event photo.
   Fill in:
   - **Title, Year, Type, Styles** — Type and Styles drive the filters on `/work`.
   - **Image** — uploads into `public/media/works/`.
   - **Alt text** — required. Describe the piece for someone who can't see it;
     it's what search engines and screen readers use.
   - **Medium / Placement** — e.g. `Tattoo, black & grey` · `Forearm`.
   - **Status** — healed, fresh, available, sold, print available.
   - **Caption** — short, in his voice. Shown in the lightbox and on the piece page.
   - **Show on home page** + **Home page order** — the home flip-through takes
     the first 12, lowest order first.
   - **Use as home hero** — exactly one piece should have this on.
   - **Grid importance** — "Wide" gives it more room in the desktop gallery.
   - **Buy: linked shop product** — links the piece to a Shop item; the lightbox
     button becomes *Buy* instead of *Inquire*.
3. Save. In local mode that writes a YAML file; in GitHub mode it opens a commit.

**Available designs** work the same way (Designs collection): drawing, note,
colour options, placement ideas, one-off vs repeatable, and status
(available / claimed / tattooed). Claimed and tattooed designs stay visible but
marked, and a tattooed one can link to the finished tattoo in Works.

### Importing everything from Instagram at once

```bash
python3 download-instagram-assets.py "<apify dataset url>" ./assets   # on your machine
# sort photos of Thor into assets/thor/ by hand, then:
npm run import:assets          # creates entries + optimised media
npm run import:assets -- --clean   # also removes the placeholder seed entries
```

The importer guesses a title and styles from each caption, carries the caption
and the Instagram permalink across, and leaves **alt text as `TODO`** — write
those in Keystatic. It never overwrites an entry that already exists.

---

## Marking something sold manually

There are two levers, and they do different things.

**The manual override — for an in-person sale.** Shop → the product →
**Sold out (manual override)** → Save. The piece stays visible, shows a *Sold*
badge, and its button becomes *ask about something similar*. This wins over
everything else.

**Live stock — what buyers actually decrement.** Real stock lives in Upstash
Redis under `stock:<slug>`, seeded from the product's **Inventory** field on
first read, decremented atomically at checkout, and given back if a checkout
session expires unpaid. To reset it by hand, set the key in the Upstash console:

```
SET stock:moth 12
```

Changing **Inventory** in Keystatic only re-seeds a product Redis has never
seen. For anything already selling, set the Redis key.

Originals are one-of-one: inventory 1, so the first sale takes them to 0 and
the site marks them sold automatically.

> **Why Redis and not a commit back to the repo?** A webhook that commits would
> trigger a full rebuild per purchase, race between two simultaneous buyers, and
> have no atomic decrement — two people could buy the last print of an edition.
> `DECR` is atomic and settles in milliseconds. The cost is that Shop pages
> revalidate on a short window instead of being frozen at build (`revalidate =
> 60` on the product page, `300` on the index) with the live count fetched
> client-side from `/api/stock`, so the LCP image is still static HTML.
> Everything outside Shop is fully static. Without Redis configured the site
> falls back to an in-process count and still runs.

---

## Changing shop prices

Prices live in exactly one place: the **Price (cents, USD)** field on each
product. `12500` is $125.00. Checkout builds its line items from that value at
request time, so a price change takes effect on the next request — there is no
second source of truth to keep in sync.

Optional framing is a second line item: set **Framing** to *Optional add-on*
and give it a **Framing add-on (cents)** amount.

Flat-rate shipping is in **Site settings → Flat-rate shipping (cents)**.

To mirror the catalogue into the Stripe dashboard (useful for reporting and
Payment Links, not required for checkout):

```bash
STRIPE_SECRET_KEY=sk_test_... npm run sync:stripe
```

It's idempotent, keyed on the product slug in Stripe metadata, and writes the
resulting `stripeProductId` / `stripePriceId` back into the YAML — commit those.

**No prices appear anywhere else on the site.** Every service and commission
routes to an inquiry for a quote; shop items are the only things with a number
on them.

---

## Updating appearances

Appearances → Add. Kind (flash day, life drawing, guest spot, convention,
fundraiser), date, time, venue, city, optional flyer and link.

- Past dates drop off the home page and move to a *Past* list on `/events`
  automatically — nothing to delete.
- With no upcoming dates, the home page section **hides itself** entirely.
- **Hide** takes an entry off the site without deleting it.

Flyers belong here, not in Works — the gallery is for work.

---

## Deploying

1. Push to GitHub and import the repo on Vercel. Framework preset: Next.js.
   No build-command changes needed.
2. Set the environment variables from [`.env.example`](.env.example). The site
   builds and runs with **none of them set** — every integration degrades to a
   visible, honest state (the Cal embed becomes an email link, checkout becomes
   an inquiry, Resend logs to the server console) — so you can deploy first and
   switch each on as keys arrive.
3. **Stripe webhook:** add an endpoint at
   `https://<domain>/api/stripe/webhook` for `checkout.session.completed` and
   `checkout.session.expired`, and put its signing secret in
   `STRIPE_WEBHOOK_SECRET`.
4. **Redis:** add Upstash from the Vercel Marketplace; it sets
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for you.
5. **Resend:** verify the sending domain, then set `RESEND_API_KEY` and
   `RESEND_FROM`. Inquiries and order confirmations go to `NOTIFY_EMAIL`.
6. **Cal.com:** create two event types (a free consultation and a tattoo
   session), attach the Stripe app to the session one to collect the deposit,
   and set `NEXT_PUBLIC_CALCOM_USERNAME` plus the two slugs.
7. **Keystatic for Thor's phone:** set `KEYSTATIC_STORAGE=github` and the GitHub
   app credentials so his edits commit straight to the repo. Left unset, the
   editor runs in local mode (your machine only).
8. Set `NEXT_PUBLIC_SITE_URL` to the real domain — canonical URLs, Open Graph
   images and the sitemap are built from it.

---

## Project map

```
app/(site)/          every public page; app/layout.tsx holds <html>, (site)/layout.tsx the chrome
app/api/             inquiry · checkout · stripe/webhook · stock · keystatic
components/          Nav, Bar, Footer, Gallery (+lightbox), Flip, WorkIndex,
                     Pic, Lamp, Cursor, InquiryForm, CalEmbed, Buy, ProductGallery
lib/content.ts       the only place content is read; normalises Keystatic's nulls
lib/images.ts        real dimensions + blur placeholders; resolves media paths
lib/stock.ts         atomic stock (Redis, with an in-memory fallback)
content/             the YAML Keystatic writes — this is the database
public/media/        uploads, by collection
scripts/             import-assets.mjs · sync-stripe.mjs · placeholders.mjs
keystatic.config.tsx the schema
```

`npm run typecheck` and `npm run build` both have to pass before a deploy.

---

## What is still placeholder

Everything marked `TODO:` in `content/` renders on the site with a small mono
`TODO` marker in front of it, so nothing fake can ship unnoticed. The seed
entries (14 works, 8 designs, 5 products, 3 appearances) exist so the layout is
real and testable before `/assets` arrives — `npm run import:assets -- --clean`
replaces them wholesale.

The images are generated placeholder plates (`public/media/placeholders/`):
registration marks and their own dimensions, clearly a slot, never mistakable
for artwork.

See the design record for the full open-questions list:
<https://claude.ai/code/artifact/63f0eddb-8927-43c9-b089-64745e98c0ea>
