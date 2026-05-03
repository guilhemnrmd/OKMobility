/**
 * Client Portal — Sales page + Authentication + Dashboard
 *
 * CUSTOMIZATION:
 *   - Edit PORTAL_CONFIG below to change all visible content on the sales page.
 *   - Override window.BRAND (in brand-config.js) for logo, name, and theme color.
 *   - The client auth API endpoint is at /api/client-auth (see /functions/api/client-auth.js).
 */

'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   PORTAL CONFIGURATION
   Edit this object to customize the sales page content.
   All text, icons, and structure are driven from here.
══════════════════════════════════════════════════════════════════════════ */
const PORTAL_CONFIG = {

    hero: {
        badge:    '',                      // e.g. 'Nouveau' — leave empty to hide
        title:    'Votre espace,\n<span class="gradient-text">simplifié.</span>',
        subtitle: 'Accédez à vos dossiers, suivez leur avancement et gérez votre compte en toute autonomie.',
        ctaLabel: 'En savoir plus',
        ctaTarget: '#features',            // scroll target on click
    },

    features: {
        title:    'Tout ce dont vous avez besoin',
        subtitle: 'Une interface claire pour gérer vos demandes et votre compte.',
        items: [
            {
                icon:  'bx-user-circle',
                title: 'Mon compte',
                desc:  'Consultez et mettez à jour vos informations personnelles à tout moment.',
            },
            {
                icon:  'bx-file',
                title: 'Mes dossiers',
                desc:  'Suivez l'avancement de chaque dossier en temps réel, de la création à la validation.',
            },
            {
                icon:  'bx-bell',
                title: 'Notifications',
                desc:  'Soyez informé dès qu'une action est requise ou qu'un statut change.',
            },
            {
                icon:  'bx-support',
                title: 'Assistance',
                desc:  'Contactez notre équipe directement depuis votre espace si vous avez une question.',
            },
        ],
    },

    steps: {
        title: 'Comment ça marche',
        items: [
            {
                title: 'Créez votre compte',
                desc:  'Un conseiller vous transmet vos identifiants de connexion lors de votre prise en charge.',
            },
            {
                title: 'Accédez à vos dossiers',
                desc:  'Retrouvez toutes vos demandes d'autorisation et suivez leur statut en un coup d'œil.',
            },
            {
                title: 'Restez informé',
                desc:  'Recevez des mises à jour à chaque étape et téléchargez vos documents validés.',
            },
        ],
    },

    ctaBand: {
        title:     'Prêt à commencer ?',
        subtitle:  'Connectez-vous à votre espace ou contactez un conseiller.',
        btnLabel:  'Se connecter',
    },

    login: {
        modalTitle:    'Mon espace client',
        modalSubtitle: 'Connectez-vous pour accéder à vos services.',
    },

    dashboard: {
        daLabel:    'Dossiers',         // label used in the dashboard DA section
        dasSectionTitle: 'Mes dossiers (DA)',
    },
};


/* ══════════════════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);
const $q = (sel, ctx = document) => ctx.querySelector(sel);

function formatDate(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('fr-FR', {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
    });
}

function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
}

function setHtml(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
}

const DA_STATUS_LABELS = {
    pending:  'En cours',
    approved: 'Validé',
    refused:  'Refusé',
    draft:    'Brouillon',
};

const DA_TYPE_ICONS = {
    default:    'bx-file',
    vehicle:    'bx-car',
    document:   'bx-id-card',
    contract:   'bx-receipt',
};


/* ══════════════════════════════════════════════════════════════════════════
   SALES PAGE INIT
══════════════════════════════════════════════════════════════════════════ */
function initSalesPage() {
    const C = PORTAL_CONFIG;
    const B = window.BRAND || {};

    /* Hero */
    const badge = $(('heroBadge'));
    if (C.hero.badge) {
        badge.textContent = C.hero.badge;
        badge.hidden = false;
    }
    setHtml('heroTitle', C.hero.title);
    setText('heroSubtitle', C.hero.subtitle);

    const heroCta = $('heroCta');
    heroCta.textContent = C.hero.ctaLabel;
    heroCta.addEventListener('click', () => {
        const target = document.querySelector(C.hero.ctaTarget);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });

    /* Features */
    setText('featuresTitle',    C.features.title);
    setText('featuresSubtitle', C.features.subtitle);

    const grid = $('featuresGrid');
    C.features.items.forEach(f => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.setAttribute('role', 'listitem');
        card.innerHTML = `
            <div class="feature-icon" aria-hidden="true">
                <i class="bx ${f.icon}"></i>
            </div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
        `;
        grid.appendChild(card);
    });

    /* Steps */
    setText('stepsTitle', C.steps.title);
    const stepsGrid = $('stepsGrid');
    C.steps.items.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'step-card';
        card.setAttribute('role', 'listitem');
        card.innerHTML = `
            <div class="step-number" aria-hidden="true">${i + 1}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
        `;
        stepsGrid.appendChild(card);
    });

    /* CTA Band */
    setText('ctaBandTitle',    C.ctaBand.title);
    setText('ctaBandSubtitle', C.ctaBand.subtitle);
    setText('ctaBandBtnLabel', C.ctaBand.btnLabel);
    $('ctaBandBtn').addEventListener('click', openLogin);

    /* Login modal headings */
    setText('loginModalTitle',    C.login.modalTitle);
    setText('loginModalSubtitle', C.login.modalSubtitle);

    /* Dashboard DA section label */
    setText('dasSectionTitle', C.dashboard.dasSectionTitle || 'Mes dossiers');

    /* Footer copyright */
    if (B.copyright) setText('footerLegal', B.copyright);

    /* Hero login CTA */
    $('heroLoginCta').addEventListener('click', openLogin);
    $('navLoginBtn').addEventListener('click', openLogin);
}


