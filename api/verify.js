// /api/verify — validates a hiring token, logs the view, fires an email notification
// Called by hiring.html on every page load
import crypto from 'crypto';

// ── Vercel KV via REST (no npm package needed) ──────────────────────────────
async function kvGet(key) {
    if (!process.env.KV_REST_API_URL) return null;
    try {
        const r = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
        const j = await r.json();
        return j.result ? JSON.parse(j.result) : null;
    } catch { return null; }
}

// Resolve a 6-char short code to its full token string
async function kvResolveShortCode(code) {
    if (!process.env.KV_REST_API_URL) return null;
    try {
        const r = await fetch(
            `${process.env.KV_REST_API_URL}/get/${encodeURIComponent('short:' + code)}`,
            { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } }
        );
        const j = await r.json();
        return j.result || null;
    } catch { return null; }
}

async function kvSet(key, value) {
    if (!process.env.KV_REST_API_URL) return;
    try {
        await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: JSON.stringify(value) })
        });
    } catch { /* non-fatal */ }
}

// ── Geo lookup via ipapi.co (free, no key needed) ───────────────────────────
async function getLocation(ip) {
    if (!ip || ip === '::1' || ip.startsWith('127.')) return 'Local';
    try {
        const r = await fetch(`https://ipapi.co/${ip}/json/`, {
            headers: { 'User-Agent': 'portfolio-tracker/1.0' }
        });
        if (!r.ok) return 'Unknown';
        const g = await r.json();
        if (g.city && g.country_name) return `${g.city}, ${g.country_name}`;
        return g.country_name || 'Unknown';
    } catch { return 'Unknown'; }
}

// ── Resend email (REST, no npm) ──────────────────────────────────────────────
async function sendNotification({ company, viewCount, location, device, browser, expDate, now }) {
    if (!process.env.RESEND_API_KEY) return;
    const isRepeat = viewCount > 1;
    const emoji    = isRepeat ? '🔄' : '👀';
    const subject  = isRepeat
        ? `${emoji} ${company} viewed your portfolio again (${viewCount} total views)`
        : `${emoji} ${company} just opened your portfolio`;

    const timeStr = now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
    });

    const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0d0d12;color:#f0ede8;border-radius:12px;">
  <p style="font-size:32px;margin:0 0 8px;">${emoji}</p>
  <h1 style="font-size:20px;font-weight:600;margin:0 0 4px;color:#fff;">${company} ${isRepeat ? 'is back' : 'just opened your portfolio'}</h1>
  <p style="font-size:13px;color:#8a8a8a;margin:0 0 24px;">View #${viewCount}</p>
  <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;margin-bottom:20px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:7px 0;color:#8a8a8a;font-size:12px;width:80px;vertical-align:top;">Time</td>      <td style="padding:7px 0;font-size:13px;color:#f0ede8;">${timeStr}</td></tr>
      <tr><td style="padding:7px 0;color:#8a8a8a;font-size:12px;vertical-align:top;">Location</td>  <td style="padding:7px 0;font-size:13px;color:#f0ede8;">${location}</td></tr>
      <tr><td style="padding:7px 0;color:#8a8a8a;font-size:12px;vertical-align:top;">Device</td>    <td style="padding:7px 0;font-size:13px;color:#f0ede8;">${device} · ${browser}</td></tr>
      <tr><td style="padding:7px 0;color:#8a8a8a;font-size:12px;vertical-align:top;">Expires</td>   <td style="padding:7px 0;font-size:13px;color:#f0ede8;">${expDate}</td></tr>
    </table>
  </div>
  <p style="font-size:11px;color:#3a3a3a;margin:0;">John Rubino · Portfolio Tracker</p>
</div>`;

    try {
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM || 'Portfolio Tracker <onboarding@resend.dev>',
                to:   process.env.NOTIFY_EMAIL || 'johnrubinodesign@gmail.com',
                subject,
                html
            })
        });
    } catch { /* non-fatal */ }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

    let { t: token } = req.query;
    if (!token) return res.status(400).json({ valid: false, reason: 'no_token' });

    // Short codes (no '.' separator) resolve to a full token via KV
    if (!token.includes('.')) {
        const resolved = await kvResolveShortCode(token);
        if (!resolved) return res.status(401).json({ valid: false, reason: 'invalid' });
        token = resolved;
    }

    const secret = process.env.HIRING_SECRET;
    if (!secret) return res.status(500).json({ valid: false, reason: 'server_error' });

    // Split and verify signature
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return res.status(400).json({ valid: false, reason: 'malformed' });

    const data       = token.slice(0, dotIdx);
    const sig        = token.slice(dotIdx + 1);
    const expectSig  = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    if (sig !== expectSig) return res.status(401).json({ valid: false, reason: 'invalid' });

    // Decode payload
    let payload;
    try { payload = JSON.parse(Buffer.from(data, 'base64url').toString()); }
    catch { return res.status(400).json({ valid: false, reason: 'malformed' }); }

    const expDate = new Date(payload.exp * 1000).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    // Expired?
    if (payload.exp < Math.floor(Date.now() / 1000)) {
        return res.status(200).json({ valid: false, reason: 'expired', company: payload.co, expDate });
    }

    // ── Gather request context ──────────────────────────────────────────────
    const ip      = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
    const ua      = req.headers['user-agent'] || '';
    const isMob   = /Mobile|Android|iPhone|iPad/.test(ua);
    const browser = ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
    const device  = isMob ? 'Mobile' : 'Desktop';
    const now     = new Date();
    const kvKey   = `hire:${payload.id}`;

    // ── Geo + KV read in parallel ───────────────────────────────────────────
    const [location, existing] = await Promise.all([
        getLocation(ip),
        kvGet(kvKey)
    ]);

    // KV: append new view and write back (fire-and-forget)
    const log = existing || { company: payload.co, views: [] };
    log.views.push({ ts: now.toISOString(), ip, location, device, browser });
    const viewCount = log.views.length;
    kvSet(kvKey, log);

    // Email (fire-and-forget)
    sendNotification({ company: payload.co, viewCount, location, device, browser, expDate, now });

    return res.status(200).json({
        valid:     true,
        company:   payload.co,
        exp:       payload.exp,
        expDate,
        viewCount
    });
}
