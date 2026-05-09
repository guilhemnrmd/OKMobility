/*
 * © 2026 Guilhem Normand. Tous droits réservés.
 * Ce logiciel est une création indépendante.
 * Toute copie, rétro-ingénierie, modification ou hébergement sur un serveur tiers
 * sans licence explicite de l'auteur est strictement interdite et s'expose à des
 * poursuites pour contrefaçon selon le droit européen.
 *
 * © 2026 Guilhem Normand. Todos los derechos reservados.
 * Este software es una creación independiente.
 * Cualquier copia, ingeniería inversa, modificación o alojamiento en un servidor de
 * terceros sin licencia explícita del autor está estrictamente prohibido y puede dar
 * lugar a acciones legales por infracción conforme al derecho europeo.
 *
 * PRIVACITÉ / PRIVACIDAD:
 * Toutes les données échangées sont privées et transmises en P2P chiffré (WebRTC).
 * Aucune donnée personnelle n'est stockée côté serveur dans cette application.
 */

/**
 * OK Mobility - Conseiller (Advisor) View
 * Real-time P2P data reception via WebRTC/PeerJS
 */

// ============================================================================
// 1. State & Configuration
// ============================================================================
const config = {
    publicClientUrl: (() => {
        if (typeof window === 'undefined') return 'https://okmobility.pages.dev/client/';
        // Always use the current origin so the QR code points to the right environment
        // (prod → prod, Cloudflare preview → preview, localhost → localhost)
        return window.location.origin + '/client/';
    })(),
    peerPrefix: 'OKM-',
    codeLength: 6,
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        // Metered.ca Open Relay TURN (free 500MB/month, more than enough for text data)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:80?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turns:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ]
};

const TURN_FETCH_TIMEOUT_MS = 3500;

const rtcDiag = {
    enabled: (() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('diag') === '1' || localStorage.getItem('okm_rtc_diag') === '1';
        } catch {
            return false;
        }
    })()
};

function diagLog(...args) {
    if (!rtcDiag.enabled) return;
    console.debug('[OKM-RTC][ADVISOR]', ...args);
}

function getPeerConnectionFromDataConnection(connection) {
    return connection?.peerConnection || connection?._pc || null;
}

async function logSelectedCandidatePair(connection, label) {
    if (!rtcDiag.enabled || !connection) return;
    const pc = getPeerConnectionFromDataConnection(connection);
    if (!pc || typeof pc.getStats !== 'function') return;

    try {
        const stats = await pc.getStats();
        let selectedPair = null;

        stats.forEach((report) => {
            if (report.type === 'candidate-pair' && (report.selected || report.nominated)) {
                selectedPair = report;
            }
        });

        if (!selectedPair) {
            diagLog(label, 'No selected candidate pair yet');
            return;
        }

        const localCandidate = stats.get(selectedPair.localCandidateId);
        const remoteCandidate = stats.get(selectedPair.remoteCandidateId);

        diagLog(label, {
            protocol: selectedPair.protocol,
            localCandidateType: localCandidate?.candidateType,
            remoteCandidateType: remoteCandidate?.candidateType,
            localAddress: localCandidate?.address,
            remoteAddress: remoteCandidate?.address
        });
    } catch (err) {
        diagLog('getStats failed:', err.message);
    }
}

function normalizeIceServers(servers) {
    if (!servers) return [];
    const list = Array.isArray(servers) ? servers : [servers];
    return list.filter((server) => {
        if (!server || typeof server !== 'object') return false;
        return typeof server.urls === 'string' || Array.isArray(server.urls);
    });
}

function buildMergedIceServers(dynamicServers) {
    const baseStun = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' }
    ];

    const cloudflareServers = normalizeIceServers(dynamicServers);
    const fallbackTurnServers = config.iceServers.filter((server) => {
        if (!server || !server.urls) return false;
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
        return urls.some((url) => typeof url === 'string' && (url.startsWith('turn:') || url.startsWith('turns:')));
    });

    return [...baseStun, ...cloudflareServers, ...fallbackTurnServers];
}

const state = {
    lang: 'es',
    peer: null,
    connection: null,
    errorMessageTimer: null,
    isManualDisconnect: false,
    sessionCode: null,
    displayCode: null,
    qrCodeInstance: null,
    currentData: {},
    mapDebounceTimer: null,
    tempMapDebounceTimer: null
};

// ============================================================================
// 2. DOM Elements
// ============================================================================
const dom = {
    html: document.documentElement,
    langSelect: document.getElementById('languageSelect'),
    langDisplay: document.getElementById('langDisplay'),
    sellerActionError: document.getElementById('sellerActionError'),
    setupView: document.getElementById('setupView'),
    liveDataView: document.getElementById('liveDataView'),
    disconnectedView: document.getElementById('disconnectedView'),
    btnLinkStatus: document.getElementById('btnLinkStatus'),
    titleSetup: document.getElementById('titleSetup'),
    setupSubtitle: document.getElementById('setupSubtitle'),
    codeLabel: document.getElementById('codeLabel'),
    sessionCode: document.getElementById('sessionCode'),
    qrCode: document.getElementById('qrCode'),
    qrCodeFrame: document.getElementById('qrCodeFrame'),
    qrLightbox: document.getElementById('qrLightbox'),
    qrLightboxFrame: document.getElementById('qrLightboxFrame'),
    qrCodeLarge: document.getElementById('qrCodeLarge'),
    addressMapExpandBtn: document.getElementById('addressMapExpandBtn'),
    mapLightbox:         document.getElementById('mapLightbox'),
    mapLightboxCloseBtn: document.getElementById('mapLightboxCloseBtn'),
    qrHint: document.getElementById('qrHint'),
    titleLiveData: document.getElementById('titleLiveData'),
    connectionStatus: document.getElementById('connectionStatus'),
    statusText: document.getElementById('statusText'),
    btnCopyCode: document.getElementById('btnCopyCode'),
    btnCopyAll: document.getElementById('btnCopyAll'),
    btnNewSession: document.getElementById('btnNewSession'),
    btnRestart: document.getElementById('btnRestart'),
    txtBtnCopyAll: document.getElementById('txtBtnCopyAll'),
    advisorLegalText: document.getElementById('advisorLegalText'),
    titleDisconnected: document.getElementById('titleDisconnected'),
    disconnectedSubtitle: document.getElementById('disconnectedSubtitle'),
    txtBtnRestart: document.getElementById('txtBtnRestart'),
    // Dynamic data containers (populated by renderRetailerFields)
    dataFieldsContainer: document.getElementById('dataFieldsContainer'),
    mapsContainer: document.getElementById('mapsContainer')
};

