/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 *
 * License Gate — Runs before PeerJS initialisation on /retailer/
 *
 * Flow:
 *  1. Read agencyId from localStorage (set once on first visit)
 *     → If missing: show agency pre-selection dropdown (one-time only)
 *  2. Check localStorage cache (30-day validity + licenseVersion)
 *     → If cache miss/expired: call /api/check-license
 *  3. If server says invalid/expired → show permanent error gate
 *  4. If firstActivation → show CGU modal → POST /api/accept-terms
 *  5. All done → resolve() → caller runs initializePeer()
 */

// ── Anti-DevTools: disable right-click and common shortcuts ──────────────────
(function antiDevTools() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' ||
            ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
            ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u')
        ) {
            e.preventDefault();
        }
    });
})();

// ── Constants ────────────────────────────────────────────────────────────────
const CACHE_KEY_PREFIX   = 'okm_lic_';
const AGENCY_STORAGE_KEY = 'okm_agency';  // Persists selected agencyId
const AGENCY_NAME_STORAGE_KEY = 'okm_agency_name';
const CACHE_TTL_MS       = 30 * 24 * 60 * 60 * 1000; // 30 days

// Known agencies shown in the pre-menu (one-time agency selection).
// Only shown on a device that hasn't selected an agency yet.
// This static list is used as FALLBACK only if the dynamic API call fails.
const FALLBACK_AGENCIES = window.BRAND?.fallbackAgencies || [
    { id: 'valencia_aero_01',    label: 'OK Mobility Valencia Aeropuerto' },
    { id: 'valencia_sorolla_01', label: 'OK Mobility Estación Joaquín Sorolla' }
];

const AGENCIES_SESSION_KEY = 'okm_agencies_list';
const AGENCIES_CACHE_TTL_MS = 60 * 1000;

function readAgenciesFromSession() {
    try {
        const raw = sessionStorage.getItem(AGENCIES_SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);

        // Backward compatibility with old format: direct array.
        if (Array.isArray(parsed) && parsed.length > 0) {
            return { agencies: parsed, cachedAt: 0 };
        }

        if (!parsed || typeof parsed !== 'object') return null;
        if (!Array.isArray(parsed.agencies) || parsed.agencies.length === 0) return null;
        if (typeof parsed.cachedAt !== 'number') return null;

        return parsed;
    } catch (_) {
        return null;
    }
}

function writeAgenciesToSession(agencies) {
    try {
        sessionStorage.setItem(AGENCIES_SESSION_KEY, JSON.stringify({
            agencies,
            cachedAt: Date.now()
        }));
    } catch (_) {}
}

