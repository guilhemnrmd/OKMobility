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
    publicClientUrl: 'https://ok-mobility-retailer.pages.dev/',
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
    currentData: {}
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
    lblDataTempZipCity: document.getElementById('lblDataTempZipCity'),
    valTempZipCity: document.getElementById('valTempZipCity'),
    lblDataPhoneCode: document.getElementById('lblDataPhoneCode'),
    valPhoneCode: document.getElementById('valPhoneCode'),
    lblDataPhone: document.getElementById('lblDataPhone'),
    valPhone: document.getElementById('valPhone'),
    lblDataEmail: document.getElementById('lblDataEmail'),
    valEmail: document.getElementById('valEmail'),
    // Rows (for showing/hiding temp address)
    rowTempAddress: document.getElementById('rowTempAddress'),
    rowTempZipCity: document.getElementById('rowTempZipCity')
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
    email: 120
};

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

// ============================================================================
// 4. QR Code Generation
// ============================================================================
function generateQRCode(sessionCode) {
    // Clear previous QR code
    dom.qrCode.innerHTML = '';
    
    // Build the client URL with the session code
    const clientPageUrl = new URL(config.publicClientUrl);
    clientPageUrl.searchParams.set('code', sessionCode);
    const clientUrl = clientPageUrl.href;
    
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
    if (!dom.qrCodeLarge || !dom.qrCode) return;
    dom.qrCodeLarge.innerHTML = dom.qrCode.innerHTML;
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
async function fetchTurnCredentials() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TURN_FETCH_TIMEOUT_MS);

    try {
        const response = await fetch('/api/turn-credentials', {
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
    
    // Handle temporary address visibility
    if (cleanData.hasTempAddress !== undefined) {
        const show = cleanData.hasTempAddress;
        dom.rowTempAddress.style.display = show ? 'flex' : 'none';
        dom.rowTempZipCity.style.display = show ? 'flex' : 'none';
    }
    
    if (cleanData.tempAddress !== undefined) {
        dom.valTempAddress.textContent = cleanData.tempAddress || '-';
        highlightField('valTempAddress');
    }
    
    if (cleanData.tempZipCode !== undefined || cleanData.tempCity !== undefined) {
        const zip = cleanData.tempZipCode || state.currentData.tempZipCode || '';
        const city = cleanData.tempCity || state.currentData.tempCity || '';
        dom.valTempZipCity.textContent = `${zip} ${city}`.trim() || '-';
        highlightField('valTempZipCity');
    }
    
    if (cleanData.phoneCode !== undefined) {
        dom.valPhoneCode.textContent = cleanData.phoneCode || '-';
        highlightField('valPhoneCode');
    }

    if (cleanData.phoneNumber !== undefined) {
        dom.valPhone.textContent = cleanData.phoneNumber || '-';
        highlightField('valPhone');
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
    dom.valAddress.textContent = '-';
    dom.valCountry.textContent = '-';
    dom.valZipCode.textContent = '-';
    dom.valCity.textContent = '-';
    dom.valTempAddress.textContent = '-';
    dom.valTempZipCity.textContent = '-';
    dom.valPhoneCode.textContent = '-';
    dom.valPhone.textContent = '-';
    dom.valEmail.textContent = '-';
    dom.rowTempAddress.style.display = 'none';
    dom.rowTempZipCity.style.display = 'none';
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
// 10. Copy Functions
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
        tempZipCity: dom.valTempZipCity.textContent,
        phoneCode: dom.valPhoneCode.textContent,
        phoneNumber: dom.valPhone.textContent,
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
        if (data.tempZipCode || data.tempCity) text += `CP / Ciudad (temp): ${data.tempZipCode || ''} ${data.tempCity || ''}\n`;
    }
    
    if (data.phoneCode) text += `Prefijo telefónico: ${data.phoneCode}\n`;
    if (data.phoneNumber) text += `Teléfono: ${data.phoneNumber}\n`;
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
    dom.qrLightbox.addEventListener('pointermove', updateQrLightboxTilt);
    dom.qrLightbox.addEventListener('pointerleave', resetQrLightboxTilt);
}

if (dom.qrLightboxFrame) {
    dom.qrLightboxFrame.addEventListener('click', closeQrLightbox);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeQrLightbox();
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
            // Display the agency name in the header slogan
            const cached = (() => {
                try {
                    const raw = localStorage.getItem('okm_lic_' + agencyId);
                    return raw ? JSON.parse(raw) : null;
                } catch { return null; }
            })();
            const agencyName = cached?.agencyName || '';
            if (agencyName) {
                const slogan = document.querySelector('.brand-slogan');
                if (slogan) {
                    slogan.textContent = agencyName;
                    slogan.title = agencyName;
                }
            }
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
