// /api/hiring-views — list recent hiring-link opens (newest first)
// Usage: /api/hiring-views?key=YOUR_ADMIN_KEY
// Optional: &limit=50 (max 100)
import { listHiringViews, kvConfigured } from '../lib/hiring-store.js';

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

    return res.status(200).json({
        count: views.length,
        views
    });
}
