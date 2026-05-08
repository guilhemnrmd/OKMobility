export async function onRequestPost(context) {
    const { request, env } = context;

    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    const expectedOrigin = `${url.protocol}//${url.host}`;
    if (origin && origin !== expectedOrigin) {
        return jsonError('Forbidden', 403);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return jsonError('Corps de requête invalide', 400);
    }

    const { name, email, company } = body;

    if (!name?.trim() || !email?.trim() || !company?.trim()) {
        return jsonError('Tous les champs sont requis', 400);
    }

    const emailLower = email.toLowerCase().trim();
    if (!isValidEmail(emailLower)) {
        return jsonError('Adresse email invalide', 400);
    }

    if (!env.OKM_ACCOUNTS) {
        return jsonError('Erreur de configuration serveur (OKM_ACCOUNTS manquant)', 500);
    }

    const existing = await env.OKM_ACCOUNTS.get(`account:${emailLower}`);
    if (existing) {
        return jsonError('Un compte existe déjà avec cette adresse email', 409);
    }

    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const pending = {
        email: emailLower,
        name: name.trim(),
        company: company.trim(),
        token,
        createdAt: now.toISOString(),
        expiresAt,
    };

    await env.OKM_ACCOUNTS.put(`pending:${token}`, JSON.stringify(pending), {
        expirationTtl: 24 * 60 * 60,
    });

    const verifyUrl = `${expectedOrigin}/api/verify-email?token=${token}`;
    const emailSent = await sendVerificationEmail(env, emailLower, name.trim(), verifyUrl);

    const response = { success: true };
    if (!emailSent.sent) {
        response._devVerifyUrl = verifyUrl;
    }

    return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function jsonError(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

async function sendVerificationEmail(env, email, name, verifyUrl) {
    const apiKey = env.RESEND_API_KEY;
    const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@okmobility.com';

    if (!apiKey) {
        console.log(`[DEV] Verification link for ${email}: ${verifyUrl}`);
        return { sent: false };
    }

    const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f9ff;font-family:Inter,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;padding:40px 32px;box-shadow:0 4px 24px rgba(32,84,234,0.08);">
    <div style="margin-bottom:24px;">
      <span style="font-size:1.5rem;font-weight:700;color:#2054EA;">OKMobility Platform</span>
    </div>
    <h1 style="font-size:1.5rem;color:#17181D;margin:0 0 8px;">Vérifiez votre adresse email</h1>
    <p style="color:#5B6070;margin:0 0 24px;">Bonjour ${name},<br><br>Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour finaliser la création de votre compte et choisir votre mot de passe.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#2054EA;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:600;margin-bottom:24px;">Créer mon mot de passe →</a>
    <p style="color:#5B6070;font-size:0.875rem;margin:0;">Ce lien est valable 24 heures. Si vous n'avez pas demandé de compte, ignorez cet email.</p>
  </div>
</body>
</html>`;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: 'Vérifiez votre adresse email — OKMobility Platform',
                html,
            }),
        });
        return { sent: res.ok };
    } catch {
        return { sent: false };
    }
}
