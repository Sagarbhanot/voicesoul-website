// Forwards website chat messages to the VoiceSoul Google Chat space.
// The webhook URL is a secret: it lives in the Netlify environment
// variable GCHAT_WEBHOOK_URL, never in this (public) repo.
// Trim, cap length, and strip < > so visitors can't inject Google Chat
// mentions like <users/all> or formatted links.
const clip = (v, n) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, n);

// Only accept requests sent from the VoiceSoul website itself.
const ALLOWED_ORIGINS = new Set([
  'https://voicesoul.in',
  'https://www.voicesoul.in',
  'https://deluxe-cupcake-e4d837.netlify.app'
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!ALLOWED_ORIGINS.has(req.headers.get('origin'))) return new Response('Forbidden', { status: 403 });
  const hook = process.env.GCHAT_WEBHOOK_URL;
  if (!hook) return new Response('Chat is not configured', { status: 500 });

  let b;
  try { b = await req.json(); } catch { return new Response('Bad request', { status: 400 }); }
  const name = clip(b.name, 80), email = clip(b.email, 120), phone = clip(b.phone, 30);
  const text = clip(b.text, 2000);
  const session = clip(b.session, 40).replace(/[^a-zA-Z0-9-]/g, '');
  if (!name || !EMAIL_RE.test(email) || phone.replace(/\D/g, '').length < 10 || session.length < 8)
    return new Response('Missing details', { status: 400 });
  if (b.website) return new Response('ok', { status: 200 }); // honeypot: bots fill hidden fields

  const msg = b.type === 'start'
    ? `💬 *New chat on voicesoul.in*\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}`
    : `*${name}:* ${text}`;
  if (b.type !== 'start' && !text) return new Response('Empty message', { status: 400 });

  // One Google Chat thread per visitor, so each conversation stays together.
  const url = `${hook}&threadKey=vs-${session}&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ text: msg })
  });
  return new Response(r.ok ? 'ok' : 'failed', { status: r.ok ? 200 : 502 });
};

export const config = { path: '/api/chat' };
