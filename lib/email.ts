import 'server-only';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM ?? 'Lampkey Artery <onboarding@resend.dev>';
export const NOTIFY = process.env.NOTIFY_EMAIL ?? 'lampkeyart@gmail.com';

type Mail = {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
};

/** Sends via Resend; logs to the server console when no key is configured, so
 *  forms still work end-to-end on a fresh clone. */
export async function sendMail({ to, subject, text, replyTo, attachments }: Mail) {
  if (!resend) {
    console.log('[email:dry-run]', JSON.stringify({ to, subject, replyTo, text, attachments: attachments?.map((a) => a.filename) }, null, 2));
    return { ok: true, dryRun: true as const };
  }
  const r = await resend.emails.send({ from: FROM, to, subject, text, replyTo, attachments });
  if (r.error) throw new Error(r.error.message);
  return { ok: true, dryRun: false as const, id: r.data?.id };
}
