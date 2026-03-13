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
 * OK Mobility - Client Info Form Logic
 * Features: i18n (8 languages), RTL support, Photon API Autocomplete, Mailto Generator
 */

// ============================================================================
// 1. i18n Dictionary
// ============================================================================
const i18n = {
    "fr": {
      "dir": "ltr",
      "pageTitle": "Vos informations",
      "address": "Adresse de résidence",
      "addressPlaceholder": "15 Rue de Rivoli",
      "tempAddressCheck": "J'ai une adresse temporaire locale",
      "tempTooltip": "Renseignez cette adresse si vous séjournez temporairement à un autre endroit (ex: Hôtel, Airbnb) pendant la durée de votre location.",
      "tempAddress": "Adresse temporaire",
      "tempZipCode": "Code Postal",
      "tempCity": "Ville",
      "zipCode": "Code Postal",
      "city": "Ville",
      "phone": "Téléphone Mobile",
      "email": "E-mail",
      "placeholderCity": "Paris",
      "placeholderZip": "75001",
      "placeholderPhone": "6 12 34 56 78",
      "placeholderEmail": "jean.dupont@email.com",
      "btnGenerate": "Générer mon résumé",
      "btnEdit": "Modifier",
      "legalText": "OK MOBILITY GROUP, S.L.U. est le Responsable du traitement des données à caractère personnel de la personne concernée et l'informe que lesdites données feront l'objet d'un traitement conformément aux dispositions du Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 (RGPD) et de la Loi Organique 3/2018 du 5 décembre relative à la protection des données personnelles et à la garantie des droits numériques (LOPDGDD).",
    "summaryTitle": "Veuillez présenter ce résumé au conseiller",
    "advisorConnectButton": "Connecter un conseiller",
    "advisorModalTitle": "Connexion conseiller",
    "advisorModalDesc": "Saisissez le code fourni par le conseiller.",
    "advisorModalConnect": "Connecter",
    "advisorModalCancel": "Annuler",
    "advisorCodePlaceholder": "XXXXXX",
      "statusNotConnected": "Non connecté",
      "statusConnecting": "Connexion...",
      "statusConnected": "Connecté au conseiller",
      "statusError": "Erreur de connexion"
    },
    "en": {
      "dir": "ltr",
      "pageTitle": "Your information",
      "address": "Home Address",
      "addressPlaceholder": "221B Baker Street",
      "tempAddressCheck": "I have a local temporary address",
      "tempTooltip": "Fill in this address if you are temporarily staying at another location (e.g., Hotel, Airbnb) during your rental period.",
      "tempAddress": "Temporary Address",
      "tempZipCode": "Postal Code / Zip",
      "tempCity": "City",
      "zipCode": "Postal Code / Zip",
      "city": "City",
      "phone": "Mobile Telephone Number",
      "email": "E-mail",
      "placeholderCity": "London",
      "placeholderZip": "SW1A 1AA",
      "placeholderPhone": "7911 123456",
      "placeholderEmail": "john.doe@email.com",
      "btnGenerate": "Generate my summary",
      "btnEdit": "Edit",
      "legalText": "OK MOBILITY GROUP, S.L.U. acts as Data Controller with respect to the personal data of the Data Subject and hereby informs that such data shall be processed in accordance with the provisions of Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 (GDPR) and Organic Law 3/2018 of 5 December on the Protection of Personal Data and Guarantee of Digital Rights (LOPDGDD).",
    "summaryTitle": "Please present this summary to the advisor",
    "advisorConnectButton": "Connect an advisor",
    "advisorModalTitle": "Advisor connection",
    "advisorModalDesc": "Enter the code provided by the advisor.",
    "advisorModalConnect": "Connect",
    "advisorModalCancel": "Cancel",
    "advisorCodePlaceholder": "XXXXXX",
      "statusNotConnected": "Not connected",
      "statusConnecting": "Connecting...",
      "statusConnected": "Connected to advisor",
      "statusError": "Connection error"
    },
    "es": {
      "dir": "ltr",
      "pageTitle": "Su información",
      "address": "Dirección de residencia",
      "addressPlaceholder": "Gran Vía, 15",
      "tempAddressCheck": "Tengo una dirección temporal local",
      "tempTooltip": "Rellene esta dirección si se aloja temporalmente en otro lugar (ej. Hotel, Airbnb) durante su alquiler.",
      "tempAddress": "Dirección temporal",
      "tempZipCode": "Código Postal / CP",
      "tempCity": "Ciudad",
      "zipCode": "Código Postal / CP",
      "city": "Ciudad",
      "phone": "Teléfono Móvil",
      "email": "E-mail",
      "placeholderCity": "Madrid",
      "placeholderZip": "28001",
      "placeholderPhone": "612 34 56 78",
      "placeholderEmail": "juan.perez@email.com",
      "btnGenerate": "Generar mi resumen",
      "btnEdit": "Modificar",
      "legalText": "OK MOBILITY GROUP, S.L.U. es el Responsable del tratamiento de los datos personales del Interesado y le informa de que estos datos se tratarán de conformidad con lo dispuesto en el Reglamento (UE) 2016/679, de 27 de abril (GDPR), y la Ley Orgánica 3/2018, de 5 de diciembre (LOPDG).",
    "summaryTitle": "Por favor, presente este resumen al asesor",
    "advisorConnectButton": "Conectar asesor",
    "advisorModalTitle": "Conexión con asesor",
    "advisorModalDesc": "Introduzca el código proporcionado por el asesor.",
    "advisorModalConnect": "Conectar",
    "advisorModalCancel": "Cancelar",
    "advisorCodePlaceholder": "XXXXXX",
      "statusNotConnected": "Sin conectar",
      "statusConnecting": "Conectando...",
      "statusConnected": "Conectado al asesor",
      "statusError": "Error de conexión"
    },
    "it": {
      "dir": "ltr",
      "pageTitle": "Le tue informazioni",
      "address": "Indirizzo di residenza",
      "addressPlaceholder": "Via Roma, 10",
      "tempAddressCheck": "Ho un indirizzo temporaneo locale",
      "tempTooltip": "Compila questo indirizzo se soggiorni temporaneamente in un altro luogo (es. Hotel, Airbnb) durante il noleggio.",
      "tempAddress": "Indirizzo temporaneo",
      "tempZipCode": "Codice Postale / CAP",
      "tempCity": "Città",
      "zipCode": "Codice Postale / CAP",
      "city": "Città",
      "phone": "Telefono Cellulare",
      "email": "E-mail",
      "placeholderCity": "Roma",
      "placeholderZip": "00118",
      "placeholderPhone": "312 345 6789",
      "placeholderEmail": "mario.rossi@email.com",
      "btnGenerate": "Genera il mio riepilogo",
      "btnEdit": "Modifica",
      "legalText": "OK MOBILITY GROUP, S.L.U. è il Titolare del trattamento dei dati personali dell'Interessato e lo informa che tali dati saranno trattati in conformità con le disposizioni del Regolamento (UE) 2016/679 del Parlamento europeo e del Consiglio del 27 aprile 2016 (GDPR) e della Legge Organica 3/2018 del 5 dicembre sulla protezione dei dati personali e garanzia dei diritti digitali (LOPDGDD).",
    "summaryTitle": "Si prega di presentare questo riepilogo al consulente",
    "advisorConnectButton": "Collega un consulente",
    "advisorModalTitle": "Connessione consulente",
    "advisorModalDesc": "Inserisci il codice fornito dal consulente.",
    "advisorModalConnect": "Connetti",
    "advisorModalCancel": "Annulla",
    "advisorCodePlaceholder": "XXXXXX",
      "statusNotConnected": "Non connesso",
      "statusConnecting": "Connessione...",
      "statusConnected": "Connesso al consulente",
      "statusError": "Errore di connessione"
    },
    "pt": {
      "dir": "ltr",
      "pageTitle": "As suas informações",
      "address": "Morada",
      "addressPlaceholder": "Rua Augusta, 20",
      "tempAddressCheck": "Tenho um endereço temporário local",
      "tempTooltip": "Preencha este endereço se estiver hospedado temporariamente noutro local (ex: Hotel, Airbnb) durante o seu aluguer.",
      "tempAddress": "Endereço temporário",
      "tempZipCode": "Código Postal",
      "tempCity": "Cidade",
      "zipCode": "Código Postal",
      "city": "Cidade",
      "phone": "Telemóvel",
      "email": "E-mail",
      "placeholderCity": "Lisboa",
      "placeholderZip": "1000-001",
      "placeholderPhone": "912 345 678",
      "placeholderEmail": "joao.silva@email.com",
      "btnGenerate": "Gerar o meu resumo",
      "btnEdit": "Editar",
      "legalText": "A OK MOBILITY GROUP, S.L.U. é a Responsável pelo tratamento dos dados pessoais do Titular dos dados e informa que os referidos dados serão tratados em conformidade com o disposto no Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho, de 27 de abril de 2016 (RGPD), e na Lei Orgânica n.º 3/2018, de 5 de dezembro, relativa à Proteção de Dados Pessoais e à Garantia dos Direitos Digitais (LOPDGDD).",
    "summaryTitle": "Por favor, apresente este resumo ao consultor",
    "advisorConnectButton": "Conectar consultor",
    "advisorModalTitle": "Conexão com consultor",
    "advisorModalDesc": "Digite o código fornecido pelo consultor.",
    "advisorModalConnect": "Conectar",
    "advisorModalCancel": "Cancelar",
    "advisorCodePlaceholder": "XXXXXX",
      "statusNotConnected": "Não conectado",
      "statusConnecting": "Conectando...",
      "statusConnected": "Conectado ao consultor",
      "statusError": "Erro de conexão"
    },
    "de": {
      "dir": "ltr",
      "pageTitle": "Ihre Informationen",
      "address": "Wohnanschrift",
      "addressPlaceholder": "Alexanderplatz 4",
      "tempAddressCheck": "Ich habe eine lokale temporäre Adresse",
      "tempTooltip": "Geben Sie diese Adresse an, wenn Sie sich während Ihrer Anmietung vorübergehend an einem anderen Ort (z.B. Hotel, Airbnb) aufhalten.",
      "tempAddress": "Temporäre Adresse",
      "tempZipCode": "Postleitzahl / PLZ",
      "tempCity": "Stadt",
      "zipCode": "Postleitzahl / PLZ",
      "city": "Stadt",
      "phone": "Handynummer",
      "email": "E-Mail",
      "placeholderCity": "Berlin",
      "placeholderZip": "10115",
      "placeholderPhone": "151 23456789",
      "placeholderEmail": "max.mustermann@email.com",
      "btnGenerate": "Meine Zusammenfassung erstellen",
      "btnEdit": "Bearbeiten",
      "legalText": "OK MOBILITY GROUP, S.L.U. ist der Verantwortliche im Sinne des Datenschutzrechts für die Verarbeitung der personenbezogenen Daten der betroffenen Person und teilt mit, dass diese Daten gemäß den Bestimmungen der Verordnung (EU) 2016/679 des Europäischen Parlaments und des Rates vom 27. April 2016 (DSGVO) sowie des Organgesetzes 3/2018 vom 5. Dezember über den Schutz personenbezogener Daten und die Gewährleistung digitaler Rechte (LOPDGDD) verarbeitet werden.",
    "summaryTitle": "Bitte legen Sie diese Zusammenfassung dem Berater vor",
    "advisorConnectButton": "Berater verbinden",
    "advisorModalTitle": "Beraterverbindung",
    "advisorModalDesc": "Geben Sie den vom Berater bereitgestellten Code ein.",
    "advisorModalConnect": "Verbinden",
    "advisorModalCancel": "Abbrechen",
    "advisorCodePlaceholder": "XXXXXX",
      "statusNotConnected": "Nicht verbunden",
      "statusConnecting": "Verbinde...",
      "statusConnected": "Mit Berater verbunden",
      "statusError": "Verbindungsfehler"
        },
        "nl": {
            "dir": "ltr",
            "pageTitle": "Uw gegevens",
            "address": "Woonadres",
            "addressPlaceholder": "Damrak 1",
            "tempAddressCheck": "Ik heb een tijdelijk lokaal adres",
            "tempTooltip": "Vul dit adres in als u tijdens uw huurperiode tijdelijk op een andere locatie verblijft (bijv. hotel, Airbnb).",
            "tempAddress": "Tijdelijk adres",
            "tempZipCode": "Postcode",
            "tempCity": "Plaats",
            "zipCode": "Postcode",
            "city": "Plaats",
            "phone": "Mobiel telefoonnummer",
            "email": "E-mail",
            "placeholderCity": "Amsterdam",
            "placeholderZip": "1012 LG",
            "placeholderPhone": "06 12 34 56 78",
            "placeholderEmail": "jan.jansen@email.com",
            "btnGenerate": "Mijn overzicht genereren",
            "btnEdit": "Bewerken",
            "legalText": "OK MOBILITY GROUP, S.L.U. is de verwerkingsverantwoordelijke voor de persoonsgegevens van de betrokkene en informeert dat deze gegevens worden verwerkt in overeenstemming met Verordening (EU) 2016/679 van het Europees Parlement en de Raad van 27 april 2016 (AVG) en Organieke Wet 3/2018 van 5 december inzake de bescherming van persoonsgegevens en de waarborging van digitale rechten (LOPDGDD).",
            "summaryTitle": "Toon dit overzicht aan de adviseur",
            "advisorConnectButton": "Adviseur verbinden",
            "advisorModalTitle": "Verbinding met adviseur",
            "advisorModalDesc": "Voer de code in die door de adviseur is gegeven.",
            "advisorModalConnect": "Verbinden",
            "advisorModalCancel": "Annuleren",
            "advisorCodePlaceholder": "XXXXXX",
            "statusNotConnected": "Niet verbonden",
            "statusConnecting": "Verbinden...",
            "statusConnected": "Verbonden met adviseur",
            "statusError": "Verbindingsfout"
    }
};

