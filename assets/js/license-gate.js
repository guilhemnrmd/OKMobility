/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 *
 * License Gate — Runs before PeerJS initialisation on /retailer/
 *
 * Flow:
 *  1. Show agency pre-selection menu (no ?agency= needed in URL)
 *  2. Check localStorage cache (30-day validity + licenseVersion)
 *  3. If cache miss/expired → call /api/check-license
 *  4. If server says invalid/expired → show permanent error gate
 *  5. If firstActivation → show CGU modal (accept → POST /api/accept-terms)
 *  6. If device fingerprint differs from stored one → show PIN modal
 *  7. All done → resolve()  → caller runs initializePeer()
 */

// ── Anti-DevTools: disable right-click and common shortcuts ──────────────────
(function antiDevTools() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        // Block F12, Ctrl+Shift+I/J/C/U, Cmd+Opt+I (macOS)
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
const FINGERPRINT_KEY    = 'okm_fp';
const CACHE_TTL_MS       = 30 * 24 * 60 * 60 * 1000; // 30 days

// Known agencies — only these appear in the pre-menu.
// Agency names come from KV on first load; the menu uses this as a display helper.
const KNOWN_AGENCIES = [
    { id: 'valencia_aero_01',      label: 'OK Mobility Valencia Aeropuerto' },
    { id: 'valencia_sorolla_01',   label: 'OK Mobility Estación Joaquín Sorolla' }
];

// ── DOM helpers ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function showGate(reason) {
    const gate = $('licenseGate');
    const icon = $('licenseGateIcon');
    const title = $('licenseGateTitle');
    const msg = $('licenseGateMsg');

    const states = {
        no_agency: {
            icon: 'bx-question-mark',
            title: 'Agencia no seleccionada',
            text: 'No se ha podido determinar la agencia. Por favor escanee el QR correcto o contacte con soporte.'
        },
        not_found: {
            icon: 'bx-block',
            title: 'Terminal no autorizado',
            text: 'Este terminal no dispone de una licencia activa. Contacte con el proveedor.'
        },
        expired: {
            icon: 'bx-time',
            title: 'Licencia expirada',
            text: 'La licencia de esta agencia ha vencido. Por favor contacte con el proveedor para renovarla.'
        },
        error: {
            icon: 'bx-error-circle',
            title: 'Error de activación',
            text: 'No se ha podido verificar la licencia. Compruebe su conexión y recargue la página.'
        }
    };

    const s = states[reason] || states.error;
    icon.innerHTML = `<i class='bx ${s.icon}'></i>`;
    title.textContent = s.title;
    msg.textContent = s.text;
    gate.style.display = 'flex';
}

// ── Device fingerprint ────────────────────────────────────────────────────────
function getDeviceFingerprint() {
    const raw = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language
    ].join('|');

    // Fast non-cryptographic hash (djb2)
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
    }
    return (hash >>> 0).toString(36);
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
        const age = Date.now() - (data.cachedAt || 0);
        return age < CACHE_TTL_MS ? data : null;
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

async function apiVerifyPin(agencyId, pin) {
    const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, pin })
    });
    if (!res.ok) return { valid: false };
    return res.json();
}

