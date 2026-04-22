/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Public agency list
 *
 * GET /api/list-agencies
 * Returns only active (non-revoked) agencies: [{ id, label }]
 * Used by the retailer license-gate to build the agency selection menu.
 */

function getRootHost(hostname) {
    const parts = String(hostname || '').split('.').filter(Boolean);
    if (parts.length <= 2) return String(hostname || '');
    return parts.slice(-3).join('.');
}

function getTrustedOrigin(request) {
    const requestUrl = new URL(request.url);
    const requestOrigin = requestUrl.origin;
    const requestHost = requestUrl.hostname;
    const requestRootHost = getRootHost(requestHost);

    const origin = request.headers.get('origin');
    if (origin) {
        try {
            const url = new URL(origin);
            if (url.origin === requestOrigin) return origin;
            if (getRootHost(url.hostname) === requestRootHost) return origin;
        } catch { /* ignore */ }
    }

    const referer = request.headers.get('referer');
    if (referer) {
        try {
            const refUrl = new URL(referer);
            if (refUrl.origin === requestOrigin) return refUrl.origin;
            if (getRootHost(refUrl.hostname) === requestRootHost) return refUrl.origin;
        } catch { /* ignore */ }
    }

    return null;
}

function buildHeaders(trustedOrigin) {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin'
    };

    if (trustedOrigin) {
        headers['Access-Control-Allow-Origin'] = trustedOrigin;
        headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    }

    return headers;
}

export async function onRequest(context) {
    const { env, request } = context;
    const trustedOrigin = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: buildHeaders(trustedOrigin) });
    }

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: buildHeaders(trustedOrigin)
        });
    }

    if (!trustedOrigin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: buildHeaders(null)
        });
    }

    if (!env.OKM_LICENSES) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
            status: 503,
            headers: buildHeaders(trustedOrigin)
        });
    }

    const list = await env.OKM_LICENSES.list({ prefix: 'agency:' });
    const agencies = [];
    const now = Date.now();

    function sanitizeAgencyId(id) {
        if (typeof id !== 'string') return null;
        const trimmed = id.trim().toLowerCase();
        return /^[a-z0-9_]{1,64}$/.test(trimmed) ? trimmed : null;
    }

    function sanitizeLabel(label, fallback) {
        if (typeof label !== 'string') return fallback;
        const trimmed = label.trim().replace(/\s+/g, ' ');
        if (!trimmed) return fallback;
        return trimmed.slice(0, 120);
    }

    function isValidFutureIsoDate(value) {
        if (typeof value !== 'string' || !value) return false;
        const ts = Date.parse(value);
        return Number.isFinite(ts) && ts > now;
    }

    for (const key of list.keys) {
        if (typeof key.name !== 'string' || !key.name.startsWith('agency:')) continue;

        const rawId = key.name.slice('agency:'.length);
        const agencyId = sanitizeAgencyId(rawId);
        if (!agencyId) continue;

        const raw = await env.OKM_LICENSES.get(key.name);
        if (!raw) continue;
        try {
            const data = JSON.parse(raw);
            if (!data || typeof data !== 'object') continue;

            // Skip revoked agencies
            if (data.revokedAt) continue;
            if (!isValidFutureIsoDate(data.licenseExpiresAt)) continue;

            agencies.push({
                id: agencyId,
                label: sanitizeLabel(data.agencyName, agencyId)
            });
        } catch { /* skip corrupted entries */ }
    }

    agencies.sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }));

    return new Response(JSON.stringify({ agencies }), {
        status: 200,
        headers: buildHeaders(trustedOrigin)
    });
}
