import { getSettings, getSocials } from '@/lib/content';
import { SITE_URL } from '@/lib/site';
import { Nav } from '@/components/Nav';
import { Bar } from '@/components/Bar';
import { Footer } from '@/components/Footer';
import { Cursor } from '@/components/Cursor';
import { Lamp } from '@/components/Lamp';
import { JsonLd } from '@/components/JsonLd';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, socials] = await Promise.all([getSettings(), getSocials()]);
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s.artistName,
    alternateName: s.brandName,
    jobTitle: 'Tattoo artist',
    url: SITE_URL,
    email: s.email,
    worksFor: { '@type': 'LocalBusiness', name: s.studioName, address: { '@type': 'PostalAddress', addressLocality: s.studioCity.split(',')[0], addressRegion: 'CA', addressCountry: 'US' } },
    homeLocation: { '@type': 'Place', name: s.homeCity },
    sameAs: socials.filter((x) => x.platform !== 'email').map((x) => x.url),
  };
  return (
    <div className="has-bar">
      <a href="#main" className="visually-hidden">Skip to content</a>
      <Nav brand={s.brandName} socials={socials.map((x) => ({ label: x.label, url: x.url!, handle: x.handle }))} />
      <main id="main">{children}</main>
      <Footer />
      <Bar />
      <Lamp />
      <Cursor />
      <JsonLd data={person} />
    </div>
  );
}
