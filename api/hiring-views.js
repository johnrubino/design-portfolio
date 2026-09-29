// /api/hiring-views — list recent hiring-link opens (newest first)
// plus per-link engagement (case studies read, depth, time, clicks)
// Usage: /api/hiring-views?key=YOUR_ADMIN_KEY
// Optional: &limit=50 (max 100)
import { listHiringViews, kvConfigured, kvGetJson, getHiringActivity } from '../lib/hiring-store.js';

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

    // One engagement summary per distinct link, newest-opened first
    const tokenIds = [...new Set(views.map(v => v.tokenId).filter(Boolean))];
    const links = await Promise.all(tokenIds.map(async tokenId => {
        const [opens, activity] = await Promise.all([
            kvGetJson(`hire:${tokenId}`),
            getHiringActivity(tokenId)
        ]);
        const openList = Array.isArray(opens?.views) ? opens.views : [];
        return {
            tokenId,
            company:    activity?.company || opens?.company || views.find(v => v.tokenId === tokenId)?.company,
            opens:      openList.length,
            lastOpen:   openList.length ? openList[openList.length - 1].ts : null,
            lastActive: activity?.lastActive || null,
            summary:    summarise(activity),
            activity:   activity || null
        };
    }));

    return res.status(200).json({
        count: views.length,
        links,
        views
    });
}
