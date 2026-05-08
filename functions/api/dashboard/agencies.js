export async function onRequest(context) {
    const { request, env } = context;

    const session = await getSession(request, env);
    if (!session) {
        return jsonError('Non authentifié', 401);
    }

    const accountRaw = await env.OKM_ACCOUNTS.get(`account:${session.email}`);
    if (!accountRaw) return jsonError('Compte introuvable', 404);
    const account = JSON.parse(accountRaw);

    if (request.method === 'GET') {
        return new Response(JSON.stringify({ agencies: account.agencies || [] }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (request.method === 'POST') {
        // Trial restriction — commented out for dev; re-enable when going live:
        // if (account.plan === 'trial' && (account.agencies || []).length >= 1) {
        //     return jsonError('La création de plusieurs agences est réservée aux abonnés Pro', 403);
        // }

        let body;
        try { body = await request.json(); } catch { return jsonError('Corps invalide', 400); }

        const { name } = body;
        if (!name?.trim()) return jsonError("Nom d'agence requis", 400);

        const agencyId = generateId();
        const now = new Date().toISOString();

        const agency = {
            id: agencyId,
            name: name.trim(),
            agencyVersion: 1,
            createdAt: now,
            licenseExpiresAt: account.trialEndsAt,
            plan: account.plan,
            ownerEmail: session.email,
        };

        if (!account.agencies) account.agencies = [];
        account.agencies.push({ id: agencyId, name: name.trim(), createdAt: now });

        await Promise.all([
            env.OKM_ACCOUNTS.put(`account:${session.email}`, JSON.stringify(account)),
            env.OKM_LICENSES.put(`agency:${agencyId}`, JSON.stringify(agency)),
        ]);

        return new Response(JSON.stringify({
            success: true,
            agency: { id: agencyId, name: name.trim(), createdAt: now },
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'DELETE') {
        const url = new URL(request.url);
        const agencyId = url.searchParams.get('id');
        if (!agencyId) return jsonError("ID d'agence requis", 400);

        const agencies = account.agencies || [];
        if (agencies.length <= 1) {
            return jsonError('Vous devez conserver au moins une agence', 400);
        }

        const idx = agencies.findIndex(a => a.id === agencyId);
        if (idx === -1) return jsonError('Agence introuvable', 404);

        agencies.splice(idx, 1);
        account.agencies = agencies;

        await Promise.all([
            env.OKM_ACCOUNTS.put(`account:${session.email}`, JSON.stringify(account)),
            env.OKM_LICENSES.delete(`agency:${agencyId}`),
        ]);

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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function jsonError(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
