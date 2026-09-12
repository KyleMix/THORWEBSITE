import 'server-only';
import Stripe from 'stripe';

/** Pinned to the SDK's own API version so upgrades are a deliberate change. */
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
export const stripeReady = Boolean(stripe && process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));