// ============================================================================
// 2. DOM Elements & State
// ============================================================================
const state = {
    lang: 'es', // Default fallback
    debounceTimer: null,
    addressSelected: false,
    globalCountriesData: [],
    countrySelectedManually: false,
    phoneSelectedManually: false,
    // WebRTC / PeerJS
    peer: null,
    advisorConnection: null,
    advisorConnected: false,
    sendDebounceTimer: null,
    lastSentPayload: null
};

const dom = {
    html: document.documentElement,
    langSelect: document.getElementById('languageSelect'),
    // Form and Views
    form: document.getElementById('clientForm'),
    summaryView: document.getElementById('summaryView'),
    // Outputs
    summaryContentBody: document.getElementById('summaryContentBody'),
    btnEdit: document.getElementById('btnEdit'),
    btnEdit: document.getElementById('btnEdit'),
    // Inputs Main Address
    address: document.getElementById('address'),
    country: document.getElementById('country'),
    zipCode: document.getElementById('zipCode'),
    city: document.getElementById('city'),
    // Inputs Temp Address
    hasTempAddress: document.getElementById('hasTempAddress'),
    lblTempAddressCheck: document.getElementById('lblTempAddressCheck'),
    txtTempTooltip: document.getElementById('txtTempTooltip'),
    btnTempInfo: document.getElementById('btnTempInfo'),
    tempTooltip: document.getElementById('tempTooltip'),
    tempAddressSection: document.getElementById('tempAddressSection'),
    lblTempAddress: document.getElementById('lblTempAddress'),
    tempAddress: document.getElementById('tempAddress'),
    lblTempZipCode: document.getElementById('lblTempZipCode'),
    tempZipCode: document.getElementById('tempZipCode'),
    lblTempCity: document.getElementById('lblTempCity'),
    tempCity: document.getElementById('tempCity'),
    // Contact
    countryCode: document.getElementById('countryCode'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    // Advisor Connection (Modal)
    btnOpenAdvisorModal: document.getElementById('btnOpenAdvisorModal'),
    txtAdvisorConnect: document.getElementById('txtAdvisorConnect'),
    advisorModal: document.getElementById('advisorModal'),
    advisorModalOverlay: document.getElementById('advisorModalOverlay'),
    advisorModalTitle: document.getElementById('advisorModalTitle'),
    advisorModalDesc: document.getElementById('advisorModalDesc'),
    advisorModalCancel: document.getElementById('advisorModalCancel'),
    advisorCodeInput: document.getElementById('advisorCodeInput'),
    advisorConnectionStatus: document.getElementById('advisorConnectionStatus'),
    clientStatusIndicator: document.getElementById('clientStatusIndicator'),
    clientStatusText: document.getElementById('clientStatusText')
};

// ============================================================================
// 3. Language Switcher (i18n & RTL)
// ============================================================================
function applyLanguage(langCode) {
    const t = i18n[langCode];
    if (!t) return;

    state.lang = langCode;

    // Sync lang display label
    const langNames = { fr: 'Français', en: 'English', es: 'Español', it: 'Italiano', pt: 'Português', de: 'Deutsch', nl: 'Nederlands' };
    const langDisplay = document.getElementById('langDisplay');
    if (langDisplay) langDisplay.textContent = langNames[langCode] || langCode;

    // Apply Directionality & Lang Attribute
    dom.html.setAttribute('dir', t.dir);
    dom.html.setAttribute('lang', langCode);

    // Update Text Nodes
    document.getElementById('pageTitle').textContent = t.pageTitle;
    
    document.getElementById('lblAddress').textContent = t.address;
    dom.address.placeholder = t.addressPlaceholder;

    const countryLabel = document.getElementById('lblCountry');
    if (countryLabel) {
        countryLabel.textContent = t.country || 'Country';
    }
    
    // Temporary Address Texts
    dom.lblTempAddressCheck.textContent = t.tempAddressCheck;
    dom.txtTempTooltip.textContent = t.tempTooltip;
    
    dom.lblTempAddress.textContent = t.tempAddress;
    dom.tempAddress.placeholder = t.addressPlaceholder;
    
    dom.lblTempZipCode.textContent = t.tempZipCode;
    dom.tempZipCode.placeholder = t.placeholderZip;
    
    dom.lblTempCity.textContent = t.tempCity;
    dom.tempCity.placeholder = t.placeholderCity;
    
    document.getElementById('lblZipCode').textContent = t.zipCode;
    dom.zipCode.placeholder = t.placeholderZip;
    
    document.getElementById('lblCity').textContent = t.city;
    dom.city.placeholder = t.placeholderCity;

    const phoneCodeLabel = document.getElementById('lblPhoneCode');
    if (phoneCodeLabel) {
        phoneCodeLabel.textContent = t.phoneCode || 'Dial code';
    }
    
    document.getElementById('lblPhone').textContent = t.phone;
    dom.phone.placeholder = t.placeholderPhone;
    
    document.getElementById('lblEmail').textContent = t.email;
    dom.email.placeholder = t.placeholderEmail;
    
    document.getElementById('txtBtnGenerate').textContent = t.btnGenerate;
    document.getElementById('txtBtnEdit').textContent = t.btnEdit;
    
    // Met à jour le h1 selon la vue active
    const summaryVisible = dom.summaryView && dom.summaryView.style.display !== 'none';
    document.getElementById('pageTitle').textContent = summaryVisible ? t.summaryTitle : t.pageTitle;
    
    // Legal Texts
    document.querySelectorAll('.legal-text').forEach(el => {
        el.textContent = t.legalText;
    });

    // Advisor Modal Labels
    if (dom.advisorModalTitle) {
        dom.advisorModalTitle.textContent = t.advisorModalTitle || 'Advisor connection';
    }
    if (dom.advisorModalDesc) {
        dom.advisorModalDesc.textContent = t.advisorModalDesc || 'Enter the code provided by the advisor.';
    }
    if (dom.advisorModalCancel) {
        dom.advisorModalCancel.textContent = t.advisorModalCancel || 'Cancel';
    }
    if (dom.advisorCodeInput) {
        dom.advisorCodeInput.placeholder = t.advisorCodePlaceholder || 'XXXXXX';
    }
    // Update connection status text if not connected
    if (dom.clientStatusText && !state.advisorConnected) {
        dom.clientStatusText.textContent = t.statusNotConnected || 'Not connected';
    }

    if (state.globalCountriesData && state.globalCountriesData.length > 0) {
        renderCountryNameSelect(langCode);
        renderCountryCodeSelect(langCode);
    }
}

dom.langSelect.addEventListener('change', (e) => {
    applyLanguage(e.target.value);
    if (state.advisorConnected) {
        sendFormDataToAdvisor();
    }
});

document.getElementById('btnReset').addEventListener('click', () => {
    resetClientForm();
});

function resetClientForm() {
    const btn = document.getElementById('btnReset');
    btn.classList.add('spinning');

    // Clear form fields without reloading (keep advisor connection alive)
    dom.form.reset();

    // Reset temp address section
    dom.tempAddressSection.classList.remove('expanded');
    document.getElementById('tempAddressWrapper').classList.remove('active');
    dom.tempAddress.removeAttribute('required');
    dom.tempZipCode.removeAttribute('required');
    dom.tempCity.removeAttribute('required');

    // Hide summary view if visible
    dom.summaryView.style.display = 'none';
    dom.form.style.display = 'flex';
    document.getElementById('pageTitle').textContent = i18n[state.lang].pageTitle;

    // Reset country displays to current select values
    const countrySelect = dom.country;
    if (countrySelect) {
        const selectedOpt = countrySelect.options[countrySelect.selectedIndex];
        if (selectedOpt && selectedOpt.dataset.short) {
            const countryDisplay = document.getElementById('countryDisplay');
            if (countryDisplay) countryDisplay.textContent = selectedOpt.dataset.short;
        }
    }

    const phoneCodeSelect = dom.countryCode;
    if (phoneCodeSelect) {
        const selectedOpt = phoneCodeSelect.options[phoneCodeSelect.selectedIndex];
        if (selectedOpt && selectedOpt.dataset.short) {
            const phoneCodeDisplay = document.getElementById('countryCodeDisplay');
            if (phoneCodeDisplay) phoneCodeDisplay.textContent = selectedOpt.dataset.short;
        }
    }

    // Send cleared data if connected
    if (state.advisorConnected) {
        sendFormDataToAdvisor();
    }

    setTimeout(() => btn.classList.remove('spinning'), 520);
}

// ============================================================================
// 4. Temporary Address Toggle
// ============================================================================

dom.hasTempAddress.addEventListener('change', (e) => {
    const wrapper = document.getElementById('tempAddressWrapper');
    if (e.target.checked) {
        dom.tempAddressSection.classList.add('expanded');
        wrapper.classList.add('active');
        // Add required attributes dynamically
        dom.tempAddress.setAttribute('required', 'true');
        dom.tempZipCode.setAttribute('required', 'true');
        dom.tempCity.setAttribute('required', 'true');
    } else {
        dom.tempAddressSection.classList.remove('expanded');
        wrapper.classList.remove('active');
        // Remove required attributes
        dom.tempAddress.removeAttribute('required');
        dom.tempZipCode.removeAttribute('required');
        dom.tempCity.removeAttribute('required');
    }
});

// Clic sur toute la ligne = coche la case (sauf si clic sur le bouton info ou sur le label lui-même qui gère nativement)
document.querySelector('.toggle-header').addEventListener('click', (e) => {
    if (!dom.btnTempInfo.contains(e.target) && !e.target.closest('.custom-checkbox')) {
        dom.hasTempAddress.click();
    }
});

// Tooltip Toggle on Info Button Click
dom.btnTempInfo.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from immediately closing it
    const isHidden = dom.tempTooltip.style.display === 'none';
    dom.tempTooltip.style.display = isHidden ? 'block' : 'none';
});

