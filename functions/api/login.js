/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Login endpoint
 *
 * POST /api/login
 *   body: { email, password }
 *   → Validates credentials, creates a session token, sets HttpOnly cookie.
 *   → Returns { ok, redirect }
 *
 * KV Keys (OKM_LICENSES namespace):
 *   signup:{ts}:{email}  → account data (must have status: active)
 *   session:{token}      → { email, createdAt } (TTL 7 days)
 */

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;  // 5-minute window
const RATE_LIMIT_MAX = 10;                     // 10 attempts per IP per 5 min
const rateLimitStore = new Map();

const SESSION_TTL_SECONDS = 7 * 24 * 3600;
const PBKDF2_ITERATIONS = 100_000;
const SESSION_COOKIE = 'okm_session';

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
            const eTLD1 = requestHost.split('.').slice(-2).join('.');
            if (u.hostname === eTLD1 || u.hostname.endsWith('.' + eTLD1)) return origin;
        } catch { /* ignore */ }
    }
    return sameOrigin;
}

function buildHeaders(origin, extra = {}) {
    return {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin',
        ...(origin ? {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': 'true'
        } : {}),
        ...extra
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

function generateToken(bytes = 32) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return hexEncode(arr.buffer);
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

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405, headers: buildHeaders(trustedOrigin)
        });
    }

    if (!env.OKM_LICENSES) {
        return new Response(JSON.stringify({ error: 'KV not configured' }), {
            status: 503, headers: buildHeaders(trustedOrigin)
        });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Trop de tentatives. Réessayez dans 5 minutes.' }), {
            status: 429, headers: buildHeaders(trustedOrigin)
        });
    }

    let body;
    try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 120) : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || !emailRe.test(email) || !password) {
        return new Response(JSON.stringify({ error: 'Identifiants incorrects.' }), {
            status: 401, headers: buildHeaders(trustedOrigin)
        });
    }

    const account = await findAccountByEmail(env.OKM_LICENSES, email);

    // Always run the hash to prevent timing-based account enumeration
    const dummySalt = '0'.repeat(64);
    const candidateHash = account?.data?.passwordHash
        ? await hashPassword(password, account.data.passwordSalt || dummySalt)
        : await hashPassword(password, dummySalt);

    if (!account || account.data.status !== 'active' || !account.data.passwordHash) {
        return new Response(JSON.stringify({ error: 'Identifiants incorrects.' }), {
            status: 401, headers: buildHeaders(trustedOrigin)
        });
    }

    const valid = await timingSafeEqual(candidateHash, account.data.passwordHash);
    if (!valid) {
        return new Response(JSON.stringify({ error: 'Identifiants incorrects.' }), {
            status: 401, headers: buildHeaders(trustedOrigin)
        });
    }

    // Create session
    const sessionToken = generateToken(32);
    const sessionData = { email, createdAt: new Date().toISOString() };
    await env.OKM_LICENSES.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
        expirationTtl: SESSION_TTL_SECONDS
    });

    const isSecure = request.url.startsWith('https://');
    const cookieValue = `${SESSION_COOKIE}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${isSecure ? '; Secure' : ''}`;

    return new Response(JSON.stringify({ ok: true, redirect: '/retailer/' }), {
        status: 200,
        headers: buildHeaders(trustedOrigin, { 'Set-Cookie': cookieValue })
    });
}
