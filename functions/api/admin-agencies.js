/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Admin API for licence management
 * Protected by ADMIN_TOKEN env secret.
 *
 * GET  /api/admin-agencies
 *   → list all agencies
 *
 * POST /api/admin-agencies
 *   body: { action: 'upsert'|'revoke', agencyId, agencyName?, licenseExpiresAt?, licenseVersion? }
 *   → update KV + bump licenseVersion (forces client cache invalidation)
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitStore = new Map();

function buildHeaders(origin, rateLimit = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin'
    };

    if (origin) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Authorization,Content-Type,X-Admin-Token';
    }

    if (rateLimit) {
        headers['X-RateLimit-Limit'] = String(rateLimit.limit);
        headers['X-RateLimit-Remaining'] = String(rateLimit.remaining);
        headers['X-RateLimit-Reset'] = String(rateLimit.resetEpochSeconds);
        if (rateLimit.retryAfterSeconds > 0) {
            headers['Retry-After'] = String(rateLimit.retryAfterSeconds);
        }
    }

    return headers;
}

function jsonResponse(payload, status, origin, rateLimit = null) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: buildHeaders(origin, rateLimit)
    });
}

function getAllowedOrigins(env) {
    const fromEnv = (env.ADMIN_ALLOWED_ORIGIN || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    if (fromEnv.length > 0) return new Set(fromEnv);

    return new Set([
        'https://okmobility.pages.dev',
        'http://localhost:8788',
        'http://127.0.0.1:8788'
    ]);
}

function resolveOrigin(request) {
    const rawOrigin = request.headers.get('Origin') || request.headers.get('origin') || '';
    return rawOrigin.trim();
}

function isOriginAllowed(origin, env, requestUrl) {
    if (!origin) return true;

    // Always allow same-origin calls for the current deployment hostname.
    try {
        const requestOrigin = new URL(requestUrl || '').origin;
        if (requestOrigin && origin === requestOrigin) return true;
    } catch {
        /* ignore */
    }

    const allowedOrigins = getAllowedOrigins(env);
    return allowedOrigins.has(origin);
}

function applyRateLimit(request) {
    const ip = (
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('x-forwarded-for') ||
        'unknown'
    ).split(',')[0].trim();

    const now = Date.now();
    const current = rateLimitStore.get(ip);

    if (!current || now >= current.resetAt) {
        const resetAt = now + RATE_LIMIT_WINDOW_MS;
        const next = { count: 1, resetAt };
        rateLimitStore.set(ip, next);
        return {
            allowed: true,
            limit: RATE_LIMIT_MAX_REQUESTS,
            remaining: RATE_LIMIT_MAX_REQUESTS - 1,
            resetEpochSeconds: Math.floor(resetAt / 1000),
            retryAfterSeconds: 0
        };
    }

    current.count += 1;
    rateLimitStore.set(ip, current);

    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - current.count);
    const retryAfterSeconds = Math.max(0, Math.ceil((current.resetAt - now) / 1000));

    return {
        allowed: current.count <= RATE_LIMIT_MAX_REQUESTS,
        limit: RATE_LIMIT_MAX_REQUESTS,
        remaining,
        resetEpochSeconds: Math.floor(current.resetAt / 1000),
        retryAfterSeconds
    };
}

function sanitizeAgencyId(id) {
    if (typeof id !== 'string') return null;
    return /^[a-z0-9_]{1,64}$/.test(id) ? id : null;
}

function getAdminToken(request) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.toLowerCase().startsWith('bearer ')) {
        return authHeader.slice(7).trim();
    }

    const headerToken = request.headers.get('x-admin-token');
    if (headerToken) {
        return headerToken.trim();
    }

    const url = new URL(request.url);
    return (url.searchParams.get('token') || '').trim();
}

