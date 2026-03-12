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
        }
    ]
};

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
    lblDataZipCity: document.getElementById('lblDataZipCity'),
    valZipCity: document.getElementById('valZipCity'),
    lblDataTempAddress: document.getElementById('lblDataTempAddress'),
    valTempAddress: document.getElementById('valTempAddress'),
    lblDataTempZipCity: document.getElementById('lblDataTempZipCity'),
    valTempZipCity: document.getElementById('valTempZipCity'),
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
}

// ============================================================================
// 5. PeerJS Initialization
// ============================================================================
function initializePeer() {
    state.displayCode = generateSessionCode();
    state.sessionCode = config.peerPrefix + state.displayCode;
    
    // Display session code
    dom.sessionCode.textContent = state.displayCode;
    
    // Generate QR code
    generateQRCode(state.displayCode);
    
    // Create Peer with custom ICE servers
    state.peer = new Peer(state.sessionCode, {
        config: {
            iceServers: config.iceServers
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
        state.connection = conn;
        updateStatus('connecting');
        
        conn.on('open', () => {
            console.log('Connection opened');
            updateStatus('connected');
            showLiveDataView();
        });
        
        conn.on('data', (data) => {
            console.log('Received data:', data);
            handleIncomingData(data);
        });
        
        conn.on('close', () => {
            console.log('Client disconnected');
            handleDisconnection();
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            handleDisconnection();
        });
    });
    
    // Peer error handling
    state.peer.on('error', (err) => {
        console.error('Peer error:', err);
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
    dom.setupView.style.display = 'block';
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
    state.currentData = { ...state.currentData, ...data };

    if (data.language && languageNames[data.language]) {
        setRemoteLanguage(data.language, false);
    }
    
    // Update displayed values
    if (data.address !== undefined) {
        dom.valAddress.textContent = data.address || '-';
        highlightField('valAddress');
    }
    
    if (data.zipCode !== undefined || data.city !== undefined) {
        const zip = data.zipCode || state.currentData.zipCode || '';
        const city = data.city || state.currentData.city || '';
        dom.valZipCity.textContent = `${zip} ${city}`.trim() || '-';
        highlightField('valZipCity');
    }
    
    // Handle temporary address visibility
    if (data.hasTempAddress !== undefined) {
        const show = data.hasTempAddress;
        dom.rowTempAddress.style.display = show ? 'flex' : 'none';
        dom.rowTempZipCity.style.display = show ? 'flex' : 'none';
    }
    
    if (data.tempAddress !== undefined) {
        dom.valTempAddress.textContent = data.tempAddress || '-';
        highlightField('valTempAddress');
    }
    
    if (data.tempZipCode !== undefined || data.tempCity !== undefined) {
        const zip = data.tempZipCode || state.currentData.tempZipCode || '';
        const city = data.tempCity || state.currentData.tempCity || '';
        dom.valTempZipCity.textContent = `${zip} ${city}`.trim() || '-';
        highlightField('valTempZipCity');
    }
    
    if (data.phone !== undefined) {
        dom.valPhone.textContent = data.phone || '-';
        highlightField('valPhone');
    }
    
    if (data.email !== undefined) {
        dom.valEmail.textContent = data.email || '-';
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
        showSetupView();
        updateStatus('waiting');
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
        showSetupView();
        updateStatus('waiting');
    }
}

function clearDisplayedData() {
    state.currentData = {};
    dom.valAddress.textContent = '-';
    dom.valZipCity.textContent = '-';
    dom.valTempAddress.textContent = '-';
    dom.valTempZipCity.textContent = '-';
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
        zipCity: dom.valZipCity.textContent,
        tempAddress: dom.valTempAddress.textContent,
        tempZipCity: dom.valTempZipCity.textContent,
        phone: dom.valPhone.textContent,
        email: dom.valEmail.textContent
    };
    return values[field] || '';
}

function copyAllData() {
    const data = state.currentData;
    let text = '';
    
    if (data.address) text += `Dirección: ${data.address}\n`;
    if (data.zipCode || data.city) text += `CP / Ciudad: ${data.zipCode || ''} ${data.city || ''}\n`;
    
    if (data.hasTempAddress) {
        if (data.tempAddress) text += `Dirección temporal: ${data.tempAddress}\n`;
        if (data.tempZipCode || data.tempCity) text += `CP / Ciudad (temp): ${data.tempZipCode || ''} ${data.tempCity || ''}\n`;
    }
    
    if (data.phone) text += `Teléfono: ${data.phone}\n`;
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
// 12. Initialize
// ============================================================================
setRemoteLanguage(state.lang, false);
initializePeer();
