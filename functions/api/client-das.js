/**
 * GET /api/client-das
 *
 * Returns the DA list for the authenticated client.
 * Authorization: Bearer <token>
 *
 * Returns:
 *   200  { das: DA[] }
 *   401  { error }
 *
 * DA shape:
 *   { id, ref, type, title, status, createdAt, updatedAt, notes? }
 *   status: 'pending' | 'approved' | 'refused' | 'draft'
 *   type:   'vehicle' | 'document' | 'contract' | 'default'
 *
 * KV key: client-das:{clientId}  →  JSON array of DA objects
 *
 * TODO: verify JWT (CLIENT_JWT_SECRET), extract clientId, load from KV.
 */

function getTrustedOrigin(request) {
    const requestHost = request.headers.get('host') || '';
    const sameOrigin  = 'https://' + requestHost;

    const origin = request.headers.get('origin');
    if (origin) {
        try {
            const url      = new URL(origin);
            const rootHost = requestHost.split('.').slice(-3).join('.');
            if (url.origin === sameOrigin || url.hostname.endsWith(rootHost)) return origin;
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
    return {
        'Content-Type':             'application/json',
        'Cache-Control':            'no-store',
        'X-Content-Type-Options':   'nosniff',
        'Vary':                     'Origin',
        'Access-Control-Allow-Origin':   trustedOrigin,
        'Access-Control-Allow-Methods':  'GET, OPTIONS',
        'Access-Control-Allow-Headers':  'Authorization',
    };
}

export async function onRequest(context) {
    const { request, env } = context;
    const trustedOrigin    = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: buildHeaders(trustedOrigin) });
    }

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405, headers: buildHeaders(trustedOrigin),
        });
    }

    /* ── Auth ─────────────────────────────────────────────────────────── */
    const authHeader = request.headers.get('Authorization') || '';
    const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
        return new Response(JSON.stringify({ error: 'Token manquant.' }), {
            status: 401, headers: buildHeaders(trustedOrigin),
        });
    }

    /* ── TODO: JWT verification + KV lookup ──────────────────────────── */
    /*
     *   const payload  = await verifyJWT(token, env.CLIENT_JWT_SECRET);
     *   const clientId = payload?.sub;
     *   if (!clientId) return err401(trustedOrigin);
     *
     *   const raw = await env.OKM_LICENSES.get(`client-das:${clientId}`);
     *   const das = raw ? JSON.parse(raw) : [];
     *
     *   return new Response(JSON.stringify({ das }), {
     *       status: 200, headers: buildHeaders(trustedOrigin),
     *   });
     */

    /* ── STUB: accept demo token ─────────────────────────────────────── */
    if (!token.startsWith('demo_token_')) {
        return new Response(JSON.stringify({ error: 'Token invalide.' }), {
            status: 401, headers: buildHeaders(trustedOrigin),
        });
    }

    return new Response(JSON.stringify({ das: [] }), {
        status: 200, headers: buildHeaders(trustedOrigin),
    });
}
