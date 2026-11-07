// POST /api/walkthrough — "Request walkthrough" form → email via Resend.
// Env: RESEND_API_KEY (required), NOTIFY_EMAIL, RESEND_FROM (optional;
// same variables as the main site's hiring notifications).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  if (body.website) return res.status(200).json({ ok: true }); // honeypot: pretend success

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const project = clean(body.project, 120);
  if (name.length < 2 || !EMAIL_RE.test(email) || !project) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const key = (process.env.RESEND_API_KEY || '').trim();
  if (!key) return res.status(500).json({ error: 'Email is not configured' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: (process.env.RESEND_FROM || '').trim() || 'RTA beta <onboarding@resend.dev>',
        to: (process.env.NOTIFY_EMAIL || '').trim() || 'johnrubinodesign@gmail.com',
        reply_to: email,
        subject: `Walkthrough request: ${project}`,
        text: `${name} <${email}> asked for a walkthrough of ${project}.\n\nSent from the Rubino Transit Authority beta.`,
      }),
    });
    if (!r.ok) {
      console.error('[walkthrough] Resend rejected', r.status, await r.text());
      return res.status(502).json({ error: 'Send failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[walkthrough] send error', err);
    return res.status(502).json({ error: 'Send failed' });
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
