import { NextResponse } from 'next/server';
import { sendMail, NOTIFY } from '@/lib/email';

export const runtime = 'nodejs';
const MAX = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const fd = await req.formData();
  const s = (k: string) => String(fd.get(k) ?? '').trim();

  // Spam: honeypot filled, or submitted faster than a human could type.
  if (s('website')) return NextResponse.json({ ok: true });
  const t0 = Number(s('t0'));
  if (!t0 || Date.now() - t0 < 3000) return NextResponse.json({ error: 'That was quick. Try again in a moment.' }, { status: 400 });

  const name = s('name'), email = s('email'), type = s('type'), message = s('message');
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message) return NextResponse.json({ error: 'Name, a real email, and a message are required.' }, { status: 400 });

  const file = fd.get('ref');
  let attachment: { filename: string; content: string } | undefined;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX) return NextResponse.json({ error: 'Reference image is over 8 MB.' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Reference must be an image.' }, { status: 400 });
    attachment = { filename: file.name, content: Buffer.from(await file.arrayBuffer()).toString('base64') };
  }

  const optional = (label: string, key: string) => (s(key) ? [`${label}: ${s(key)}`] : []);
  const lines = [
    `Type: ${type}`, `Name: ${name}`, `Email: ${email}`,
    ...optional('Size/placement', 'size'), ...optional('Budget', 'budget'),
    ...optional('Date/deadline', 'date'), ...optional('Design claimed', 'design'),
    '', message, '', attachment ? `Reference attached: ${attachment.filename}` : 'No reference attached.',
  ].join('\n');

  try {
    await sendMail({ to: NOTIFY, subject: `[Inquiry · ${type}] ${name}${s('design') ? ` · claims ${s('design')}` : ''}`, text: lines, replyTo: email, attachments: attachment ? [attachment] : undefined });
    await sendMail({ to: email, subject: 'Got it — Lampkey Artery', text: `Hi ${name},\n\nGot your message. I'll get back to you soon.\n\nThanks for looking.\nThor\n\n---\n${message}` });
  } catch (e) {
    console.error('[inquiry]', e);
    return NextResponse.json({ error: 'Could not send right now. Email me directly instead.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