// Close tooltip when clicking anywhere else
document.addEventListener('click', (e) => {
    if (!dom.btnTempInfo.contains(e.target) && !dom.tempTooltip.contains(e.target)) {
        dom.tempTooltip.style.display = 'none';
    }
});

// ============================================================================
// 5. Form Submission & Mailto Generation
// ============================================================================
dom.form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic Validation check
    if (!dom.form.checkValidity()) {
        dom.form.reportValidity();
        return;
    }

    const formData = new FormData(dom.form);
    const addr = formData.get('address');
    const selectedCountryOption = dom.country ? dom.country.options[dom.country.selectedIndex] : null;
    const countryLabel = selectedCountryOption
        ? (selectedCountryOption.dataset.countryName || selectedCountryOption.textContent || '')
        : '';
    
    // Phone split fields
    const phoneCode = `${formData.get('countryCode') || ''}`.trim();
    const phoneNumber = `${formData.get('phone') || ''}`.trim();

    // Prepare Summary View with Beautiful UI Components (Forced to Spanish)
    const t = i18n['es'];
    
    // Base Document
    let summaryHTML = `
        <div class="summary-row">
            <span class="summary-label">${t.address || 'Adresse'}</span>
            <span class="summary-value">${addr}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.country || 'Pays'}</span>
            <span class="summary-value">${countryLabel || '-'}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.zipCode || 'CP'}</span>
            <span class="summary-value">${formData.get('zipCode') || '-'}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.city || 'Ville'}</span>
            <span class="summary-value">${formData.get('city') || '-'}</span>
        </div>
    `;

    // Add Temporary Address Block if checked
    if (dom.hasTempAddress.checked) {
        summaryHTML += `
            <div class="summary-row" style="margin-top: 15px; padding-top: 15px;">
                <span class="summary-label" style="color: var(--color-accent);"><i class='bx bx-map-pin'></i> ${t.tempAddress || 'Adresse temporaire'}</span>
                <span class="summary-value">${formData.get('tempAddress')}</span>
            </div>
            <div class="summary-row" style="margin-bottom: 15px;">
                <span class="summary-label">${t.tempZipCode || 'CP'} / ${t.tempCity || 'Ville'}</span>
                <span class="summary-value">${formData.get('tempZipCodePlaceholder')} ${formData.get('tempCityPlaceholder')}</span>
            </div>
        `;
    }

    // Add Phone and Email
    summaryHTML += `
        <div class="summary-row">
            <span class="summary-label">${t.phoneCode || 'Indicatif'}</span>
            <span class="summary-value">${phoneCode || '-'}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.phone || 'Téléphone'}</span>
            <span class="summary-value">${phoneNumber || '-'}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.email || 'Email'}</span>
            <span class="summary-value">${formData.get('email')}</span>
        </div>
    `;

    dom.summaryContentBody.innerHTML = summaryHTML;

    // Configure Send Button
    // Note: The Send button logic has been removed as requested by the user

    // Transition UI
    document.getElementById('pageTitle').textContent = i18n[state.lang].summaryTitle;
    dom.form.style.display = 'none';
    dom.summaryView.style.display = 'flex';
});