async function fetchAgenciesList() {
    const cached = readAgenciesFromSession();

    // Always try API first so new/re-activated agencies appear immediately.
    try {
        const res = await fetch(`/api/list-agencies?ts=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if (Array.isArray(json.agencies) && json.agencies.length > 0) {
            writeAgenciesToSession(json.agencies);
            return json.agencies;
        }
    } catch (_) {}

    // Fallback to recent session cache when API is temporarily unavailable.
    if (cached && cached.agencies.length > 0) {
        const isRecent = (Date.now() - cached.cachedAt) < AGENCIES_CACHE_TTL_MS;
        if (isRecent) return cached.agencies;
        return cached.agencies;
    }

    // Fallback to static list
    return FALLBACK_AGENCIES;
}
// ── DOM helpers ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function sanitizeAgencyName(name) {
    if (typeof name !== 'string') return null;

    const cleaned = name
        .trim()
        .replace(/^ok\s*mobility\s*/i, '')
        .replace(/^[-:|]\s*/, '')
        .replace(/\s+/g, ' ')
        .slice(0, 120);

    return cleaned || null;
}

function applyRetailerAgencyBranding(agencyName) {
    const slogan = document.getElementById('retailerAgencyBrandText');
    if (!slogan) return;

    const fallback = slogan.dataset.defaultSlogan || 'Vista Asesor';
    slogan.textContent = agencyName || fallback;
}

function calculateExpirationStatus(expiresAtISO) {
    if (!expiresAtISO) return { status: 'unknown', message: '' };

    const expiresAt = new Date(expiresAtISO);
    if (Number.isNaN(expiresAt.getTime())) return { status: 'unknown', message: '' };

    const now = Date.now();
    const diffMs = expiresAt.getTime() - now;

    if (diffMs <= 0) {
        return { status: 'expired', message: 'Licencia expirada' };
    }

    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    let status = 'ok';
    let message = '';

    if (daysRemaining >= 60) {
        const months = Math.floor(daysRemaining / 30);
        message = `Licencia activa: ${months} ${months > 1 ? 'meses' : 'mes'} restantes`;
        status = months <= 2 ? 'warning' : 'ok';
    } else if (daysRemaining >= 14) {
        const weeks = Math.floor(daysRemaining / 7);
        message = `Licencia activa: ${weeks} ${weeks > 1 ? 'semanas' : 'semana'} restantes`;
        status = weeks <= 2 ? 'warning' : 'ok';
    } else {
        message = `Licencia activa: ${daysRemaining} ${daysRemaining > 1 ? 'días' : 'día'} restantes`;
        status = daysRemaining <= 3 ? 'critical' : 'warning';
    }

    return { status, message };
}

function displayLicenseStatus(expiresAtISO) {
    const note = document.getElementById('licenseStatusInline');
    if (!note) return;

    const expiration = calculateExpirationStatus(expiresAtISO);

    if (expiration.status === 'unknown') {
        note.style.display = 'none';
        return;
    }

    note.textContent = expiration.message;
    note.className = `license-status-note license-status-${expiration.status}`;
    note.style.display = 'block';
}

function showGate(reason) {
    const gate   = $('licenseGate');
    const icon   = $('licenseGateIcon');
    const title  = $('licenseGateTitle');
    const msg    = $('licenseGateMsg');
    const actionBtn = $('licenseGateActionBtn');

    const states = {
        no_agency: {
            icon: 'bx-question-mark',
            title: 'Agencia no seleccionada',
            text: 'No se ha podido determinar la agencia. Contacte con el soporte técnico.',
            showAction: false
        },
        not_found: {
            icon: 'bx-block',
            title: 'Terminal no autorizado',
            text: 'Este terminal no dispone de una licencia activa. Contacte con el proveedor.',
            showAction: false
        },
        expired: {
            icon: 'bx-time',
            title: 'Licencia expirada',
            text: 'La licencia de esta agencia ha vencido. Contacte con el proveedor para renovarla.',
            showAction: true
        },
        error: {
            icon: 'bx-error-circle',
            title: 'Error de activación',
            text: 'No se ha podido verificar la licencia. Compruebe su conexión e inténtelo de nuevo.',
            showAction: false
        }
    };

    const s = states[reason] || states.error;
    icon.innerHTML = `<i class='bx ${s.icon}'></i>`;
    title.textContent = s.title;
    msg.textContent = s.text;
    actionBtn.style.display = s.showAction ? 'inline-flex' : 'none';
    gate.style.display = 'flex';
}

// ── localStorage cache ────────────────────────────────────────────────────────
function saveCache(agencyId, payload) {
    try {
        localStorage.setItem(CACHE_KEY_PREFIX + agencyId, JSON.stringify({
            ...payload,
            cachedAt: Date.now()
        }));
    } catch (_) {}
}

function loadCache(agencyId) {
    try {
        const raw = localStorage.getItem(CACHE_KEY_PREFIX + agencyId);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return (Date.now() - (data.cachedAt || 0)) < CACHE_TTL_MS ? data : null;
    } catch (_) {
        return null;
    }
}

// ── Server calls ──────────────────────────────────────────────────────────────
async function apiCheckLicense(agencyId) {
    const res = await fetch(`/api/check-license?agency=${encodeURIComponent(agencyId)}&source=retailer`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiAcceptTerms(agencyId) {
    const res = await fetch('/api/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

// ── One-time agency pre-selection menu ───────────────────────────────────────
// Only shown when no agencyId is stored in localStorage.
// After selection, the ID is persisted — the menu never appears again.
function buildAgencyMenu(initialAgencies) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'advisor-modal glass-panel';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-header">
                <i class='bx bx-building-house' style="font-size:1.5rem;margin-right:8px;color:var(--color-accent);"></i>
                <h2>Configuración inicial</h2>
            </div>
            <p style="font-size:0.9rem;color:var(--color-text-secondary);margin-bottom:4px;">
                Seleccione la agencia a la que pertenece este terminal. Esto sólo se pregunta una vez.
            </p>
            <div class="custom-select-wrapper" style="width:100%;">
                <div id="_agencyMenuDisplay" class="country-display">— Seleccione su agencia —</div>
                <select id="_agencyMenuSel" class="overlay-select" style="width:100%;">
                    <option value="" disabled selected>— Seleccione su agencia —</option>
                    ${initialAgencies.map(a => `<option value="${a.id}">${a.label}</option>`).join('')}
                </select>
                <i class='bx bx-chevron-down select-arrow'></i>
            </div>
            <div class="modal-actions" style="margin-top:16px;">
                <button id="_agencyMenuBtn" class="btn-primary glass-btn" disabled>
                    <i class='bx bx-check-circle'></i>
                    <span>Confirmar agencia</span>
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const sel = modal.querySelector('#_agencyMenuSel');
        const btn = modal.querySelector('#_agencyMenuBtn');
        const display = modal.querySelector('#_agencyMenuDisplay');

        function renderAgencyOptions(agencies, selectedId = '') {
            const options = ['<option value="" disabled>— Seleccione su agencia —</option>']
                .concat(agencies.map((a) => `<option value="${a.id}">${a.label}</option>`));

            sel.innerHTML = options.join('');

            if (selectedId && agencies.some((a) => a.id === selectedId)) {
                sel.value = selectedId;
            } else {
                sel.value = '';
            }

            const selectedOption = sel.options[sel.selectedIndex];
            display.textContent = selectedOption?.textContent || '— Seleccione su agencia —';
            btn.disabled = !sel.value;
        }

        async function refreshAgencyOptions() {
            const previouslySelected = sel.value || '';
            const agencies = await fetchAgenciesList();
            renderAgencyOptions(agencies, previouslySelected);
        }

        // Force a refresh when the modal appears.
        refreshAgencyOptions().catch(() => {});

        sel.addEventListener('change', () => {
            btn.disabled = !sel.value;

            if (display) {
                const selectedOption = sel.options[sel.selectedIndex];
                display.textContent = selectedOption?.textContent || '— Seleccione su agencia —';
            }
        });

        // Refresh list when user interacts with the dropdown.
        sel.addEventListener('focus', () => {
            refreshAgencyOptions().catch(() => {});
        });

        sel.addEventListener('click', () => {
            refreshAgencyOptions().catch(() => {});
        });

        btn.addEventListener('click', () => {
            const id = sel.value;
            if (!id) return;
            // Persist selection — never show again on this device
            try { localStorage.setItem(AGENCY_STORAGE_KEY, id); } catch (_) {}
            overlay.remove();
            modal.remove();
            resolve(id);
        });
    });
}

// ── CGU modal ─────────────────────────────────────────────────────────────────
function showTermsModal(agencyName) {
    return new Promise(resolve => {
        const termsOverlay = $('termsModalOverlay');
        const termsModal   = $('termsModal');
        const agencySpan   = $('termsAgencyName');
        const acceptBtn    = $('termsBtnAccept');

        if (agencySpan) agencySpan.textContent = agencyName;
        termsOverlay.style.display = 'block';
        termsModal.style.display = 'flex';

        acceptBtn.addEventListener('click', async () => {
            acceptBtn.disabled = true;
            acceptBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i><span>Activando...</span>`;
            resolve();
        }, { once: true });
    });
}

