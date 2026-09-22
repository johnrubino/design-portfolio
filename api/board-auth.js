// /api/board-auth — private gate for /board (ADMIN_KEY / ?key=)
// GET ?key=YOUR_ADMIN_KEY → { ok: true }
// Localhost without ADMIN_KEY → preview ok (matches hiring microsite)

function getAdminKey(req) {
    if (req.query && req.query.key) return req.query.key;
    const header = req.headers['x-admin-key'];
    if (header) return header;
    const auth = req.headers.authorization || '';
    if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
    return null;
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const key = getAdminKey(req);
    const adminKey = process.env.ADMIN_KEY;
    const host = (req.headers.host || '').split(':')[0];
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    if (!adminKey) {
        if (isLocal) {
            return res.status(200).json({ ok: true, preview: true });
        }
        return res.status(500).json({ ok: false, error: 'ADMIN_KEY env var not set' });
    }

    if (!key || key !== adminKey) {
        return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    return res.status(200).json({ ok: true });
}
