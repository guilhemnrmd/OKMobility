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
const CACHE_TTL_MS       = 30 * 24 * 60 * 60 * 1000; // 30 days

// Known agencies shown in the pre-menu (one-time agency selection).
// Only shown on a device that hasn't selected an agency yet.
const KNOWN_AGENCIES = [
    { id: 'valencia_aero_01',    label: 'OK Mobility Valencia Aeropuerto' },
    { id: 'valencia_sorolla_01', label: 'OK Mobility Estación Joaquín Sorolla' }
];

// ── DOM helpers ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function showGate(reason) {
    const gate   = $('licenseGate');
    const icon   = $('licenseGateIcon');
    const title  = $('licenseGateTitle');
    const msg    = $('licenseGateMsg');

    const states = {
        no_agency: {
            icon: 'bx-question-mark',
            title: 'Agencia no seleccionada',
            text: 'No se ha podido determinar la agencia. Contacte con el soporte técnico.'
        },
        not_found: {
            icon: 'bx-block',
            title: 'Terminal no autorizado',
            text: 'Este terminal no dispone de una licencia activa. Contacte con el proveedor.'
        },
        expired: {
            icon: 'bx-time',
            title: 'Licencia expirada',
            text: 'La licencia de esta agencia ha vencido. Contacte con el proveedor para renovarla.'
        },
        error: {
            icon: 'bx-error-circle',
            title: 'Error de activación',
            text: 'No se ha podido verificar la licencia. Compruebe su conexión e inténtelo de nuevo.'
        }
    };

    const s = states[reason] || states.error;
    icon.innerHTML = `<i class='bx ${s.icon}'></i>`;
    title.textContent = s.title;
    msg.textContent = s.text;
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
    const res = await fetch(`/api/check-license?agency=${encodeURIComponent(agencyId)}`);
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
function buildAgencyMenu() {
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
                    ${KNOWN_AGENCIES.map(a => `<option value="${a.id}">${a.label}</option>`).join('')}
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

        sel.addEventListener('change', () => {
            btn.disabled = !sel.value;

            if (display) {
                const selectedOption = sel.options[sel.selectedIndex];
                display.textContent = selectedOption?.textContent || '— Seleccione su agencia —';
            }
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
    const knownIds = KNOWN_AGENCIES.map(a => a.id);

    // 1. Get agencyId — from URL param, localStorage, or one-time menu
    const urlParams = new URLSearchParams(window.location.search);
    let agencyId = urlParams.get('agency') || '';

    if (!agencyId || !knownIds.includes(agencyId)) {
        // Try localStorage first (avoids re-showing the menu)
        agencyId = localStorage.getItem(AGENCY_STORAGE_KEY) || '';
    }

    if (!agencyId || !knownIds.includes(agencyId)) {
        // First time on this device — show one-time selection menu
        agencyId = await buildAgencyMenu();
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
            }
        }).catch(() => { /* offline — continue with cached data */ });
    }

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
