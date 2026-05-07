/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * Cloudflare Pages Function — Trial signup endpoint
 * POST /api/signup
 *
 * Creates a pending account in KV, generates a one-time activation token,
 * sends a magic-link email via MailChannels, and notifies the admin.
 *
 * Required env bindings:
 *   OKM_LICENSES  — KV namespace
 *   NOTIFY_EMAIL  — admin notification address (env secret)
 *   BRAND_NAME    — optional, defaults to "MobilityOS"
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map();

const ACTIVATION_TTL_SECONDS = 24 * 3600;

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
            // Match same eTLD+1 only (last two labels) to prevent subdomain spoofing
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

/** HTML-encode all user-supplied values before inserting into email HTML. */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function hexEncode(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(bytes = 32) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return hexEncode(arr.buffer);
}

function getRequestHost(request) {
    const host = request.headers.get('host') || '';
    // Prefer x-forwarded-host only when explicitly trusted by the platform
    return host;
}

/**
 * Send an email via Resend API.
 * Requires RESEND_API_KEY env secret.
 * Without a verified domain, uses Resend's shared sender onboarding@resend.dev.
 */
async function sendViaResend(env, { to, toName, subject, html }) {
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) return;

    const brandName = env.BRAND_NAME || 'MobilityOS';
    // Use verified domain sender if available, else Resend's free shared sender
    const from = env.FROM_EMAIL || `${brandName} <onboarding@resend.dev>`;

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ from, to: toName ? `${toName} <${to}>` : to, subject, html })
    });
}

async function sendActivationEmail(env, request, data, token) {
    const brandName = env.BRAND_NAME || 'MobilityOS';
    const proto = request.url.startsWith('https://') ? 'https' : 'http';
    const host = request.headers.get('host') || '';
    const activationUrl = `${proto}://${host}/setup-account/?token=${token}`;

    const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#17181D;">
  <h2 style="color:#2054EA;margin-bottom:8px;">${escapeHtml(brandName)}</h2>
  <p style="margin-bottom:24px;color:#5B6070;">Bonjour ${escapeHtml(data.firstName)},</p>
  <p>Votre demande d'essai a bien été reçue. Cliquez sur le bouton ci-dessous pour créer votre mot de passe et activer votre compte.</p>
  <div style="margin:28px 0;">
    <a href="${escapeHtml(activationUrl)}"
       style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#2054EA,#05C4E8);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
      Activer mon compte →
    </a>
  </div>
  <p style="font-size:13px;color:#888;">Ce lien est valable 24 heures et ne peut être utilisé qu'une seule fois.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="font-size:12px;color:#aaa;">Si vous ne pouvez pas cliquer sur le bouton, copiez ce lien dans votre navigateur :<br>${escapeHtml(activationUrl)}</p>
</div>`.trim();

    try {
        await sendViaResend(env, {
            to: data.email,
            toName: `${data.firstName} ${data.lastName}`,
            subject: `Activez votre compte ${brandName} — lien valable 24h`,
            html
        });
    } catch { /* Non-blocking */ }
}

async function sendAdminNotification(env, data) {
    const notifyTo = env.NOTIFY_EMAIL;
    if (!notifyTo) return;
    const brandName = env.BRAND_NAME || 'MobilityOS';

    const html = `
<h2 style="color:#2054EA">Nouvelle demande d'essai 30j — ${escapeHtml(brandName)}</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Société</td><td>${escapeHtml(data.companyName)}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Contact</td><td>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">E-mail</td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Téléphone</td><td>${escapeHtml(data.phone || '—')}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Postes</td><td>${escapeHtml(data.desks || '—')}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Langue</td><td>${escapeHtml(data.lang || '—')}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Date</td><td>${escapeHtml(data.ts)}</td></tr>
</table>`.trim();

    try {
        await sendViaResend(env, {
            to: notifyTo,
            subject: `[${brandName}] Nouvelle demande d'essai — ${data.companyName}`,
            html
        });
    } catch { /* Non-blocking */ }
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
        return new Response(JSON.stringify({ error: 'Service unavailable' }), {
            status: 503, headers: buildHeaders(trustedOrigin)
        });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
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

    const companyName = sanitizeString(body.companyName, 100);
    const firstName   = sanitizeString(body.firstName, 60);
    const lastName    = sanitizeString(body.lastName, 60);
    const email       = sanitizeString(body.email, 120).toLowerCase();
    const phone       = sanitizeString(body.phone, 30);
    const desks       = sanitizeString(String(body.desks || ''), 6);
    const lang        = sanitizeString(body.lang, 10);

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
    const accountKey = `signup:${ts}:${email}`;
    const data = {
        companyName, firstName, lastName, email, phone, desks, lang,
        ts, status: 'pending',
        ip: ip.slice(0, 8) + '…'
    };

    await env.OKM_LICENSES.put(accountKey, JSON.stringify(data), {
        expirationTtl: 365 * 24 * 3600
    });

    // Generate activation token (one-time, 24h TTL)
    const token = generateToken(32);
    await env.OKM_LICENSES.put(`activation:${token}`, JSON.stringify({
        email,
        expiresAt: new Date(Date.now() + ACTIVATION_TTL_SECONDS * 1000).toISOString()
    }), { expirationTtl: ACTIVATION_TTL_SECONDS });

    // Send emails (non-blocking)
    context.waitUntil(Promise.all([
        sendActivationEmail(env, request, data, token),
        sendAdminNotification(env, data)
    ]));

    return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: buildHeaders(trustedOrigin)
    });
}