// Edit Button logic
dom.btnEdit.addEventListener('click', () => {
    document.getElementById('pageTitle').textContent = i18n[state.lang].pageTitle;
    dom.summaryView.style.display = 'none';
    dom.form.style.display = 'flex';
});

// ============================================================================
// 6. Init
// ============================================================================

// Detect Browser Language
function detectUserLanguage() {
    if (navigator.language) {
        const browserLang = navigator.language.split('-')[0].toLowerCase();
        // Check if we support this exact language (fr, en, es, it, pt, de, nl)
        if (i18n[browserLang]) {
            return browserLang;
        }
    }
    // Ultimate fallback if language is unsupported or undetected
    return 'es'; 
}

state.lang = sessionStorage.getItem('okm_lang') || detectUserLanguage();
sessionStorage.removeItem('okm_lang');
dom.langSelect.value = state.lang; // Sync UI Select box
applyLanguage(state.lang);

// ============================================================================
// 7. Dynamic Data (Country Dial Codes)
// ============================================================================
async function populateCountryCodes() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
        const data = await response.json();
        
        let countries = [];
        data.forEach(c => {
            if (c.idd && c.idd.root) {
                const suffix = (c.idd.suffixes && c.idd.suffixes.length === 1) ? c.idd.suffixes[0] : '';
                const code = c.idd.root + suffix;
                const flag = getFlagEmoji(c.cca2);
                countries.push({
                    code: code,
                    cca2: c.cca2,
                    name: c.name.common,
                    shortLabel: `${flag} ${code}`,
                    fullLabel: `${flag} ${c.name.common} (${code})`
                });
            }
        });

        // Filter out malformed strings
        countries = countries.filter(c => !c.code.includes('undefined') && c.code !== '');
        
        // Sort alphabetically by English name
        countries.sort((a, b) => a.name.localeCompare(b.name));

        state.globalCountriesData = countries;

        const countrySelect = dom.country;
        const phoneCodeSelect = dom.countryCode;

        if (countrySelect) {
            countrySelect.addEventListener('change', (e) => {
                state.countrySelectedManually = true;
                const selectedOpt = e.target.options[e.target.selectedIndex];
                if (selectedOpt && selectedOpt.dataset.short) {
                    const countryDisplay = document.getElementById('countryDisplay');
                    if (countryDisplay) countryDisplay.textContent = selectedOpt.dataset.short;
                }
            });
        }

        // Update the overlay view when the native select changes (only bind once)
        if (phoneCodeSelect) {
            phoneCodeSelect.addEventListener('change', (e) => {
                state.phoneSelectedManually = true;
                const selectedOpt = e.target.options[e.target.selectedIndex];
                if (selectedOpt && selectedOpt.dataset.short) {
                    const phoneCodeDisplay = document.getElementById('countryCodeDisplay');
                    if (phoneCodeDisplay) phoneCodeDisplay.textContent = selectedOpt.dataset.short;
                }
            });
        }

        // Initial render
        renderCountryNameSelect(state.lang);
        renderCountryCodeSelect(state.lang);
        
    } catch (error) {
        console.error('Error fetching country codes:', error);
    }
}

