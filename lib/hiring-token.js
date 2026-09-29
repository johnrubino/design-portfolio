// Shared hiring-link token handling for /api/verify and /api/track.
import crypto from 'crypto';

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

/**
 * Validate a hiring token (full signed token or short code).
 * Returns { ok: true, payload } or { ok: false, status, reason, payload? }.
 * Expired tokens return ok:false with reason 'expired' and the decoded payload.
 */
export async function verifyHiringToken(token) {
    if (!token) return { ok: false, status: 400, reason: 'no_token' };

    // Short codes (no '.' separator) resolve to a full token via KV
    if (!token.includes('.')) {
        const resolved = await kvResolveShortCode(token);
        if (!resolved) return { ok: false, status: 401, reason: 'invalid' };
        token = resolved;
    }

    const secret = process.env.HIRING_SECRET;
    if (!secret) return { ok: false, status: 500, reason: 'server_error' };

    // Split and verify signature
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return { ok: false, status: 400, reason: 'malformed' };

    const data      = token.slice(0, dotIdx);
    const sig       = token.slice(dotIdx + 1);
    const expectSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    if (sig !== expectSig) return { ok: false, status: 401, reason: 'invalid' };

    // Decode payload
    let payload;
    try { payload = JSON.parse(Buffer.from(data, 'base64url').toString()); }
    catch { return { ok: false, status: 400, reason: 'malformed' }; }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
        return { ok: false, status: 200, reason: 'expired', payload };
    }
    return { ok: true, payload };
}

// Cheap bot filter — skip logging only; token still validates
export function isObviousBot(ua) {
    if (!ua) return true;
    return /bot|crawler|spider|preview|slurp|facebookexternalhit|whatsapp|telegram|discord|embedly|quora|pinterest|redditbot|linkedinbot|twitterbot|applebot|semrush|ahrefs|bytespider|gptbot|claudebot|curl|wget|python-requests|go-http-client|headless/i.test(ua);
}
