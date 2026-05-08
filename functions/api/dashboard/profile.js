export async function onRequest(context) {
    const { request, env } = context;

    const session = await getSession(request, env);
    if (!session) {
        return jsonError('Non authentifié', 401);
    }

    const accountRaw = await env.OKM_ACCOUNTS.get(`account:${session.email}`);
    if (!accountRaw) {
        return jsonError('Compte introuvable', 404);
    }
    const account = JSON.parse(accountRaw);

    if (request.method === 'GET') {
        return new Response(JSON.stringify({
            email: account.email,
            name: account.name,
            company: account.company,
            phone: account.phone || '',
            plan: account.plan,
            trialEndsAt: account.trialEndsAt,
            createdAt: account.createdAt,
            formSettings: account.formSettings,
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'PUT') {
        let body;
        try {
            body = await request.json();
        } catch {
            return jsonError('Corps de requête invalide', 400);
        }

        if (body.name?.trim()) account.name = body.name.trim();
        if (body.company?.trim()) account.company = body.company.trim();
        if (body.phone !== undefined) account.phone = (body.phone || '').trim();
        if (body.formSettings && typeof body.formSettings === 'object') {
            account.formSettings = { ...account.formSettings, ...body.formSettings };
        }

        await env.OKM_ACCOUNTS.put(`account:${session.email}`, JSON.stringify(account));
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return jsonError('Méthode non autorisée', 405);
}

async function getSession(request, env) {
    const cookie = request.headers.get('Cookie') || '';
    const sessionId = getCookieValue(cookie, 'okm_session');
    if (!sessionId) return null;

    const sessionRaw = await env.OKM_ACCOUNTS.get(`session:${sessionId}`);
    if (!sessionRaw) return null;

    const session = JSON.parse(sessionRaw);
    if (new Date(session.expiresAt) < new Date()) return null;

    return session;
}

function getCookieValue(cookieString, name) {
    const match = cookieString.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
}

function jsonError(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