function renderCountryCodeSelect(langCode) {
    if (!state.globalCountriesData || state.globalCountriesData.length === 0) return;
    const select = dom.countryCode;
    const currentSelection = state.phoneSelectedManually ? select.value : null;
    const localeForDisplay = i18n[langCode] ? langCode : 'en';
    let displayNames = null;

    try {
        displayNames = new Intl.DisplayNames([localeForDisplay], { type: 'region' });
    } catch (_) {
        displayNames = null;
    }
    
    // Determine priority countries based on UI language
    let priorityCca2 = [];
    switch (langCode) {
        case 'en': priorityCca2 = ['GB', 'US', 'CA', 'AU', 'IE', 'NZ']; break;
        case 'es': priorityCca2 = ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE']; break;
        case 'fr': priorityCca2 = ['FR', 'BE', 'CH', 'CA', 'LU', 'MC']; break;
        case 'it': priorityCca2 = ['IT', 'CH', 'SM', 'VA']; break;
        case 'pt': priorityCca2 = ['PT', 'BR', 'AO', 'MZ', 'CV']; break;
        case 'de': priorityCca2 = ['DE', 'AT', 'CH', 'LU', 'LI']; break;
        case 'nl': priorityCca2 = ['NL', 'BE', 'SR', 'AW', 'CW']; break;
        default: priorityCca2 = ['ES'];
    }
    
    const countriesCopy = [...state.globalCountriesData];
    const topCountries = [];
    
    priorityCca2.forEach(cca2 => {
        const idx = countriesCopy.findIndex(c => c.cca2 === cca2);
        if (idx !== -1) {
            topCountries.push(countriesCopy.splice(idx, 1)[0]);
        }
    });

    select.innerHTML = '';
    let selectionRestored = false;
    
    // 1. Add priority countries at the top
    topCountries.forEach((c, index) => {
        const option = document.createElement('option');
        const localizedName = displayNames ? displayNames.of(c.cca2) : c.name;
        option.value = c.code;
        option.textContent = `${getFlagEmoji(c.cca2)} ${localizedName || c.name} (${c.code})`;
        option.dataset.short = c.shortLabel;
        
        if (c.code === currentSelection || (!currentSelection && index === 0)) {
            option.selected = true;
            const display = document.getElementById('countryCodeDisplay');
            if (display) display.textContent = c.shortLabel;
            selectionRestored = true;
        }
        select.appendChild(option);
    });
    
    // Add separator
    if (topCountries.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '──────────';
        select.appendChild(separator);
    }

    // 2. Add all other countries sorted alphabetically
    countriesCopy.forEach(c => {
        const option = document.createElement('option');
        const localizedName = displayNames ? displayNames.of(c.cca2) : c.name;
        option.value = c.code;
        option.textContent = `${getFlagEmoji(c.cca2)} ${localizedName || c.name} (${c.code})`;
        option.dataset.short = c.shortLabel;
        
        if (!selectionRestored && c.code === currentSelection) {
            option.selected = true;
            const display = document.getElementById('countryCodeDisplay');
            if (display) display.textContent = c.shortLabel;
            selectionRestored = true;
        }
        select.appendChild(option);
    });
}

