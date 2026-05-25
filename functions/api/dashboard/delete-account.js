export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'DELETE') {
        return jsonError('Méthode non autorisée', 405);
    }

    const session = await getSession(request, env);
    if (!session) {
        return jsonError('Non authentifié', 401);
    }

    const email = session.email;

    // ── Verify the account exists ─────────────────────────────────────────
    const accountRaw = await env.OKM_ACCOUNTS.get(`account:${email}`);
    if (!accountRaw) {
        return jsonError('Compte introuvable', 404);
    }

    // ── Require the email as confirmation in request body ─────────────────
    let body;
    try {
        body = await request.json();
    } catch {
        return jsonError('Corps de requête invalide', 400);
    }

    if (!body.confirmEmail || body.confirmEmail.toLowerCase().trim() !== email) {
        return jsonError('Confirmation email incorrecte', 400);
    }

    // ── Delete: license entries + sessions + account ──────────────────
    try {
        const account = JSON.parse(accountRaw);
        const agencies = account.agencies || [];

        // 1. Remove license entries and stats for all agencies of this account
        if (env.OKM_LICENSES) {
            for (const agency of agencies) {
                if (agency.id) {
                    await Promise.all([
                        env.OKM_LICENSES.delete(`agency:${agency.id}`).catch(() => {}),
                        env.OKM_LICENSES.delete(`stats:${agency.id}`).catch(() => {})
                    ]);
                }
            }
        }

        // 2. Remove the current session
        const cookie = request.headers.get('Cookie') || '';
        const sessionId = getCookieValue(cookie, 'okm_session');
        if (sessionId) {
            await env.OKM_ACCOUNTS.delete(`session:${sessionId}`);
        }

        // 3. Remove main account record (done last so that if any cleanup fails, the account isn't orphaned)
        await env.OKM_ACCOUNTS.delete(`account:${email}`);
    } catch (err) {
        console.error('[DELETE ACCOUNT] Error:', err?.message || err);
        return jsonError('Erreur lors de la suppression', 500);
    }

    // ── Expire the session cookie ─────────────────────────────────────────
    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'okm_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure',
        },
    });
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
