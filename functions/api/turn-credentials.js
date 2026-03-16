/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 * Ce logiciel est une création indépendante.
 * Toute copie, rétro-ingénierie, modification ou hébergement sur un serveur tiers
 * sans licence explicite de l'auteur est strictement interdite et s'expose à des
 * poursuites pour contrefaçon selon le droit européen.
 *
 * © 2026 Guilhem Normand. Todos los derechos reservados.
 * Este software es una creación independiente.
 * Cualquier copia, ingeniería inversa, modificación o alojamiento en un servidor de
 * terceros sin licencia explícita del autor está estrictamente prohibido y puede dar
 * lugar a acciones legales por infracción conforme al derecho europeo.
 *
 * PRIVACITÉ / PRIVACIDAD:
 * Les données traitées par cette fonction sont temporaires et privées.
 * Aucun stockage persistant de données personnelles n'est effectué.
 */

/**
 * Cloudflare Pages Function — generates ephemeral TURN credentials
 * via Cloudflare Calls TURN API.
 *
 * Required env secrets (set via Wrangler):
 *   TURN_KEY_ID     — Key ID from Cloudflare Calls dashboard
 *   TURN_API_TOKEN  — API Token for that key
 */
const TURN_TTL_SECONDS = 600; // 10 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitStore = new Map();
const ALLOWED_ORIGINS = new Set([
    'https://ok-mobility-retailer.pages.dev',
    'https://develop.ok-mobility-retailer.pages.dev'
]);
const ALLOWED_HOST_SUFFIXES = ['.ok-mobility-retailer.pages.dev'];

function getClientIp(request) {
    return request.headers.get('cf-connecting-ip') || 'unknown';
}

function isRateLimited(key) {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(key, { windowStart: now, count: 1 });
        return false;
    }

    entry.count += 1;
    rateLimitStore.set(key, entry);
    return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function isAllowedOrigin(originValue) {
    if (!originValue) return false;

    try {
        const url = new URL(originValue);
        if (url.protocol !== 'https:') return false;

        if (ALLOWED_ORIGINS.has(url.origin)) return true;
        return ALLOWED_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix));
    } catch {
        return false;
    }
}

function getTrustedOrigin(request) {
    const origin = request.headers.get('origin');
    if (isAllowedOrigin(origin)) return origin;

    const referer = request.headers.get('referer');
    if (referer) {
        try {
            const refererOrigin = new URL(referer).origin;
            if (isAllowedOrigin(refererOrigin)) return refererOrigin;
        } catch { /* ignore */ }
    }

    // Allow same-host requests without origin header
    const host = request.headers.get('host') || '';
    if (host === 'ok-mobility-retailer.pages.dev' ||
        host.endsWith('.ok-mobility-retailer.pages.dev')) {
        return 'https://' + host;
    }
    return null;
}

function buildJsonHeaders(trustedOrigin) {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Vary': 'Origin'
    };

    if (trustedOrigin) {
        headers['Access-Control-Allow-Origin'] = trustedOrigin;
        headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type';
        headers['Access-Control-Max-Age'] = '600';
    }

    return headers;
}

export async function onRequest(context) {
    const { env, request } = context;

    const trustedOrigin = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
        if (!trustedOrigin) {
            return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
                status: 403,
                headers: buildJsonHeaders(null)
            });
        }

        return new Response(null, {
            status: 204,
            headers: buildJsonHeaders(trustedOrigin)
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: {
                ...buildJsonHeaders(trustedOrigin),
                'Allow': 'POST, OPTIONS'
            }
        });
    }

    if (!trustedOrigin) {
        return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
            status: 403,
            headers: buildJsonHeaders(null)
        });
    }

    const clientKey = getClientIp(request);
    if (isRateLimited(clientKey)) {
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
            status: 429,
            headers: buildJsonHeaders(trustedOrigin)
        });
    }

    // If secrets are not set, return 503 so clients fall back gracefully
    if (!env.TURN_KEY_ID || !env.TURN_API_TOKEN) {
        return new Response(JSON.stringify({ error: 'TURN not configured' }), {
            status: 503,
            headers: buildJsonHeaders(trustedOrigin)
        });
    }

    try {
        const response = await fetch(
            `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.TURN_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ttl: TURN_TTL_SECONDS })
            }
        );

        if (!response.ok) {
            throw new Error(`Cloudflare TURN API returned ${response.status}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: buildJsonHeaders(trustedOrigin)
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: buildJsonHeaders(trustedOrigin)
        });
    }
}
