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

async function kvFetch(path, { method = 'GET', body, contentType } = {}) {
    if (!kvConfigured()) return null;
    try {
        const r = await fetch(`${process.env.KV_REST_API_URL}${path}`, {
            method,
            headers: authHeaders(contentType),
            body
        });
        if (!r.ok) return null;
        return await r.json();
    } catch {
        return null;
    }
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
 */
export async function kvSetNx(key, ttlSeconds) {
    if (!kvConfigured()) return true;
    try {
        const path =
            `/set/${encodeURIComponent(key)}/1?NX=true` +
            (ttlSeconds ? `&EX=${ttlSeconds}` : '');
        const j = await kvFetch(path, { method: 'POST' });
        return j?.result === 'OK';
    } catch {
        return true;
    }
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

export { VIEWS_KEY, MAX_VIEWS };
