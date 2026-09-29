// /api/verify — validates a hiring token, logs the open, fires an email notification
// Called by hiring.html on every page load
import crypto from 'crypto';
import { appendHiringView, kvGetJson, kvSetJson, kvSetNx } from '../lib/hiring-store.js';
import { verifyHiringToken, isObviousBot } from '../lib/hiring-token.js';

function uaHash(ua) {
    return crypto.createHash('sha256').update(ua || '').digest('hex').slice(0, 16);
}

function hourBucket(date) {
    // UTC hour: YYYYMMDDHH
    return date.toISOString().slice(0, 13).replace(/[-T]/g, '');
}

function geoFromHeaders(headers) {
    const country = headers['x-vercel-ip-country'] || '';
    const cityRaw = headers['x-vercel-ip-city'];
    // City may be URL-encoded (e.g. New%20York)
    let city = '';
    if (cityRaw) {
        try { city = decodeURIComponent(cityRaw); }
        catch { city = cityRaw; }
    }
    return { country, city };
}

function locationLabel(country, city) {
    if (city && country) return `${city}, ${country}`;
    return city || country || 'Unknown';
}

// ── Resend email (REST, no npm) ──────────────────────────────────────────────
async function sendNotification({ company, viewCount, location, device, browser, expDate, now }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[verify] RESEND_API_KEY not set — no notification email sent');
        return;
    }
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
        const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: (process.env.RESEND_FROM || '').trim() || 'Portfolio Tracker <onboarding@resend.dev>',
                to:   (process.env.NOTIFY_EMAIL || '').trim() || 'johnrubinodesign@gmail.com',
                subject,
                html
            })
        });
        if (!r.ok) console.error('[verify] Resend rejected notification', r.status, await r.text());
    } catch (err) {
        console.error('[verify] Resend request failed', err && err.message);
    }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

    const check = await verifyHiringToken(req.query.t);
    if (!check.ok && check.reason !== 'expired') {
        return res.status(check.status).json({ valid: false, reason: check.reason });
    }
    const payload = check.payload;

    const expDate = new Date(payload.exp * 1000).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    // Expired? Do not log as a company open.
    if (check.reason === 'expired') {
        return res.status(200).json({ valid: false, reason: 'expired', company: payload.co, expDate });
    }

    // ── Gather request context (no raw IP stored) ───────────────────────────
    const ua      = req.headers['user-agent'] || '';
    const isMob   = /Mobile|Android|iPhone|iPad/.test(ua);
    const browser = ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
    const device  = isMob ? 'Mobile' : 'Desktop';
    const now     = new Date();
    const { country, city } = geoFromHeaders(req.headers);
    const path    = '/hiring';
    const tokenId = payload.id || '';

    // Log only for humans; still return valid so the public UX is unchanged
    let viewCount = 0;
    const shouldLog = !isObviousBot(ua) && tokenId;
    if (!shouldLog) {
        console.warn('[verify] open not logged:', !tokenId ? 'token has no id' : 'bot user-agent', ua.slice(0, 120));
    }

    if (shouldLog) {
        // Dedupe: same token id + same UTC hour + same UA → one open
        const dedupeKey = `hire:dedupe:${tokenId}:${hourBucket(now)}:${uaHash(ua)}`;
        const isNew = await kvSetNx(dedupeKey, 2 * 3600);

        if (isNew) {
            const entry = {
                company: payload.co,
                tokenId,
                ts: now.toISOString(),
                country,
                city,
                ua: ua.slice(0, 200),
                path
            };

            // Global newest-first list for /api/hiring-views
            await appendHiringView(entry);

            // Per-token tally (email + optional history) — no IP, no full token
            const kvKey = `hire:${tokenId}`;
            const existing = (await kvGetJson(kvKey)) || { company: payload.co, views: [] };
            if (!Array.isArray(existing.views)) existing.views = [];
            existing.company = payload.co;
            existing.views.push({
                ts: entry.ts,
                country,
                city,
                device,
                browser
            });
            // Cap per-token history
            if (existing.views.length > 50) existing.views = existing.views.slice(-50);
            await kvSetJson(kvKey, existing);
            viewCount = existing.views.length;

            // Email (await so serverless doesn't freeze early on hobby)
            await sendNotification({
                company: payload.co,
                viewCount,
                location: locationLabel(country, city),
                device,
                browser,
                expDate,
                now
            });
        } else {
            // Duplicate refresh — report existing count if present
            const existing = await kvGetJson(`hire:${tokenId}`);
            viewCount = Array.isArray(existing?.views) ? existing.views.length : 0;
        }
    }

    return res.status(200).json({
        valid:     true,
        company:   payload.co,
        exp:       payload.exp,
        expDate,
        viewCount
    });
}
