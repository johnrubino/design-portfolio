// /api/track — engagement events from an open hiring link
// Called by hiring.html (navigator.sendBeacon / fetch keepalive), batched.
// Body: { t: <token or short code>, events: [{ type, ... }] }
import { verifyHiringToken, isObviousBot } from '../lib/hiring-token.js';
import { recordHiringEvents } from '../lib/hiring-store.js';

const MAX_EVENTS  = 25;
const MAX_SECONDS = 900; // per batch; the client flushes far more often than this

const VIEWS = new Set(['portfolio', 'labs', 'writing', 'about']);
const LINKS = new Set(['email', 'linkedin', 'substack', 'article', 'labs', 'external']);
const DEPTHS = new Set([25, 50, 75, 100]);
const CASE_RE = /^[a-z0-9-]{1,60}$/;

// Allowlist + normalise one event; anything unexpected is dropped
function clean(e) {
    if (!e || typeof e !== 'object') return null;
    switch (e.type) {
        case 'view':
            return VIEWS.has(e.view) ? { type: 'view', view: e.view } : null;
        case 'case_open':
            return CASE_RE.test(e.case || '') ? { type: 'case_open', case: e.case } : null;
        case 'case_depth': {
            const pct = Number(e.pct);
            return CASE_RE.test(e.case || '') && DEPTHS.has(pct) ? { type: 'case_depth', case: e.case, pct } : null;
        }
        case 'link':
            return LINKS.has(e.link) ? { type: 'link', link: e.link } : null;
        case 'time': {
            const s = Math.round(Number(e.seconds));
            return s > 0 ? { type: 'time', seconds: Math.min(s, MAX_SECONDS) } : null;
        }
        default:
            return null;
    }
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // sendBeacon posts text/plain, so the body may arrive as a string
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ ok: false }); }
    }
    if (!body || typeof body !== 'object') return res.status(400).json({ ok: false });

    const check = await verifyHiringToken(typeof body.t === 'string' ? body.t : '');
    if (!check.ok) return res.status(check.status === 200 ? 403 : check.status).json({ ok: false, reason: check.reason });

    const ua = req.headers['user-agent'] || '';
    const tokenId = check.payload.id;
    if (isObviousBot(ua) || !tokenId) return res.status(204).end();

    const raw = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : [];
    const events = raw.map(clean).filter(Boolean);

    // Merge all time slices in the batch into one, capped
    const seconds = events.filter(e => e.type === 'time').reduce((n, e) => n + e.seconds, 0);
    const merged = events.filter(e => e.type !== 'time');
    if (seconds) merged.push({ type: 'time', seconds: Math.min(seconds, MAX_SECONDS) });

    await recordHiringEvents(tokenId, check.payload.co, merged);
    return res.status(204).end();
}
