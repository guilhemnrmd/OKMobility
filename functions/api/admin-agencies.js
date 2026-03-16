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

function buildHeaders() {
    return {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
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
    const token = getAdminToken(request);

    if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: buildHeaders()
        });
    }

    if (!env.OKM_LICENSES) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
            status: 503, headers: buildHeaders()
        });
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
                agencies.push({
                    id: key.name.replace('agency:', ''),
                    agencyName: data.agencyName,
                    licenseExpiresAt: data.licenseExpiresAt,
                    firstActivation: data.firstActivation,
                    licenseVersion: data.licenseVersion || 1
                    // NOTE: PIN is intentionally omitted from the list response
                });
            } catch { /* skip corrupted entries */ }
        }

        return new Response(JSON.stringify({ agencies }), {
            status: 200, headers: buildHeaders()
        });
    }

    // ── POST: upsert or revoke ────────────────────────────────────────────────
    if (request.method === 'POST') {
        let body;
        try { body = await request.json(); }
        catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
                status: 400, headers: buildHeaders()
            });
        }

        const { action } = body;

        // Revoke a licence (sets expiry to past)
        if (action === 'revoke') {
            const agencyId = sanitizeAgencyId(body.agencyId);
            if (!agencyId) {
                return new Response(JSON.stringify({ error: 'Invalid agencyId' }), {
                    status: 400, headers: buildHeaders()
                });
            }
            const raw = await env.OKM_LICENSES.get(`agency:${agencyId}`);
            if (!raw) {
                return new Response(JSON.stringify({ error: 'Not found' }), {
                    status: 404, headers: buildHeaders()
                });
            }
            const existing = JSON.parse(raw);
            existing.licenseExpiresAt = '2000-01-01T00:00:00Z'; // Past date
            existing.licenseVersion = (existing.licenseVersion || 1) + 1;
            await env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(existing));
            return new Response(JSON.stringify({ success: true }), {
                status: 200, headers: buildHeaders()
            });
        }

        // Upsert (create or update) a licence
        if (action === 'upsert') {
            const agencyId = sanitizeAgencyId(body.agencyId);
            if (!agencyId) {
                return new Response(JSON.stringify({ error: 'Invalid agencyId' }), {
                    status: 400, headers: buildHeaders()
                });
            }

            const agencyName = typeof body.agencyName === 'string' ? body.agencyName.slice(0, 120) : null;
            const licenseExpiresAt = typeof body.licenseExpiresAt === 'string' ? body.licenseExpiresAt : null;

            if (!agencyName || !licenseExpiresAt) {
                return new Response(JSON.stringify({ error: 'agencyName and licenseExpiresAt are required' }), {
                    status: 400, headers: buildHeaders()
                });
            }

            // Load existing to preserve fields not being updated
            const raw = await env.OKM_LICENSES.get(`agency:${agencyId}`);
            const existing = raw ? JSON.parse(raw) : { firstActivation: true };
            delete existing.pin;

            const updated = {
                ...existing,
                agencyName,
                licenseExpiresAt,
                licenseVersion: (existing.licenseVersion || 1) + 1
            };

            await env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(updated));
            return new Response(JSON.stringify({ success: true }), {
                status: 200, headers: buildHeaders()
            });
        }

        return new Response(JSON.stringify({ error: 'Unknown action' }), {
            status: 400, headers: buildHeaders()
        });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405, headers: buildHeaders()
    });
}
