export async function onRequestPost(context) {
    const { request, env } = context;

    let body;
    try {
        body = await request.json();
    } catch {
        return jsonError('Corps de requête invalide', 400);
    }

    const { token, password } = body;

    if (!token || !password) {
        return jsonError('Token et mot de passe requis', 400);
    }

    if (password.length < 8) {
        return jsonError('Le mot de passe doit contenir au moins 8 caractères', 400);
    }

    const pendingRaw = await env.OKM_ACCOUNTS.get(`pending:${token}`);
    if (!pendingRaw) {
        return jsonError('Lien expiré ou invalide. Veuillez recommencer l\'inscription.', 400);
    }

    const pending = JSON.parse(pendingRaw);
    if (new Date(pending.expiresAt) < new Date()) {
        await env.OKM_ACCOUNTS.delete(`pending:${token}`);
        return jsonError('Lien expiré. Veuillez recommencer l\'inscription.', 400);
    }

    const existingAccount = await env.OKM_ACCOUNTS.get(`account:${pending.email}`);
    if (existingAccount) {
        return jsonError('Un compte existe déjà avec cette adresse email', 409);
    }

    const { hash, salt } = await hashPassword(password);

    const agencyId = generateId();
    const now = new Date().toISOString();
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const agency = {
        id: agencyId,
        name: pending.company,
        agencyVersion: 1,
        createdAt: now,
        licenseExpiresAt: trialEndsAt,
        plan: 'trial',
        ownerEmail: pending.email,
    };

    const account = {
        email: pending.email,
        name: pending.name,
        company: pending.company,
        phone: '',
        passwordHash: hash,
        salt,
        emailVerified: true,
        createdAt: now,
        trialEndsAt,
        plan: 'trial',
        agencies: [{ id: agencyId, name: pending.company, createdAt: now }],
        formSettings: {
            language: 'fr',
            showTempAddress: true,
            showSecondPhone: true,
        },
    };

    const sessionId = generateToken();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session = { email: pending.email, createdAt: now, expiresAt: sessionExpiresAt };

    await Promise.all([
        env.OKM_ACCOUNTS.put(`account:${pending.email}`, JSON.stringify(account)),
        env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(agency)),
        env.OKM_ACCOUNTS.put(`session:${sessionId}`, JSON.stringify(session), {
            expirationTtl: 7 * 24 * 60 * 60,
        }),
        env.OKM_ACCOUNTS.delete(`pending:${token}`),
    ]);

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': buildSessionCookie(sessionId),
        },
    });
}

async function hashPassword(password) {
    const salt = crypto.randomUUID();
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
    );
    const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    return { hash, salt };
}

function generateToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
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
