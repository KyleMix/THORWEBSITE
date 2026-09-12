'use client';
import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

type Props = { defaultType?: string; about?: string; design?: string; intro?: string; thanks: string; compact?: boolean };

/** One screen. Honeypot + time-check spam protection, no visible captcha. */
export function InquiryForm({ defaultType = 'tattoo', about, design, intro, thanks, compact = false }: Props) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');
  const [t0, setT0] = useState(0);
  useEffect(() => setT0(Date.now()), []);
  const prefill = design ? `I'd like to claim the "${design}" design. ` : about ? `About "${about}": ` : '';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('busy'); setErr('');
    const fd = new FormData(e.currentTarget);
    fd.set('t0', String(t0));
    try {
      const r = await fetch('/api/inquiry', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Something went wrong.');
      track('inquiry_submitted', { type: String(fd.get('type')) });
      setState('done');
    } catch (ex) {
      setErr((ex as Error).message); setState('error');
    }
  }

  if (state === 'done') return <p className="notice" role="status">{thanks} I'll get back to you.</p>;

  return (
    <form className="form" onSubmit={onSubmit} id="inquiry" noValidate={false}>
      {intro && <p className="prose-2 todo">{intro}</p>}
      <div className="form-row">
        <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="type">What is this about</label>
          <select id="type" name="type" defaultValue={defaultType}>
            <option value="tattoo">Tattoo</option>
            <option value="commission">Commission (drawing or portrait)</option>
            <option value="event">Live event or caricatures</option>
            <option value="other">Something else</option>
          </select>
        </div>
        {!compact && <div className="field"><label htmlFor="size">Size or placement</label><input id="size" name="size" placeholder="e.g. forearm, about a hand wide" /></div>}
      </div>
      {!compact && (
        <div className="form-row">
          <div className="field"><label htmlFor="budget">Budget range <span className="hint">(optional)</span></label><input id="budget" name="budget" placeholder="e.g. $300–500" /></div>
          <div className="field"><label htmlFor="date">Date or deadline</label><input id="date" name="date" type="date" /></div>
        </div>
      )}
      <div className="field">
        <label htmlFor="message">Tell me about it</label>
        <textarea id="message" name="message" required defaultValue={prefill} />
      </div>
      {!compact && (
        <div className="field">
          <label htmlFor="ref">Reference image <span className="hint">(optional, up to 8 MB)</span></label>
          <input id="ref" name="ref" type="file" accept="image/*" />
        </div>
      )}
      {design && <input type="hidden" name="design" value={design} />}
      <div className="hp" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {state === 'error' && <p className="notice err" role="alert">{err}</p>}
      <div><button type="submit" className="action action-fill" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send'} <span className="arrow">→</span></button></div>
    </form>
  );
}