// ── Main gate function ────────────────────────────────────────────────────────
/**
 * Call BEFORE initializePeer().
 * Resolves with agencyId when the terminal is cleared.
 * Rejects (with reason string) if the terminal should be blocked.
 */
window.runLicenseGate = async function () {
    // Fetch the dynamic agency list from the server (fallback to static list)
    const agencies = await fetchAgenciesList();
    const knownIds = agencies.map(a => a.id);

    // 1. Get agencyId — from URL param, localStorage, or one-time menu
    const urlParams = new URLSearchParams(window.location.search);
    let agencyId = urlParams.get('agency') || '';

    if (!agencyId || !knownIds.includes(agencyId)) {
        // Try localStorage first (avoids re-showing the menu)
        agencyId = localStorage.getItem(AGENCY_STORAGE_KEY) || '';
    }

    if (!agencyId || !knownIds.includes(agencyId)) {
        // First time on this device — show one-time selection menu
        agencyId = await buildAgencyMenu(agencies);
    }

    // Sync URL silently (useful for bookmarking / diagnostic)
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('agency', agencyId);
        window.history.replaceState({}, '', url.toString());
    } catch (_) {}

    // 2. Try local cache (30-day TTL)
    let license = loadCache(agencyId);

    if (!license) {
        // 3. Re-validate against server
        try {
            const result = await apiCheckLicense(agencyId);
            if (!result.valid) {
                showGate(result.reason || 'not_found');
                return Promise.reject('license_invalid:' + (result.reason || 'unknown'));
            }
            saveCache(agencyId, result);
            license = result;
        } catch (fetchErr) {
            // Network error — allow stale cache if available
            try {
                const stale = JSON.parse(localStorage.getItem(CACHE_KEY_PREFIX + agencyId));
                if (stale?.valid) { license = stale; }
                else { showGate('error'); return Promise.reject('license_network_error'); }
            } catch {
                showGate('error');
                return Promise.reject('license_network_error');
            }
        }
    } else {
        // Cache hit — run a background re-validation to catch revocations/renewals
        apiCheckLicense(agencyId).then(result => {
            if (!result.valid) {
                // Clear cache and show gate on next interaction
                localStorage.removeItem(CACHE_KEY_PREFIX + agencyId);
                showGate(result.reason || 'not_found');
            } else if ((result.licenseVersion || 1) > (license.licenseVersion || 1)) {
                saveCache(agencyId, result);
                // Update expiration status if license version changed
                displayLicenseStatus(result?.licenseExpiresAt);
            }
        }).catch(() => { /* offline — continue with cached data */ });
    }

    // Keep agency display name in retailer header and storage for QR propagation.
    const agencyName = sanitizeAgencyName(license?.agencyName || '');
    applyRetailerAgencyBranding(agencyName);
    try {
        if (agencyName) localStorage.setItem(AGENCY_NAME_STORAGE_KEY, agencyName);
        else localStorage.removeItem(AGENCY_NAME_STORAGE_KEY);
    } catch (_) {}

    const agencyLanguage = license?.agencyLanguage || null;
    try {
        if (agencyLanguage) localStorage.setItem('okm_agency_language', agencyLanguage);
        else localStorage.removeItem('okm_agency_language');
    } catch (_) {}

    // Display license expiration status discreetly in header.
    displayLicenseStatus(license?.licenseExpiresAt);

    // 4. First activation → CGU modal
    if (license.firstActivation) {
        await showTermsModal(license.agencyName || agencyId);
        try {
            await apiAcceptTerms(agencyId);
            saveCache(agencyId, { ...license, firstActivation: false });
        } catch (_) { /* Log silently, don't block */ }
    }

    // Close any open modals
    const termsOverlay = $('termsModalOverlay');
    const termsModal   = $('termsModal');
    if (termsOverlay) termsOverlay.style.display = 'none';
    if (termsModal)   termsModal.style.display   = 'none';

    return agencyId;
};

// Refresh agency list at page load so first modal opening uses fresh data.
fetchAgenciesList().catch(() => {});

// ── Setup button listener for agency reset ───────────────────────────────────
const licenseGateActionBtn = $('licenseGateActionBtn');
if (licenseGateActionBtn) {
    licenseGateActionBtn.addEventListener('click', () => {
        // Clear the stored agency ID
        try { localStorage.removeItem(AGENCY_STORAGE_KEY); } catch (_) {}
        try { localStorage.removeItem(AGENCY_NAME_STORAGE_KEY); } catch (_) {}
        try { sessionStorage.removeItem(AGENCIES_SESSION_KEY); } catch (_) {}
        // Clear all agency-specific caches
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX)) {
                try { localStorage.removeItem(key); } catch (_) {}
            }
        });
        // Reload to trigger agency selection flow again
        window.location.href = window.location.pathname;
    });
}
