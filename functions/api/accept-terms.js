/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Accept CGU on first activation
 * POST /api/accept-terms { agencyId }
 *
 * Logs acceptance: terms:{agencyId} → { acceptedAt, ip }
 * Updates agency:{agencyId} → firstActivation: false
 */

/**
 * Domain-agnostic origin check — works with any custom domain or pages.dev URL.
 */
function getTrustedOrigin(request) {
    const requestHost = request.headers.get('host') || '';
    const sameOrigin = 'https://' + requestHost;

    const origin = request.headers.get('origin');
    if (origin) {
        try {
            const url = new URL(origin);
            if (url.origin === sameOrigin) return origin;
            const rootHost = requestHost.split('.').slice(-3).join('.');
            if (url.hostname.endsWith(rootHost)) return origin;
        } catch { /* ignore */ }
    }

    const referer = request.headers.get('referer');
    if (referer) {
        try {
            const refOrigin = new URL(referer).origin;
            if (refOrigin === sameOrigin) return refOrigin;
        } catch { /* ignore */ }
    }

    return sameOrigin;
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

    // Log the acceptance
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const termsEntry = {
        acceptedAt: new Date().toISOString(),
        ip,
        userAgent: request.headers.get('user-agent') || 'unknown'
    };
    await env.OKM_LICENSES.put(`terms:${agencyId}`, JSON.stringify(termsEntry));

    // Update firstActivation → false
    license.firstActivation = false;
    await env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(license));

    return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: buildHeaders(trustedOrigin)
    });
}
