'use client';
import type { Social } from '@/lib/content';
import { SocialIcon } from './Icons';
import { track } from '@/lib/analytics';

export function SocialRows({ socials }: { socials: Social[] }) {
  return (
    <ul className="socials">
      {socials.map((s) => (
        <li key={s.slug}>
          <a className="social-row" href={s.url!} target={s.platform === 'email' ? undefined : '_blank'} rel="noopener" onClick={() => track('outbound_social', { network: s.slug })}>
            <SocialIcon platform={s.platform} />
            <span className="lbl">{s.label}</span>
            <span className="hnd">{s.handle}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SocialInline({ socials }: { socials: Social[] }) {
  return (
    <div className="social-inline">
      {socials.map((s) => (
        <a key={s.slug} href={s.url!} target={s.platform === 'email' ? undefined : '_blank'} rel="noopener" onClick={() => track('outbound_social', { network: s.slug })}>
          <SocialIcon platform={s.platform} /> {s.handle || s.label}
        </a>
      ))}
    </div>
  );
}
