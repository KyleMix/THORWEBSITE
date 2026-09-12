'use client';
import { track as vercelTrack } from '@vercel/analytics';

export type EventName =
  | 'booking_started'
  | 'booking_completed'
  | 'add_to_cart'
  | 'checkout_completed'
  | 'inquiry_submitted'
  | 'outbound_social';

export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(name, props);
  } catch {
    /* analytics must never break the page */
  }
}
