/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Retailer customization settings
 *
 * GET  /api/retailer-settings?agency=<id>
 *   → Returns the public customization settings for an agency (no auth required)
 *
 * POST /api/retailer-settings
 *   body: { agency, pin, settings: { welcomeMsg?, displayName?, defaultLang?, logoUrl? } }
 *   → Validates the PIN against the license entry, then stores settings in KV.
 *
 * KV Keys:
 *   agency:{id}           → license entry (existing, read-only here)
 *   settings:{id}         → customization settings (JSON)
 *
 * PIN storage: the license entry may include a `settingsPin` field (plain string, max 8 chars).
 * Set via the admin panel when creating/editing a license.
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_READ = 60;
const RATE_LIMIT_MAX_WRITE = 10;
const rateLimitStore = new Map();

function getClientIp(request) {
    return request.headers.get('cf-connecting-ip') || 'unknown';
}

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
    return sameOrigin;
}

function buildHeaders(origin) {
    return {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin',
        ...(origin ? {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        } : {})
    };
}

function isRateLimited(key, max) {
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(key, { windowStart: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > max;
}

function sanitizeAgencyId(id) {
    if (typeof id !== 'string') return null;
    return /^[a-z0-9_]{1,64}$/.test(id) ? id : null;
}

function sanitizeString(val, maxLen = 200) {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

function sanitizeUrl(val) {
    if (typeof val !== 'string') return '';
    const clean = val.trim().slice(0, 500);
    try {
        const u = new URL(clean);
        if (u.protocol === 'https:') return clean;
    } catch { /* ignore */ }
    return '';
}

export async function onRequest(context) {
    const { env, request } = context;
    const trustedOrigin = getTrustedOrigin(request);

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: buildHeaders(trustedOrigin) });
    }

    if (!env.OKM_LICENSES) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
            status: 503, headers: buildHeaders(trustedOrigin)
        });
    }

    const ip = getClientIp(request);

    // ── GET: read public settings ─────────────────────────────────────────────
    if (request.method === 'GET') {
        if (isRateLimited(ip, RATE_LIMIT_MAX_READ)) {
            return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
                status: 429, headers: buildHeaders(trustedOrigin)
            });
        }

        const url = new URL(request.url);
        const agencyId = sanitizeAgencyId(url.searchParams.get('agency'));
        if (!agencyId) {
            return new Response(JSON.stringify({ error: 'Invalid agency id' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }

        const raw = await env.OKM_LICENSES.get(`settings:${agencyId}`);
        if (!raw) {
            return new Response(JSON.stringify({ settings: null }), {
                status: 200, headers: buildHeaders(trustedOrigin)
            });
        }

        let settings;
        try { settings = JSON.parse(raw); } catch { settings = null; }

        return new Response(JSON.stringify({ settings }), {
            status: 200, headers: buildHeaders(trustedOrigin)
        });
    }

    // ── POST: update settings (PIN-protected) ─────────────────────────────────
    if (request.method === 'POST') {
        if (isRateLimited(ip, RATE_LIMIT_MAX_WRITE)) {
            return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
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

        const agencyId = sanitizeAgencyId(body.agency);
        if (!agencyId) {
            return new Response(JSON.stringify({ error: 'Invalid agency id' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }

        const pin = typeof body.pin === 'string' ? body.pin.trim().slice(0, 8) : '';

        // Load license to validate PIN
        const licenseRaw = await env.OKM_LICENSES.get(`agency:${agencyId}`);
        if (!licenseRaw) {
            return new Response(JSON.stringify({ error: 'Agency not found' }), {
                status: 404, headers: buildHeaders(trustedOrigin)
            });
        }

        let license;
        try { license = JSON.parse(licenseRaw); } catch {
            return new Response(JSON.stringify({ error: 'License corrupted' }), {
                status: 500, headers: buildHeaders(trustedOrigin)
            });
        }

        // PIN required if set on the license; if no PIN set, reject write access.
        if (!license.settingsPin) {
            return new Response(JSON.stringify({ error: 'Settings PIN not configured. Contact your administrator.' }), {
                status: 403, headers: buildHeaders(trustedOrigin)
            });
        }
        if (pin !== String(license.settingsPin)) {
            return new Response(JSON.stringify({ error: 'Invalid PIN' }), {
                status: 401, headers: buildHeaders(trustedOrigin)
            });
        }

        // Sanitize and store settings
        const s = body.settings || {};
        const settings = {
            displayName: sanitizeString(s.displayName, 80),
            welcomeMsg: sanitizeString(s.welcomeMsg, 160),
            defaultLang: /^[a-z]{2}$/.test(s.defaultLang || '') ? s.defaultLang : '',
            logoUrl: sanitizeUrl(s.logoUrl),
            updatedAt: new Date().toISOString()
        };

        await env.OKM_LICENSES.put(`settings:${agencyId}`, JSON.stringify(settings));

        return new Response(JSON.stringify({ ok: true, settings }), {
            status: 200, headers: buildHeaders(trustedOrigin)
        });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405, headers: buildHeaders(trustedOrigin)
    });
}
