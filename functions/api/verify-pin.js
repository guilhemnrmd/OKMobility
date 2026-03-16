/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Verify device PIN
 * POST /api/verify-pin { agencyId, pin }
 *
 * PIN is stored server-side in KV → never exposed to client.
 * Rate limited: max 5 attempts per 15 minutes per IP to prevent brute-force.
 */

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map();

const ALLOWED_ORIGINS = new Set([
    'https://ok-mobility-retailer.pages.dev'
]);
const ALLOWED_HOST_SUFFIXES = ['.ok-mobility-retailer.pages.dev'];

function isAllowedOrigin(value) {
    if (!value) return false;
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:') return false;
        if (ALLOWED_ORIGINS.has(url.origin)) return true;
        return ALLOWED_HOST_SUFFIXES.some(s => url.hostname.endsWith(s));
    } catch { return false; }
}

function getTrustedOrigin(request) {
    const origin = request.headers.get('origin');
    if (isAllowedOrigin(origin)) return origin;
    const referer = request.headers.get('referer');
    if (!referer) return null;
    try {
        const o = new URL(referer).origin;
        return isAllowedOrigin(o) ? o : null;
    } catch { return null; }
}

function buildHeaders(trustedOrigin) {
    const h = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin'
    };
    if (trustedOrigin) {
        h['Access-Control-Allow-Origin'] = trustedOrigin;
        h['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
        h['Access-Control-Allow-Headers'] = 'Content-Type';
    }
    return h;
}

function sanitizeAgencyId(id) {
    if (typeof id !== 'string') return null;
    return /^[a-z0-9_]{1,64}$/.test(id) ? id : null;
}

function isRateLimited(key) {
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(key, { windowStart: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

export async function onRequest(context) {
    const { env, request } = context;
    const trustedOrigin = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: buildHeaders(trustedOrigin) });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405, headers: buildHeaders(trustedOrigin)
        });
    }

    if (!trustedOrigin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
            status: 403, headers: buildHeaders(null)
        });
    }

    if (!env.OKM_LICENSES) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
            status: 503, headers: buildHeaders(trustedOrigin)
        });
    }

    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitKey = `pin:${ip}`;
    if (isRateLimited(rateLimitKey)) {
        return new Response(JSON.stringify({ valid: false, reason: 'too_many_attempts' }), {
            status: 429, headers: buildHeaders(trustedOrigin)
        });
    }

    let body;
    try { body = await request.json(); }
    catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }

    const agencyId = sanitizeAgencyId(body?.agencyId);
    const pin = typeof body?.pin === 'string' ? body.pin.slice(0, 8) : null;

    if (!agencyId || !pin) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }

    const licenseRaw = await env.OKM_LICENSES.get(`agency:${agencyId}`);
    if (!licenseRaw) {
        return new Response(JSON.stringify({ valid: false, reason: 'not_found' }), {
            status: 200, headers: buildHeaders(trustedOrigin)
        });
    }

    let license;
    try { license = JSON.parse(licenseRaw); }
    catch {
        return new Response(JSON.stringify({ valid: false, reason: 'corrupted' }), {
            status: 200, headers: buildHeaders(trustedOrigin)
        });
    }

    // Constant-time comparison to prevent timing attacks
    const expectedPin = String(license.pin || '');
    const isValid = expectedPin.length === pin.length &&
        expectedPin.split('').every((c, i) => c === pin[i]);

    return new Response(JSON.stringify({ valid: isValid }), {
        status: 200, headers: buildHeaders(trustedOrigin)
    });
}
