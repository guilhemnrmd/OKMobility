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
    const adminToast   = document.getElementById('adminToast');
    const adminSyncIndicator = document.getElementById('adminSyncIndicator');
    const authGate     = document.getElementById('authGate');
    const authGateError = document.getElementById('authGateError');
    const adminTokenInput = document.getElementById('adminTokenInput');
    const adminTokenSubmit = document.getElementById('adminTokenSubmit');
    const btnRefresh   = document.getElementById('btnRefresh');
    const btnAdd       = document.getElementById('btnAddAgency');
    const btnLogout    = document.getElementById('btnLogout');
    const adminToolbar = document.getElementById('adminToolbar');
    const bulkPanel = document.getElementById('bulkPanel');
    const selectionCount = document.getElementById('selectionCount');
    const btnSelectAllVisible = document.getElementById('btnSelectAllVisible');
    const btnClearSelection = document.getElementById('btnClearSelection');
    const bulkExpiryInput = document.getElementById('bulkExpiryInput');
    const btnBulkUpdateExpiry = document.getElementById('btnBulkUpdateExpiry');
    const btnBulkRenewYear = document.getElementById('btnBulkRenewYear');
    const expiredArchiveWrap = document.getElementById('expiredArchiveWrap');
    const expiredArchiveList = document.getElementById('expiredArchiveList');
    const btnExpiredArchive = document.getElementById('btnExpiredArchive');
    const expiredArchiveInfo = document.getElementById('expiredArchiveInfo');
    const expiredArchiveChevron = document.getElementById('expiredArchiveChevron');

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
    let agenciesCache = [];
    let selectedAgencyIds = new Set();
    let toastTimer = null;
    let syncTimer = null;
    let lastRenderedSnapshot = '[]';

    function setAuthenticatedUi(isAuthenticated) {
        if (authGate) authGate.style.display = isAuthenticated ? 'none' : 'flex';
        if (loadingState) loadingState.style.display = isAuthenticated ? 'flex' : 'none';
        if (agencyList) agencyList.style.display = 'none';
        if (expiredArchiveWrap) expiredArchiveWrap.style.display = 'none';
        if (adminToolbar) adminToolbar.style.display = isAuthenticated ? 'flex' : 'none';
        if (bulkPanel) bulkPanel.style.display = isAuthenticated ? 'flex' : 'none';
        if (btnAdd) btnAdd.style.display = isAuthenticated ? 'inline-flex' : 'none';
        if (btnRefresh) btnRefresh.style.display = isAuthenticated ? 'inline-flex' : 'none';
        if (btnLogout) btnLogout.style.display = isAuthenticated ? 'inline-flex' : 'none';
        if (!isAuthenticated && adminSyncIndicator) {
            adminSyncIndicator.classList.remove('active');
        }
    }

    function normalizeAgenciesForSnapshot(agencies) {
        return agencies
            .map((a) => ({
                id: a.id || '',
                agencyName: a.agencyName || '',
                licenseExpiresAt: a.licenseExpiresAt || null,
                firstActivation: !!a.firstActivation,
                licenseVersion: a.licenseVersion || 1,
                revokedAt: a.revokedAt || null
            }))
            .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }

    function snapshotAgencies(agencies) {
        return JSON.stringify(normalizeAgenciesForSnapshot(agencies));
    }

    function setSyncIndicator(active) {
        if (!adminSyncIndicator) return;
        adminSyncIndicator.classList.toggle('active', !!active);
    }

    function updateSelectionUi() {
        const count = selectedAgencyIds.size;
        if (selectionCount) {
            selectionCount.textContent = `${count} sélectionnée${count > 1 ? 's' : ''}`;
        }

        if (btnBulkUpdateExpiry) btnBulkUpdateExpiry.disabled = count === 0;
        if (btnBulkRenewYear) btnBulkRenewYear.disabled = count === 0;
    }

    function syncCardCheckboxes() {
        document.querySelectorAll('.agency-select-checkbox').forEach((input) => {
            const agencyId = input.dataset.agencyId;
            input.checked = selectedAgencyIds.has(agencyId);
        });
        updateSelectionUi();
    }

    function setSelection(ids) {
        selectedAgencyIds = new Set(ids);
        syncCardCheckboxes();
    }

    function clearToken() {
        token = '';
        try { sessionStorage.removeItem(SESSION_TOKEN_KEY); } catch { /* ignore */ }
        if (syncTimer) {
            clearTimeout(syncTimer);
            syncTimer = null;
        }
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
        const r = await fetch(`/api/admin-agencies?ts=${Date.now()}`, {
            headers: buildAuthHeaders(),
            cache: 'no-store'
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

    function formatDateTime(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }

    function renderAgency(a) {
        const expired = isExpired(a.licenseExpiresAt);
        const isRevoked = !!a.revokedAt;
        const card = document.createElement('div');
        card.className = 'agency-card glass-panel';
        card.dataset.id = a.id;

        const recentEvents = Array.isArray(a.telemetry?.recentEvents) ? a.telemetry.recentEvents : [];
        const logsListHtml = recentEvents.length > 0
            ? recentEvents.map((evt) => `
                <div class="agency-log-item">
                    <span><i class='bx bx-time-five'></i> <strong>${formatDateTime(evt.at)}</strong></span>
                    <span><i class='bx bx-world'></i> ${escHtml(evt.country || 'XX')}</span>
                    <span><i class='bx bx-devices'></i> ${escHtml(evt.device || 'unknown')}</span>
                </div>
            `).join('')
            : '<div class="agency-log-item"><span>Aucun log de connexion disponible.</span></div>';

        const countries30d = (a.telemetry?.countries30d && typeof a.telemetry.countries30d === 'object')
            ? Object.entries(a.telemetry.countries30d).sort((x, y) => y[1] - x[1])
            : [];
        const maxCount = countries30d[0]?.[1] || 1;
        const countriesHtml = countries30d.length > 0
            ? countries30d.map(([cc, count]) => {
                const pct = Math.round((count / maxCount) * 100);
                const flag = cc.length === 2
                    ? String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E0 + c.charCodeAt(0) - 65))
                    : '🌐';
                return `<div class="country-bar-row">
                    <span class="country-bar-label">${flag} ${escHtml(cc)}</span>
                    <span class="country-bar-track"><span class="country-bar-fill" style="width:${pct}%"></span></span>
                    <span class="country-bar-count">${count}</span>
                </div>`;
            }).join('')
            : '<div class="agency-log-item"><span>Aucune donnée pays disponible.</span></div>';

        card.innerHTML = `
            <div class="agency-card-header">
                <div>
                    <div class="agency-name">${escHtml(a.agencyName || a.id)}</div>
                    <div class="agency-id">${escHtml(a.id)}</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label class="select-box">
                        <input type="checkbox" class="agency-select-checkbox" data-agency-id="${escHtml(a.id)}">
                        <span>Sélection</span>
                    </label>
                    <span class="badge ${expired ? 'badge-expired' : 'badge-ok'}">
                        <i class='bx ${expired ? 'bx-x-circle' : 'bx-check-circle'}'></i>
                        ${expired ? 'Expirée' : 'Active'}
                    </span>
                </div>
            </div>
            <div class="agency-meta">
                <span><i class='bx bx-calendar'></i> Expiration&nbsp;: <strong>${formatDate(a.licenseExpiresAt)}</strong></span>
                <span><i class='bx bx-git-repo-forked'></i> v${a.licenseVersion || 1}</span>
                <span><i class='bx bx-${a.firstActivation ? 'radio-circle' : 'check-circle'}'></i> ${a.firstActivation ? 'CGU en attente' : 'CGU acceptées'}</span>
                <span><i class='bx bx-devices'></i> Postes (30j)&nbsp;: <strong>${a.telemetry?.uniqueDevices30d || 0}</strong></span>
                <span><i class='bx bx-world'></i> Zone&nbsp;: <strong>${a.telemetry?.lastSeenCountry || '—'}</strong></span>
                ${a.agencyAddress ? `<span><i class='bx bx-map-pin'></i> ${escHtml(a.agencyAddress)}</span>` : ''}
                ${a.agencyLanguage ? `<span><i class='bx bx-globe'></i> ${escHtml(a.agencyLanguage.toUpperCase())}</span>` : ''}
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
                <button class="btn-sm btn-logs">
                    <i class='bx bx-list-ul'></i> Logs
                </button>
                <button class="btn-sm btn-countries">
                    <i class='bx bx-bar-chart-alt-2'></i> Pays
                </button>
                ${isRevoked ? `<button class="btn-sm danger btn-delete" title="Supprimer définitivement cette licence révoquée">
                    <i class='bx bx-trash'></i> Supprimer
                </button>` : ''}
            </div>
            <div class="agency-logs" id="logs_${escHtml(a.id)}">
                <div class="agency-logs-title">Connexions récentes</div>
                <div class="agency-logs-list">${logsListHtml}</div>
            </div>
            <div class="agency-countries" id="countries_${escHtml(a.id)}">
                <div class="agency-logs-title"><i class='bx bx-bar-chart-alt-2'></i> Pays (30j)</div>
                <div class="countries-bar-list">${countriesHtml}</div>
            </div>
            <div class="edit-form" id="ef_${escHtml(a.id)}">
                <!-- inline edit, opened by JS -->
            </div>
        `;

        const selectInput = card.querySelector('.agency-select-checkbox');
        selectInput.checked = selectedAgencyIds.has(a.id);
        selectInput.addEventListener('change', () => {
            if (selectInput.checked) {
                selectedAgencyIds.add(a.id);
            } else {
                selectedAgencyIds.delete(a.id);
            }
            updateSelectionUi();
        });

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
                applyUpsertLocally({
                    agencyId: a.id,
                    agencyName: a.agencyName,
                    licenseExpiresAt: renewed.toISOString()
                });
                renderAgenciesFromCache();
                showMsg(`✅ Licence renouvelée jusqu'au ${formatDate(renewed.toISOString())}`);
            } catch (e) {
                showMsg('❌ Erreur : ' + e.message, true);
            }
        });

        // Revoke
        card.querySelector('.btn-revoke').addEventListener('click', async () => {
            if (!confirm(`⚠️ Révoquer la licence "${a.agencyName}" ? Le terminal sera immédiatement bloqué (dans les 30 jours de cache).`)) return;
            try {
                await apiPost({ action: 'revoke', agencyId: a.id });
                applyRevokeLocally(a.id);
                renderAgenciesFromCache();
                showMsg(`🔒 Licence révoquée.`);
            } catch (e) {
                showMsg('❌ Erreur : ' + e.message, true);
            }
        });

        // Delete (only for revoked licenses)
        const deleteBtn = card.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!confirm(`🗑️ Supprimer définitivement la licence "${a.agencyName}" ? Cette action est irréversible.`)) return;
                try {
                    await apiPost({ action: 'delete', agencyId: a.id });
                    applyDeleteLocally(a.id);
                    renderAgenciesFromCache();
                    showMsg(`🗑️ Licence supprimée définitivement.`);
                } catch (e) {
                    showMsg('❌ Erreur : ' + e.message, true);
                }
            });
        }

        const logsBtn = card.querySelector('.btn-logs');
        const logsPanel = card.querySelector('.agency-logs');
        if (logsBtn && logsPanel) {
            logsBtn.addEventListener('click', () => {
                logsPanel.classList.toggle('open');
                const isOpen = logsPanel.classList.contains('open');
                logsBtn.innerHTML = isOpen
                    ? "<i class='bx bx-x'></i> Fermer logs"
                    : "<i class='bx bx-list-ul'></i> Logs";
            });
        }

        const countriesBtn = card.querySelector('.btn-countries');
        const countriesPanel = card.querySelector('.agency-countries');
        if (countriesBtn && countriesPanel) {
            countriesBtn.addEventListener('click', () => {
                countriesPanel.classList.toggle('open');
                const isOpen = countriesPanel.classList.contains('open');
                countriesBtn.innerHTML = isOpen
                    ? "<i class='bx bx-x'></i> Fermer pays"
                    : "<i class='bx bx-bar-chart-alt-2'></i> Pays";
            });
        }

        return card;
    }

    function escHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function renderAgenciesFromCache() {
        const byId = new Set(agenciesCache.map((a) => a.id));
        selectedAgencyIds.forEach((id) => {
            if (!byId.has(id)) selectedAgencyIds.delete(id);
        });

        const activeAgencies = agenciesCache.filter((a) => !isExpired(a.licenseExpiresAt));
        const expiredAgencies = agenciesCache.filter((a) => isExpired(a.licenseExpiresAt));

        agencyList.innerHTML = '';
        expiredArchiveList.innerHTML = '';

        if (agenciesCache.length === 0) {
            agencyList.innerHTML = '<p style="color:var(--color-text-secondary);text-align:center;padding:20px;">Aucune agence configurée.</p>';
            expiredArchiveWrap.style.display = 'none';
        } else {
            if (activeAgencies.length > 0) {
                const title = document.createElement('div');
                title.className = 'section-title';
                title.innerHTML = `<span>Actives</span><span>${activeAgencies.length}</span>`;
                agencyList.appendChild(title);
                activeAgencies.forEach((a) => agencyList.appendChild(renderAgency(a)));
            } else {
                agencyList.innerHTML = '<p style="color:var(--color-text-secondary);text-align:center;padding:12px 20px;">Aucune licence active.</p>';
            }

            expiredArchiveInfo.textContent = String(expiredAgencies.length);
            expiredArchiveWrap.style.display = expiredAgencies.length > 0 ? 'flex' : 'none';

            expiredAgencies.forEach((a) => expiredArchiveList.appendChild(renderAgency(a)));
        }

        agencyList.style.display = 'flex';
        syncCardCheckboxes();
        lastRenderedSnapshot = snapshotAgencies(agenciesCache);
    }

    function applyUpsertLocally({ agencyId, agencyName, licenseExpiresAt, agencyAddress, agencyLanguage }) {
        const idx = agenciesCache.findIndex((a) => a.id === agencyId);
        if (idx === -1) {
            agenciesCache.push({
                id: agencyId,
                agencyName,
                licenseExpiresAt,
                agencyAddress: agencyAddress || null,
                agencyLanguage: agencyLanguage || null,
                firstActivation: true,
                licenseVersion: 1
            });
            return;
        }

        const previous = agenciesCache[idx];
        agenciesCache[idx] = {
            ...previous,
            agencyName,
            licenseExpiresAt,
            agencyAddress: agencyAddress !== undefined ? agencyAddress : (previous.agencyAddress || null),
            agencyLanguage: agencyLanguage !== undefined ? agencyLanguage : (previous.agencyLanguage || null),
            licenseVersion: (previous.licenseVersion || 1) + 1
        };
    }

    function applyRevokeLocally(agencyId) {
        const idx = agenciesCache.findIndex((a) => a.id === agencyId);
        if (idx === -1) return;

        const previous = agenciesCache[idx];
        agenciesCache[idx] = {
            ...previous,
            licenseExpiresAt: '2000-01-01T00:00:00Z',
            licenseVersion: (previous.licenseVersion || 1) + 1,
            revokedAt: new Date().toISOString()
        };
    }

    function applyDeleteLocally(agencyId) {
        const idx = agenciesCache.findIndex((a) => a.id === agencyId);
        if (idx === -1) return;
        agenciesCache.splice(idx, 1);
    }

    function scheduleSilentSync() {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            silentSync().catch(() => {});
        }, 3000);
    }

    async function silentSync(forceRender = false) {
        if (!token) return;

        setSyncIndicator(true);
        try {
            const data = await apiGet();
            const nextAgencies = Array.isArray(data.agencies) ? data.agencies.slice() : [];
            const oldSnapshot = snapshotAgencies(agenciesCache);
            const newSnapshot = snapshotAgencies(nextAgencies);

            if (forceRender || oldSnapshot !== newSnapshot) {
                agenciesCache = nextAgencies;
                renderAgenciesFromCache();
            }
        } catch (e) {
            if (e.message === 'HTTP 401') {
                clearToken();
                setAuthenticatedUi(false);
                setAuthGateError('Token invalide. Réessayez.');
                return;
            }
            if (forceRender) {
                showMsg('Erreur de synchronisation : ' + e.message + '.', true);
            }
        } finally {
            setSyncIndicator(false);
        }
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
            agenciesCache = Array.isArray(data.agencies) ? data.agencies.slice() : [];
            const currentSnapshot = snapshotAgencies(agenciesCache);
            if (lastRenderedSnapshot !== currentSnapshot) {
                renderAgenciesFromCache();
            }
            loadingState.style.display = 'none';
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
        if (!adminToast) {
            adminError.textContent = text;
            adminError.style.background = isErr ? 'rgba(255,59,48,0.1)' : 'rgba(34,197,94,0.1)';
            adminError.style.borderColor = isErr ? 'rgba(255,59,48,0.2)' : 'rgba(34,197,94,0.2)';
            adminError.style.color = '';
            adminError.classList.toggle('text-error', isErr);
            adminError.classList.toggle('text-success', !isErr);
            adminError.style.display = 'block';
            setTimeout(() => { adminError.style.display = 'none'; }, 4000);
            return;
        }

        if (toastTimer) clearTimeout(toastTimer);
        adminToast.textContent = text;
        adminToast.classList.remove('success', 'error', 'show');
        adminToast.classList.add(isErr ? 'error' : 'success');
        adminToast.classList.add('show');

        toastTimer = setTimeout(() => {
            adminToast.classList.remove('show');
        }, 3800);
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
        document.getElementById('newAgencyAddress').value = a.agencyAddress || '';
        document.getElementById('newAgencyLanguage').value = a.agencyLanguage || '';
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
            licenseExpiresAt: new Date(expiry + 'T23:59:59Z').toISOString(),
            agencyAddress: document.getElementById('newAgencyAddress').value.trim() || null,
            agencyLanguage: document.getElementById('newAgencyLanguage').value || null,
        };

        try {
            await apiPost(body);
            applyUpsertLocally(body);
            renderAgenciesFromCache();
            closeModal();
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
    btnRefresh.addEventListener('click', () => {
        silentSync(true);
    });
    if (btnSelectAllVisible) {
        btnSelectAllVisible.addEventListener('click', () => {
            const ids = [];
            document.querySelectorAll('.agency-select-checkbox').forEach((input) => {
                if (input.offsetParent !== null) {
                    ids.push(input.dataset.agencyId);
                }
            });
            setSelection(ids);
        });
    }

    if (btnClearSelection) {
        btnClearSelection.addEventListener('click', () => {
            selectedAgencyIds.clear();
            syncCardCheckboxes();
        });
    }

    if (btnExpiredArchive) {
        btnExpiredArchive.addEventListener('click', () => {
            expiredArchiveList.classList.toggle('open');
            const isOpen = expiredArchiveList.classList.contains('open');
            if (expiredArchiveChevron) expiredArchiveChevron.textContent = isOpen ? '▾' : '▸';
        });
    }

    if (btnBulkUpdateExpiry) {
        btnBulkUpdateExpiry.addEventListener('click', async () => {
        const ids = Array.from(selectedAgencyIds);
        if (ids.length === 0) {
            showMsg('Sélection vide.', true);
            return;
        }

        if (!bulkExpiryInput.value) {
            showMsg('Choisis une date d\'expiration pour la modification en lot.', true);
            return;
        }

        if (!confirm(`Appliquer la date ${bulkExpiryInput.value} à ${ids.length} agence(s) ?`)) return;

        btnBulkUpdateExpiry.disabled = true;
        const targetIso = new Date(`${bulkExpiryInput.value}T23:59:59Z`).toISOString();
        let ok = 0;
        let fail = 0;

        try {
            for (const id of ids) {
                const agency = agenciesCache.find((a) => a.id === id);
                if (!agency) {
                    fail += 1;
                    continue;
                }

                try {
                    await apiPost({
                        action: 'upsert',
                        agencyId: agency.id,
                        agencyName: agency.agencyName,
                        licenseExpiresAt: targetIso
                    });
                    ok += 1;
                } catch {
                    fail += 1;
                }
            }

            showMsg(`Mise à jour en lot terminée: ${ok} succès, ${fail} échec(s).`, fail > 0);
        } finally {
            btnBulkUpdateExpiry.disabled = false;
        }
        });
    }

    if (btnBulkRenewYear) {
        btnBulkRenewYear.addEventListener('click', async () => {
        const ids = Array.from(selectedAgencyIds);
        if (ids.length === 0) {
            showMsg('Sélection vide.', true);
            return;
        }

        if (!confirm(`Ajouter +1 an à ${ids.length} agence(s) sélectionnée(s) ?`)) return;

        btnBulkRenewYear.disabled = true;
        let ok = 0;
        let fail = 0;

        try {
            for (const id of ids) {
                const agency = agenciesCache.find((a) => a.id === id);
                if (!agency) {
                    fail += 1;
                    continue;
                }

                try {
                    const current = agency.licenseExpiresAt ? new Date(agency.licenseExpiresAt) : new Date();
                    const renewed = new Date(Math.max(current, new Date()));
                    renewed.setFullYear(renewed.getFullYear() + 1);
                    await apiPost({
                        action: 'upsert',
                        agencyId: agency.id,
                        agencyName: agency.agencyName,
                        licenseExpiresAt: renewed.toISOString()
                    });
                    ok += 1;
                } catch {
                    fail += 1;
                }
            }

            showMsg(`Renouvellement en lot terminé: ${ok} succès, ${fail} échec(s).`, fail > 0);
        } finally {
            btnBulkRenewYear.disabled = false;
        }
        });
    }

    btnLogout.addEventListener('click', () => {
        clearToken();
        setAuthenticatedUi(false);
        setAuthGateError('');
        adminError.style.display = 'none';
        if (adminToast) adminToast.classList.remove('show');
        selectedAgencyIds.clear();
        agenciesCache = [];
        lastRenderedSnapshot = '[]';
        updateSelectionUi();
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

    updateSelectionUi();

    // ── Boot ───────────────────────────────────────────────────────────────────
    loadAgencies();
})();
