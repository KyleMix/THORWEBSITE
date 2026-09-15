import Link from 'next/link';
import { getSettings, getSocials } from '@/lib/content';
import { SocialInline } from './Socials';
import { BrandLockup } from './BrandMark';


export async function Footer() {
  const [s, socials] = await Promise.all([getSettings(), getSocials()]);
  return (
    <footer className="footer" data-material="skin">
      <div className="footer-top">
        <div className="sig-block">
          <BrandLockup className="sig-mark" />
          <p className="sig">{s.thanksLine}</p>
        </div>
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
