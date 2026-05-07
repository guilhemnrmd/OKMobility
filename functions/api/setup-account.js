/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Account activation via token
 *
 * GET  /api/setup-account?token=<token>
 *   → Validates the activation token. Returns { valid, email, reason? }
 *
 * POST /api/setup-account
 *   body: { token, password }
 *   → Validates token, hashes password with PBKDF2, activates account, invalidates token.
 *
 * KV Keys (OKM_LICENSES namespace):
 *   signup:{ts}:{email}          → account data (status: pending → active)
 *   activation:{token}           → { email, expiresAt } (TTL 24h, deleted on use)
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = new Map();

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 32;
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

function getClientIp(request) {
    return request.headers.get('cf-connecting-ip') || 'unknown';
}

function getTrustedOrigin(request) {
    const requestHost = request.headers.get('host') || '';
    const sameOrigin = 'https://' + requestHost;
    const origin = request.headers.get('origin');
    if (origin) {
        try {
            const u = new URL(origin);
            if (u.origin === sameOrigin) return origin;
            // Allow same eTLD+1 only (last two labels)
            const eTLD1 = requestHost.split('.').slice(-2).join('.');
            if (u.hostname === eTLD1 || u.hostname.endsWith('.' + eTLD1)) return origin;
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

function hexEncode(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, saltHex) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial, 256
    );
    return hexEncode(bits);
}

function generateSalt() {
    const arr = new Uint8Array(SALT_BYTES);
    crypto.getRandomValues(arr);
    return hexEncode(arr.buffer);
}

async function timingSafeEqual(a, b) {
    const enc = new TextEncoder();
    const ka = await crypto.subtle.importKey('raw', enc.encode(a), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const kb = await crypto.subtle.importKey('raw', enc.encode(b), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const msg = enc.encode('compare');
    const [sa, sb] = await Promise.all([crypto.subtle.sign('HMAC', ka, msg), crypto.subtle.sign('HMAC', kb, msg)]);
    const va = new Uint8Array(sa), vb = new Uint8Array(sb);
    if (va.length !== vb.length) return false;
    let diff = 0;
    for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
    return diff === 0;
}

async function findAccountByEmail(kv, email) {
    // List keys matching signup:*:email pattern (limited scan)
    const list = await kv.list({ prefix: `signup:` });
    for (const key of list.keys) {
        if (key.name.endsWith(':' + email)) {
            const raw = await kv.get(key.name);
            if (raw) return { key: key.name, data: JSON.parse(raw) };
        }
    }
    return null;
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
    if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
            status: 429, headers: buildHeaders(trustedOrigin)
        });
    }

    // ── GET: validate token ──────────────────────────────────────────────────
    if (request.method === 'GET') {
        const token = new URL(request.url).searchParams.get('token') || '';
        if (!token || !/^[0-9a-f]{64}$/.test(token)) {
            return new Response(JSON.stringify({ valid: false, reason: 'invalid' }), {
                status: 200, headers: buildHeaders(trustedOrigin)
            });
        }

        const raw = await env.OKM_LICENSES.get(`activation:${token}`);
        if (!raw) {
            return new Response(JSON.stringify({ valid: false, reason: 'invalid' }), {
                status: 200, headers: buildHeaders(trustedOrigin)
            });
        }

        let entry;
        try { entry = JSON.parse(raw); } catch {
            return new Response(JSON.stringify({ valid: false, reason: 'invalid' }), {
                status: 200, headers: buildHeaders(trustedOrigin)
            });
        }

        if (new Date(entry.expiresAt) < new Date()) {
            await env.OKM_LICENSES.delete(`activation:${token}`);
            return new Response(JSON.stringify({ valid: false, reason: 'expired' }), {
                status: 200, headers: buildHeaders(trustedOrigin)
            });
        }

        return new Response(JSON.stringify({ valid: true, email: entry.email }), {
            status: 200, headers: buildHeaders(trustedOrigin)
        });
    }

    // ── POST: set password ───────────────────────────────────────────────────
    if (request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }

        const token = typeof body.token === 'string' ? body.token.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';

        if (!token || !/^[0-9a-f]{64}$/.test(token)) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }
        if (!password || password.length < 8 || password.length > 256) {
            return new Response(JSON.stringify({ error: 'Password must be at least 8 characters.' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }

        const raw = await env.OKM_LICENSES.get(`activation:${token}`);
        if (!raw) {
            return new Response(JSON.stringify({ error: 'Ce lien est invalide ou déjà utilisé.' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }

        let entry;
        try { entry = JSON.parse(raw); } catch {
            return new Response(JSON.stringify({ error: 'Ce lien est invalide.' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }

        if (new Date(entry.expiresAt) < new Date()) {
            await env.OKM_LICENSES.delete(`activation:${token}`);
            return new Response(JSON.stringify({ error: 'Ce lien a expiré. Veuillez créer un nouveau compte.' }), {
                status: 400, headers: buildHeaders(trustedOrigin)
            });
        }

        const salt = generateSalt();
        const hash = await hashPassword(password, salt);

        // Update the account record
        const account = await findAccountByEmail(env.OKM_LICENSES, entry.email);
        if (account) {
            const updated = { ...account.data, status: 'active', passwordHash: hash, passwordSalt: salt, activatedAt: new Date().toISOString() };
            await env.OKM_LICENSES.put(account.key, JSON.stringify(updated));
        }

        // Invalidate token immediately (one-time use)
        await env.OKM_LICENSES.delete(`activation:${token}`);

        return new Response(JSON.stringify({ ok: true }), {
            status: 200, headers: buildHeaders(trustedOrigin)
        });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405, headers: buildHeaders(trustedOrigin)
    });
}
