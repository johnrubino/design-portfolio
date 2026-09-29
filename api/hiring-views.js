// /api/hiring-views — list recent hiring-link opens (newest first)
// plus per-link engagement (case studies read, depth, time, clicks)
// Usage: /api/hiring-views?key=YOUR_ADMIN_KEY
// Optional: &limit=50 (max 100)
//           &codes=AbC123,XyZ789  short codes of sent links (board uses this to
//           include never-opened / expired links)
import { listHiringViews, kvConfigured, kvGetJson, getHiringActivity } from '../lib/hiring-store.js';
import { verifyHiringToken } from '../lib/hiring-token.js';

const CASE_TITLES = {
    'future-of-wealth-advisory': 'Future of Wealth Advisory',
    'fully-paid-lending':        'Fully Paid Lending',
    'purple-panda-rentals':      'Purple Panda Rentals'
};

function formatDuration(s) {
    if (!s) return '0s';
    const m = Math.floor(s / 60);
    return m ? `${m}m ${s % 60}s` : `${s}s`;
}

// e.g. "Read Fully Paid Lending (75%), Purple Panda Rentals (25%) · 6m 10s engaged · clicked email"
function summarise(activity) {
    if (!activity) return 'Opened — no engagement recorded yet';
    const parts = [];
    const cases = Object.entries(activity.cases || {})
        .map(([id, c]) => `${CASE_TITLES[id] || id} (${c.maxDepth || 0}%)`);
    parts.push(cases.length ? `Read ${cases.join(', ')}` : 'No case studies opened');
    parts.push(`${formatDuration(activity.engagedSeconds || 0)} engaged`);
    const views = Object.keys(activity.views || {}).filter(v => v !== 'portfolio');
    if (views.length) parts.push(`viewed ${views.join(', ')}`);
    const links = Object.keys(activity.links || {});
    if (links.length) parts.push(`clicked ${links.join(', ')}`);
    return parts.join(' · ');
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { key, limit } = req.query;
    if (!key || key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!kvConfigured()) {
        return res.status(503).json({
            error: 'KV not configured',
            views: []
        });
    }

    const n = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const views = await listHiringViews(n);

    // Optional &codes=AbC123,XyZ789 — resolve links that were sent (e.g. from the
    // board) so never-opened and expired links can be reported too.
    const codeList = String(req.query.codes || '')
        .split(',').map(s => s.trim()).filter(s => /^[A-Za-z0-9]{1,16}$/.test(s)).slice(0, 100);
    const resolved = await Promise.all(codeList.map(async code => {
        const check = await verifyHiringToken(code);
        return {
            code,
            status:  check.ok ? 'active' : (check.reason === 'expired' ? 'expired' : 'unknown'),
            tokenId: check.payload?.id || null,
            company: check.payload?.co || null,
            expires: check.payload?.exp ? new Date(check.payload.exp * 1000).toISOString() : null
        };
    }));
    const codes = Object.fromEntries(resolved.map(r => [r.code, r]));

    // One engagement summary per distinct link (opened, or sent via &codes)
    const tokenIds = [...new Set([
        ...views.map(v => v.tokenId),
        ...resolved.map(r => r.tokenId)
    ].filter(Boolean))];
    const links = await Promise.all(tokenIds.map(async tokenId => {
        const [opens, activity] = await Promise.all([
            kvGetJson(`hire:${tokenId}`),
            getHiringActivity(tokenId)
        ]);
        const openList = Array.isArray(opens?.views) ? opens.views : [];
        return {
            tokenId,
            company:    activity?.company || opens?.company || views.find(v => v.tokenId === tokenId)?.company
                        || resolved.find(r => r.tokenId === tokenId)?.company,
            opens:      openList.length,
            lastOpen:   openList.length ? openList[openList.length - 1].ts : null,
            lastActive: activity?.lastActive || null,
            summary:    openList.length || activity ? summarise(activity) : 'Not opened yet',
            activity:   activity || null,
            openLog:    openList.slice().reverse()   // newest first: { ts, city, country, device, browser }
        };
    }));

    return res.status(200).json({
        count: views.length,
        links,
        codes,
        views
    });
}
