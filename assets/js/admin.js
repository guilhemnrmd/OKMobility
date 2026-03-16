/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * OKM Admin — Licence management JS
 * Accessible at /admin/?token=<ADMIN_TOKEN>
 *
 * ADMIN_TOKEN must be set as a Cloudflare Pages env secret.
 * Share only the full URL (with token) to access this page.
 */

(() => {
    'use strict';

    // ── Token ─────────────────────────────────────────────────────────────────
    const params = new URLSearchParams(window.location.search);
    const TOKEN = params.get('token') || '';

    if (!TOKEN) {
        document.body.innerHTML = `
            <div class="ambient-background"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>
            <main class="glass-container" style="max-width:400px;display:flex;align-items:center;justify-content:center;min-height:100dvh;">
                <div class="glass-panel" style="padding:32px;text-align:center;">
                    <i class='bx bx-lock' style="font-size:2rem;color:#ff6b6b;"></i>
                    <h2 class="gradient-text" style="margin:12px 0 8px;">Accès restreint</h2>
                    <p style="font-size:0.9rem;color:var(--color-text-secondary);">Ce panneau est réservé à l'administrateur.</p>
                </div>
            </main>`;
        return;
    }

    // ── DOM ───────────────────────────────────────────────────────────────────
    const agencyList   = document.getElementById('agencyList');
    const loadingState = document.getElementById('loadingState');
    const adminError   = document.getElementById('adminError');
    const btnRefresh   = document.getElementById('btnRefresh');
    const btnAdd       = document.getElementById('btnAddAgency');

    // Add/edit modal
    const addOverlay   = document.getElementById('addModalOverlay');
    const addModal     = document.getElementById('addModal');
    const addTitle     = document.getElementById('addModalTitle');
    const addSave      = document.getElementById('addModalSave');
    const addCancel    = document.getElementById('addModalCancel');
    const addError     = document.getElementById('addModalError');
    const inId         = document.getElementById('newAgencyId');
    const inName       = document.getElementById('newAgencyName');
    const inExpiry     = document.getElementById('newAgencyExpiry');
    const inPin        = document.getElementById('newAgencyPin');

    let editingId = null; // null = new agency

    // ── API calls ─────────────────────────────────────────────────────────────
    async function apiGet() {
        const r = await fetch(`/api/admin-agencies?token=${encodeURIComponent(TOKEN)}`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }

    async function apiPost(body) {
        const r = await fetch(`/api/admin-agencies?token=${encodeURIComponent(TOKEN)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.error || 'HTTP ' + r.status);
        }
        return r.json();
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function isExpired(dateStr) {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    }

    function renderAgency(a) {
        const expired = isExpired(a.licenseExpiresAt);
        const card = document.createElement('div');
        card.className = 'agency-card glass-panel';
        card.dataset.id = a.id;

        card.innerHTML = `
            <div class="agency-card-header">
                <div>
                    <div class="agency-name">${escHtml(a.agencyName || a.id)}</div>
                    <div class="agency-id">${escHtml(a.id)}</div>
                </div>
                <span class="badge ${expired ? 'badge-expired' : 'badge-ok'}">
                    <i class='bx ${expired ? 'bx-x-circle' : 'bx-check-circle'}'></i>
                    ${expired ? 'Expirée' : 'Active'}
                </span>
            </div>
            <div class="agency-meta">
                <span><i class='bx bx-calendar'></i> Expiration&nbsp;: <strong>${formatDate(a.licenseExpiresAt)}</strong></span>
                <span><i class='bx bx-git-repo-forked'></i> v${a.licenseVersion || 1}</span>
                <span><i class='bx bx-${a.firstActivation ? 'radio-circle' : 'check-circle'}'></i> ${a.firstActivation ? 'CGU en attente' : 'CGU acceptées'}</span>
            </div>
            <div class="agency-actions">
                <button class="btn-sm btn-edit">
                    <i class='bx bx-edit-alt'></i> Modifier
                </button>
                <button class="btn-sm btn-renew">
                    <i class='bx bx-calendar-plus'></i> Renouveler +1 an
                </button>
                <button class="btn-sm danger btn-revoke">
                    <i class='bx bx-block'></i> Révoquer
                </button>
            </div>
            <div class="edit-form" id="ef_${escHtml(a.id)}">
                <!-- inline edit, opened by JS -->
            </div>
        `;

        // Edit
        card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(a));

        // Renew +1 year
        card.querySelector('.btn-renew').addEventListener('click', async () => {
            if (!confirm(`Renouveler la licence "${a.agencyName}" pour 1 an supplémentaire ?`)) return;
            const current = a.licenseExpiresAt ? new Date(a.licenseExpiresAt) : new Date();
            const renewed = new Date(Math.max(current, new Date()));
            renewed.setFullYear(renewed.getFullYear() + 1);
            try {
                await apiPost({
                    action: 'upsert',
                    agencyId: a.id,
                    agencyName: a.agencyName,
                    licenseExpiresAt: renewed.toISOString()
                });
                showMsg(`✅ Licence renouvelée jusqu'au ${formatDate(renewed.toISOString())}`);
                await loadAgencies();
            } catch (e) {
                showMsg('❌ Erreur : ' + e.message, true);
            }
        });

        // Revoke
        card.querySelector('.btn-revoke').addEventListener('click', async () => {
            if (!confirm(`⚠️ Révoquer la licence "${a.agencyName}" ? Le terminal sera immédiatement bloqué (dans les 30 jours de cache).`)) return;
            try {
                await apiPost({ action: 'revoke', agencyId: a.id });
                showMsg(`🔒 Licence révoquée.`);
                await loadAgencies();
            } catch (e) {
                showMsg('❌ Erreur : ' + e.message, true);
            }
        });

        return card;
    }

    function escHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // ── Load ──────────────────────────────────────────────────────────────────
    async function loadAgencies() {
        loadingState.style.display = 'flex';
        agencyList.style.display = 'none';
        adminError.style.display = 'none';

        try {
            const data = await apiGet();
            agencyList.innerHTML = '';
            if (!data.agencies || data.agencies.length === 0) {
                agencyList.innerHTML = '<p style="color:var(--color-text-secondary);text-align:center;padding:20px;">Aucune agence configurée.</p>';
            } else {
                data.agencies.forEach(a => agencyList.appendChild(renderAgency(a)));
            }
            loadingState.style.display = 'none';
            agencyList.style.display = 'flex';
        } catch (e) {
            loadingState.style.display = 'none';
            adminError.textContent = 'Erreur de chargement : ' + e.message + '. Vérifiez votre token.';
            adminError.style.display = 'block';
        }
    }

    function showMsg(text, isErr = false) {
        adminError.textContent = text;
        adminError.style.background = isErr ? 'rgba(255,59,48,0.1)' : 'rgba(34,197,94,0.1)';
        adminError.style.borderColor = isErr ? 'rgba(255,59,48,0.2)' : 'rgba(34,197,94,0.2)';
        adminError.style.color = isErr ? '#ff6b6b' : '#22c55e';
        adminError.style.display = 'block';
        setTimeout(() => { adminError.style.display = 'none'; }, 4000);
    }

    // ── Add/Edit modal helpers ─────────────────────────────────────────────────
    function openAddModal() {
        editingId = null;
        inId.value = '';
        inName.value = '';
        inPin.value = '';
        const next = new Date();
        next.setMonth(next.getMonth() + 1);
        inExpiry.value = next.toISOString().slice(0, 10);
        inId.disabled = false;
        addTitle.textContent = 'Nouvelle agence';
        addError.textContent = '';
        addOverlay.style.display = 'block';
        addModal.style.display = 'flex';
        inName.focus();
    }

    function openEditModal(a) {
        editingId = a.id;
        inId.value = a.id;
        inName.value = a.agencyName || '';
        inPin.value = '';
        inExpiry.value = a.licenseExpiresAt ? a.licenseExpiresAt.slice(0, 10) : '';
        inId.disabled = true;
        addTitle.textContent = 'Modifier l\'agence';
        addError.textContent = '';
        addOverlay.style.display = 'block';
        addModal.style.display = 'flex';
        inName.focus();
    }

    function closeModal() {
        addOverlay.style.display = 'none';
        addModal.style.display = 'none';
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    addSave.addEventListener('click', async () => {
        addError.textContent = '';
        const id = editingId || inId.value.trim().toLowerCase();
        const name = inName.value.trim();
        const expiry = inExpiry.value;
        const pin = inPin.value.trim();

        if (!id || !/^[a-z0-9_]{1,64}$/.test(id)) {
            addError.textContent = 'ID invalide (lettres minuscules, chiffres, underscores, max 64 chars)';
            return;
        }
        if (!name) { addError.textContent = 'Nom requis.'; return; }
        if (!expiry) { addError.textContent = 'Date d\'expiration requise.'; return; }

        addSave.disabled = true;
        addSave.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i><span>Enregistrement…</span>`;

        const body = {
            action: 'upsert',
            agencyId: id,
            agencyName: name,
            licenseExpiresAt: new Date(expiry + 'T23:59:59Z').toISOString()
        };
        if (pin) body.pin = pin;

        try {
            await apiPost(body);
            closeModal();
            await loadAgencies();
            showMsg(`✅ Agence "${name}" enregistrée.`);
        } catch (e) {
            addError.textContent = 'Erreur : ' + e.message;
        } finally {
            addSave.disabled = false;
            addSave.innerHTML = `<i class='bx bx-save'></i><span>Enregistrer</span>`;
        }
    });

    addCancel.addEventListener('click', closeModal);
    addOverlay.addEventListener('click', closeModal);
    btnAdd.addEventListener('click', openAddModal);
    btnRefresh.addEventListener('click', loadAgencies);

    // ── Boot ───────────────────────────────────────────────────────────────────
    loadAgencies();
})();
