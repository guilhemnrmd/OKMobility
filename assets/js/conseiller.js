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
    tempMapDebounceTimer: null,
    summaryConfirmed: false,
    summaryCountdownTimer: null
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
    // Data values
    lblDataAddress: document.getElementById('lblDataAddress'),
    valAddress: document.getElementById('valAddress'),
    lblDataCountry: document.getElementById('lblDataCountry'),
    valCountry: document.getElementById('valCountry'),
    lblDataZipCode: document.getElementById('lblDataZipCode'),
    valZipCode: document.getElementById('valZipCode'),
    lblDataCity: document.getElementById('lblDataCity'),
    valCity: document.getElementById('valCity'),
    lblDataTempAddress: document.getElementById('lblDataTempAddress'),
    valTempAddress: document.getElementById('valTempAddress'),
    lblDataTempZipCode: document.getElementById('lblDataTempZipCode'),
    valTempZipCode: document.getElementById('valTempZipCode'),
    lblDataTempCity: document.getElementById('lblDataTempCity'),
    valTempCity: document.getElementById('valTempCity'),
    lblDataPhoneCode: document.getElementById('lblDataPhoneCode'),
    valPhoneCode: document.getElementById('valPhoneCode'),
    lblDataPhone: document.getElementById('lblDataPhone'),
    valPhone: document.getElementById('valPhone'),
    phoneWarning: document.getElementById('phoneWarning'),
    // Second phone
    lblDataPhone2Code: document.getElementById('lblDataPhone2Code'),
    valPhone2Code: document.getElementById('valPhone2Code'),
    lblDataPhone2: document.getElementById('lblDataPhone2'),
    valPhone2: document.getElementById('valPhone2'),
    phone2Warning: document.getElementById('phone2Warning'),
    lblDataEmail: document.getElementById('lblDataEmail'),
    valEmail: document.getElementById('valEmail'),
    // Rows (for showing/hiding temp address)
    rowTempAddress: document.getElementById('rowTempAddress'),
    rowTempZipCode: document.getElementById('rowTempZipCode'),
    rowTempCity: document.getElementById('rowTempCity'),
    rowPhone2: document.getElementById('rowPhone2'),
    rowPhone2Number: document.getElementById('rowPhone2Number')
};

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

    Object.keys(incomingDataLimits).forEach((key) => {
        if (key in data) {
            clean[key] = sanitizeText(data[key], incomingDataLimits[key]);
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
// 8. Data Handling
// ============================================================================
function handleIncomingData(data) {
    if (data && data.type === 'summary-confirmed') {
        state.summaryConfirmed = true;
        return;
    }

    const cleanData = sanitizeIncomingData(data);
    if (!Object.keys(cleanData).length) return;

    if ((cleanData.phoneCode === undefined || cleanData.phoneNumber === undefined) && cleanData.phone) {
        const parsed = splitPhoneParts(cleanData.phone);
        if (cleanData.phoneCode === undefined && parsed.phoneCode) {
            cleanData.phoneCode = parsed.phoneCode;
        }
        if (cleanData.phoneNumber === undefined && parsed.phoneNumber) {
            cleanData.phoneNumber = parsed.phoneNumber;
        }
    }

    state.currentData = { ...state.currentData, ...cleanData };

    if (cleanData.language && languageNames[cleanData.language]) {
        setRemoteLanguage(cleanData.language, false);
    }
    
    // Update displayed values
    // Trigger map refresh when relevant address fields change (separate timers per map)
    const mainAddrFields = ['address', 'country', 'zipCode', 'city'];
    const tempAddrFields = ['tempAddress', 'tempZipCode', 'tempCity', 'hasTempAddress'];
    if (mainAddrFields.some(k => cleanData[k] !== undefined)) {
        scheduleMainMapRefresh();
    }
    if (tempAddrFields.some(k => cleanData[k] !== undefined)) {
        scheduleTempMapRefresh();
    }

    if (cleanData.address !== undefined) {
        dom.valAddress.textContent = cleanData.address || '-';
        highlightField('valAddress');
    }

    if (cleanData.country !== undefined) {
        dom.valCountry.textContent = cleanData.country || '-';
        highlightField('valCountry');
    }

    if (cleanData.zipCode !== undefined) {
        dom.valZipCode.textContent = cleanData.zipCode || '-';
        highlightField('valZipCode');
    }

    if (cleanData.city !== undefined) {
        dom.valCity.textContent = cleanData.city || '-';
        highlightField('valCity');
    }
    
    // Handle temporary address visibility with expand animation
    if (cleanData.hasTempAddress !== undefined) {
        const show = cleanData.hasTempAddress;
        [dom.rowTempAddress, dom.rowTempZipCode, dom.rowTempCity].forEach(el => {
            if (show) {
                el.classList.add('row-expanded');
            } else {
                el.classList.remove('row-expanded');
            }
        });
    }

    if (cleanData.tempAddress !== undefined) {
        dom.valTempAddress.textContent = cleanData.tempAddress || '-';
        highlightField('valTempAddress');
    }

    if (cleanData.tempZipCode !== undefined) {
        dom.valTempZipCode.textContent = cleanData.tempZipCode || '-';
        highlightField('valTempZipCode');
    }

    if (cleanData.tempCity !== undefined) {
        dom.valTempCity.textContent = cleanData.tempCity || '-';
        highlightField('valTempCity');
    }
    
    if (cleanData.phoneCode !== undefined) {
        dom.valPhoneCode.textContent = cleanData.phoneCode || '-';
        highlightField('valPhoneCode');
    }

    if (cleanData.phoneNumber !== undefined) {
        dom.valPhone.textContent = cleanData.phoneNumber || '-';
        highlightField('valPhone');
        const dialCode = state.currentData.phoneCode || '';
        updatePhoneWarning(dom.phoneWarning, dialCode, cleanData.phoneNumber);
    }

    if (cleanData.phoneCode !== undefined && cleanData.phoneNumber === undefined) {
        // dial code changed — re-evaluate warning with existing number
        const number = state.currentData.phoneNumber || '';
        updatePhoneWarning(dom.phoneWarning, cleanData.phoneCode, number);
    }

    if (cleanData.phone2Code !== undefined || cleanData.phone2Number !== undefined) {
        const hasPhone2 = (cleanData.phone2Code || state.currentData.phone2Code || '') || (cleanData.phone2Number || state.currentData.phone2Number || '');
        if (dom.rowPhone2) dom.rowPhone2.classList.toggle('row-expanded', !!hasPhone2);
        if (dom.rowPhone2Number) dom.rowPhone2Number.classList.toggle('row-expanded', !!hasPhone2);
        if (cleanData.phone2Code !== undefined) {
            dom.valPhone2Code.textContent = cleanData.phone2Code || '-';
            highlightField('valPhone2Code');
        }
        if (cleanData.phone2Number !== undefined) {
            dom.valPhone2.textContent = cleanData.phone2Number || '-';
            highlightField('valPhone2');
        }
        const dial2 = cleanData.phone2Code ?? state.currentData.phone2Code ?? '';
        const num2 = cleanData.phone2Number ?? state.currentData.phone2Number ?? '';
        updatePhoneWarning(dom.phone2Warning, dial2, num2);
    }

    if (cleanData.email !== undefined) {
        dom.valEmail.textContent = cleanData.email || '-';
        highlightField('valEmail');
    }
}

function highlightField(fieldId) {
    const el = document.getElementById(fieldId);
    if (el) {
        el.classList.remove('highlight');
        // Trigger reflow to restart animation
        void el.offsetWidth;
        el.classList.add('highlight');
    }
}

// ============================================================================
// 9. Disconnection Handling
// ============================================================================
const SUMMARY_PERSIST_MS = 5 * 60 * 1000; // 5 minutes

function startSummaryCountdown() {
    const banner = document.getElementById('summaryCountdownBanner');
    const valueEl = document.getElementById('summaryCountdownValue');
    if (!banner || !valueEl) return;

    let remaining = SUMMARY_PERSIST_MS;
    banner.style.display = 'flex';

    function tick() {
        remaining -= 1000;
        if (remaining <= 0) {
            endSummaryCountdown();
            showDisconnectedView();
            return;
        }
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        valueEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }

    tick();
    state.summaryCountdownTimer = setInterval(tick, 1000);
}

function endSummaryCountdown() {
    if (state.summaryCountdownTimer) {
        clearInterval(state.summaryCountdownTimer);
        state.summaryCountdownTimer = null;
    }
    const banner = document.getElementById('summaryCountdownBanner');
    if (banner) banner.style.display = 'none';
    state.summaryConfirmed = false;
}

function handleDisconnection() {
    state.connection = null;

    if (state.isManualDisconnect) {
        state.isManualDisconnect = false;
        endSummaryCountdown();
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

    if (state.summaryConfirmed) {
        startSummaryCountdown();
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
    dom.valAddress.textContent = '-';
    dom.valCountry.textContent = '-';
    dom.valZipCode.textContent = '-';
    dom.valCity.textContent = '-';
    dom.valTempAddress.textContent  = '-';
    dom.valTempZipCode.textContent  = '-';
    dom.valTempCity.textContent     = '-';
    dom.valPhoneCode.textContent = '-';
    dom.valPhone.textContent = '-';
    if (dom.phoneWarning) dom.phoneWarning.style.display = 'none';
    if (dom.valPhone2Code) dom.valPhone2Code.textContent = '-';
    if (dom.valPhone2) dom.valPhone2.textContent = '-';
    if (dom.phone2Warning) dom.phone2Warning.style.display = 'none';
    dom.valEmail.textContent = '-';
    dom.rowTempAddress.classList.remove('row-expanded');
    dom.rowTempZipCode.classList.remove('row-expanded');
    dom.rowTempCity.classList.remove('row-expanded');
    if (dom.rowPhone2) dom.rowPhone2.classList.remove('row-expanded');
    if (dom.rowPhone2Number) dom.rowPhone2Number.classList.remove('row-expanded');
    hideAddressMap();
    hideTempAddressMap();
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
    endSummaryCountdown();
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
// 10. Address Map (MapLibre GL + JawgMaps vector tiles + Places geocoding)
// ============================================================================
let mapInstance = null;
let mainMarker  = null;
let agencyCenter = null;       // [lon, lat] — geocoded from agencyAddress after license gate
let mapHasClientAddress = false; // true once the map has flown to a real client address

let tempMapInstance = null;
let tempMapMarker   = null;

function preloadMapTiles(center) {
    const token = window.BRAND?.maps?.jawgToken ?? '';
    if (!token || mapInstance) return; // skip if map already created

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

function ensureMap() {
    if (mapInstance) return;
    const token = window.BRAND?.maps?.jawgToken ?? '';
    mapInstance = new maplibregl.Map({
        container: 'addressMap',
        style: `https://api.jawg.io/styles/jawg-streets.json?access-token=${token}`,
        zoom: 13,
        center: agencyCenter ?? [2.3522, 48.8566],  // Agency location or Paris fallback
        scrollZoom: false,
        attributionControl: true,
        trackResize: false
    });
    const container = document.getElementById('addressMap');
    const ro = new ResizeObserver(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            mapInstance.resize();
        }
    });
    ro.observe(container);
}

function ensureTempMap() {
    if (tempMapInstance) return;
    const token = window.BRAND?.maps?.jawgToken ?? '';
    tempMapInstance = new maplibregl.Map({
        container: 'tempAddressMap',
        style: `https://api.jawg.io/styles/jawg-streets.json?access-token=${token}`,
        zoom: 15,
        center: agencyCenter ?? [2.3522, 48.8566],
        scrollZoom: false,
        attributionControl: true,
        trackResize: false
    });
    const container = document.getElementById('tempAddressMap');
    const ro = new ResizeObserver(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            tempMapInstance.resize();
        }
    });
    ro.observe(container);
}

function applyView(center, bounds) {
    function doView() {
        mapInstance.stop(); // cancel any ongoing animation
        if (bounds) {
            mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 16 });
        } else {
            mapInstance.flyTo({ center, zoom: 15 });
        }
    }
    if (mapInstance.loaded()) { doView(); }
    else { mapInstance.once('load', doView); }
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

function buildMainQuery(data) {
    return [data.address, data.zipCode, data.city, data.country].filter(Boolean).join(', ');
}

function buildTempQuery(data) {
    return [data.tempAddress, data.tempZipCode, data.tempCity].filter(Boolean).join(', ');
}

async function refreshMainMap() {
    const data  = state.currentData;
    const query = buildMainQuery(data);

    if (!query || !data.address) { hideAddressMap(); return; }

    const coords = await geocode(query);
    if (!coords) { hideAddressMap(); return; }

    showAddressMap();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    ensureMap();
    mapHasClientAddress = true;

    const labelEl = document.getElementById('addressMapLabel');
    if (labelEl) {
        labelEl.textContent = [data.address, data.zipCode, data.city].filter(Boolean).join(', ');
    }

    if (mainMarker) { mainMarker.remove(); mainMarker = null; }
    mainMarker = new maplibregl.Marker({ color: '#3B82F6' })
        .setLngLat([coords.lon, coords.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(
            `<strong>${data.address || ''}</strong><br>${[data.zipCode, data.city, data.country].filter(Boolean).join(', ')}`
        ))
        .addTo(mapInstance);

    applyView([coords.lon, coords.lat]);
}

async function refreshTempMap() {
    const data = state.currentData;

    if (!data.hasTempAddress || !data.tempAddress) { hideTempAddressMap(); return; }

    const tcoords = await geocode(buildTempQuery(data));
    if (!tcoords) { hideTempAddressMap(); return; }

    showTempAddressMap();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    ensureTempMap();

    const tempLabelEl = document.getElementById('tempAddressMapLabel');
    if (tempLabelEl) {
        tempLabelEl.textContent = [data.tempAddress, data.tempZipCode, data.tempCity].filter(Boolean).join(', ');
    }

    if (tempMapMarker) { tempMapMarker.remove(); tempMapMarker = null; }
    tempMapMarker = new maplibregl.Marker({ color: '#8B5CF6' })
        .setLngLat([tcoords.lon, tcoords.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(
            `<strong>${data.tempAddress}</strong><br>${[data.tempZipCode, data.tempCity].filter(Boolean).join(', ')}`
        ))
        .addTo(tempMapInstance);

    function doTempView() {
        tempMapInstance.stop();
        tempMapInstance.flyTo({ center: [tcoords.lon, tcoords.lat], zoom: 15 });
    }
    if (tempMapInstance.loaded()) { doTempView(); }
    else { tempMapInstance.once('load', doTempView); }
}

function updateMapsColumnVisibility() {
    const col = document.querySelector('.live-col-maps');
    if (!col) return;
    const mainVisible = document.getElementById('addressMapWrapper')?.classList.contains('map-visible');
    const tempVisible = document.getElementById('tempAddressMapWrapper')?.classList.contains('map-visible');
    col.classList.toggle('has-map', !!(mainVisible || tempVisible));
}

function showAddressMap() {
    const w = document.getElementById('addressMapWrapper');
    if (w) { w.classList.add('map-visible'); updateMapsColumnVisibility(); }
}

function hideAddressMap() {
    const w = document.getElementById('addressMapWrapper');
    if (w) { w.classList.remove('map-visible'); updateMapsColumnVisibility(); }
    if (mainMarker) { mainMarker.remove(); mainMarker = null; }
    mapHasClientAddress = false;
}

function showTempAddressMap() {
    const w = document.getElementById('tempAddressMapWrapper');
    if (w) { w.classList.add('map-visible'); updateMapsColumnVisibility(); }
}

function hideTempAddressMap() {
    const w = document.getElementById('tempAddressMapWrapper');
    if (w) { w.classList.remove('map-visible'); updateMapsColumnVisibility(); }
    if (tempMapMarker) { tempMapMarker.remove(); tempMapMarker = null; }
}

function scheduleMainMapRefresh() {
    clearTimeout(state.mapDebounceTimer);
    state.mapDebounceTimer = setTimeout(refreshMainMap, 900);
}

function scheduleTempMapRefresh() {
    clearTimeout(state.tempMapDebounceTimer);
    state.tempMapDebounceTimer = setTimeout(refreshTempMap, 900);
}

// ── Map lightbox ──────────────────────────────────────────────────
let mapLightboxInstance = null;

function openMapLightbox(sourceMap, markerColor, labelElId) {
    if (!dom.mapLightbox || !sourceMap) return;
    const token  = window.BRAND?.maps?.jawgToken ?? '';
    const center = sourceMap.getCenter();
    const zoom   = sourceMap.getZoom();

    const src = document.getElementById(labelElId ?? 'addressMapLabel');
    const dst = document.getElementById('mapLightboxLabel');
    if (src && dst) dst.textContent = src.textContent;

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

    const marker = markerColor === '#8B5CF6' ? tempMapMarker : mainMarker;
    if (marker) {
        new maplibregl.Marker({ color: markerColor ?? '#3B82F6' })
            .setLngLat(marker.getLngLat())
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

function copyFieldValue(field) {
    const values = {
        address: dom.valAddress.textContent,
        country: dom.valCountry.textContent,
        zipCode: dom.valZipCode.textContent,
        city: dom.valCity.textContent,
        tempAddress: dom.valTempAddress.textContent,
        tempZipCode: dom.valTempZipCode.textContent,
        tempCity:    dom.valTempCity.textContent,
        phoneCode: dom.valPhoneCode.textContent,
        phoneNumber: dom.valPhone.textContent,
        phone2Code: dom.valPhone2Code?.textContent || '',
        phone2Number: dom.valPhone2?.textContent || '',
        email: dom.valEmail.textContent
    };
    return values[field] || '';
}

function copyAllData() {
    const data = state.currentData;
    let text = '';
    
    if (data.address) text += `Dirección: ${data.address}\n`;
    if (data.country) text += `País: ${data.country}\n`;
    if (data.zipCode) text += `CP: ${data.zipCode}\n`;
    if (data.city) text += `Ciudad: ${data.city}\n`;
    
    if (data.hasTempAddress) {
        if (data.tempAddress) text += `Dirección temporal: ${data.tempAddress}\n`;
        if (data.tempZipCode) text += `CP (temp): ${data.tempZipCode}\n`;
        if (data.tempCity)    text += `Ciudad (temp): ${data.tempCity}\n`;
    }
    
    if (data.phoneCode) text += `Prefijo telefónico: ${data.phoneCode}\n`;
    if (data.phoneNumber) text += `Teléfono: ${data.phoneNumber}\n`;
    if (data.phone2Number) text += `2º Teléfono: ${data.phone2Code ? data.phone2Code + ' ' : ''}${data.phone2Number}\n`;
    if (data.email) text += `E-mail: ${data.email}\n`;
    
    return text.trim();
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

if (dom.addressMapExpandBtn) {
    dom.addressMapExpandBtn.addEventListener('click', e => {
        e.stopPropagation();
        openMapLightbox(mapInstance, '#3B82F6', 'addressMapLabel');
    });
}

const tempAddressMapExpandBtn = document.getElementById('tempAddressMapExpandBtn');
if (tempAddressMapExpandBtn) {
    tempAddressMapExpandBtn.addEventListener('click', e => {
        e.stopPropagation();
        openMapLightbox(tempMapInstance, '#8B5CF6', 'tempAddressMapLabel');
    });
}
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
    copyToClipboard(allData, dom.btnCopyAll);
});

// Individual copy buttons
document.querySelectorAll('.btn-copy[data-field]').forEach(btn => {
    btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        const value = copyFieldValue(field);
        if (value && value !== '-') {
            copyToClipboard(value, btn);
        }
    });
});

// Suggestion modal
const btnSuggest = document.getElementById('btnSuggestImprovement');
const suggestionOverlay = document.getElementById('suggestionModalOverlay');
const suggestionModal = document.getElementById('suggestionModal');
const suggestionText = document.getElementById('suggestionText');

function openSuggestionModal() {
    if (suggestionOverlay) suggestionOverlay.style.display = 'block';
    if (suggestionModal) suggestionModal.style.display = 'block';
    if (suggestionText) { suggestionText.value = ''; suggestionText.focus(); }
}

function closeSuggestionModal() {
    if (suggestionOverlay) suggestionOverlay.style.display = 'none';
    if (suggestionModal) suggestionModal.style.display = 'none';
}

if (btnSuggest) btnSuggest.addEventListener('click', openSuggestionModal);
if (suggestionOverlay) suggestionOverlay.addEventListener('click', closeSuggestionModal);
const cancelBtn = document.getElementById('suggestionModalCancel');
if (cancelBtn) cancelBtn.addEventListener('click', closeSuggestionModal);
const sendBtn = document.getElementById('suggestionModalSend');
if (sendBtn) {
    sendBtn.addEventListener('click', () => {
        const msg = suggestionText ? suggestionText.value.trim() : '';
        if (!msg) return;
        const agencyName = window._okmAgencyId || 'unknown';
        const subject = encodeURIComponent(`[MobilityOS] Suggestion — ${agencyName}`);
        const body = encodeURIComponent(msg);
        window.open(`mailto:guilhem.normand@icloud.com?subject=${subject}&body=${body}`, '_blank');
        closeSuggestionModal();
    });
}

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
                            // If the map is open but no client address has been shown yet, re-center on agency
                            if (mapInstance && !mapHasClientAddress) {
                                mapInstance.jumpTo({ center: agencyCenter });
                            }
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

            initializePeer();
        })
        .catch(reason => {
            // Gate blocked — do NOT initializePeer
            console.warn('[OKM] License gate blocked startup:', reason);
        });
} else {
    // Fallback — gate script not loaded (should not happen in prod)
    initializePeer();
}