/* ══════════════════════════════════════════════════════════════════════════
   LOGIN MODAL
══════════════════════════════════════════════════════════════════════════ */
function openLogin() {
    const overlay = $('loginOverlay');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('visible');
    setTimeout(() => $('loginEmail')?.focus(), 80);
    document.addEventListener('keydown', handleEscKey);
}

function closeLogin() {
    const overlay = $('loginOverlay');
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', handleEscKey);
    clearLoginError();
}

function handleEscKey(e) {
    if (e.key === 'Escape') closeLogin();
}

function clearLoginError() {
    const err = $('loginError');
    err.hidden = true;
    err.textContent = '';
}

function showLoginError(msg) {
    const err = $('loginError');
    err.textContent = msg;
    err.hidden = false;
}

function setLoginLoading(loading) {
    const btn     = $('loginSubmit');
    const label   = btn.querySelector('.btn-label');
    const spinner = btn.querySelector('.btn-spinner');
    btn.disabled  = loading;
    label.style.opacity  = loading ? '0' : '1';
    spinner.hidden       = !loading;
}

function initLoginModal() {
    $('loginCloseBtn').addEventListener('click', closeLogin);

    /* Close on backdrop click */
    $('loginOverlay').addEventListener('click', (e) => {
        if (e.target === $('loginOverlay')) closeLogin();
    });

    /* Password toggle */
    $('togglePwBtn').addEventListener('click', () => {
        const input = $('loginPassword');
        const icon  = $('togglePwIcon');
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        icon.className = `bx bx-${isText ? 'show' : 'hide'}`;
        $('togglePwBtn').setAttribute('aria-label', isText ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
    });

    /* Form submit */
    $('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearLoginError();

        const email    = $('loginEmail').value.trim();
        const password = $('loginPassword').value;

        if (!email || !password) {
            showLoginError('Veuillez renseigner votre e-mail et votre mot de passe.');
            return;
        }

        setLoginLoading(true);

        try {
            const result = await AuthAPI.login(email, password);
            closeLogin();
            showDashboard(result);
        } catch (err) {
            showLoginError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
        } finally {
            setLoginLoading(false);
        }
    });

    /* Forgot password placeholder */
    $('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        /* TODO: implement password reset flow */
        alert('Contactez votre conseiller pour réinitialiser votre mot de passe.');
    });
}


/* ══════════════════════════════════════════════════════════════════════════
   AUTH API
   Replace the mock implementation below with real API calls once the
   /api/client-auth endpoint is ready.
══════════════════════════════════════════════════════════════════════════ */
const AuthAPI = {

    /**
     * Login — POST /api/client-auth
     * Returns { token, client } on success, throws on failure.
     */
    async login(email, password) {
        const res = await fetch('/api/client-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || 'Connexion échouée.');
        }

        /* Store token in sessionStorage (never localStorage) */
        if (data.token) sessionStorage.setItem('client_token', data.token);

        return data;
    },

    logout() {
        sessionStorage.removeItem('client_token');
    },

    getToken() {
        return sessionStorage.getItem('client_token');
    },

    /**
     * Fetch DA list — GET /api/client-das
     */
    async fetchDAs() {
        const token = this.getToken();
        const res = await fetch('/api/client-das', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Impossible de charger les dossiers.');
        return res.json();
    },
};


/* ══════════════════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
function showDashboard(authData) {
    $('salesPage').hidden      = true;
    $('dashboardPage').hidden  = false;
    document.body.scrollTop    = 0;
    document.documentElement.scrollTop = 0;

    const client = authData.client || {};

    /* Greeting */
    const firstName = client.firstName || client.name?.split(' ')[0] || '';
    setText('userGreeting', firstName ? `Bonjour, ${firstName}` : '');
    setText('dashWelcomeTitle', firstName ? `Bonjour, ${firstName} 👋` : 'Bienvenue');
    setText('dashWelcomeSubtitle', 'Voici un résumé de votre espace client.');

    const lastLogin = authData.lastLoginAt
        ? `Dernière connexion : ${formatDate(authData.lastLoginAt)}`
        : '';
    setText('dashLastLogin', lastLogin);

    /* Account card */
    renderAccountCard(client);

    /* Stats */
    renderStats(authData);

    /* DAs */
    const das = authData.das || [];
    renderDAList(das, 'all');

    /* DA filter tabs */
    $('daTabs').querySelectorAll('.da-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $('daTabs').querySelectorAll('.da-tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            renderDAList(das, tab.dataset.filter);
        });
    });
}