function renderCountryNameSelect(langCode) {
    if (!state.globalCountriesData || state.globalCountriesData.length === 0 || !dom.country) return;

    const select = dom.country;
    const currentSelection = state.countrySelectedManually ? select.value : null;
    const localeForDisplay = i18n[langCode] ? langCode : 'en';
    let displayNames = null;

    try {
        displayNames = new Intl.DisplayNames([localeForDisplay], { type: 'region' });
    } catch (_) {
        displayNames = null;
    }

    const countries = [...state.globalCountriesData];
    select.innerHTML = '';

    countries.forEach((c, index) => {
        const option = document.createElement('option');
        const localizedName = displayNames ? displayNames.of(c.cca2) : c.name;
        const countryName = localizedName || c.name;
        const shortLabel = `${getFlagEmoji(c.cca2)} ${countryName}`;

        option.value = c.cca2;
        option.textContent = shortLabel;
        option.dataset.short = shortLabel;
        option.dataset.countryName = countryName;

        if (c.cca2 === currentSelection || (!currentSelection && (c.cca2 === 'ES' || index === 0))) {
            option.selected = true;
            const display = document.getElementById('countryDisplay');
            if (display) display.textContent = shortLabel;
        }

        select.appendChild(option);
    });
}

function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// Call on startup
populateCountryCodes();

