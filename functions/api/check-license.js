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
const TELEMETRY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const TELEMETRY_MAX_DEVICE_KEYS = 500;
const TELEMETRY_MAX_EVENTS = 100;

function shouldCollectTelemetry(request, url) {
    const source = (url.searchParams.get('source') || '').trim().toLowerCase();
    if (source !== 'retailer') return false;

    const referer = request.headers.get('referer') || '';
    if (!referer) return false;

    try {
        const refererUrl = new URL(referer);
        return refererUrl.pathname.startsWith('/retailer/');
    } catch {
        return false;
    }
}

function getClientIp(request) {
    return request.headers.get('cf-connecting-ip') || 'unknown';
}

/**
 * Determines if the origin is trusted by checking it matches the request's own host.
 * This makes the code domain-agnostic — works with any custom domain or pages.dev URL.
 */
function getTrustedOrigin(request) {
    const requestHost = request.headers.get('host') || '';
    const sameOrigin = 'https://' + requestHost;

    const origin = request.headers.get('origin');
    if (origin) {
        try {
            const url = new URL(origin);
            // Same-origin or same root domain (covers preview deployments like abc123.okmobility.pages.dev)
            if (url.origin === sameOrigin) return origin;
            // Allow subdomains of the same root (e.g. develop.okmobility.pages.dev)
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

    // Same-host request without origin header (e.g. fetch from QR-scanned page)
    return sameOrigin;
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

async function sha256Hex(input) {
    const payload = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', payload);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getDeviceCountry(request) {
    const country = (request.headers.get('cf-ipcountry') || '').toUpperCase();
    return /^[A-Z]{2}$/.test(country) ? country : 'XX';
}

/**
 * Extracts geolocation info from Cloudflare's request.cf object.
 * Available on all plans (including Free).
 * Coordinates are rounded to 2 decimals (~1 km) for GDPR compliance.
 */
function getGeoInfo(request) {
    const cf = request.cf || {};
    const lat = typeof cf.latitude === 'string' ? parseFloat(cf.latitude) : (typeof cf.latitude === 'number' ? cf.latitude : null);
    const lon = typeof cf.longitude === 'string' ? parseFloat(cf.longitude) : (typeof cf.longitude === 'number' ? cf.longitude : null);
    return {
        city: typeof cf.city === 'string' ? cf.city : null,
        region: typeof cf.region === 'string' ? cf.region : null,
        regionCode: typeof cf.regionCode === 'string' ? cf.regionCode : null,
        timezone: typeof cf.timezone === 'string' ? cf.timezone : null,
        lat: Number.isFinite(lat) ? Math.round(lat * 100) / 100 : null,
        lon: Number.isFinite(lon) ? Math.round(lon * 100) / 100 : null
    };
}

async function recordAgencyTelemetry(env, request, agencyId) {
    if (!env.OKM_LICENSES) return;

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const salt = env.TELEMETRY_SALT || env.ADMIN_TOKEN || 'okm-default-salt';
    const country = getDeviceCountry(request);
    const geo = getGeoInfo(request);
    const now = Date.now();

    // Pseudonymous device key, no raw IP stored.
    const deviceKey = await sha256Hex(`${salt}:${agencyId}:${ip}:${userAgent}`);
    const statsKey = `stats:${agencyId}`;

    let stats = {
        totalChecks: 0,
        uniqueDevices30d: 0,
        lastSeenAt: null,
        lastSeenCountry: 'XX',
        countries30d: {},
        cities30d: {},
        deviceSeenAt: {},
        recentEvents: []
    };

    try {
        const raw = await env.OKM_LICENSES.get(statsKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') stats = { ...stats, ...parsed };
        }
    } catch {
        // Ignore telemetry parse errors and rebuild stats.
    }

    const deviceSeenAt = (stats.deviceSeenAt && typeof stats.deviceSeenAt === 'object') ? stats.deviceSeenAt : {};
    const countries30d = (stats.countries30d && typeof stats.countries30d === 'object') ? stats.countries30d : {};
    const cities30d = (stats.cities30d && typeof stats.cities30d === 'object') ? stats.cities30d : {};
    const recentEvents = Array.isArray(stats.recentEvents) ? stats.recentEvents : [];

    // Prune expired device keys (older than 30 days).
    const entries = Object.entries(deviceSeenAt).filter(([, ts]) => Number.isFinite(ts) && (now - ts) <= TELEMETRY_RETENTION_MS);

    // Keep only the most recent keys to cap payload size.
    entries.sort((a, b) => b[1] - a[1]);
    const capped = entries.slice(0, TELEMETRY_MAX_DEVICE_KEYS - 1);

    const nextDeviceSeenAt = Object.fromEntries(capped);
    nextDeviceSeenAt[deviceKey] = now;

    countries30d[country] = (countries30d[country] || 0) + 1;
    if (geo.city) {
        cities30d[geo.city] = (cities30d[geo.city] || 0) + 1;
    }

    const event = {
        at: new Date(now).toISOString(),
        country,
        city: geo.city,
        region: geo.region,
        regionCode: geo.regionCode,
        timezone: geo.timezone,
        lat: geo.lat,
        lon: geo.lon,
        device: deviceKey.slice(0, 12)
    };
    const nextRecentEvents = [event, ...recentEvents]
        .filter((e) => e && typeof e === 'object' && typeof e.at === 'string')
        .slice(0, TELEMETRY_MAX_EVENTS);

    const uniqueDevices30d = Object.keys(nextDeviceSeenAt).length;
    const totalChecks = Number.isFinite(stats.totalChecks) ? stats.totalChecks + 1 : 1;

    const nextStats = {
        totalChecks,
        uniqueDevices30d,
        lastSeenAt: new Date(now).toISOString(),
        lastSeenCountry: country,
        countries30d,
        cities30d,
        deviceSeenAt: nextDeviceSeenAt,
        recentEvents: nextRecentEvents
    };

    await env.OKM_LICENSES.put(statsKey, JSON.stringify(nextStats));
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

    // Best-effort telemetry for admin insights (retailer context only).
    if (shouldCollectTelemetry(request, url)) {
        try {
            await recordAgencyTelemetry(env, request, agencyId);
        } catch {
            // Ignore telemetry errors.
        }
    }

    let formSettings = null;
    if (license.ownerEmail && env.OKM_ACCOUNTS) {
        try {
            const accountRaw = await env.OKM_ACCOUNTS.get(`account:${license.ownerEmail}`);
            if (accountRaw) {
                const account = JSON.parse(accountRaw);
                formSettings = account.formSettings || null;
            }
        } catch (e) {
            // Ignore if we can't fetch account
        }
    }

    return new Response(JSON.stringify({
        valid: true,
        agencyName: license.agencyName,
        licenseExpiresAt: license.licenseExpiresAt || null,
        firstActivation: license.firstActivation === true,
        licenseVersion: license.licenseVersion || 1,
        agencyAddress: license.agencyAddress || null,
        agencyLanguage: license.agencyLanguage || null,
        formSettings: formSettings
    }), { status: 200, headers: buildHeaders(trustedOrigin) });

}