export async function onRequest(context) {
    const { env, request } = context;
    const origin = resolveOrigin(request);

    if (!isOriginAllowed(origin, env, request.url)) {
        return jsonResponse({ error: 'Origin not allowed' }, 403, null);
    }

    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: buildHeaders(origin)
        });
    }

    const rateLimit = applyRateLimit(request);
    if (!rateLimit.allowed) {
        return jsonResponse({ error: 'Too Many Requests' }, 429, origin, rateLimit);
    }

    const token = getAdminToken(request);

    if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return jsonResponse({ error: 'Unauthorized' }, 401, origin, rateLimit);
    }

    if (!env.OKM_LICENSES) {
        return jsonResponse({ error: 'KV not configured' }, 503, origin, rateLimit);
    }

    // ── GET: list all agencies ────────────────────────────────────────────────
    if (request.method === 'GET') {
        const list = await env.OKM_LICENSES.list({ prefix: 'agency:' });
        const agencies = [];

        for (const key of list.keys) {
            const raw = await env.OKM_LICENSES.get(key.name);
            if (!raw) continue;
            try {
                const data = JSON.parse(raw);
                let stats = null;
                try {
                    const statsRaw = await env.OKM_LICENSES.get(`stats:${key.name.replace('agency:', '')}`);
                    if (statsRaw) stats = JSON.parse(statsRaw);
                } catch {
                    stats = null;
                }

                agencies.push({
                    id: key.name.replace('agency:', ''),
                    agencyName: data.agencyName,
                    licenseExpiresAt: data.licenseExpiresAt,
                    firstActivation: data.firstActivation,
                    licenseVersion: data.licenseVersion || 1,
                    revokedAt: data.revokedAt || null,
                    telemetry: {
                        uniqueDevices30d: Number.isFinite(stats?.uniqueDevices30d) ? stats.uniqueDevices30d : 0,
                        totalChecks: Number.isFinite(stats?.totalChecks) ? stats.totalChecks : 0,
                        lastSeenAt: stats?.lastSeenAt || null,
                        lastSeenCountry: stats?.lastSeenCountry || null,
                        recentEvents: Array.isArray(stats?.recentEvents)
                            ? stats.recentEvents
                                .filter((evt) => evt && typeof evt === 'object')
                                .map((evt) => ({
                                    at: typeof evt.at === 'string' ? evt.at : null,
                                    country: typeof evt.country === 'string' ? evt.country : 'XX',
                                    device: typeof evt.device === 'string' ? evt.device : 'unknown'
                                }))
                                .slice(0, 30)
                            : []
                    }
                    // NOTE: PIN is intentionally omitted from the list response
                });
            } catch { /* skip corrupted entries */ }
        }

        return jsonResponse({ agencies }, 200, origin, rateLimit);
    }

    // ── POST: upsert or revoke ────────────────────────────────────────────────
    if (request.method === 'POST') {
        let body;
        try { body = await request.json(); }
        catch {
            return jsonResponse({ error: 'Invalid JSON' }, 400, origin, rateLimit);
        }

        const { action } = body;

        // Revoke a licence (sets expiry to past)
        if (action === 'revoke') {
            const agencyId = sanitizeAgencyId(body.agencyId);
            if (!agencyId) {
                return jsonResponse({ error: 'Invalid agencyId' }, 400, origin, rateLimit);
            }
            const raw = await env.OKM_LICENSES.get(`agency:${agencyId}`);
            if (!raw) {
                return jsonResponse({ error: 'Not found' }, 404, origin, rateLimit);
            }
            const existing = JSON.parse(raw);
            existing.licenseExpiresAt = '2000-01-01T00:00:00Z'; // Past date
            existing.revokedAt = new Date().toISOString();
            existing.licenseVersion = (existing.licenseVersion || 1) + 1;
            await env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(existing));
            return jsonResponse({ success: true }, 200, origin, rateLimit);
        }

        // Upsert (create or update) a licence
        if (action === 'upsert') {
            const agencyId = sanitizeAgencyId(body.agencyId);
            if (!agencyId) {
                return jsonResponse({ error: 'Invalid agencyId' }, 400, origin, rateLimit);
            }

            const agencyName = typeof body.agencyName === 'string' ? body.agencyName.slice(0, 120) : null;
            const licenseExpiresAt = typeof body.licenseExpiresAt === 'string' ? body.licenseExpiresAt : null;

            if (!agencyName || !licenseExpiresAt) {
                return jsonResponse({ error: 'agencyName and licenseExpiresAt are required' }, 400, origin, rateLimit);
            }

            // Load existing to preserve fields not being updated
            const raw = await env.OKM_LICENSES.get(`agency:${agencyId}`);
            const existing = raw ? JSON.parse(raw) : { firstActivation: true };
            delete existing.pin;
            delete existing.revokedAt; // Clear revoke flag on upsert (re-activation)

            const updated = {
                ...existing,
                agencyName,
                licenseExpiresAt,
                licenseVersion: (existing.licenseVersion || 1) + 1
            };

            await env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(updated));
            return jsonResponse({ success: true }, 200, origin, rateLimit);
        }

        // Delete a licence permanently (removes KV entry)
        if (action === 'delete') {
            const agencyId = sanitizeAgencyId(body.agencyId);
            if (!agencyId) {
                return jsonResponse({ error: 'Invalid agencyId' }, 400, origin, rateLimit);
            }
            await env.OKM_LICENSES.delete(`agency:${agencyId}`);
            return jsonResponse({ success: true }, 200, origin, rateLimit);
        }

        return jsonResponse({ error: 'Unknown action' }, 400, origin, rateLimit);
    }

    return jsonResponse({ error: 'Method Not Allowed' }, 405, origin, rateLimit);
}