// ── Dynamic registries (populated by renderRetailerFields) ───────────
// fieldRegistry[key] = { row, valueEl, labelEl, warningEl, fieldDef, parentGroupId? }
// groupRegistry[groupId] = { wrap, slidingSec, headerEl, labelEl, childKeys: [], visible: false }
// mapRegistry[addrKey]  = { wrapper, mapEl, labelEl, expandBtn, mapInstance, marker, addrKey, zipKey, cityKey, color, debounceTimer }
const fieldRegistry = {};
const groupRegistry = {};
const mapRegistry   = {};
let renderedLang = 'es';

const languageNames = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    pt: 'Português',
    de: 'Deutsch',
    nl: 'Nederlands'
};

const incomingDataLimits = {
    address: 140,
    country: 80,
    zipCode: 20,
    city: 80,
    tempAddress: 140,
    tempZipCode: 20,
    tempCity: 80,
    phoneCode: 10,
    phoneNumber: 40,
    phone: 60,
    phone2Code: 10,
    phone2Number: 40,
    email: 120
};

function isPhoneValid(dialCode, number) {
    if (!number) return true; // empty = no warning
    const lpn = window.libphonenumber;
    if (!lpn || !lpn.isValidPhoneNumber) return true; // lib not loaded = no warning
    const full = `${dialCode} ${number}`.replace(/\s+/g, ' ').trim();
    try { return lpn.isValidPhoneNumber(full); } catch (_) { return true; }
}

function updatePhoneWarning(warningEl, dialCode, number) {
    if (!warningEl) return;
    warningEl.style.display = (!number || isPhoneValid(dialCode, number)) ? 'none' : 'inline-flex';
}

function splitPhoneParts(phoneValue) {
    const value = sanitizeText(phoneValue, 60);
    if (!value) return { phoneCode: '', phoneNumber: '' };

    const match = value.match(/^(\+\d{1,5})\s*(.*)$/);
    if (!match) {
        return { phoneCode: '', phoneNumber: value };
    }

    return {
        phoneCode: sanitizeText(match[1] || '', 10),
        phoneNumber: sanitizeText(match[2] || '', 40)
    };
}

function sanitizeText(value, maxLength) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, maxLength);
}

// Keys that match this regex are accepted as dynamic free-form field values,
// in addition to the well-known canonical keys defined in incomingDataLimits.
// custom_*, address_block_*_addr/zip/city, plus any single-token field id used
// by the form builder.
const DYNAMIC_KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

function sanitizeIncomingData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {};
    }

    const clean = {};

    if (typeof data.language === 'string' && languageNames[data.language]) {
        clean.language = data.language;
    }

    if ('hasTempAddress' in data) {
        clean.hasTempAddress = Boolean(data.hasTempAddress);
    }

    // Canonical fields (with strict per-key max length)
    Object.keys(incomingDataLimits).forEach((key) => {
        if (key in data) {
            clean[key] = sanitizeText(data[key], incomingDataLimits[key]);
        }
    });

    // Dynamic toggle-group visibility flags: _visible_<groupId> or chk_<groupId>
    Object.keys(data).forEach(key => {
        if (key.startsWith('_visible_') || key.startsWith('chk_')) {
            clean[key] = Boolean(data[key]);
        } else if (typeof data[key] === 'string' && !(key in incomingDataLimits) && DYNAMIC_KEY_RE.test(key) && key !== 'language') {
            // Free-form dynamic field value — generic 200-char clamp
            clean[key] = sanitizeText(data[key], 200);
        }
    });

    return clean;
}

function hasActiveClientConnection() {
    return Boolean(state.connection && state.connection.open);
}

function showSellerActionError(message) {
    if (!dom.sellerActionError) return;

    clearTimeout(state.errorMessageTimer);
    dom.sellerActionError.textContent = message;
    dom.sellerActionError.classList.add('visible');

    state.errorMessageTimer = setTimeout(() => {
        dom.sellerActionError.classList.remove('visible');
    }, 2800);
}

function sendLanguageToClient() {
    if (!hasActiveClientConnection()) return;

    try {
        state.connection.send({ type: 'set-language', language: state.lang });
    } catch (err) {
        console.error('Failed to send language command to client:', err);
    }
}

function setRemoteLanguage(langCode, syncClient = true) {
    if (!languageNames[langCode]) return;

    state.lang = langCode;

    if (dom.langSelect) {
        dom.langSelect.value = langCode;
    }
    if (dom.langDisplay) {
        dom.langDisplay.textContent = languageNames[langCode] || langCode;
    }

    // Re-paint dynamic field labels (only if the renderer has already run)
    if (Object.keys(fieldRegistry).length > 0 && typeof updateRetailerLabels === 'function') {
        try { updateRetailerLabels(langCode); } catch (_) {}
    }

    if (syncClient) {
        sendLanguageToClient();
    }
}

function guardLanguageSelectorInteraction(event) {
    if (hasActiveClientConnection()) {
        return;
    }

    event.preventDefault();
    showSellerActionError('No hay conexión establecida. No se puede cambiar el idioma del cliente.');

    if (dom.langSelect) {
        dom.langSelect.blur();
    }
}

