export async function onRequestPost(context) {
    const { request, env } = context;

    const cookie = request.headers.get('Cookie') || '';
    const sessionId = getCookieValue(cookie, 'okm_session');

    if (sessionId) {
        await env.OKM_ACCOUNTS.delete(`session:${sessionId}`);
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'okm_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
        },
    });
}

function getCookieValue(cookieString, name) {
    const match = cookieString.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
}
