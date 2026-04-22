/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Accept CGU on first activation
 * POST /api/accept-terms { agencyId }
 *
 * Logs acceptance: terms:{agencyId} → pseudonymous audit fields
 * Updates agency:{agencyId} → firstActivation: false
 */

function getRootHost(hostname) {
    const parts = String(hostname || '').split('.').filter(Boolean);
    if (parts.length <= 2) return String(hostname || '');
    return parts.slice(-3).join('.');
}

async function sha256Hex(input) {
    const payload = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', payload);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Domain-agnostic origin check — works with any custom domain or pages.dev URL.
 */
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
            const refOrigin = new URL(referer).origin;
            const refHost = new URL(referer).hostname;
            if (refOrigin === requestOrigin) return refOrigin;
            if (getRootHost(refHost) === requestRootHost) return refOrigin;
        } catch { /* ignore */ }
    }

    return null;
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

    let body;
    try { body = await request.json(); }
    catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }

    const agencyId = sanitizeAgencyId(body?.agencyId);
    if (!agencyId) {
        return new Response(JSON.stringify({ error: 'Invalid agencyId' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }

    // Verify agency exists
    const licenseRaw = await env.OKM_LICENSES.get(`agency:${agencyId}`);
    if (!licenseRaw) {
        return new Response(JSON.stringify({ error: 'Agency not found' }), {
            status: 404, headers: buildHeaders(trustedOrigin)
        });
    }

    const license = JSON.parse(licenseRaw);

    // Log acceptance using pseudonymous audit fields (no raw IP stored).
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const country = (request.headers.get('cf-ipcountry') || '').toUpperCase();
    const salt = env.TELEMETRY_SALT || env.ADMIN_TOKEN || 'okm-default-salt';

    const ipHash = await sha256Hex(`${salt}:terms:${agencyId}:${ip}`);
    const uaHash = await sha256Hex(`${salt}:terms:${agencyId}:${userAgent}`);

    const termsEntry = {
        acceptedAt: new Date().toISOString(),
        ipHash,
        uaHash: uaHash.slice(0, 16),
        country: /^[A-Z]{2}$/.test(country) ? country : 'XX'
    };
    await env.OKM_LICENSES.put(`terms:${agencyId}`, JSON.stringify(termsEntry));

    // Update firstActivation → false
    license.firstActivation = false;
    await env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(license));

    return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: buildHeaders(trustedOrigin)
    });
}