// ============================================================================
// 8. Fix layout jump on language switch — lock legal-text height to tallest version
// ============================================================================
function lockLegalTextHeight() {
    const els = document.querySelectorAll('.legal-text');
    if (!els.length) return;

    // Remove any previously set min-height to measure freely
    els.forEach(el => el.style.minHeight = '');

    let maxHeight = 0;
    const original = els[0].textContent;

    // Measure each language's legal text on the first .legal-text element
    Object.values(i18n).forEach(t => {
        els[0].textContent = t.legalText;
        maxHeight = Math.max(maxHeight, els[0].scrollHeight);
    });

    // Restore current text
    els[0].textContent = i18n[state.lang].legalText;

    // Apply the max height as min-height to all legal-text elements
    els.forEach(el => el.style.minHeight = maxHeight + 'px');
}

// Run once DOM is ready, and re-run on resize (debounced)
window.addEventListener('load', lockLegalTextHeight);
let _legalResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(_legalResizeTimer);
    _legalResizeTimer = setTimeout(lockLegalTextHeight, 200);
});

// ============================================================================
// 9. WebRTC / PeerJS - Advisor Connection (Client Side)
// ============================================================================

const peerConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
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
    console.debug('[OKM-RTC][CLIENT]', ...args);
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
    const fallbackTurnServers = peerConfig.iceServers.filter((server) => {
        if (!server || !server.urls) return false;
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
        return urls.some((url) => typeof url === 'string' && (url.startsWith('turn:') || url.startsWith('turns:')));
    });

    return [...baseStun, ...cloudflareServers, ...fallbackTurnServers];
}

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
    return peerConfig.iceServers;
}

// Modal open/close helpers
function openAdvisorModal() {
    if (dom.advisorModalOverlay) dom.advisorModalOverlay.style.display = 'block';
    if (dom.advisorModal) dom.advisorModal.style.display = 'block';
    if (dom.advisorCodeInput) {
        dom.advisorCodeInput.focus();
        dom.advisorCodeInput.select();
    }
}

function closeAdvisorModal() {
    if (dom.advisorModalOverlay) dom.advisorModalOverlay.style.display = 'none';
    if (dom.advisorModal) dom.advisorModal.style.display = 'none';
}

// Check URL for pre-filled advisor code on load
function checkUrlForAdvisorCode() {
    const urlCode = new URLSearchParams(window.location.search).get('code');
    if (urlCode && dom.advisorCodeInput) {
        dom.advisorCodeInput.value = urlCode.toUpperCase();
        openAdvisorModal();
        // Auto-connect after a short delay
        setTimeout(() => connectToAdvisor(), 600);
    }
}

// Connect to advisor's Peer
async function connectToAdvisor() {
    const raw = dom.advisorCodeInput.value.trim().toUpperCase();
    if (!raw || raw.length < 4) return;
    const code = raw.startsWith('OKM-') ? raw : `OKM-${raw}`;
    
    updateClientStatus('connecting');
    
    // Create our peer (auto-generated ID)
    if (state.peer) {
        state.peer.destroy();
    }
    
    const iceServers = await fetchTurnCredentials();
    diagLog('ICE servers count:', iceServers.length);
    state.peer = new Peer({ config: { iceServers } });
    
    state.peer.on('open', () => {
        console.log('Client peer opened, connecting to advisor:', code);
        diagLog('Peer opened, trying advisor code', code);
        
        // Connect to the advisor's peer
        state.advisorConnection = state.peer.connect(code, { reliable: true });
        
        state.advisorConnection.on('open', () => {
            console.log('Connected to advisor');
            state.advisorConnected = true;
            state.lastSentPayload = null;
            updateClientStatus('connected');
            closeAdvisorModal();
            // Send current form data immediately
            sendFormDataToAdvisor(true);
            setTimeout(() => {
                logSelectedCandidatePair(state.advisorConnection, 'Selected path after connection open');
            }, 1500);
        });

        state.advisorConnection.on('data', (data) => {
            if (data && data.type === 'reset-form') {
                resetClientForm();
                return;
            }

            if (data && data.type === 'set-language' && data.language && i18n[data.language]) {
                if (dom.langSelect) {
                    dom.langSelect.value = data.language;
                }
                applyLanguage(data.language);
            }
        });
        
        state.advisorConnection.on('close', () => {
            console.log('Disconnected from advisor');
            diagLog('Data connection closed');
            state.advisorConnected = false;
            state.lastSentPayload = null;
            updateClientStatus('disconnected');
        });
        
        state.advisorConnection.on('error', (err) => {
            console.error('Connection error:', err);
            diagLog('Data connection error:', err?.type || err?.message || err);
            state.advisorConnected = false;
            state.lastSentPayload = null;
            updateClientStatus('error');
        });
    });
    
    state.peer.on('error', (err) => {
        console.error('Peer error:', err);
        diagLog('Peer error:', err?.type || err?.message || err);
        state.advisorConnected = false;
        updateClientStatus('error');
    });
}

// Disconnect from advisor
function disconnectFromAdvisor() {
    if (state.advisorConnection) {
        state.advisorConnection.close();
        state.advisorConnection = null;
    }
    if (state.peer) {
        state.peer.destroy();
        state.peer = null;
    }
    state.advisorConnected = false;
    state.lastSentPayload = null;
    updateClientStatus('disconnected');
}

