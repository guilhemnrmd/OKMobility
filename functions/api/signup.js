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

    const { name, email, company, address, uiLanguage } = body;

    if (!name?.trim() || !email?.trim() || !company?.trim()) {
        return jsonError('Tous les champs sont requis', 400);
    }

    const emailLower = email.toLowerCase().trim();
    if (!isValidEmail(emailLower)) {
        return jsonError('Adresse email invalide', 400);
    }

    const supportedLangs = ['fr', 'en', 'es', 'it', 'pt', 'de', 'nl'];
    const resolvedLang = supportedLangs.includes(uiLanguage) ? uiLanguage : 'fr';

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
        address: (address || '').trim(),
        uiLanguage: resolvedLang,
        token,
        createdAt: now.toISOString(),
        expiresAt,
    };

    await env.OKM_ACCOUNTS.put(`pending:${token}`, JSON.stringify(pending), {
        expirationTtl: 24 * 60 * 60,
    });

    const verifyUrl = `${expectedOrigin}/api/verify-email?token=${token}`;
    const emailSent = await sendVerificationEmail(env, emailLower, name.trim(), verifyUrl, resolvedLang);

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

// Localized email content for verification emails
const EMAIL_CONTENT = {
    fr: {
        subject: 'Vérifiez votre adresse email — OKMobility Platform',
        h1: 'Vérifiez votre adresse email',
        greeting: name => `Bonjour ${name},`,
        body: 'Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour finaliser la création de votre compte et choisir votre mot de passe.',
        cta: 'Créer mon mot de passe →',
        footer: 'Ce lien est valable 24 heures. Si vous n\'avez pas demandé de compte, ignorez cet email.',
    },
    en: {
        subject: 'Verify your email address — OKMobility Platform',
        h1: 'Verify your email address',
        greeting: name => `Hello ${name},`,
        body: 'Thank you for signing up. Click the button below to complete account creation and set your password.',
        cta: 'Set my password →',
        footer: 'This link is valid for 24 hours. If you didn\'t request an account, please ignore this email.',
    },
    es: {
        subject: 'Verifica tu dirección de correo — OKMobility Platform',
        h1: 'Verifica tu dirección de correo',
        greeting: name => `Hola ${name},`,
        body: 'Gracias por registrarte. Haz clic en el botón de abajo para finalizar la creación de tu cuenta y elegir tu contraseña.',
        cta: 'Crear mi contraseña →',
        footer: 'Este enlace es válido durante 24 horas. Si no solicitaste una cuenta, ignora este correo.',
    },
    it: {
        subject: 'Verifica il tuo indirizzo email — OKMobility Platform',
        h1: 'Verifica il tuo indirizzo email',
        greeting: name => `Ciao ${name},`,
        body: 'Grazie per esserti registrato. Clicca il pulsante qui sotto per completare la creazione del tuo account e scegliere la tua password.',
        cta: 'Crea la mia password →',
        footer: 'Questo link è valido per 24 ore. Se non hai richiesto un account, ignora questa email.',
    },
    pt: {
        subject: 'Verifique o seu endereço de email — OKMobility Platform',
        h1: 'Verifique o seu endereço de email',
        greeting: name => `Olá ${name},`,
        body: 'Obrigado por se registar. Clique no botão abaixo para finalizar a criação da sua conta e escolher a sua password.',
        cta: 'Criar a minha password →',
        footer: 'Este link é válido por 24 horas. Se não solicitou uma conta, ignore este email.',
    },
    de: {
        subject: 'E-Mail-Adresse verifizieren — OKMobility Platform',
        h1: 'E-Mail-Adresse verifizieren',
        greeting: name => `Hallo ${name},`,
        body: 'Vielen Dank für Ihre Registrierung. Klicken Sie auf die Schaltfläche unten, um die Kontoerstellung abzuschließen und Ihr Passwort festzulegen.',
        cta: 'Mein Passwort erstellen →',
        footer: 'Dieser Link ist 24 Stunden gültig. Wenn Sie kein Konto angefordert haben, ignorieren Sie diese E-Mail.',
    },
    nl: {
        subject: 'Verifieer uw e-mailadres — OKMobility Platform',
        h1: 'Verifieer uw e-mailadres',
        greeting: name => `Hallo ${name},`,
        body: 'Bedankt voor uw registratie. Klik op de knop hieronder om de accountaanmaak te voltooien en uw wachtwoord in te stellen.',
        cta: 'Mijn wachtwoord instellen →',
        footer: 'Deze link is 24 uur geldig. Als u geen account heeft aangevraagd, kunt u deze e-mail negeren.',
    },
};

async function sendVerificationEmail(env, email, name, verifyUrl, lang = 'fr') {
    const apiKey = env.RESEND_API_KEY;
    const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@okmobility.com';
    const t = EMAIL_CONTENT[lang] || EMAIL_CONTENT['fr'];

    if (!apiKey) {
        console.log(`[DEV] Verification link for ${email}: ${verifyUrl}`);
        return { sent: false };
    }

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f9ff;font-family:Inter,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;padding:40px 32px;box-shadow:0 4px 24px rgba(32,84,234,0.08);">
    <div style="margin-bottom:24px;">
      <span style="font-size:1.5rem;font-weight:700;color:#2054EA;">OKMobility Platform</span>
    </div>
    <h1 style="font-size:1.5rem;color:#17181D;margin:0 0 8px;">${t.h1}</h1>
    <p style="color:#5B6070;margin:0 0 24px;">${t.greeting(name)}<br><br>${t.body}</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#2054EA;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:1rem;font-weight:600;margin-bottom:24px;">${t.cta}</a>
    <p style="color:#5B6070;font-size:0.875rem;margin:0;">${t.footer}</p>
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
                subject: t.subject,
                html,
            }),
        });
        if (!res.ok) {
            let errBody = '';
            try { errBody = await res.text(); } catch (_) {}
            console.error(`[RESEND] HTTP ${res.status} — from: ${fromEmail} — to: ${email}`, errBody);
            return { sent: false, status: res.status, error: errBody };
        }
        return { sent: true };
    } catch (err) {
        console.error('[RESEND] Network error:', err?.message || err);
        return { sent: false, error: err?.message };
    }
}
