export async function onRequestPost(context) {
    const { request, env } = context;

    let body;
    try {
        body = await request.json();
    } catch {
        return jsonError('Corps de requête invalide', 400);
    }

    const { email, password } = body;
    if (!email?.trim() || !password) {
        return jsonError('Email et mot de passe requis', 400);
    }

    const emailLower = email.toLowerCase().trim();
    
    if (!env.OKM_ACCOUNTS) {
        return jsonError('Erreur de configuration serveur (OKM_ACCOUNTS manquant)', 500);
    }

    const accountRaw = await env.OKM_ACCOUNTS.get(`account:${emailLower}`);
    if (!accountRaw) {
        return jsonError('Email ou mot de passe incorrect', 401);
    }

    const account = JSON.parse(accountRaw);
    const valid = await verifyPassword(password, account.salt, account.passwordHash);
    if (!valid) {
        return jsonError('Email ou mot de passe incorrect', 401);
    }

    const sessionId = generateToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await env.OKM_ACCOUNTS.put(
        `session:${sessionId}`,
        JSON.stringify({ email: emailLower, createdAt: now, expiresAt }),
        { expirationTtl: 7 * 24 * 60 * 60 }
    );

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': buildSessionCookie(sessionId),
        },
    });
}

async function verifyPassword(password, salt, storedHash) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
    );
    const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hash === storedHash;
}

function generateToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildSessionCookie(sessionId) {
    const maxAge = 7 * 24 * 60 * 60;
    return `okm_session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

function jsonError(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