// Update connection status UI
function updateClientStatus(status) {
    const t = i18n[state.lang] || i18n['es'];
    const indicator = dom.clientStatusIndicator;
    const text = dom.clientStatusText;

    if (!indicator) {
        if (dom.btnOpenAdvisorModal) {
            dom.btnOpenAdvisorModal.classList.remove('connected', 'connecting');
            if (status === 'connecting') dom.btnOpenAdvisorModal.classList.add('connecting');
            if (status === 'connected') dom.btnOpenAdvisorModal.classList.add('connected');
        }
        return;
    }

    indicator.className = 'status-indicator';
    
    // Update button state
    if (dom.btnOpenAdvisorModal) {
        dom.btnOpenAdvisorModal.classList.remove('connected', 'connecting');
    }
    
    switch (status) {
        case 'connecting':
            indicator.classList.add('connecting');
            if (text) text.textContent = t.statusConnecting || 'Connecting...';
            if (dom.btnOpenAdvisorModal) dom.btnOpenAdvisorModal.classList.add('connecting');
            break;
        case 'connected':
            indicator.classList.add('connected');
            if (text) text.textContent = t.statusConnected || 'Connected to advisor';
            if (dom.btnOpenAdvisorModal) dom.btnOpenAdvisorModal.classList.add('connected');
            break;
        case 'error':
            indicator.classList.add('error');
            if (text) text.textContent = t.statusError || 'Connection error';
            break;
        default:
            indicator.classList.add('disconnected');
            if (text) text.textContent = t.statusNotConnected || 'Not connected';
    }
}

function clampText(value, maxLength) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, maxLength);
}

function buildAdvisorPayload() {
    if (!state.advisorConnected || !state.advisorConnection) return;
    
    const selectedPhoneOption = dom.countryCode ? dom.countryCode.options[dom.countryCode.selectedIndex] : null;
    const selectedCountryOption = dom.country ? dom.country.options[dom.country.selectedIndex] : null;
    const phoneCode = selectedPhoneOption ? selectedPhoneOption.value : '+33';
    const countryName = selectedCountryOption
        ? (selectedCountryOption.dataset.countryName || selectedCountryOption.textContent || '')
        : '';

    const phoneValue = clampText(dom.phone?.value || '', 40);
    const formattedPhone = `${phoneCode} ${phoneValue}`.replace(/\s+/g, ' ').trim();
    
    return {
        language: state.lang,
        address: clampText(dom.address?.value || '', 140),
        country: clampText(countryName, 80),
        zipCode: clampText(dom.zipCode?.value || '', 20),
        city: clampText(dom.city?.value || '', 80),
        hasTempAddress: Boolean(dom.hasTempAddress?.checked),
        tempAddress: clampText(dom.tempAddress?.value || '', 140),
        tempZipCode: clampText(dom.tempZipCode?.value || '', 20),
        tempCity: clampText(dom.tempCity?.value || '', 80),
        phoneCode: clampText(phoneCode, 10),
        phoneNumber: clampText(phoneValue, 40),
        phone: formattedPhone.slice(0, 40),
        email: clampText(dom.email?.value || '', 120)
    };
}

function getPayloadPatch(previousPayload, nextPayload) {
    const patch = {};
    Object.keys(nextPayload).forEach((key) => {
        if (!previousPayload || previousPayload[key] !== nextPayload[key]) {
            patch[key] = nextPayload[key];
        }
    });
    return patch;
}

// Send form data to advisor (debounced)
function sendFormDataToAdvisor(forceSnapshot = false) {
    if (!state.advisorConnected || !state.advisorConnection) return;

    const payload = buildAdvisorPayload();
    const outgoing = forceSnapshot
        ? payload
        : getPayloadPatch(state.lastSentPayload, payload);

    if (!Object.keys(outgoing).length) return;
    
    try {
        state.advisorConnection.send(outgoing);
        state.lastSentPayload = payload;
    } catch (err) {
        console.error('Failed to send data:', err);
    }
}

// Debounced send on input
function debouncedSendToAdvisor() {
    if (!state.advisorConnected) return;
    
    clearTimeout(state.sendDebounceTimer);
    state.sendDebounceTimer = setTimeout(() => {
        sendFormDataToAdvisor();
    }, 300);
}

// Attach input listeners to all form fields for real-time sync
function attachRealTimeListeners() {
    const fields = [
        dom.address, dom.country, dom.zipCode, dom.city,
        dom.tempAddress, dom.tempZipCode, dom.tempCity,
        dom.phone, dom.email
    ];
    
    fields.forEach(field => {
        if (field) {
            field.addEventListener('input', debouncedSendToAdvisor);
        }
    });
    
    // Also listen to country code changes
    if (dom.countryCode) {
        dom.countryCode.addEventListener('change', debouncedSendToAdvisor);
    }

    if (dom.country) {
        dom.country.addEventListener('change', debouncedSendToAdvisor);
    }
    
    // And temp address checkbox
    if (dom.hasTempAddress) {
        dom.hasTempAddress.addEventListener('change', () => {
            setTimeout(sendFormDataToAdvisor, 100);
        });
    }
}

// Modal controls
if (dom.btnOpenAdvisorModal) {
    dom.btnOpenAdvisorModal.addEventListener('click', openAdvisorModal);
}
if (dom.advisorModalCancel) {
    dom.advisorModalCancel.addEventListener('click', closeAdvisorModal);
}
if (dom.advisorModalOverlay) {
    dom.advisorModalOverlay.addEventListener('click', closeAdvisorModal);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom.advisorModal && dom.advisorModal.style.display !== 'none') {
        closeAdvisorModal();
    }
});

// Code input behavior
if (dom.advisorCodeInput) {
    dom.advisorCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (dom.advisorCodeInput.value.trim().length >= 4) {
                connectToAdvisor();
            }
        }
    });
    
    // Auto-uppercase
    dom.advisorCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
        if (e.target.value.trim().length >= 4 && !state.advisorConnected) {
            connectToAdvisor();
        }
    });
}

// Initialize
attachRealTimeListeners();
checkUrlForAdvisorCode();