// ── Pre-selection menu ────────────────────────────────────────────────────────
function buildAgencyMenu() {
    return new Promise(resolve => {
        // Build overlay
        const overlay = document.createElement('div');
        overlay.id = 'agencyMenuOverlay';
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'advisor-modal glass-panel';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-header">
                <i class='bx bx-building-house' style="font-size:1.5rem;margin-right:8px;color:var(--color-accent);"></i>
                <h2>Seleccionar agencia</h2>
            </div>
            <p style="font-size:0.9rem;color:var(--color-text-secondary);margin-bottom:4px;">
                ¿En qué agencia se encuentra?
            </p>
            <div class="custom-select-wrapper" style="width:100%;">
                <select id="agencyMenuSelect" class="overlay-select" style="width:100%;">
                    <option value="" disabled selected>— Seleccione su agencia —</option>
                    ${KNOWN_AGENCIES.map(a => `<option value="${a.id}">${a.label}</option>`).join('')}
                </select>
                <i class='bx bx-chevron-down select-arrow'></i>
            </div>
            <div class="modal-actions" style="margin-top:16px;">
                <button id="agencyMenuConfirm" class="btn-primary glass-btn" disabled>
                    <i class='bx bx-check-circle'></i>
                    <span>Confirmar</span>
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const sel = modal.querySelector('#agencyMenuSelect');
        const btn = modal.querySelector('#agencyMenuConfirm');

        sel.addEventListener('change', () => {
            btn.disabled = !sel.value;
        });

        btn.addEventListener('click', () => {
            const id = sel.value;
            if (!id) return;
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

// ── PIN modal ─────────────────────────────────────────────────────────────────
function showPinModal(agencyId) {
    return new Promise(resolve => {
        const pinOverlay = $('pinModalOverlay');
        const pinModal   = $('pinModal');
        const pinInput   = $('pinInput');
        const pinError   = $('pinError');
        const pinSubmit  = $('pinBtnSubmit');

        pinOverlay.style.display = 'block';
        pinModal.style.display = 'flex';
        pinInput.focus();

        let attempts = 0;

        async function tryPin() {
            const pin = pinInput.value.trim();
            if (!pin) return;

            pinSubmit.disabled = true;
            pinError.textContent = '';
            pinSubmit.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i><span>Verificando...</span>`;

            try {
                const result = await apiVerifyPin(agencyId, pin);
                if (result.valid) {
                    pinOverlay.style.display = 'none';
                    pinModal.style.display = 'none';
                    resolve();
                } else {
                    attempts++;
                    if (attempts >= 5) {
                        pinError.textContent = '⛔ Demasiados intentos. Contacte con soporte.';
                        pinSubmit.disabled = true;
                        return;
                    }
                    pinError.textContent = `PIN incorrecto (${attempts}/5). Inténtelo de nuevo.`;
                    pinInput.value = '';
                    pinInput.focus();
                    pinSubmit.disabled = false;
                    pinSubmit.innerHTML = `<i class='bx bx-log-in'></i><span>Verificar</span>`;
                }
            } catch {
                pinError.textContent = 'Error de red. Compruebe su conexión.';
                pinSubmit.disabled = false;
                pinSubmit.innerHTML = `<i class='bx bx-log-in'></i><span>Verificar</span>`;
            }
        }

        pinSubmit.addEventListener('click', tryPin);
        pinInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') tryPin();
        });
    });
}

// ── Main gate function ────────────────────────────────────────────────────────
/**
 * Call this BEFORE initializePeer().
 * Returns a promise that resolves with the agencyId when the terminal is cleared.
 * The caller should use the returned agencyId to set page context (title, etc.)
 */
window.runLicenseGate = async function () {
    // 1. Get agencyId from URL or show pre-selection menu
    const urlParams = new URLSearchParams(window.location.search);
    let agencyId = urlParams.get('agency') || '';

    const knownIds = KNOWN_AGENCIES.map(a => a.id);
    if (!agencyId || !knownIds.includes(agencyId)) {
        agencyId = await buildAgencyMenu();
        // Update URL silently (no reload)
        const url = new URL(window.location.href);
        url.searchParams.set('agency', agencyId);
        window.history.replaceState({}, '', url.toString());
    }

    // 2. Try local cache
    let license = loadCache(agencyId);

    if (!license) {
        // 3. Re-validate against server
        try {
            const result = await apiCheckLicense(agencyId);
            if (!result.valid) {
                showGate(result.reason || 'not_found');
                return Promise.reject('license_invalid');
            }
            saveCache(agencyId, result);
            license = result;
        } catch {
            // Network error — if we had a previous cache (even expired), let through
            const staleRaw = (() => {
                try { return JSON.parse(localStorage.getItem(CACHE_KEY_PREFIX + agencyId)); } catch { return null; }
            })();
            if (staleRaw?.valid) {
                license = staleRaw;
            } else {
                showGate('error');
                return Promise.reject('license_network_error');
            }
        }
    } else {
        // Cache hit — still check licenseVersion server-side if possible
        try {
            const result = await apiCheckLicense(agencyId);
            if (!result.valid) {
                localStorage.removeItem(CACHE_KEY_PREFIX + agencyId);
                showGate(result.reason || 'not_found');
                return Promise.reject('license_revoked');
            }
            // Refresh cache if version changed
            if ((result.licenseVersion || 1) > (license.licenseVersion || 1)) {
                saveCache(agencyId, result);
                license = result;
            }
        } catch {
            // Offline — continue with cached data
        }
    }

    // 4. First activation → CGU modal
    if (license.firstActivation) {
        await showTermsModal(license.agencyName || agencyId);
        try {
            await apiAcceptTerms(agencyId);
            // Update cache — firstActivation now false
            saveCache(agencyId, { ...license, firstActivation: false });
        } catch {
            // Log silently, don't block
        }
    }

    // 5. Device fingerprint check
    const fp = getDeviceFingerprint();
    const storedFp = localStorage.getItem(FINGERPRINT_KEY + '_' + agencyId);

    if (storedFp !== fp) {
        await showPinModal(agencyId);
        // Store fingerprint after successful PIN
        try { localStorage.setItem(FINGERPRINT_KEY + '_' + agencyId, fp); } catch (_) {}
    }

    // Close any open modals
    const termsOverlay = $('termsModalOverlay');
    const termsModal   = $('termsModal');
    if (termsOverlay) termsOverlay.style.display = 'none';
    if (termsModal)   termsModal.style.display   = 'none';

    return agencyId;
};
