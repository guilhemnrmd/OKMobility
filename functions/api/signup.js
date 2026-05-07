/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Trial signup endpoint
 * POST /api/signup
 *
 * Stores the signup request in KV (OKM_LICENSES namespace) under key signup:{ts}:{email}
 * and sends a notification email via MailChannels (free Cloudflare integration).
 *
 * Required env bindings:
 *   OKM_LICENSES  — KV namespace (reused for signups)
 *   NOTIFY_EMAIL  — email address to receive signup notifications (env secret)
 *   BRAND_NAME    — optional, defaults to "MobilityOS"
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

function sanitizeString(val, maxLen = 200) {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

function isValidEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

async function sendNotificationEmail(env, data) {
    const notifyTo = env.NOTIFY_EMAIL;
    if (!notifyTo) return;

    const brandName = env.BRAND_NAME || 'MobilityOS';
    const subject = `[${brandName}] Nouvelle demande d'essai — ${data.companyName}`;
    const html = `
<h2 style="color:#2054EA">Nouvelle demande d'essai 30j</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Société</td><td>${data.companyName}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Contact</td><td>${data.firstName} ${data.lastName}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">E-mail</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Téléphone</td><td>${data.phone || '—'}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Postes</td><td>${data.desks || '—'}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Langue</td><td>${data.lang || '—'}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Date</td><td>${data.ts}</td></tr>
</table>
`.trim();

    try {
        await fetch('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: notifyTo }] }],
                from: { email: `noreply@${new URL('https://' + notifyTo.split('@')[1]).hostname}`, name: brandName },
                subject,
                content: [{ type: 'text/html', value: html }]
            })
        });
    } catch {
        // Email failure is non-blocking — signup is still stored in KV.
    }
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

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
            status: 429, headers: buildHeaders(trustedOrigin)
        });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }

    const companyName = sanitizeString(body.companyName, 100);
    const firstName = sanitizeString(body.firstName, 60);
    const lastName = sanitizeString(body.lastName, 60);
    const email = sanitizeString(body.email, 120);
    const phone = sanitizeString(body.phone, 30);
    const desks = sanitizeString(String(body.desks || ''), 6);
    const lang = sanitizeString(body.lang, 10);

    if (!companyName || !firstName || !lastName) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }
    if (!isValidEmail(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address' }), {
            status: 400, headers: buildHeaders(trustedOrigin)
        });
    }

    const ts = new Date().toISOString();
    const data = { companyName, firstName, lastName, email, phone, desks, lang, ts, ip: ip.slice(0, 8) + '…' };

    if (env.OKM_LICENSES) {
        const key = `signup:${ts}:${email}`;
        await env.OKM_LICENSES.put(key, JSON.stringify(data), {
            expirationTtl: 365 * 24 * 3600  // keep for 1 year
        });
    }

    // Fire-and-forget notification email
    context.waitUntil(sendNotificationEmail(env, data));

    return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: buildHeaders(trustedOrigin)
    });
}
