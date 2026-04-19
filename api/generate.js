// /api/generate — creates a signed, time-limited hiring token
// Usage: /api/generate?company=Figma&days=14&key=YOUR_ADMIN_KEY
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { company, days = '14', key } = req.query;

    // Guard: admin key
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
        co: company,
        exp: Math.floor(Date.now() / 1000) + daysNum * 86400,
        id: crypto.randomBytes(8).toString('hex')
    };

    // Sign: HMAC-SHA256 over base64url(payload)
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig  = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    const token = `${data}.${sig}`;

    // Build the full URL
    const host    = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url     = `${host}/hiring.html?t=${token}`;
    const expDate = new Date(payload.exp * 1000).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    return res.status(200).json({ url, token, company, expires: expDate, days: daysNum, id: payload.id });
}
