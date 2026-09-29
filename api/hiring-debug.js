// /api/hiring-debug — one-click health check for hiring-link tracking (admin only)
// Usage: /api/hiring-debug?key=YOUR_ADMIN_KEY
// Optional: &t=<short code or full hiring link>   check a specific link
//           &email=1                               send a test notification email
// Reports which env vars are set (never their values), whether KV reads/writes
// and the dedupe check work, whether the link carries a tracking id, and Resend's
// response. Writes only a throwaway key that expires in 60 seconds.
import { kvConfigured, kvRaw, listHiringViews } from '../lib/hiring-store.js';
import { verifyHiringToken, isObviousBot } from '../lib/hiring-token.js';

const ENV_VARS = [
    'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'HIRING_SECRET', 'ADMIN_KEY',
    'SITE_URL', 'NOTIFY_EMAIL', 'RESEND_API_KEY', 'RESEND_FROM'
];

function extractToken(t) {
    if (!t) return '';
    try { return new URL(t).searchParams.get('t') || t; } catch { return t; }
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const { key, t, email } = req.query;
    if (!key || key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const diagnosis = [];
    const out = { env: {}, diagnosis };

    for (const name of ENV_VARS) out.env[name] = Boolean(process.env[name]);
    const recipient = (process.env.NOTIFY_EMAIL || '').trim() || 'johnrubinodesign@gmail.com';
    const sender    = (process.env.RESEND_FROM || '').trim() || 'Portfolio Tracker <onboarding@resend.dev>';
    out.env.notifyRecipient = recipient;
    out.env.notifySender    = sender;

    // ── KV: write, read, and the NX dedupe used by /api/verify ──
    if (!kvConfigured()) {
        diagnosis.push('KV is not configured (KV_REST_API_URL / KV_REST_API_TOKEN missing) — nothing can be stored.');
    } else {
        const probe = `hire:debug:${Date.now()}`;
        const write  = await kvRaw(`/set/${encodeURIComponent(probe)}/ok/EX/60`, { method: 'POST' });
        const read   = await kvRaw(`/get/${encodeURIComponent(probe)}`);
        const nx1    = await kvRaw(`/set/${encodeURIComponent(probe + ':nx')}/1/NX/EX/60`, { method: 'POST' });
        const nx2    = await kvRaw(`/set/${encodeURIComponent(probe + ':nx')}/1/NX/EX/60`, { method: 'POST' });
        const legacy = await kvRaw(`/set/${encodeURIComponent(probe + ':legacy')}/1?NX=true&EX=60`, { method: 'POST' });
        out.kv = {
            write:  { status: write.status, body: write.body },
            read:   { status: read.status, body: read.body },
            dedupeFirst:  { status: nx1.status, body: nx1.body, expected: 'result "OK"' },
            dedupeRepeat: { status: nx2.status, body: nx2.body, expected: 'result null' },
            previousDedupeFormat: { status: legacy.status, body: legacy.body }
        };
        if (!write.ok) diagnosis.push(`KV writes fail (HTTP ${write.status}) — check the KV token is the read/write one, not KV_REST_API_READ_ONLY_TOKEN.`);
        else if (read.body?.result !== 'ok') diagnosis.push('KV write succeeded but read-back did not match.');
        if (nx1.body?.result !== 'OK' || nx2.body?.result !== null) diagnosis.push('Dedupe check misbehaves — opens may be dropped or double-counted.');
        if (!legacy.ok || legacy.body?.result !== 'OK') diagnosis.push('The previous dedupe format was rejected by KV — this is why opens were silently skipped (fixed in this deploy).');

        const recent = await listHiringViews(100);
        out.stored = { opensInList: recent.length, newest: recent[0]?.ts || null };
    }

    // ── A specific hiring link ──
    if (t) {
        const check = await verifyHiringToken(extractToken(t));
        out.token = {
            ok:       check.ok,
            reason:   check.reason || null,
            company:  check.payload?.co || null,
            hasTrackingId: Boolean(check.payload?.id),
            expires:  check.payload?.exp ? new Date(check.payload.exp * 1000).toISOString() : null
        };
        if (check.ok && !check.payload.id) diagnosis.push('This link has no tracking id, so opens are never logged — regenerate it with /api/generate.');
        if (check.reason === 'expired') diagnosis.push('This link has expired — expired opens are intentionally not logged.');
        if (check.reason === 'invalid') diagnosis.push('This link did not validate (unknown short code or wrong HIRING_SECRET).');
    }

    // ── Your own browser, as /api/verify would see it ──
    const ua = req.headers['user-agent'] || '';
    out.requester = { userAgent: ua.slice(0, 200), treatedAsBot: isObviousBot(ua) };
    if (out.requester.treatedAsBot) diagnosis.push('Your browser is being treated as a bot, so your own opens are skipped.');

    // ── Email ──
    if (!process.env.RESEND_API_KEY) {
        diagnosis.push('RESEND_API_KEY is not set — no notification emails are sent.');
    } else if (email === '1') {
        try {
            const r = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: sender,
                    to: recipient,
                    subject: '✅ Portfolio tracker test email',
                    html: '<p>If you can read this, hiring-link notifications can reach you.</p>'
                })
            });
            const body = await r.text();
            out.email = { status: r.status, body: body.slice(0, 500) };
            if (!r.ok) diagnosis.push(`Resend rejected the test email (HTTP ${r.status}). With the default onboarding@resend.dev sender, Resend only delivers to the address your Resend account was created with — set NOTIFY_EMAIL to that address, or verify your domain and set RESEND_FROM.`);
        } catch (err) {
            out.email = { error: String(err && err.message || err) };
            diagnosis.push('Could not reach Resend.');
        }
    }

    if (!diagnosis.length) diagnosis.push('No problems found.');
    return res.status(200).json(out);
}