// ============================================================================
// 3. Session Code Generation
// ============================================================================
function generateSessionCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
    let code = '';
    for (let i = 0; i < config.codeLength; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function sanitizeAgencyId(id) {
    if (typeof id !== 'string') return null;
    return /^[a-z0-9_]{1,64}$/.test(id) ? id : null;
}

function resolveAgencyId() {
    const fromUrl = sanitizeAgencyId(new URLSearchParams(window.location.search).get('agency'));
    if (fromUrl) return fromUrl;

    try {
        const fromStorage = sanitizeAgencyId(localStorage.getItem('okm_agency'));
        if (fromStorage) return fromStorage;
    } catch {
        // Ignore storage access issues and continue without agency context.
    }

    return null;
}

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

function resolveAgencyName() {
    const slogan = document.querySelector('.brand-slogan');
    const sloganText = sanitizeAgencyName(slogan?.textContent || '');
    const defaultSlogan = sanitizeAgencyName(slogan?.dataset?.defaultSlogan || 'Vista Asesor');
    if (sloganText && sloganText !== defaultSlogan) {
        return sloganText;
    }

    try {
        const fromStorageName = sanitizeAgencyName(localStorage.getItem('okm_agency_name'));
        if (fromStorageName) return fromStorageName;
    } catch {
        // Ignore storage issues.
    }

    const agencyId = resolveAgencyId();
    if (!agencyId) return null;

    try {
        const raw = localStorage.getItem('okm_lic_' + agencyId);
        if (!raw) return null;

        const cached = JSON.parse(raw);
        return sanitizeAgencyName(cached?.agencyName || '');
    } catch {
        return null;
    }
}

// ============================================================================
// 4. QR Code Generation
// ============================================================================
function generateQRCode(sessionCode) {
    // Clear previous QR code
    dom.qrCode.innerHTML = '';
    
    // Build the client URL with the session code
    const clientPageUrl = new URL(config.publicClientUrl);
    clientPageUrl.searchParams.set('code', sessionCode);

    // Keep agency context from retailer URL so client page can show the right agency name.
    const agencyId = resolveAgencyId();
    if (agencyId) {
        clientPageUrl.searchParams.set('agency', agencyId);
    }

    const agencyName = resolveAgencyName();
    if (agencyName) {
        clientPageUrl.searchParams.set('agencyName', agencyName);
    }

    const clientUrl = clientPageUrl.href;
    state.clientUrl = clientUrl;

    // Generate QR code
    state.qrCodeInstance = new QRCode(dom.qrCode, {
        text: clientUrl,
        width: 180,
        height: 180,
        colorDark: '#193366',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    syncQrLightbox();
}

function syncQrLightbox() {
    if (!dom.qrCodeLarge || !state.clientUrl) return;
    dom.qrCodeLarge.innerHTML = '';
    new QRCode(dom.qrCodeLarge, {
        text: state.clientUrl,
        width: 420,
        height: 420,
        colorDark: '#193366',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}

function openQrLightbox() {
    if (!dom.qrLightbox) return;
    syncQrLightbox();
    resetQrLightboxTilt();
    dom.qrLightbox.classList.add('is-open');
    dom.qrLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeQrLightbox() {
    if (!dom.qrLightbox) return;
    dom.qrLightbox.classList.remove('is-open');
    dom.qrLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetQrLightboxTilt();
}

function updateQrLightboxTilt(event) {
    if (!dom.qrLightboxFrame || !dom.qrLightbox?.classList.contains('is-open')) return;

    const rect = dom.qrLightboxFrame.getBoundingClientRect();
    const ratioX = ((event.clientX - rect.left) / rect.width) - 0.5;
    const ratioY = ((event.clientY - rect.top) / rect.height) - 0.5;

    dom.qrLightboxFrame.style.setProperty('--qr-lightbox-tilt-x', `${ratioY * -8}deg`);
    dom.qrLightboxFrame.style.setProperty('--qr-lightbox-tilt-y', `${ratioX * 8}deg`);
    dom.qrLightboxFrame.style.setProperty('--qr-lightbox-x', `${ratioX * 8}px`);
    dom.qrLightboxFrame.style.setProperty('--qr-lightbox-y', `${ratioY * 8}px`);
}

function resetQrLightboxTilt() {
    if (!dom.qrLightboxFrame) return;
    dom.qrLightboxFrame.style.removeProperty('--qr-lightbox-tilt-x');
    dom.qrLightboxFrame.style.removeProperty('--qr-lightbox-tilt-y');
    dom.qrLightboxFrame.style.removeProperty('--qr-lightbox-x');
    dom.qrLightboxFrame.style.removeProperty('--qr-lightbox-y');
}

// ============================================================================
// 5. PeerJS Initialization
// ============================================================================
// Fetch ephemeral Cloudflare TURN credentials.
// Falls back to the hardcoded openrelay servers if the API is unavailable.
// Always fetches from the canonical production URL so that TURN secrets are
// available regardless of whether the advisor is on localhost, a preview
// deployment, or production itself. Preview deployments do not have secrets.
async function fetchTurnCredentials() {
    const turnApiUrl = 'https://okmobility.pages.dev/api/turn-credentials';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TURN_FETCH_TIMEOUT_MS);

    try {
        const response = await fetch(turnApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('HTTP ' + response.status);

        const data = await response.json();

        if (data && data.iceServers) {
            diagLog('Using Cloudflare TURN credentials');
            return buildMergedIceServers(data.iceServers);
        }
    } catch (err) {
        clearTimeout(timeoutId);
        console.warn('Cloudflare TURN unavailable, using fallback:', err.message);
        diagLog('Falling back to static TURN servers because:', err.message);
    }

    diagLog('Using fallback TURN credentials');
    return config.iceServers;
}

async function initializePeer() {
    state.displayCode = generateSessionCode();
    state.sessionCode = config.peerPrefix + state.displayCode;
    
    // Display session code
    dom.sessionCode.textContent = state.displayCode;
    
    // Generate QR code
    generateQRCode(state.displayCode);
    
    // Fetch fresh TURN credentials (falls back to openrelay if unavailable)
    const iceServers = await fetchTurnCredentials();
    diagLog('ICE servers count:', iceServers.length);

    // Create Peer with custom ICE servers
    state.peer = new Peer(state.sessionCode, {
        config: {
            iceServers
        }
    });
    
    // Peer opened successfully
    state.peer.on('open', (id) => {
        console.log('Peer opened with ID:', id);
        updateStatus('waiting');
    });
    
    // Incoming connection from client
    state.peer.on('connection', (conn) => {
        // Only accept one client at a time
        if (state.connection) {
            console.log('Rejecting additional connection - already have a client');
            conn.close();
            return;
        }
        
        console.log('Client connected:', conn.peer);
        diagLog('Incoming connection from client:', conn.peer);
        state.connection = conn;
        updateStatus('connecting');
        
        conn.on('open', () => {
            console.log('Connection opened');
            updateStatus('connected');
            showLiveDataView();
            setTimeout(() => {
                logSelectedCandidatePair(state.connection, 'Selected path after connection open');
            }, 1500);
        });
        
        conn.on('data', (data) => {
            handleIncomingData(data);
        });
        
        conn.on('close', () => {
            console.log('Client disconnected');
            diagLog('Data connection closed');
            handleDisconnection();
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            diagLog('Data connection error:', err?.type || err?.message || err);
            handleDisconnection();
        });
    });
    
    // Peer error handling
    state.peer.on('error', (err) => {
        console.error('Peer error:', err);
        diagLog('Peer error:', err?.type || err?.message || err);
        if (err.type === 'unavailable-id') {
            // ID collision - regenerate
            setTimeout(() => {
                state.peer.destroy();
                initializePeer();
            }, 1000);
        } else {
            updateStatus('error', err.message);
        }
    });
    
    state.peer.on('disconnected', () => {
        console.log('Peer disconnected from server');
        diagLog('Peer disconnected from signaling server, reconnecting');
        // Try to reconnect
        if (state.peer && !state.peer.destroyed) {
            state.peer.reconnect();
        }
    });
}

// ============================================================================
// 6. Status Updates
// ============================================================================
function updateStatus(status, message) {
    const indicator = dom.connectionStatus?.querySelector('.status-indicator');

    if (indicator) {
        indicator.className = 'status-indicator';
    }
    if (dom.btnLinkStatus) {
        dom.btnLinkStatus.classList.remove('connecting', 'connected');
    }
    
    switch (status) {
        case 'waiting':
            if (indicator) {
                indicator.classList.add('waiting');
            }
            if (dom.statusText) {
                dom.statusText.textContent = 'Esperando cliente...';
            }
            break;
        case 'connecting':
            if (indicator) {
                indicator.classList.add('connecting');
            }
            if (dom.statusText) {
                dom.statusText.textContent = 'Conectando cliente...';
            }
            if (dom.btnLinkStatus) {
                dom.btnLinkStatus.classList.add('connecting');
            }
            break;
        case 'connected':
            if (indicator) {
                indicator.classList.add('connected');
            }
            if (dom.statusText) {
                dom.statusText.textContent = 'Cliente conectado';
            }
            if (dom.btnLinkStatus) {
                dom.btnLinkStatus.classList.add('connected');
            }
            break;
        case 'error':
            if (indicator) {
                indicator.classList.add('error');
            }
            if (dom.statusText) {
                dom.statusText.textContent = message || 'Error de conexión';
            }
            break;
    }
}

// ============================================================================
// 7. View Management
// ============================================================================
function showSetupView() {
    dom.setupView.style.display = 'flex';
    dom.liveDataView.style.display = 'none';
    dom.disconnectedView.style.display = 'none';
}

function showLiveDataView() {
    dom.setupView.style.display = 'none';
    dom.liveDataView.style.display = 'flex';
    dom.liveDataView.classList.remove('live-data-entrance');
    void dom.liveDataView.offsetWidth; // force reflow
    dom.liveDataView.classList.add('live-data-entrance');
    dom.disconnectedView.style.display = 'none';
}

function showDisconnectedView() {
    dom.setupView.style.display = 'none';
    dom.liveDataView.style.display = 'none';
    dom.disconnectedView.style.display = 'flex';
}

// ============================================================================
// 8. Dynamic Field Rendering (driven by formSettings.fields)
// ============================================================================

// Sane defaults if formSettings is empty (matches dashboard DEFAULT_FIELDS).
const DEFAULT_RETAILER_FIELDS = [
    { id:'address_block', type:'address_block', icon:'bx-map',      labels:{ fr:'Adresse',   en:'Address',   es:'Dirección',   it:'Indirizzo',   pt:'Endereço',   de:'Adresse',   nl:'Adres'    } },
    { id:'phone',         type:'tel',           icon:'bx-phone',    labels:{ fr:'Téléphone', en:'Phone',     es:'Teléfono',    it:'Telefono',    pt:'Telefone',   de:'Telefon',   nl:'Telefoon' } },
    { id:'email',         type:'email',         icon:'bx-envelope', labels:{ fr:'E-mail',    en:'E-mail',    es:'E-mail',      it:'E-mail',      pt:'E-mail',     de:'E-Mail',    nl:'E-mail'   } }
];

// i18n strings used for sub-labels of address blocks (postal code / city / map)
const I18N_RETAILER = {
    fr: { zipCode:'Code postal', city:'Ville',    country:'Pays',    map:'Carte' },
    en: { zipCode:'Postal code', city:'City',     country:'Country', map:'Map' },
    es: { zipCode:'CP',          city:'Ciudad',   country:'País',    map:'Mapa' },
    it: { zipCode:'CAP',         city:'Città',    country:'Paese',   map:'Mappa' },
    pt: { zipCode:'CEP',         city:'Cidade',   country:'País',    map:'Mapa' },
    de: { zipCode:'PLZ',         city:'Stadt',    country:'Land',    map:'Karte' },
    nl: { zipCode:'Postcode',    city:'Stad',     country:'Land',    map:'Kaart' }
};

function lstr(lang, key) {
    return (I18N_RETAILER[lang] || I18N_RETAILER.es)[key] || key;
}

function fieldLabel(field, lang) {
    return field.labels?.[lang] || field.label || field.id;
}

function makeRow({ key, label, icon, isPhone = false }) {
    const row = document.createElement('div');
    row.className = 'data-row';
    row.id = `row_${key}`;
    row.innerHTML = `
        <div class="data-info">
            <span class="data-label" data-key="${key}">${icon ? `<i class='bx ${icon}'></i> ` : ''}${label}</span>
            <span class="data-value" id="val_${key}">-</span>
            ${isPhone ? `<span class="phone-warning" id="warn_${key}" style="display:none;" title="Formato de número inválido"><i class='bx bx-error-circle'></i></span>` : ''}
        </div>
        <button class="btn-copy" data-field="${key}" title="Copiar"><i class='bx bx-copy'></i></button>
    `;
    return row;
}

function attachCopy(row) {
    const btn = row.querySelector('.btn-copy');
    btn.addEventListener('click', () => {
        const val = row.querySelector('.data-value').textContent;
        if (val && val !== '-') copyToClipboard(val, btn);
    });
}

function registerField(key, row, fieldDef, options = {}) {
    fieldRegistry[key] = {
        row,
        valueEl: row.querySelector('.data-value'),
        labelEl: row.querySelector('.data-label'),
        warningEl: row.querySelector('.phone-warning'),
        fieldDef,
        ...options
    };
}

function renderRetailerFields(fields, lang) {
    // Wipe registries + DOM containers
    Object.keys(fieldRegistry).forEach(k => delete fieldRegistry[k]);
    Object.keys(groupRegistry).forEach(k => delete groupRegistry[k]);
    Object.keys(mapRegistry).forEach(k => {
        const m = mapRegistry[k];
        if (m.mapInstance) m.mapInstance.remove();
        delete mapRegistry[k];
    });
    if (dom.dataFieldsContainer) dom.dataFieldsContainer.innerHTML = '';
    if (dom.mapsContainer) dom.mapsContainer.innerHTML = '';

    const list = (Array.isArray(fields) && fields.length) ? fields : DEFAULT_RETAILER_FIELDS;
    let firstAddressBlockSeen = false;

    function renderOne(field, parentGroupId = null) {
        // ── Address block → 3 rows + dedicated map panel ──────────────
        if (field.type === 'address_block') {
            const isFirst = !firstAddressBlockSeen;
            firstAddressBlockSeen = true;
            const addrKey  = isFirst ? 'address'  : `${field.id}_addr`;
            const zipKey   = isFirst ? 'zipCode'  : `${field.id}_zip`;
            const cityKey  = isFirst ? 'city'     : `${field.id}_city`;
            const ctryKey  = isFirst ? 'country'  : null;

            const blockHeader = fieldLabel(field, lang);
            const rowAddr = makeRow({ key: addrKey, label: blockHeader, icon: field.icon || 'bx-map' });
            const rowZip  = makeRow({ key: zipKey,  label: lstr(lang, 'zipCode') });
            const rowCity = makeRow({ key: cityKey, label: lstr(lang, 'city') });

            attachCopy(rowAddr); attachCopy(rowZip); attachCopy(rowCity);
            registerField(addrKey, rowAddr, field, { parentGroupId, isAddressKey: true });
            registerField(zipKey,  rowZip,  field, { parentGroupId });
            registerField(cityKey, rowCity, field, { parentGroupId });

            const target = parentGroupId ? groupRegistry[parentGroupId].innerEl : dom.dataFieldsContainer;
            target.appendChild(rowAddr); target.appendChild(rowZip); target.appendChild(rowCity);

            if (ctryKey) {
                const rowCtry = makeRow({ key: ctryKey, label: lstr(lang, 'country') });
                attachCopy(rowCtry);
                registerField(ctryKey, rowCtry, field, { parentGroupId });
                target.appendChild(rowCtry);
            }

            // Map panel for this address block
            const mapColor = isFirst ? '#3B82F6' : '#8B5CF6';
            const mapWrap = document.createElement('div');
            mapWrap.className = 'glass-panel map-col-panel';
            mapWrap.id = `mapWrapper_${addrKey}`;
            mapWrap.innerHTML = `
                <div class="map-col-header">
                    <i class='bx ${field.icon || 'bx-map-alt'}'></i>
                    <span class="map-section-label">${blockHeader}</span>
                </div>
                <div class="address-map-wrapper temp-standalone-map">
                    <div id="map_${addrKey}" class="address-map-container"></div>
                    <div class="address-map-overlay">
                        <i class='bx ${field.icon || 'bx-map-alt'}'></i>
                        <span class="address-map-overlay-text" id="mapLbl_${addrKey}"></span>
                        <button class="address-map-expand-btn" data-map-key="${addrKey}" aria-label="Agrandir la carte">
                            <i class='bx bx-fullscreen'></i>
                        </button>
                    </div>
                </div>
            `;
            if (dom.mapsContainer) dom.mapsContainer.appendChild(mapWrap);

            mapRegistry[addrKey] = {
                wrapper: mapWrap,
                mapEl: mapWrap.querySelector(`#map_${addrKey}`),
                labelEl: mapWrap.querySelector(`#mapLbl_${addrKey}`),
                sectionLabelEl: mapWrap.querySelector('.map-section-label'),
                fieldDef: field,
                expandBtn: mapWrap.querySelector('.address-map-expand-btn'),
                mapInstance: null,
                marker: null,
                addrKey, zipKey, cityKey, ctryKey,
                color: mapColor,
                debounceTimer: null
            };

            mapRegistry[addrKey].expandBtn.addEventListener('click', e => {
                e.stopPropagation();
                openMapLightbox(addrKey);
            });

        // ── Toggle group → header + collapsible inner area ────────────
        } else if (field.type === 'toggle_group') {
            const wrap = document.createElement('div');
            wrap.className = 'data-group-wrap';
            wrap.id = `group_${field.id}`;

            const header = document.createElement('div');
            header.className = 'data-group-header';
            header.innerHTML = `
                <span class="data-group-icon"><i class='bx ${field.icon || 'bx-list-plus'}'></i></span>
                <span class="data-group-label" data-key="${field.id}">${fieldLabel(field, lang)}</span>
                <span class="data-group-state"><i class='bx bx-chevron-down'></i></span>
            `;
            const slidingSec = document.createElement('div');
            slidingSec.className = 'data-group-sliding';
            const innerEl = document.createElement('div');
            innerEl.className = 'data-group-inner';
            slidingSec.appendChild(innerEl);
            wrap.appendChild(header);
            wrap.appendChild(slidingSec);

            const target = parentGroupId ? groupRegistry[parentGroupId].innerEl : dom.dataFieldsContainer;
            target.appendChild(wrap);

            groupRegistry[field.id] = {
                wrap, header, slidingSec, innerEl,
                labelEl: header.querySelector('.data-group-label'),
                fieldDef: field,
                visible: false,
                childKeys: []
            };

            (field.children || []).forEach(child => renderOne(child, field.id));

        // ── Standard scalar field ─────────────────────────────────────
        } else {
            const isPhone = field.type === 'tel';
            const row = makeRow({
                key: field.id,
                label: fieldLabel(field, lang),
                icon: field.icon || (isPhone ? 'bx-phone' : (field.type === 'email' ? 'bx-envelope' : ''))
            , isPhone });
            attachCopy(row);
            registerField(field.id, row, field, { parentGroupId, isPhone });
            const target = parentGroupId ? groupRegistry[parentGroupId].innerEl : dom.dataFieldsContainer;
            target.appendChild(row);
            if (parentGroupId) groupRegistry[parentGroupId].childKeys.push(field.id);
        }
    }

    list.forEach(f => renderOne(f, null));
    renderedLang = lang;
    updateMapsColumnVisibility();
}

function updateRetailerLabels(lang) {
    // Re-paint labels without rebuilding the structure.
    const fields = (Array.isArray(window.OKM_FORM_SETTINGS?.fields) && window.OKM_FORM_SETTINGS.fields.length)
        ? window.OKM_FORM_SETTINGS.fields
        : DEFAULT_RETAILER_FIELDS;

    function walk(field) {
        if (field.type === 'address_block') {
            // Find the addr key in fieldRegistry: try canonical first, then prefixed.
            const candidates = ['address', `${field.id}_addr`];
            const addrKey = candidates.find(k => fieldRegistry[k]);
            if (!addrKey) return;
            const r = fieldRegistry[addrKey];
            if (r.labelEl) r.labelEl.innerHTML = `<i class='bx ${field.icon || 'bx-map'}'></i> ${fieldLabel(field, lang)}`;

            const zipKey  = addrKey === 'address' ? 'zipCode' : `${field.id}_zip`;
            const cityKey = addrKey === 'address' ? 'city'    : `${field.id}_city`;
            const ctryKey = addrKey === 'address' ? 'country' : null;
            if (fieldRegistry[zipKey])  fieldRegistry[zipKey].labelEl.textContent  = lstr(lang, 'zipCode');
            if (fieldRegistry[cityKey]) fieldRegistry[cityKey].labelEl.textContent = lstr(lang, 'city');
            if (ctryKey && fieldRegistry[ctryKey]) fieldRegistry[ctryKey].labelEl.textContent = lstr(lang, 'country');

            const m = mapRegistry[addrKey];
            if (m?.sectionLabelEl) m.sectionLabelEl.textContent = fieldLabel(field, lang);
        } else if (field.type === 'toggle_group') {
            const g = groupRegistry[field.id];
            if (g?.labelEl) g.labelEl.textContent = fieldLabel(field, lang);
            (field.children || []).forEach(walk);
        } else {
            const r = fieldRegistry[field.id];
            if (r?.labelEl) {
                const ic = field.icon ? `<i class='bx ${field.icon}'></i> ` : '';
                r.labelEl.innerHTML = `${ic}${fieldLabel(field, lang)}`;
            }
        }
    }
    fields.forEach(walk);
    renderedLang = lang;
}

// ============================================================================
// 8b. Incoming Data Handling
// ============================================================================
function handleIncomingData(data) {
    const cleanData = sanitizeIncomingData(data);
    if (!Object.keys(cleanData).length) return;

    // Compatibility: accept legacy combined `phone` value (no separate dial code)
    if ((cleanData.phoneCode === undefined || cleanData.phoneNumber === undefined) && cleanData.phone) {
        const parsed = splitPhoneParts(cleanData.phone);
        if (cleanData.phoneCode === undefined && parsed.phoneCode) cleanData.phoneCode = parsed.phoneCode;
        if (cleanData.phoneNumber === undefined && parsed.phoneNumber) cleanData.phoneNumber = parsed.phoneNumber;
    }

    state.currentData = { ...state.currentData, ...cleanData };

    if (cleanData.language && languageNames[cleanData.language]) {
        setRemoteLanguage(cleanData.language, false);
    }

    // ── Toggle group visibility flags ── client sends `_visible_<groupId>` or
    //    legacy `hasTempAddress`/`chk_<id>`.
    Object.keys(cleanData).forEach(k => {
        let groupId = null;
        if (k === 'hasTempAddress') groupId = findGroupForLegacyTemp();
        else if (k.startsWith('_visible_')) groupId = k.slice(9);
        else if (k.startsWith('chk_'))      groupId = k.slice(4);
        if (groupId && groupRegistry[groupId]) {
            setGroupVisible(groupId, !!cleanData[k]);
        }
    });

    // ── Update each known field by key ─────────────────────────────
    Object.keys(cleanData).forEach(key => {
        if (key === 'language' || key === 'hasTempAddress' || key.startsWith('_visible_') || key.startsWith('chk_')) return;

        // Phone (combined) — split & route to phoneCode/phoneNumber
        if (key === 'phone' && (cleanData.phoneCode !== undefined || cleanData.phoneNumber !== undefined)) return;

        // Try direct match first
        let reg = fieldRegistry[key];

        // If no registered field but key looks like a custom_* one, register a new row
        if (!reg && key.startsWith('custom_')) {
            reg = registerAdHocCustomField(key, cleanData.language || renderedLang);
        }
        if (!reg) return;

        const value = cleanData[key];
        reg.valueEl.textContent = (value === '' || value === null || value === undefined) ? '-' : value;
        flashHighlight(reg.valueEl);

        // Phone validation warning
        if (reg.isPhone && reg.warningEl) {
            updatePhoneWarning(reg.warningEl, '', value);
        }
        // phoneCode → re-evaluate phone warning
        if (key === 'phoneCode') {
            const phoneReg = fieldRegistry['phoneNumber'] || fieldRegistry['phone'];
            if (phoneReg?.warningEl) {
                const num = state.currentData.phoneNumber || state.currentData.phone || '';
                updatePhoneWarning(phoneReg.warningEl, value || '', num);
            }
        }
        if (key === 'phoneNumber' && reg.warningEl) {
            updatePhoneWarning(reg.warningEl, state.currentData.phoneCode || '', value);
        }
    });

    // ── Refresh maps for each address_block whose fields changed ──
    Object.keys(mapRegistry).forEach(addrKey => {
        const m = mapRegistry[addrKey];
        const watched = [m.addrKey, m.zipKey, m.cityKey, m.ctryKey].filter(Boolean);
        if (watched.some(k => cleanData[k] !== undefined)) scheduleMapRefresh(addrKey);
    });
}

function findGroupForLegacyTemp() {
    // Best-effort: legacy clients send hasTempAddress for any "temporary address" group.
    // We pick the first toggle_group containing an address_block child.
    const ids = Object.keys(groupRegistry);
    return ids.find(id => {
        const f = groupRegistry[id].fieldDef;
        return (f.children || []).some(c => c.type === 'address_block');
    }) || null;
}

function setGroupVisible(groupId, visible) {
    const g = groupRegistry[groupId];
    if (!g || g.visible === visible) return;
    g.visible = visible;
    g.slidingSec.classList.toggle('expanded', visible);
    g.wrap.classList.toggle('active', visible);
}

function registerAdHocCustomField(key, lang) {
    // Look up a label from formSettings if available; otherwise prettify the key.
    const formFields = window.OKM_FORM_SETTINGS?.fields || [];
    let foundDef = null;
    function walk(arr) { arr.forEach(f => { if (f.id === key) foundDef = f; if (f.children) walk(f.children); }); }
    walk(formFields);
    const label = foundDef ? fieldLabel(foundDef, lang) : key.replace('custom_', '').replace(/_/g, ' ');
    const icon  = foundDef?.icon || 'bx-edit-alt';
    const row = makeRow({ key, label, icon, isPhone: foundDef?.type === 'tel' });
    attachCopy(row);
    registerField(key, row, foundDef || { id: key, type: 'text' });
    if (dom.dataFieldsContainer) dom.dataFieldsContainer.appendChild(row);
    return fieldRegistry[key];
}

function flashHighlight(el) {
    if (!el) return;
    el.classList.remove('highlight');
    void el.offsetWidth;
    el.classList.add('highlight');
}

function highlightField(fieldId) {
    flashHighlight(document.getElementById(fieldId));
}

// ============================================================================
// 9. Disconnection Handling
// ============================================================================
function handleDisconnection() {
    state.connection = null;

    if (state.isManualDisconnect) {
        state.isManualDisconnect = false;
        clearDisplayedData();
        // Destroy the old peer so the previous code becomes unreachable,
        // then spin up a new peer with a fresh session code.
        if (state.peer) {
            state.peer.destroy();
            state.peer = null;
        }
        showSetupView();
        initializePeer();
        return;
    }

    showDisconnectedView();
}

function disconnectCurrentClient() {
    if (!hasActiveClientConnection()) {
        showSellerActionError('No hay conexión establecida. No se puede cortar la conexión.');
        return;
    }

    state.isManualDisconnect = true;

    try {
        state.connection.close();
    } catch (err) {
        console.error('Failed to disconnect current client:', err);
        state.isManualDisconnect = false;
        state.connection = null;
        clearDisplayedData();
        if (state.peer) { state.peer.destroy(); state.peer = null; }
        showSetupView();
        initializePeer();
    }
}

function clearDisplayedData() {
    state.currentData = {};

    // Reset every registered value cell
    Object.values(fieldRegistry).forEach(reg => {
        if (reg.valueEl) reg.valueEl.textContent = '-';
        if (reg.warningEl) reg.warningEl.style.display = 'none';
    });

    // Collapse all toggle groups
    Object.keys(groupRegistry).forEach(id => setGroupVisible(id, false));

    // Hide every map and remove markers
    Object.keys(mapRegistry).forEach(addrKey => hideMap(addrKey));
}

function clearSessionData() {
    clearDisplayedData();

    if (state.connection && state.connection.open) {
        try {
            state.connection.send({ type: 'reset-form' });
        } catch (err) {
            console.error('Failed to send reset command to client:', err);
        }
    }

    if (state.connection && state.connection.open) {
        showLiveDataView();
        return;
    }

    if (state.peer && !state.peer.destroyed) {
        showSetupView();
        updateStatus('waiting');
        return;
    }

    showDisconnectedView();
}

function restartSession() {
    // Clean up existing peer
    if (state.peer) {
        state.peer.destroy();
    }
    state.connection = null;
    clearDisplayedData();
    
    // Show setup and reinitialize
    showSetupView();
    initializePeer();
}

// ============================================================================
// 10. Address Maps (MapLibre GL — one instance per address_block)
// ============================================================================
let agencyCenter = null;        // [lon, lat] — geocoded from agencyAddress after license gate
const mapHasClientAddr = {};    // addrKey → boolean (true once the map has flown to a real client address)

function preloadMapTiles(center) {
    const token = window.BRAND?.maps?.jawgToken ?? '';
    if (!token) return;

    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;height:280px;pointer-events:none;';
    document.body.appendChild(div);

    const preload = new maplibregl.Map({
        container: div,
        style: `https://api.jawg.io/styles/jawg-streets.json?access-token=${token}`,
        zoom: 13,
        center,
        interactive: false,
        attributionControl: false,
        trackResize: false
    });

    preload.once('idle', () => {
        preload.remove();
        div.remove();
    });
}

function ensureMapInstance(addrKey) {
    const m = mapRegistry[addrKey];
    if (!m || m.mapInstance) return;
    const token = window.BRAND?.maps?.jawgToken ?? '';
    m.mapInstance = new maplibregl.Map({
        container: m.mapEl,
        style: `https://api.jawg.io/styles/jawg-streets.json?access-token=${token}`,
        zoom: 13,
        center: agencyCenter ?? [2.3522, 48.8566],
        scrollZoom: false,
        attributionControl: true,
        trackResize: false
    });
    const ro = new ResizeObserver(() => {
        if (m.mapEl.offsetWidth > 0 && m.mapEl.offsetHeight > 0) m.mapInstance.resize();
    });
    ro.observe(m.mapEl);
}

async function geocode(query) {
    if (!query || query.length < 5) return null;
    const token = window.BRAND?.maps?.jawgToken ?? '';
    try {
        const params = new URLSearchParams({ text: query, size: 1, lang: 'fr', 'access-token': token });
        const resp = await fetch(`https://api.jawg.io/places/v1/search?${params}`);
        if (!resp.ok) return null;
        const data = await resp.json();
        const f = data.features?.[0];
        if (!f) return null;
        const [lon, lat] = f.geometry.coordinates;
        return { lat, lon };
    } catch (_) { return null; }
}

function buildMapQuery(addrKey) {
    const m = mapRegistry[addrKey];
    if (!m) return '';
    const data = state.currentData;
    return [
        data[m.addrKey], data[m.zipKey], data[m.cityKey], m.ctryKey ? data[m.ctryKey] : null
    ].filter(Boolean).join(', ');
}

async function refreshMap(addrKey) {
    const m = mapRegistry[addrKey];
    if (!m) return;
    const data = state.currentData;

    // If the parent toggle group is collapsed, hide the map
    const parent = m.fieldDef ? findGroupContainingField(m.fieldDef) : null;
    if (parent && !groupRegistry[parent]?.visible) { hideMap(addrKey); return; }

    const addrVal = data[m.addrKey];
    if (!addrVal) { hideMap(addrKey); return; }
    const query = buildMapQuery(addrKey);
    if (!query) { hideMap(addrKey); return; }

    const coords = await geocode(query);
    if (!coords) { hideMap(addrKey); return; }

    showMap(addrKey);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    ensureMapInstance(addrKey);
    mapHasClientAddr[addrKey] = true;

    if (m.labelEl) {
        m.labelEl.textContent = [data[m.addrKey], data[m.zipKey], data[m.cityKey]].filter(Boolean).join(', ');
    }

    if (m.marker) { m.marker.remove(); m.marker = null; }
    m.marker = new maplibregl.Marker({ color: m.color })
        .setLngLat([coords.lon, coords.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(
            `<strong>${addrVal}</strong><br>${[data[m.zipKey], data[m.cityKey], m.ctryKey ? data[m.ctryKey] : ''].filter(Boolean).join(', ')}`
        ))
        .addTo(m.mapInstance);

    function doView() {
        m.mapInstance.stop();
        m.mapInstance.flyTo({ center: [coords.lon, coords.lat], zoom: 15 });
    }
    if (m.mapInstance.loaded()) doView(); else m.mapInstance.once('load', doView);
}

function findGroupContainingField(fieldDef) {
    return Object.keys(groupRegistry).find(id =>
        (groupRegistry[id].fieldDef.children || []).some(c => c === fieldDef || c.id === fieldDef.id)
    );
}

function showMap(addrKey) {
    const m = mapRegistry[addrKey];
    if (!m) return;
    m.wrapper.classList.add('map-visible');
    updateMapsColumnVisibility();
}

function hideMap(addrKey) {
    const m = mapRegistry[addrKey];
    if (!m) return;
    m.wrapper.classList.remove('map-visible');
    if (m.marker) { m.marker.remove(); m.marker = null; }
    mapHasClientAddr[addrKey] = false;
    updateMapsColumnVisibility();
}

function updateMapsColumnVisibility() {
    const col = dom.mapsContainer;
    if (!col) return;
    const anyVisible = Object.keys(mapRegistry).some(k => mapRegistry[k].wrapper.classList.contains('map-visible'));
    col.classList.toggle('has-map', anyVisible);
}

function scheduleMapRefresh(addrKey) {
    const m = mapRegistry[addrKey];
    if (!m) return;
    clearTimeout(m.debounceTimer);
    m.debounceTimer = setTimeout(() => refreshMap(addrKey), 900);
}

// ── Map lightbox (shared, opens a clone of any map) ────────────────
let mapLightboxInstance = null;

function openMapLightbox(addrKey) {
    const m = mapRegistry[addrKey];
    if (!dom.mapLightbox || !m?.mapInstance) return;
    const token  = window.BRAND?.maps?.jawgToken ?? '';
    const center = m.mapInstance.getCenter();
    const zoom   = m.mapInstance.getZoom();

    const dst = document.getElementById('mapLightboxLabel');
    if (dst && m.labelEl) dst.textContent = m.labelEl.textContent;

    dom.mapLightbox.classList.add('is-open');
    dom.mapLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    mapLightboxInstance = new maplibregl.Map({
        container: 'addressMapLarge',
        style: `https://api.jawg.io/styles/jawg-streets.json?access-token=${token}`,
        center: [center.lng, center.lat],
        zoom,
        scrollZoom: true
    });

    if (m.marker) {
        new maplibregl.Marker({ color: m.color })
            .setLngLat(m.marker.getLngLat())
            .addTo(mapLightboxInstance);
    }
}

function closeMapLightbox() {
    if (!dom.mapLightbox) return;
    dom.mapLightbox.classList.remove('is-open');
    dom.mapLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (mapLightboxInstance) { mapLightboxInstance.remove(); mapLightboxInstance = null; }
}

// ============================================================================
// 11. Copy Functions
// ============================================================================
function copyToClipboard(text, buttonEl) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const icon = buttonEl.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'bx bx-check';
        buttonEl.classList.add('copied');
        
        setTimeout(() => {
            icon.className = originalClass;
            buttonEl.classList.remove('copied');
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function copyAllData() {
    // Walk the DOM in displayed order so the export reflects the configured layout.
    if (!dom.dataFieldsContainer) return '';
    const lines = [];
    dom.dataFieldsContainer.querySelectorAll('.data-row').forEach(row => {
        const labelEl = row.querySelector('.data-label');
        const valueEl = row.querySelector('.data-value');
        if (!labelEl || !valueEl) return;
        // Skip rows inside collapsed groups
        const groupWrap = row.closest('.data-group-wrap');
        if (groupWrap && !groupWrap.classList.contains('active')) return;
        const value = valueEl.textContent.trim();
        if (!value || value === '-') return;
        lines.push(`${labelEl.textContent.trim().replace(/\s+/g, ' ')}: ${value}`);
    });
    return lines.join('\n');
}

// ============================================================================
// 11. Event Listeners
// ============================================================================

// Copy session code
dom.btnCopyCode.addEventListener('click', () => {
    copyToClipboard(state.displayCode, dom.btnCopyCode);
});

if (dom.qrCodeFrame) {
    dom.qrCodeFrame.addEventListener('click', openQrLightbox);
    dom.qrCodeFrame.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openQrLightbox();
        }
    });
}

if (dom.qrLightbox) {
    dom.qrLightbox.addEventListener('click', closeQrLightbox);
    document.addEventListener('pointermove', updateQrLightboxTilt);
}

if (dom.qrLightboxFrame) {
    dom.qrLightboxFrame.addEventListener('click', closeQrLightbox);
}

// Map lightbox close handlers (the open handlers are wired per-map row at render time)
if (dom.mapLightbox) {
    dom.mapLightbox.querySelector('.map-lightbox-backdrop')?.addEventListener('click', closeMapLightbox);
}
if (dom.mapLightboxCloseBtn) {
    dom.mapLightboxCloseBtn.addEventListener('click', e => { e.stopPropagation(); closeMapLightbox(); });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeQrLightbox();
        closeMapLightbox();
    }
});

// Copy all data
dom.btnCopyAll.addEventListener('click', () => {
    const allData = copyAllData();
    if (allData) copyToClipboard(allData, dom.btnCopyAll);
});

// New session / Restart buttons
dom.btnLinkStatus.addEventListener('click', disconnectCurrentClient);
dom.btnNewSession.addEventListener('click', clearSessionData);
dom.btnRestart.addEventListener('click', restartSession);
dom.langSelect.addEventListener('mousedown', guardLanguageSelectorInteraction);
dom.langSelect.addEventListener('touchstart', guardLanguageSelectorInteraction, { passive: false });
dom.langSelect.addEventListener('keydown', (event) => {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        guardLanguageSelectorInteraction(event);
    }
});
dom.langSelect.addEventListener('change', (e) => {
    if (!hasActiveClientConnection()) {
        if (dom.langSelect) {
            dom.langSelect.value = state.lang;
        }
        showSellerActionError('No hay conexión establecida. No se puede cambiar el idioma del cliente.');
        return;
    }

    setRemoteLanguage(e.target.value);
});

// ============================================================================
// 12. Initialize — License gate runs first, then PeerJS
// ============================================================================
setRemoteLanguage(state.lang, false);

if (typeof window.runLicenseGate === 'function') {
    window.runLicenseGate()
        .then(agencyId => {
            // Keep agency context available for QR URL generation.
            window._okmAgencyId = agencyId;

            // Display the agency name in the advisor header if known.
            const cached = (() => {
                try {
                    const raw = localStorage.getItem('okm_lic_' + agencyId);
                    return raw ? JSON.parse(raw) : null;
                } catch {
                    return null;
                }
            })();

            const agencyName = cached?.agencyName || '';
            if (agencyName) {
                const slogan = document.querySelector('.brand-slogan');
                if (slogan) {
                    slogan.textContent = agencyName;
                    slogan.title = agencyName;
                }
            }

            // ── Agency address → default map center ──────────────────────────
            const agencyAddress = cached?.agencyAddress || null;
            if (agencyAddress) {
                const SESSION_KEY = 'okm_agency_center_' + agencyId;
                const cachedCenter = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
                if (cachedCenter) {
                    agencyCenter = cachedCenter;
                    preloadMapTiles(agencyCenter);
                } else {
                    geocode(agencyAddress).then(coords => {
                        if (coords) {
                            agencyCenter = [coords.lon, coords.lat];
                            try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(agencyCenter)); } catch (_) {}
                            preloadMapTiles(agencyCenter);
                            // For each registered map that hasn't shown a client address yet, recenter on agency
                            Object.keys(mapRegistry).forEach(addrKey => {
                                const m = mapRegistry[addrKey];
                                if (m.mapInstance && !mapHasClientAddr[addrKey]) {
                                    m.mapInstance.jumpTo({ center: agencyCenter });
                                }
                            });
                        }
                    });
                }
            } else {
                preloadMapTiles([2.3522, 48.8566]); // Paris fallback
            }

            // ── Agency language → pre-select language selector ───────────────
            const agencyLanguage = cached?.agencyLanguage || null;
            if (agencyLanguage && dom.langSelect) {
                const validLangs = ['en', 'fr', 'es', 'it', 'pt', 'de', 'nl'];
                if (validLangs.includes(agencyLanguage)) {
                    dom.langSelect.value = agencyLanguage;
                    state.lang = agencyLanguage;
                    if (dom.langDisplay) dom.langDisplay.textContent = languageNames[agencyLanguage] || agencyLanguage;
                }
            }
            // ─────────────────────────────────────────────────────────────────

            // ── Render the data-display column from formSettings ────────────
            const formSettings = window.OKM_FORM_SETTINGS || cached?.formSettings || {};
            window.OKM_FORM_SETTINGS = formSettings;
            renderRetailerFields(formSettings.fields, state.lang);

            initializePeer();
        })
        .catch(reason => {
            // Gate blocked — do NOT initializePeer
            console.warn('[OKM] License gate blocked startup:', reason);
        });
} else {
    // Fallback — gate script not loaded (should not happen in prod)
    renderRetailerFields(window.OKM_FORM_SETTINGS?.fields, state.lang);
    initializePeer();
}
