/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 * Ce logiciel est une création indépendante.
 * Toute copie, rétro-ingénierie ou utilisation sans licence est strictement interdite.
 */

/**
 * Cloudflare Pages Function — License check for retailer page
 * GET /api/check-license?agency=<agencyId>
 *
 * KV Namespace: OKM_LICENSES (bound as env.OKM_LICENSES)
 * KV Keys:
 *   agency:{id} → license entry (JSON)
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateLimitStore = new Map();

const ALLOWED_ORIGINS = new Set([
    'https://ok-mobility-retailer.pages.dev',
    'https://develop.ok-mobility-retailer.pages.dev'
]);
const ALLOWED_HOST_SUFFIXES = ['.ok-mobility-retailer.pages.dev'];

function getClientIp(request) {
    return request.headers.get('cf-connecting-ip') || 'unknown';
}

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
    if (referer) {
        try {
            const o = new URL(referer).origin;
            if (isAllowedOrigin(o)) return o;
        } catch { /* ignore */ }
    }
    // Allow same-host requests without origin header (e.g. fetch() from QR-scanned page)
    // Cloudflare sets cf-connecting-ip; also check the host header matches our domain
    const host = request.headers.get('host') || '';
    if (host === 'ok-mobility-retailer.pages.dev' ||
        host.endsWith('.ok-mobility-retailer.pages.dev')) {
        return 'https://' + host;
    }
    return null;
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

function buildHeaders(trustedOrigin) {
    const h = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin'
    };
    if (trustedOrigin) {
        h['Access-Control-Allow-Origin'] = trustedOrigin;
        h['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    }
    return h;
}

function sanitizeAgencyId(id) {
    if (typeof id !== 'string') return null;
    // Only allow alphanumeric + underscore, max 64 chars
    return /^[a-z0-9_]{1,64}$/.test(id) ? id : null;
}

export async function onRequest(context) {
    const { env, request } = context;
    const trustedOrigin = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: buildHeaders(trustedOrigin) });
    }

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405, headers: buildHeaders(trustedOrigin)
        });
    }

    if (!trustedOrigin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
            status: 403, headers: buildHeaders(null)
        });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
            status: 429, headers: buildHeaders(trustedOrigin)
        });
    }

    if (!env.OKM_LICENSES) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
            status: 503, headers: buildHeaders(trustedOrigin)
        });
    }

    const url = new URL(request.url);
    const rawAgencyId = url.searchParams.get('agency');
    const agencyId = sanitizeAgencyId(rawAgencyId);

    if (!agencyId) {
        return new Response(JSON.stringify({ valid: false, reason: 'invalid_agency_id' }), {
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

    // Check expiration
    if (license.licenseExpiresAt && new Date(license.licenseExpiresAt) < new Date()) {
        return new Response(JSON.stringify({ valid: false, reason: 'expired' }), {
            status: 200, headers: buildHeaders(trustedOrigin)
        });
    }

    return new Response(JSON.stringify({
        valid: true,
        agencyName: license.agencyName,
        firstActivation: license.firstActivation === true,
        licenseVersion: license.licenseVersion || 1
    }), { status: 200, headers: buildHeaders(trustedOrigin) });

}
