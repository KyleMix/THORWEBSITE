'use client';
import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/**
 * Cal.com via the official embed SDK, themed to the site. The deposit for
 * sessions is collected by Cal.com's Stripe app on the event type itself.
 * Without NEXT_PUBLIC_CALCOM_USERNAME this renders an honest fallback.
 */
export function CalEmbed({ event, email, label }: { event: string; email: string; label: string }) {
  const user = process.env.NEXT_PUBLIC_CALCOM_USERNAME;
  const link = user ? `${user}/${event}` : '';
  useEffect(() => {
    if (!link) return;
    (async () => {
      const cal = await getCalApi({ namespace: event });
      cal('ui', {
        theme: 'dark',
        cssVarsPerTheme: {
          // The embed always runs dark to match the page; light is required by the type.
          dark: { 'cal-brand': '#EFE8DC', 'cal-bg': '#100D0C', 'cal-bg-emphasis': '#181413', 'cal-text': '#EFE8DC', 'cal-text-emphasis': '#EFE8DC', 'cal-border': '#2C2624', 'cal-border-emphasis': '#EFE8DC' },
          light: { 'cal-brand': '#1A1714', 'cal-bg': '#EFE8DC', 'cal-bg-emphasis': '#E5DCCC', 'cal-text': '#1A1714', 'cal-text-emphasis': '#1A1714', 'cal-border': '#CFC4B1', 'cal-border-emphasis': '#1A1714' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
      cal('on', { action: 'linkReady', callback: () => track('booking_started', { event }) });
      cal('on', { action: 'bookingSuccessful', callback: () => track('booking_completed', { event }) });
    })();
  }, [link, event]);

  if (!link) {
    return (
      <div className="cal cal-fallback" data-material="skin">
        <p className="mono">Cal.com — not connected yet</p>
        <p className="prose-2">TODO: set <code>NEXT_PUBLIC_CALCOM_USERNAME</code> and the event type slugs in <code>.env</code>. Until then, email to book:</p>
        <p><a href={`mailto:${email}?subject=${encodeURIComponent(label)}`} className="action">Email to book <span className="arrow">→</span></a></p>
      </div>
    );
  }
  return (
    <div className="cal">
      <Cal namespace={event} calLink={link} style={{ width: '100%', height: '100%', overflow: 'auto' }} config={{ layout: 'month_view', theme: 'dark' }} />
    </div>
  );
}
