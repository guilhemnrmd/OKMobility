export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return redirect('/signup/?error=invalid_token');
    }

    const pendingRaw = await env.OKM_ACCOUNTS.get(`pending:${token}`);
    if (!pendingRaw) {
        return redirect('/signup/?error=expired_token');
    }

    const pending = JSON.parse(pendingRaw);
    if (new Date(pending.expiresAt) < new Date()) {
        await env.OKM_ACCOUNTS.delete(`pending:${token}`);
        return redirect('/signup/?error=expired_token');
    }

    return redirect(`/signup/set-password/?token=${token}`);
}

function redirect(location) {
    return new Response(null, {
        status: 302,
        headers: { Location: location },
    });
}
