import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { getSettings } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.artistName} | Tattoo Artist in ${s.studioCity}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${s.brandName}` },
    description: s.statement,
    openGraph: { type: 'website', siteName: s.brandName, title, description: s.statement, locale: 'en_US' },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    icons: { icon: '/icon.svg' },
  };
}

export const viewport: Viewport = { themeColor: '#100D0C', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Only the face the largest element uses. Preloading the italic too
            made the two compete on a throttled connection and pushed LCP out;
            the italic lede swaps in a beat later, which nobody notices. */}
        <link rel="preload" href="/fonts/fraunces-normal-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        {/* The insights script only exists on Vercel; mounting it elsewhere
            logs a 404 to the console. */}
        {process.env.NODE_ENV === 'production' && process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
