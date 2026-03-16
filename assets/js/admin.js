/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 */

/**
 * OKM Admin — Licence management JS
 * Accessible at /admin/
 *
 * ADMIN_TOKEN is provided by the administrator and stored only in sessionStorage.
 * A one-time bootstrap via /admin/?token=<ADMIN_TOKEN> is still supported and
 * immediately stripped from the URL.
 */

(() => {
    'use strict';

    const SESSION_TOKEN_KEY = 'okm_admin_token';

    function bootstrapTokenFromUrl() {
        try {
            const url = new URL(window.location.href);
            const tokenFromUrl = url.searchParams.get('token');

            if (tokenFromUrl) {
                sessionStorage.setItem(SESSION_TOKEN_KEY, tokenFromUrl);
                url.searchParams.delete('token');
                window.history.replaceState({}, '', url.toString());
                return tokenFromUrl;
            }

            return sessionStorage.getItem(SESSION_TOKEN_KEY) || '';
        } catch {
            return '';
        }
    }

    let token = bootstrapTokenFromUrl();

    // ── DOM ───────────────────────────────────────────────────────────────────
    const agencyList   = document.getElementById('agencyList');
    const loadingState = document.getElementById('loadingState');
    const adminError   = document.getElementById('adminError');
    const authGate     = document.getElementById('authGate');
    const authGateError = document.getElementById('authGateError');
    const adminTokenInput = document.getElementById('adminTokenInput');
    const adminTokenSubmit = document.getElementById('adminTokenSubmit');
    const btnRefresh   = document.getElementById('btnRefresh');
    const btnAdd       = document.getElementById('btnAddAgency');
    const btnLogout    = document.getElementById('btnLogout');

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

    let editingId = null; // null = new agency

    function setAuthenticatedUi(isAuthenticated) {
        if (authGate) authGate.style.display = isAuthenticated ? 'none' : 'flex';
        if (loadingState) loadingState.style.display = isAuthenticated ? 'flex' : 'none';
        if (agencyList) agencyList.style.display = 'none';
        if (btnAdd) btnAdd.style.display = isAuthenticated ? 'inline-flex' : 'none';
        if (btnRefresh) btnRefresh.style.display = isAuthenticated ? 'inline-flex' : 'none';
        if (btnLogout) btnLogout.style.display = isAuthenticated ? 'inline-flex' : 'none';
    }

    function clearToken() {
        token = '';
        try { sessionStorage.removeItem(SESSION_TOKEN_KEY); } catch { /* ignore */ }
    }

    function persistToken(value) {
        token = value;
        try { sessionStorage.setItem(SESSION_TOKEN_KEY, value); } catch { /* ignore */ }
    }

    function setAuthGateError(message) {
        if (!authGateError) return;
        authGateError.textContent = message;
        authGateError.style.display = message ? 'block' : 'none';
    }

    function buildAuthHeaders(extraHeaders = {}) {
        return {
            ...extraHeaders,
            'Authorization': `Bearer ${token}`
        };
    }

    // ── API calls ─────────────────────────────────────────────────────────────
    async function apiGet() {
        const r = await fetch('/api/admin-agencies', {
            headers: buildAuthHeaders()
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }

    async function apiPost(body) {
        const r = await fetch('/api/admin-agencies', {
            method: 'POST',
            headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
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
        if (!token) {
            setAuthenticatedUi(false);
            setAuthGateError('');
            return;
        }

        setAuthenticatedUi(true);
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
            if (e.message === 'HTTP 401') {
                clearToken();
                loadingState.style.display = 'none';
                setAuthenticatedUi(false);
                setAuthGateError('Token invalide. Réessayez.');
                return;
            }
            loadingState.style.display = 'none';
            adminError.textContent = 'Erreur de chargement : ' + e.message + '.';
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
    btnLogout.addEventListener('click', () => {
        clearToken();
        setAuthenticatedUi(false);
        setAuthGateError('');
        adminError.style.display = 'none';
        if (adminTokenInput) adminTokenInput.value = '';
    });

    async function handleAuthSubmit() {
        const candidate = adminTokenInput.value.trim();
        if (!candidate) {
            setAuthGateError('Token requis.');
            return;
        }

        setAuthGateError('');
        persistToken(candidate);
        await loadAgencies();
    }

    adminTokenSubmit.addEventListener('click', handleAuthSubmit);
    adminTokenInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAuthSubmit();
        }
    });

    // ── Boot ───────────────────────────────────────────────────────────────────
    loadAgencies();
})();
