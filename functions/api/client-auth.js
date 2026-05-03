/**
 * POST /api/client-auth
 *
 * Client portal authentication.
 *
 * Body: { email: string, password: string }
 *
 * Returns:
 *   200  { token, client, das, lastLoginAt }
 *   400  { error }
 *   401  { error }
 *   429  { error }
 *
 * KV structure (OKM_LICENSES namespace):
 *   client-email:{normalizedEmail}  →  clientId  (lookup index)
 *   client:{clientId}               →  { email, passwordHash, name, firstName,
 *                                        phone, ref, agencyId, createdAt, lastLoginAt }
 *   client-das:{clientId}           →  DA[]  (see client-das.js)
 *
 * TODO: replace the STUB block with real JWT signing + password hash verification.
 *       Add CLIENT_JWT_SECRET to your wrangler.toml secrets.
 */

const RATE_LIMIT_MAX      = 10;
const RATE_LIMIT_WINDOW_S = 60;

/* Domain-agnostic CORS — works with any custom domain or *.pages.dev */
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

function buildHeaders(trustedOrigin, extra = {}) {
    return {
        'Content-Type':             'application/json',
        'Cache-Control':            'no-store',
        'X-Content-Type-Options':   'nosniff',
        'Vary':                     'Origin',
        'Access-Control-Allow-Origin':   trustedOrigin,
        'Access-Control-Allow-Methods':  'POST, OPTIONS',
        'Access-Control-Allow-Headers':  'Content-Type',
        ...extra,
    };
}

export async function onRequest(context) {
    const { request, env } = context;
    const trustedOrigin    = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: buildHeaders(trustedOrigin) });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: buildHeaders(trustedOrigin),
        });
    }

    /* ── Rate limiting (KV-backed per IP) ────────────────────────────── */
    const ip    = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = `rl:client-auth:${ip}`;
    const rlRaw = await env.OKM_LICENSES.get(rlKey);
    const rl    = rlRaw ? JSON.parse(rlRaw) : { count: 0, resetAt: Date.now() + RATE_LIMIT_WINDOW_S * 1000 };

    if (Date.now() > rl.resetAt) {
        rl.count   = 0;
        rl.resetAt = Date.now() + RATE_LIMIT_WINDOW_S * 1000;
    }
    rl.count++;
    await env.OKM_LICENSES.put(rlKey, JSON.stringify(rl), { expirationTtl: RATE_LIMIT_WINDOW_S });

    if (rl.count > RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ error: 'Trop de tentatives. Réessayez dans une minute.' }), {
            status: 429,
            headers: buildHeaders(trustedOrigin),
        });
    }

    /* ── Parse body ───────────────────────────────────────────────────── */
    let body;
    try { body = await request.json(); }
    catch {
        return new Response(JSON.stringify({ error: 'Corps de requête invalide.' }), {
            status: 400, headers: buildHeaders(trustedOrigin),
        });
    }

    const { email, password } = body || {};

    if (!email    || typeof email    !== 'string') return err400('E-mail requis.',          trustedOrigin);
    if (!password || typeof password !== 'string') return err400('Mot de passe requis.',    trustedOrigin);

    const normalizedEmail = email.trim().toLowerCase();

    /* ── TODO: real authentication ────────────────────────────────────── */
    /*
     * Uncomment and adapt once the client KV entries are created:
     *
     *   const clientId = await env.OKM_LICENSES.get(`client-email:${normalizedEmail}`);
     *   if (!clientId) return err401(trustedOrigin);
     *
     *   const raw = await env.OKM_LICENSES.get(`client:${clientId}`);
     *   if (!raw) return err401(trustedOrigin);
     *
     *   const client = JSON.parse(raw);
     *   const ok     = await verifyPassword(password, client.passwordHash);
     *   if (!ok) return err401(trustedOrigin);
     *
     *   const token  = await signJWT({ sub: clientId }, env.CLIENT_JWT_SECRET);
     *   const dasRaw = await env.OKM_LICENSES.get(`client-das:${clientId}`);
     *   const das    = dasRaw ? JSON.parse(dasRaw) : [];
     *
     *   // Update lastLoginAt
     *   client.lastLoginAt = new Date().toISOString();
     *   await env.OKM_LICENSES.put(`client:${clientId}`, JSON.stringify(client));
     *
     *   return new Response(JSON.stringify({ token, client, das, lastLoginAt: client.lastLoginAt }), {
     *       status: 200, headers: buildHeaders(trustedOrigin),
     *   });
     */

    /* ── STUB: demo credentials only ─────────────────────────────────── */
    /* Remove this block once real auth is implemented above.             */
    const DEMO_EMAIL = 'demo@example.com';
    const DEMO_PASS  = 'demo1234';

    if (normalizedEmail !== DEMO_EMAIL || password !== DEMO_PASS) {
        return err401(trustedOrigin);
    }

    const demoClient = {
        id:        'client_demo_001',
        ref:       'CLI-2026-0001',
        name:      'Jean Dupont',
        firstName: 'Jean',
        email:     DEMO_EMAIL,
        phone:     '+33 6 12 34 56 78',
        agency:    'Agence Démo',
    };

    const demoDAs = [
        {
            id:        'da_001',
            ref:       'DA-2026-0042',
            type:      'vehicle',
            title:     'Autorisation véhicule — Citroën C3',
            status:    'approved',
            createdAt: '2026-04-10T09:15:00Z',
        },
        {
            id:        'da_002',
            ref:       'DA-2026-0071',
            type:      'document',
            title:     "Vérification documents d'identité",
            status:    'pending',
            createdAt: '2026-04-28T14:30:00Z',
        },
        {
            id:        'da_003',
            ref:       'DA-2026-0055',
            type:      'contract',
            title:     'Contrat de location longue durée',
            status:    'refused',
            createdAt: '2026-04-18T11:00:00Z',
        },
    ];

    return new Response(JSON.stringify({
        token:       `demo_token_${Date.now()}`,   /* TODO: replace with real JWT */
        client:      demoClient,
        das:         demoDAs,
        lastLoginAt: new Date().toISOString(),
    }), { status: 200, headers: buildHeaders(trustedOrigin) });
}

function err400(msg, origin) {
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: buildHeaders(origin) });
}

function err401(origin) {
    return new Response(JSON.stringify({ error: 'Identifiants incorrects.' }), { status: 401, headers: buildHeaders(origin) });
}
