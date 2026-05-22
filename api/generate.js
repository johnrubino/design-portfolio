// /api/generate — creates a signed, time-limited hiring token
// Usage: /api/generate?company=Figma&days=14&key=YOUR_ADMIN_KEY
import crypto from 'crypto';

// 6-char base-62 short code  (A–Z a–z 0–9, no special chars)
const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function makeShortCode() {
    let n = crypto.randomBytes(4).readUInt32BE(0); // 0–4 294 967 295
    let s = '';
    for (let i = 0; i < 6; i++) { s = B62[n % 62] + s; n = Math.floor(n / 62); }
    return s;
}

// Store short-code → full-token in KV with a matching TTL
async function kvStoreShortCode(code, token, ttlSeconds) {
    if (!process.env.KV_REST_API_URL) return;
    try {
        await fetch(
            `${process.env.KV_REST_API_URL}/setex/${encodeURIComponent('short:' + code)}/${ttlSeconds}`,
            {
                method:  'POST',
                headers: {
                    Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
                    'Content-Type': 'text/plain'
                },
                body: token
            }
        );
    } catch { /* non-fatal */ }
}

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { company, days = '14', key } = req.query;

    if (!key || key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!company) {
        return res.status(400).json({ error: '?company= is required' });
    }
    const secret = process.env.HIRING_SECRET;
    if (!secret) {
        return res.status(500).json({ error: 'HIRING_SECRET env var not set' });
    }

    // Build payload
    const daysNum = Math.min(Math.max(parseInt(days, 10) || 14, 1), 90);
    const payload = {
        co:  company,
        exp: Math.floor(Date.now() / 1000) + daysNum * 86400,
        id:  crypto.randomBytes(8).toString('hex')
    };

    // Sign: HMAC-SHA256 over base64url(payload)
    const data  = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig   = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    const token = `${data}.${sig}`;

    const host    = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const expDate = new Date(payload.exp * 1000).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Use a short code only when KV is configured — otherwise fall back to the
    // full signed token so the link works without a KV lookup.
    let linkToken = token;
    if (process.env.KV_REST_API_URL) {
        const code = makeShortCode();
        await kvStoreShortCode(code, token, daysNum * 86400);
        linkToken = code;
    }

    return res.status(200).json({
        url:     `${host}/hiring?t=${linkToken}`,
        token,
        company,
        expires: expDate,
        days:    daysNum,
        id:      payload.id
    });
}
