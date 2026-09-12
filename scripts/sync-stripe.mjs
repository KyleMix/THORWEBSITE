#!/usr/bin/env node
/**
 * Syncs content/products/*.yaml → Stripe Products & Prices (test or live,
 * depending on STRIPE_SECRET_KEY). Idempotent: keyed by the product slug in
 * Stripe metadata. Writes stripeProductId / stripePriceId back into the YAML.
 *
 *   STRIPE_SECRET_KEY=sk_test_... npm run sync:stripe
 *
 * Checkout uses price_data from Keystatic at runtime, so this sync is for
 * Stripe Dashboard reporting and for anyone who wants to sell via Payment
 * Links. Prices in YAML are always the source of truth.
 */
import Stripe from 'stripe';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse, stringify } from 'yaml';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error('STRIPE_SECRET_KEY is not set'); process.exit(1); }
const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

const dir = 'content/products';
for (const f of readdirSync(dir).filter((x) => x.endsWith('.yaml'))) {
  const slug = f.replace(/\.yaml$/, '');
  const path = `${dir}/${f}`;
  const p = parse(readFileSync(path, 'utf8'));
  const images = SITE && p.images?.[0]?.image ? [`${SITE}/media/products/${p.images[0].image}`] : [];

  let product = p.stripeProductId ? await stripe.products.retrieve(p.stripeProductId).catch(() => null) : null;
  if (!product) {
    const found = await stripe.products.search({ query: `metadata['slug']:'${slug}'` });
    product = found.data[0] ?? null;
  }
  const body = { name: p.title, description: [p.kind === 'original' ? 'Original, one of one' : p.edition, p.size, p.medium].filter(Boolean).join(' · '), images, metadata: { slug, kind: p.kind }, active: !p.sold };
  product = product ? await stripe.products.update(product.id, body) : await stripe.products.create(body);

  let price = p.stripePriceId ? await stripe.prices.retrieve(p.stripePriceId).catch(() => null) : null;
  if (!price || price.unit_amount !== p.priceCents || !price.active) {
    if (price) await stripe.prices.update(price.id, { active: false });
    price = await stripe.prices.create({ product: product.id, currency: 'usd', unit_amount: p.priceCents, metadata: { slug } });
    await stripe.products.update(product.id, { default_price: price.id });
  }
  p.stripeProductId = product.id;
  p.stripePriceId = price.id;
  writeFileSync(path, stringify(p));
  console.log(`${slug.padEnd(36)} ${product.id}  ${price.id}  $${(p.priceCents / 100).toFixed(2)}${p.sold ? '  (sold, inactive)' : ''}`);
}
console.log('\nDone. Commit the updated YAML.');
