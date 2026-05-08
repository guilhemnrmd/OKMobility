export async function onRequestGet(context) {
    const { request, env } = context;

    const session = await getSession(request, env);
    if (!session) {
        return new Response(JSON.stringify({ authenticated: false }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const accountRaw = await env.OKM_ACCOUNTS.get(`account:${session.email}`);
    if (!accountRaw) {
        return new Response(JSON.stringify({ authenticated: false }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const account = JSON.parse(accountRaw);

    return new Response(JSON.stringify({
        authenticated: true,
        user: {
            email: account.email,
            name: account.name,
            company: account.company,
            phone: account.phone || '',
            plan: account.plan,
            trialEndsAt: account.trialEndsAt,
            agencies: account.agencies,
            formSettings: account.formSettings,
            createdAt: account.createdAt,
        },
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function getSession(request, env) {
    const cookie = request.headers.get('Cookie') || '';
    const sessionId = getCookieValue(cookie, 'okm_session');
    if (!sessionId) return null;

    const sessionRaw = await env.OKM_ACCOUNTS.get(`session:${sessionId}`);
    if (!sessionRaw) return null;

    const session = JSON.parse(sessionRaw);
    if (new Date(session.expiresAt) < new Date()) {
        await env.OKM_ACCOUNTS.delete(`session:${sessionId}`);
        return null;
    }

    return session;
}

function getCookieValue(cookieString, name) {
    const match = cookieString.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
}
