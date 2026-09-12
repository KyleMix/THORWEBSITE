import Link from 'next/link';
import { getSettings, getSocials } from '@/lib/content';
import { SocialInline } from './Socials';
import { Bulb } from './Icons';

export async function Footer() {
  const [s, socials] = await Promise.all([getSettings(), getSocials()]);
  return (
    <footer className="footer" data-material="skin">
      <div className="footer-top">
        <p className="sig"><Bulb size={22} /> {s.thanksLine}</p>
        <SocialInline socials={socials} />
      </div>
      <div className="footer-cols">
        <div>
          <Link href="/work">Work</Link><br /><Link href="/designs">Designs</Link><br /><Link href="/shop">Shop</Link>
        </div>
        <div>
          <Link href="/book">Book</Link><br /><Link href="/events">Events</Link><br /><Link href="/about">About</Link><br /><Link href="/contact">Contact</Link>
        </div>
        <div>
          <span>{s.studioName}</span><br /><span>{s.studioCity} · {s.region}</span><br /><a href={`mailto:${s.email}`}>{s.email}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {s.artistName} · {s.brandName}</span>
        <span><Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link></span>
      </div>
    </footer>
  );
}