function renderAccountCard(client) {
    const fields = [
        { label: 'Nom complet',       value: client.name      || '—' },
        { label: 'E-mail',            value: client.email     || '—' },
        { label: 'Téléphone',         value: client.phone     || '—' },
        { label: 'Référence client',  value: client.ref       || '—' },
        { label: 'Agence',            value: client.agency    || '—' },
    ];

    $('accountCard').innerHTML = fields.map(f => `
        <div class="account-field">
            <span class="account-field-label">${f.label}</span>
            <span class="account-field-value">${f.value}</span>
        </div>
    `).join('');
}

function renderStats(authData) {
    const das = authData.das || [];

    const stats = [
        {
            icon:  'bx-file',
            label: 'Dossiers au total',
            value: das.length,
        },
        {
            icon:  'bx-time-five',
            label: 'En cours',
            value: das.filter(d => d.status === 'pending').length,
        },
        {
            icon:  'bx-check-circle',
            label: 'Validés',
            value: das.filter(d => d.status === 'approved').length,
        },
    ];

    $('dashStats').innerHTML = stats.map(s => `
        <div class="stat-card" role="listitem">
            <span class="stat-label">
                <i class="bx ${s.icon} stat-icon" aria-hidden="true"></i>
                ${s.label}
            </span>
            <span class="stat-value">${s.value}</span>
        </div>
    `).join('');
}

function renderDAList(das, filter) {
    const list   = $('daList');
    const empty  = $('daEmpty');

    const filtered = filter === 'all'
        ? das
        : das.filter(d => d.status === filter);

    if (filtered.length === 0) {
        list.innerHTML = '';
        empty.hidden   = false;
        return;
    }

    empty.hidden = true;
    list.innerHTML = filtered.map(da => {
        const statusLabel = DA_STATUS_LABELS[da.status] || da.status;
        const icon        = DA_TYPE_ICONS[da.type] || DA_TYPE_ICONS.default;

        return `
        <div class="da-item" role="listitem" data-id="${da.id}">
            <div class="da-item-icon" aria-hidden="true">
                <i class="bx ${icon}"></i>
            </div>
            <div class="da-item-body">
                <div class="da-item-ref">${da.ref || da.id}</div>
                <div class="da-item-title">${da.title || da.type || 'Dossier'}</div>
                <div class="da-item-date">${formatDate(da.createdAt)}</div>
            </div>
            <div class="da-item-actions">
                <span class="status-badge ${da.status}">${statusLabel}</span>
                <button class="btn-ghost btn-sm da-detail-btn" data-id="${da.id}" aria-label="Voir le dossier ${da.ref || da.id}">
                    <i class="bx bx-chevron-right" aria-hidden="true"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');

    /* DA detail buttons (placeholder) */
    list.querySelectorAll('.da-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const da = das.find(d => d.id === btn.dataset.id);
            if (da) openDADetail(da);
        });
    });
}

function openDADetail(da) {
    /* TODO: implement DA detail modal/panel */
    alert(`Dossier ${da.ref || da.id}\nStatut : ${DA_STATUS_LABELS[da.status] || da.status}\n\nLe détail du dossier sera disponible prochainement.`);
}

function initDashboard() {
    $('logoutBtn').addEventListener('click', () => {
        AuthAPI.logout();
        $('dashboardPage').hidden = true;
        $('salesPage').hidden     = false;
        $('loginForm').reset();
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    $('editAccountBtn').addEventListener('click', () => {
        /* TODO: implement account edit modal */
        alert('La modification du compte sera disponible prochainement.');
    });
}


/* ══════════════════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initSalesPage();
    initLoginModal();
    initDashboard();

    /* Restore session if a token exists (page reload) */
    if (AuthAPI.getToken()) {
        /* TODO: validate token against /api/client-me and restore session */
        /* For now, just clear the stale token */
        AuthAPI.logout();
    }
});
