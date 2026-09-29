// Shared Vercel KV / Upstash Redis helpers for hiring open tracking.
// Uses REST only (no npm). No-ops gracefully when KV is not configured.

const VIEWS_KEY = 'hiring:views';
const MAX_VIEWS = 100;

export function kvConfigured() {
    return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function authHeaders(contentType) {
    const headers = { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` };
    if (contentType) headers['Content-Type'] = contentType;
    return headers;
}

/** Raw KV REST call: { ok, status, body } — never throws. Used by diagnostics. */
export async function kvRaw(path, { method = 'GET', body, contentType } = {}) {
    if (!kvConfigured()) return { ok: false, status: 0, body: 'KV not configured' };
    try {
        const r = await fetch(`${process.env.KV_REST_API_URL}${path}`, {
            method,
            headers: authHeaders(contentType),
            body
        });
        const text = await r.text();
        let parsed = text;
        try { parsed = JSON.parse(text); } catch { /* keep text */ }
        return { ok: r.ok, status: r.status, body: parsed };
    } catch (err) {
        return { ok: false, status: 0, body: String(err && err.message || err) };
    }
}

async function kvFetch(path, opts) {
    const r = await kvRaw(path, opts);
    if (!r.ok) {
        if (kvConfigured()) console.error('[hiring-store] KV call failed', path.split('/')[1], r.status, r.body);
        return null;
    }
    return r.body;
}

/** GET a JSON value, or null */
export async function kvGetJson(key) {
    const j = await kvFetch(`/get/${encodeURIComponent(key)}`);
    if (!j || j.result == null) return null;
    try {
        return typeof j.result === 'string' ? JSON.parse(j.result) : j.result;
    } catch {
        return null;
    }
}

/** SET a JSON value as a plain string body */
export async function kvSetJson(key, value) {
    await kvFetch(`/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        body: JSON.stringify(value),
        contentType: 'text/plain'
    });
}

/**
 * SET key only if absent. Returns true when the key was claimed (or KV is off).
 * Value is a short sentinel; TTL in seconds.
 * Uses Upstash's path-segment form (SET key 1 NX EX ttl). If the call itself
 * fails, fail open: better to log a duplicate than silently drop a real open.
 */
export async function kvSetNx(key, ttlSeconds) {
    if (!kvConfigured()) return true;
    const path =
        `/set/${encodeURIComponent(key)}/1/NX` +
        (ttlSeconds ? `/EX/${ttlSeconds}` : '');
    const j = await kvFetch(path, { method: 'POST' });
    if (!j) return true;
    return j.result === 'OK';
}

/**
 * Prepend a hiring open and trim to MAX_VIEWS.
 * Single JSON array key — hobby-friendly; rare races are acceptable for this use.
 */
export async function appendHiringView(entry) {
    if (!kvConfigured()) return;
    const existing = (await kvGetJson(VIEWS_KEY)) || [];
    const list = Array.isArray(existing) ? existing : [];
    list.unshift(entry);
    await kvSetJson(VIEWS_KEY, list.slice(0, MAX_VIEWS));
}

/** Newest-first recent opens. */
export async function listHiringViews(limit = 50) {
    const existing = (await kvGetJson(VIEWS_KEY)) || [];
    const list = Array.isArray(existing) ? existing : [];
    return list.slice(0, Math.min(Math.max(limit, 1), MAX_VIEWS));
}

// ── Engagement (per hiring link) ─────────────────────────────────────────────
// One aggregate object per token id, so storage stays bounded however long
// someone reads. Shape:
// { company, firstActive, lastActive, engagedSeconds,
//   views:  { portfolio: 2, about: 1 },
//   cases:  { 'fully-paid-lending': { opens: 1, maxDepth: 75 } },
//   links:  { email: 1, linkedin: 0 },
//   timeline: [{ ts, type, ... }]   // newest last, capped }
const MAX_TIMELINE = 60;

export function activityKey(tokenId) {
    return `hire:${tokenId}:activity`;
}

export async function getHiringActivity(tokenId) {
    return kvGetJson(activityKey(tokenId));
}

/** Fold a batch of already-validated events into the link's aggregate. */
export async function recordHiringEvents(tokenId, company, events) {
    if (!kvConfigured() || !events.length) return;
    const nowIso = new Date().toISOString();
    const a = (await kvGetJson(activityKey(tokenId))) || {};
    a.company        = company;
    a.firstActive    = a.firstActive || nowIso;
    a.lastActive     = nowIso;
    a.engagedSeconds = a.engagedSeconds || 0;
    a.views          = a.views || {};
    a.cases          = a.cases || {};
    a.links          = a.links || {};
    a.timeline       = Array.isArray(a.timeline) ? a.timeline : [];

    for (const e of events) {
        if (e.type === 'time') {
            a.engagedSeconds += e.seconds;
            continue;
        }
        if (e.type === 'view') {
            a.views[e.view] = (a.views[e.view] || 0) + 1;
        } else if (e.type === 'case_open') {
            const c = a.cases[e.case] || { opens: 0, maxDepth: 0 };
            c.opens += 1;
            a.cases[e.case] = c;
        } else if (e.type === 'case_depth') {
            const c = a.cases[e.case] || { opens: 0, maxDepth: 0 };
            c.maxDepth = Math.max(c.maxDepth, e.pct);
            a.cases[e.case] = c;
        } else if (e.type === 'link') {
            a.links[e.link] = (a.links[e.link] || 0) + 1;
        }
        const { type, ...rest } = e;
        a.timeline.push({ ts: nowIso, type, ...rest });
    }
    a.timeline = a.timeline.slice(-MAX_TIMELINE);
    await kvSetJson(activityKey(tokenId), a);
}

export { VIEWS_KEY, MAX_VIEWS };
