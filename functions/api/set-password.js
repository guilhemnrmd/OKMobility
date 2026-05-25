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

    const supportedLangs = ['fr', 'en', 'es', 'it', 'pt', 'de', 'nl'];
    const uiLanguage = supportedLangs.includes(pending.uiLanguage) ? pending.uiLanguage : 'fr';
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
        address: pending.address || '',
        phone: '',
        uiLanguage,
        passwordHash: hash,
        salt,
        emailVerified: true,
        createdAt: now,
        trialEndsAt,
        plan: 'trial',
        agencies: [{ id: agencyId, name: pending.company, address: pending.address || '', createdAt: now }],
        formSettings: {
            language: uiLanguage,
            theme: 'dark',
            fields: [
                {
                    id: "address_block", label: "Adresse",
                    labels: { fr: "Adresse de résidence", en: "Home Address", es: "Dirección de residencia", it: "Indirizzo di residenza", pt: "Morada", de: "Wohnanschrift", nl: "Woonadres" },
                    type: "address_block", icon: "bx-map", required: true, system: false,
                    requireCountry: true
                },
                {
                    id: "temp_address_group", label: "Adresse temporaire",
                    labels: { fr: "J'ai une adresse temporaire locale", en: "I have a local temporary address", es: "Tengo una dirección temporal local", it: "Ho un indirizzo temporaneo locale", pt: "Tenho um endereço temporário local", de: "Ich habe eine lokale temporäre Adresse", nl: "Ik heb een tijdelijk lokaal adres" },
                    notes: { fr: "Renseignez cette adresse si vous séjournez temporairement à un autre endroit (ex: Hôtel, Airbnb) pendant la durée de votre location.", en: "Fill in this address if you are temporarily staying at another location (e.g., Hotel, Airbnb) during your rental period.", es: "Rellene esta dirección si se aloja temporalmente en otro lugar (ej. Hotel, Airbnb) durante su alquiler." },
                    type: "toggle_group", icon: "bx-list-plus", system: false,
                    children: [
                        {
                            id: "temp_address_block", label: "Adresse temporaire",
                            labels: { fr: "Adresse temporaire", en: "Temporary Address", es: "Dirección temporal", it: "Indirizzo temporaneo", pt: "Endereço temporário", de: "Temporäre Adresse", nl: "Tijdelijk adres" },
                            type: "address_block", icon: "bx-map-pin", required: true, system: false,
                            requireCountry: false
                        }
                    ]
                },
                {
                    id: "phone", label: "Téléphone",
                    labels: { fr: "Téléphone Mobile", en: "Mobile Telephone Number", es: "Teléfono Móvil", it: "Telefono Cellulare", pt: "Telemóvel", de: "Handynummer", nl: "Mobiel telefoonnummer" },
                    type: "tel", icon: "bx-phone", required: true, system: false
                },
                {
                    id: "phone2_group", label: "2e téléphone",
                    labels: { fr: "Ajouter un 2e téléphone", en: "Add a 2nd phone number", es: "Añadir 2º teléfono", it: "Aggiungi 2° telefono", pt: "Adicionar 2º telefone", de: "2. Telefonnummer hinzufügen", nl: "2e telefoonnummer toevoegen" },
                    type: "toggle_group", icon: "bx-list-plus", system: false,
                    children: [
                        {
                            id: "phone2", label: "2e téléphone (optionnel)",
                            labels: { fr: "2e téléphone (optionnel)", en: "2nd phone (optional)", es: "2º teléfono (opcional)", it: "2° telefono (opzionale)", pt: "2º telefone (opcional)", de: "2. Telefon (optional)", nl: "2e telefoonnummer (optioneel)" },
                            type: "tel", icon: "bx-phone", required: true, system: false
                        }
                    ]
                },
                {
                    id: "email", label: "E-mail",
                    labels: { fr: "E-mail", en: "E-mail", es: "E-mail", it: "E-mail", pt: "E-mail", de: "E-Mail", nl: "E-mail" },
                    type: "email", icon: "bx-envelope", required: true, system: false
                }
            ]
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
