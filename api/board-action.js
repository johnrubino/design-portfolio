// /api/board-action — stub for Jobi webhook (Make Bot UI later)
// POST { jobId, action, source: "board" }
// Auth: ADMIN_KEY via ?key= / header x-admin-key / Authorization: Bearer
// Never expose sender keys to the browser — Jobi webhook URL stays server-side.

const ACTIONS = new Set([
    'prep_resume',
    'skip',
    'hold',
    'apply_confirm',
    'draft_outreach',
    'build_fit_page',
    'mark_sent',
    'mark_replied',
    'close'
]);

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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const key = getAdminKey(req);
    const adminKey = process.env.ADMIN_KEY;

    // Local preview without env: allow when ADMIN_KEY unset and host is localhost
    const host = (req.headers.host || '').split(':')[0];
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (adminKey) {
        if (!key || key !== adminKey) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    } else if (!isLocal) {
        return res.status(500).json({ error: 'ADMIN_KEY env var not set' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }
    }
    body = body || {};

    const { jobId, action, source } = body;
    if (!jobId || typeof jobId !== 'string') {
        return res.status(400).json({ error: 'jobId is required' });
    }
    if (!action || !ACTIONS.has(action)) {
        return res.status(400).json({ error: 'Invalid or missing action' });
    }
    if (source !== 'board') {
        return res.status(400).json({ error: 'source must be "board"' });
    }

    // Stub: Jobi webhook wiring comes later. Log payload shape for ops.
    const payload = { jobId, action, source: 'board', receivedAt: new Date().toISOString() };
    console.log('[board-action]', JSON.stringify(payload));

    // Optional forward when JOBI_WEBHOOK_URL is configured (server-only)
    const webhook = process.env.JOBI_WEBHOOK_URL;
    if (webhook) {
        try {
            await fetch(webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error('[board-action] webhook forward failed', err);
            return res.status(502).json({ ok: false, error: 'Jobi webhook failed', payload });
        }
    }

    return res.status(200).json({
        ok: true,
        notified: Boolean(webhook),
        message: webhook ? 'Jobi notified' : 'Jobi notified (stub — webhook not configured)',
        payload
    });
}
