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
      "country": "Pays",
      "zipCode": "Code Postal",
      "city": "Ville",
    "phoneCode": "Indicatif téléphonique",
      "phone": "Téléphone Mobile",
      "phone2": "2e téléphone (optionnel)",
      "phone2Toggle": "Ajouter un 2e téléphone",
      "phone2ToggleRemove": "Supprimer le 2e téléphone",
      "phoneInvalid": "Numéro de téléphone invalide pour ce pays.",
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
      "country": "Country",
      "zipCode": "Postal Code / Zip",
      "city": "City",
    "phoneCode": "Calling code",
      "phone": "Mobile Telephone Number",
      "phone2": "2nd phone (optional)",
      "phone2Toggle": "Add a 2nd phone number",
      "phone2ToggleRemove": "Remove 2nd phone number",
      "phoneInvalid": "Invalid phone number for this country.",
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
      "country": "País",
      "zipCode": "Código Postal / CP",
      "city": "Ciudad",
    "phoneCode": "Prefijo telefónico",
      "phone": "Teléfono Móvil",
      "phone2": "2º teléfono (opcional)",
      "phone2Toggle": "Añadir 2º teléfono",
      "phone2ToggleRemove": "Quitar 2º teléfono",
      "phoneInvalid": "Número de teléfono inválido para este país.",
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
      "country": "Paese",
      "zipCode": "Codice Postale / CAP",
      "city": "Città",
    "phoneCode": "Prefisso telefonico",
      "phone": "Telefono Cellulare",
      "phone2": "2° telefono (opzionale)",
      "phone2Toggle": "Aggiungi 2° telefono",
      "phone2ToggleRemove": "Rimuovi 2° telefono",
      "phoneInvalid": "Numero di telefono non valido per questo paese.",
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
      "country": "País",
      "zipCode": "Código Postal",
      "city": "Cidade",
    "phoneCode": "Indicativo telefónico",
      "phone": "Telemóvel",
      "phone2": "2º telefone (opcional)",
      "phone2Toggle": "Adicionar 2º telefone",
      "phone2ToggleRemove": "Remover 2º telefone",
      "phoneInvalid": "Número de telefone inválido para este país.",
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
      "country": "Land",
      "zipCode": "Postleitzahl / PLZ",
      "city": "Stadt",
    "phoneCode": "Ländervorwahl",
      "phone": "Handynummer",
      "phone2": "2. Telefon (optional)",
      "phone2Toggle": "2. Telefonnummer hinzufügen",
      "phone2ToggleRemove": "2. Telefonnummer entfernen",
      "phoneInvalid": "Ungültige Telefonnummer für dieses Land.",
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
            "country": "Land",
            "zipCode": "Postcode",
            "city": "Plaats",
            "phoneCode": "Landcode",
            "phone": "Mobiel telefoonnummer",
            "phone2": "2e telefoonnummer (optioneel)",
            "phone2Toggle": "2e telefoonnummer toevoegen",
            "phone2ToggleRemove": "2e telefoonnummer verwijderen",
            "phoneInvalid": "Ongeldig telefoonnummer voor dit land.",
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

// Override i18n legalText from brand config (white-label support)
if (window.BRAND?.legalText) {
    for (const [lang, text] of Object.entries(window.BRAND.legalText)) {
        if (i18n[lang]) i18n[lang].legalText = text;
    }
}

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
    phone2SelectedManually: false,
    phone2Visible: false,
    // WebRTC / PeerJS
    peer: null,
    advisorConnection: null,
    advisorConnected: false,
    sendDebounceTimer: null,
    lastSentPayload: null,
    agencyId: null,
    agencyName: null
};

const dom = {
    html: document.documentElement,
    langSelect: document.getElementById('languageSelect'),
    agencyBrandText: document.getElementById('agencyBrandText'),
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
    // Second phone (optional)
    phone2Section: document.getElementById('phone2Section'),
    btnTogglePhone2: document.getElementById('btnTogglePhone2'),
    hasPhone2: document.getElementById('hasPhone2'),
    countryCode2: document.getElementById('countryCode2'),
    phone2: document.getElementById('phone2'),
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

const DEFAULT_BRAND_SLOGAN = window.BRAND?.slogan || 'The Global Mobility Platform';

function sanitizeAgencyId(id) {
    if (typeof id !== 'string') return null;
    return /^[a-z0-9_]{1,64}$/.test(id) ? id : null;
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

function setAgencyBranding(agencyName) {
    if (!dom.agencyBrandText) return;
    dom.agencyBrandText.textContent = agencyName || DEFAULT_BRAND_SLOGAN;
}

async function hydrateAgencyBrandingFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const agencyId = sanitizeAgencyId(params.get('agency'));
    const agencyNameFromQr = sanitizeAgencyName(params.get('agencyName'));
    state.agencyId = agencyId;
    state.agencyName = agencyNameFromQr;

    if (agencyNameFromQr) {
        setAgencyBranding(agencyNameFromQr);
    }

    if (!agencyId) {
        if (!agencyNameFromQr) {
            setAgencyBranding('');
        }
        return;
    }

    try {
        const res = await fetch(`/api/check-license?agency=${encodeURIComponent(agencyId)}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const payload = await res.json();

        if (payload?.valid && typeof payload.agencyName === 'string' && payload.agencyName.trim()) {
            state.agencyName = sanitizeAgencyName(payload.agencyName);
            setAgencyBranding(state.agencyName);
            return;
        }
    } catch (err) {
        console.warn('Unable to resolve agency branding:', err.message);
    }

    if (!agencyNameFromQr) {
        setAgencyBranding('');
    }
}

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
        phoneCodeLabel.textContent = t.phoneCode || 'Calling code';
    }
    
    document.getElementById('lblPhone').textContent = t.phone;
    dom.phone.placeholder = t.placeholderPhone;

    const lblPhone2 = document.getElementById('lblPhone2');
    if (lblPhone2) lblPhone2.textContent = t.phone2 || '2nd phone (optional)';
    if (dom.phone2) dom.phone2.placeholder = t.placeholderPhone || '';
    const lblPhone2Toggle = document.getElementById('lblPhone2Toggle');
    if (lblPhone2Toggle) {
        lblPhone2Toggle.textContent = state.phone2Visible
            ? (t.phone2ToggleRemove || 'Remove 2nd phone')
            : (t.phone2Toggle || 'Add a 2nd phone number');
    }
    const lblPhoneCode2 = document.getElementById('lblPhoneCode2');
    if (lblPhoneCode2) lblPhoneCode2.textContent = t.phoneCode || 'Calling code';

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
        state.countrySelectedManually = false;
        renderCountryNameSelect(langCode);
        renderCountryCodeSelect(langCode);
        syncPhone2CodeToPhone1();
        syncPhoneCodeWithSelectedCountry();
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

    // Reset second phone section
    setPhone2Visible(false);

    // Hide autocomplete dropdowns
    document.getElementById('addressSuggestions')?.classList.remove('open');
    document.getElementById('tempAddressSuggestions')?.classList.remove('open');

    // Reset temp address section
    dom.hasTempAddress.checked = false;
    dom.tempAddressSection.classList.remove('expanded');
    document.getElementById('tempAddressWrapper').classList.remove('active');
    dom.tempAddress.removeAttribute('required');
    dom.tempZipCode.removeAttribute('required');
    dom.tempCity.removeAttribute('required');

    // Hide summary view if visible
    dom.summaryView.style.display = 'none';
    dom.form.style.display = 'flex';
    document.getElementById('pageTitle').textContent = i18n[state.lang].pageTitle;

    // Reset country to language default
    state.countrySelectedManually = false;
    state.phone2SelectedManually = false;
    if (state.globalCountriesData && state.globalCountriesData.length > 0) {
        renderCountryNameSelect(state.lang);
        renderCountryCodeSelect(state.lang);
    }

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
        dom.tempAddress.setAttribute('required', 'true');
        dom.tempZipCode.setAttribute('required', 'true');
        dom.tempCity.setAttribute('required', 'true');
    } else {
        dom.tempAddressSection.classList.remove('expanded');
        wrapper.classList.remove('active');
        dom.tempAddress.removeAttribute('required');
        dom.tempZipCode.removeAttribute('required');
        dom.tempCity.removeAttribute('required');
    }
});

// Clic sur toute la ligne = coche la case (sauf si clic sur le bouton info ou sur le label lui-même)
document.querySelector('#tempToggleHeader').addEventListener('click', (e) => {
    if (!dom.btnTempInfo.contains(e.target) && !e.target.closest('.custom-checkbox')) {
        dom.hasTempAddress.click();
    }
});

// Tooltip Toggle on Info Button Click
dom.btnTempInfo.addEventListener('click', (e) => {
    e.stopPropagation();
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
    const phone2Code = state.phone2Visible ? `${formData.get('countryCode2') || ''}`.trim() : '';
    const phone2Number = state.phone2Visible ? `${formData.get('phone2') || ''}`.trim() : '';

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
            <span class="summary-label">${t.phoneCode || 'Calling code'}</span>
            <span class="summary-value">${phoneCode || '-'}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.phone || 'Téléphone'}</span>
            <span class="summary-value">${phoneNumber || '-'}</span>
        </div>
    `;

    if (state.phone2Visible && (phone2Code || phone2Number)) {
        summaryHTML += `
        <div class="summary-row">
            <span class="summary-label">${t.phoneCode || 'Calling code'} (2)</span>
            <span class="summary-value">${phone2Code || '-'}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.phone2 || '2nd phone'}</span>
            <span class="summary-value">${phone2Number || '-'}</span>
        </div>
        `;
    }

    summaryHTML += `
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
hydrateAgencyBrandingFromUrl();

// ============================================================================
// 7. Dynamic Data (Country Dial Codes)
// ============================================================================

// Static fallback used if restcountries.com is unreachable
const COUNTRY_DIAL_FALLBACK = [
    { code: '+355', cca2: 'AL', name: 'Albania' },
    { code: '+213', cca2: 'DZ', name: 'Algeria' },
    { code: '+376', cca2: 'AD', name: 'Andorra' },
    { code: '+54',  cca2: 'AR', name: 'Argentina' },
    { code: '+61',  cca2: 'AU', name: 'Australia' },
    { code: '+43',  cca2: 'AT', name: 'Austria' },
    { code: '+32',  cca2: 'BE', name: 'Belgium' },
    { code: '+591', cca2: 'BO', name: 'Bolivia' },
    { code: '+55',  cca2: 'BR', name: 'Brazil' },
    { code: '+359', cca2: 'BG', name: 'Bulgaria' },
    { code: '+1',   cca2: 'CA', name: 'Canada' },
    { code: '+56',  cca2: 'CL', name: 'Chile' },
    { code: '+57',  cca2: 'CO', name: 'Colombia' },
    { code: '+385', cca2: 'HR', name: 'Croatia' },
    { code: '+357', cca2: 'CY', name: 'Cyprus' },
    { code: '+420', cca2: 'CZ', name: 'Czechia' },
    { code: '+45',  cca2: 'DK', name: 'Denmark' },
    { code: '+20',  cca2: 'EG', name: 'Egypt' },
    { code: '+372', cca2: 'EE', name: 'Estonia' },
    { code: '+358', cca2: 'FI', name: 'Finland' },
    { code: '+33',  cca2: 'FR', name: 'France' },
    { code: '+49',  cca2: 'DE', name: 'Germany' },
    { code: '+30',  cca2: 'GR', name: 'Greece' },
    { code: '+36',  cca2: 'HU', name: 'Hungary' },
    { code: '+354', cca2: 'IS', name: 'Iceland' },
    { code: '+91',  cca2: 'IN', name: 'India' },
    { code: '+353', cca2: 'IE', name: 'Ireland' },
    { code: '+972', cca2: 'IL', name: 'Israel' },
    { code: '+39',  cca2: 'IT', name: 'Italy' },
    { code: '+81',  cca2: 'JP', name: 'Japan' },
    { code: '+82',  cca2: 'KR', name: 'South Korea' },
    { code: '+371', cca2: 'LV', name: 'Latvia' },
    { code: '+423', cca2: 'LI', name: 'Liechtenstein' },
    { code: '+370', cca2: 'LT', name: 'Lithuania' },
    { code: '+352', cca2: 'LU', name: 'Luxembourg' },
    { code: '+356', cca2: 'MT', name: 'Malta' },
    { code: '+52',  cca2: 'MX', name: 'Mexico' },
    { code: '+373', cca2: 'MD', name: 'Moldova' },
    { code: '+377', cca2: 'MC', name: 'Monaco' },
    { code: '+212', cca2: 'MA', name: 'Morocco' },
    { code: '+31',  cca2: 'NL', name: 'Netherlands' },
    { code: '+64',  cca2: 'NZ', name: 'New Zealand' },
    { code: '+47',  cca2: 'NO', name: 'Norway' },
    { code: '+48',  cca2: 'PL', name: 'Poland' },
    { code: '+351', cca2: 'PT', name: 'Portugal' },
    { code: '+40',  cca2: 'RO', name: 'Romania' },
    { code: '+7',   cca2: 'RU', name: 'Russia' },
    { code: '+378', cca2: 'SM', name: 'San Marino' },
    { code: '+966', cca2: 'SA', name: 'Saudi Arabia' },
    { code: '+381', cca2: 'RS', name: 'Serbia' },
    { code: '+421', cca2: 'SK', name: 'Slovakia' },
    { code: '+386', cca2: 'SI', name: 'Slovenia' },
    { code: '+27',  cca2: 'ZA', name: 'South Africa' },
    { code: '+34',  cca2: 'ES', name: 'Spain' },
    { code: '+46',  cca2: 'SE', name: 'Sweden' },
    { code: '+41',  cca2: 'CH', name: 'Switzerland' },
    { code: '+216', cca2: 'TN', name: 'Tunisia' },
    { code: '+90',  cca2: 'TR', name: 'Turkey' },
    { code: '+380', cca2: 'UA', name: 'Ukraine' },
    { code: '+971', cca2: 'AE', name: 'United Arab Emirates' },
    { code: '+44',  cca2: 'GB', name: 'United Kingdom' },
    { code: '+1',   cca2: 'US', name: 'United States' },
    { code: '+598', cca2: 'UY', name: 'Uruguay' },
    { code: '+58',  cca2: 'VE', name: 'Venezuela' },
].map(c => ({
    ...c,
    shortLabel: `${getFlagEmoji(c.cca2)} ${c.code}`,
    fullLabel:  `${getFlagEmoji(c.cca2)} ${c.name} (${c.code})`
}));

function applyCountriesData(countries) {
    state.globalCountriesData = countries;

    const countrySelect   = dom.country;
    const phoneCodeSelect = dom.countryCode;

    if (countrySelect && !countrySelect._okm_bound) {
        countrySelect._okm_bound = true;
        countrySelect.addEventListener('change', (e) => {
            state.countrySelectedManually = true;
            const selectedOpt = e.target.options[e.target.selectedIndex];
            if (selectedOpt && selectedOpt.dataset.short) {
                const countryDisplay = document.getElementById('countryDisplay');
                if (countryDisplay) countryDisplay.textContent = selectedOpt.dataset.short;
            }
            syncPhoneCodeWithSelectedCountry();
        });
    }

    if (phoneCodeSelect && !phoneCodeSelect._okm_bound) {
        phoneCodeSelect._okm_bound = true;
        phoneCodeSelect.addEventListener('change', (e) => {
            state.phoneSelectedManually = true;
            const selectedOpt = e.target.options[e.target.selectedIndex];
            if (selectedOpt && selectedOpt.dataset.short) {
                const phoneCodeDisplay = document.getElementById('countryCodeDisplay');
                if (phoneCodeDisplay) phoneCodeDisplay.textContent = selectedOpt.dataset.short;
            }
        });
    }

    renderCountryNameSelect(state.lang);
    renderCountryCodeSelect(state.lang);
    syncPhone2CodeToPhone1();
    syncPhoneCodeWithSelectedCountry();
}

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

        // Filter out malformed strings and sort alphabetically
        countries = countries.filter(c => !c.code.includes('undefined') && c.code !== '');
        countries.sort((a, b) => a.name.localeCompare(b.name));

        applyCountriesData(countries);

    } catch (error) {
        console.warn('[OKM] restcountries.com unavailable, using static fallback:', error.message);
        applyCountriesData(COUNTRY_DIAL_FALLBACK);
    }
}

function syncPhone2CodeToPhone1() {
    if (!dom.countryCode || !dom.countryCode2) return;
    const currentVal = dom.countryCode2.value;
    dom.countryCode2.innerHTML = dom.countryCode.innerHTML;
    // Keep previous selection if valid, otherwise mirror phone1
    const hasVal = currentVal && Array.from(dom.countryCode2.options).some(o => o.value === currentVal);
    if (hasVal) {
        dom.countryCode2.value = currentVal;
    } else {
        dom.countryCode2.value = dom.countryCode.value;
    }
    const display2 = document.getElementById('countryCode2Display');
    if (display2) {
        const opt = dom.countryCode2.options[dom.countryCode2.selectedIndex];
        if (opt?.dataset.short) display2.textContent = opt.dataset.short;
    }
}

function syncPhoneCodeWithSelectedCountry() {
    if (!dom.country || !state.globalCountriesData?.length) return;

    const selectedCountryCca2 = dom.country.value;
    if (!selectedCountryCca2) return;

    const selectedCountryData = state.globalCountriesData.find(c => c.cca2 === selectedCountryCca2);
    if (!selectedCountryData || !selectedCountryData.code) return;

    // Sync phone1
    if (!state.phoneSelectedManually && dom.countryCode) {
        const match1 = Array.from(dom.countryCode.options).find(opt => !opt.disabled && opt.value === selectedCountryData.code);
        if (match1) {
            dom.countryCode.value = selectedCountryData.code;
            const display1 = document.getElementById('countryCodeDisplay');
            if (display1) display1.textContent = match1.dataset.short || selectedCountryData.shortLabel || `${getFlagEmoji(selectedCountryData.cca2)} ${selectedCountryData.code}`;
        }
    }

    // Sync phone2 (mirrors phone1 unless user manually changed it)
    if (!state.phone2SelectedManually && dom.countryCode2) {
        const match2 = Array.from(dom.countryCode2.options).find(opt => !opt.disabled && opt.value === selectedCountryData.code);
        if (match2) {
            dom.countryCode2.value = selectedCountryData.code;
            const display2 = document.getElementById('countryCode2Display');
            if (display2) display2.textContent = match2.dataset.short || selectedCountryData.shortLabel || `${getFlagEmoji(selectedCountryData.cca2)} ${selectedCountryData.code}`;
        }
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
        case 'es': priorityCca2 = ['ES', 'CO', 'MX', 'AR', 'CL', 'PE', 'VE']; break;
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

        const defaultCca2ByLang = { fr: 'FR', en: 'GB', es: 'ES', it: 'IT', pt: 'PT', de: 'DE', nl: 'NL' };
        const defaultCca2 = defaultCca2ByLang[langCode] || 'FR';
        if (c.cca2 === currentSelection || (!currentSelection && (c.cca2 === defaultCca2 || index === 0))) {
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
// Always uses the canonical production URL — preview deployments don't have secrets.
// Falls back to the hardcoded openrelay servers if the API is unavailable.
async function fetchTurnCredentials() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TURN_FETCH_TIMEOUT_MS);

    try {
        const response = await fetch('https://okmobility.pages.dev/api/turn-credentials', {
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
        // Connect silently in background (no modal shown when code comes from QR)
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
    const countryName = (selectedCountryOption
        ? (selectedCountryOption.dataset.countryName || selectedCountryOption.textContent || '')
        : '').replace(/[\u{1F1E0}-\u{1F1FF}]+\s*/gu, '').trim();

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
        phone2Code: state.phone2Visible ? clampText(dom.countryCode2?.value || '', 10) : '',
        phone2Number: state.phone2Visible ? clampText(dom.phone2?.value || '', 40) : '',
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
        dom.phone, dom.phone2, dom.email
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

    if (dom.countryCode2) {
        dom.countryCode2.addEventListener('change', (e) => {
            state.phone2SelectedManually = true;
            const display = document.getElementById('countryCode2Display');
            if (display) {
                const opt = e.target.options[e.target.selectedIndex];
                if (opt?.dataset.short) display.textContent = opt.dataset.short;
            }
            debouncedSendToAdvisor();
        });
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

// Second phone toggle
function setPhone2Visible(visible) {
    state.phone2Visible = visible;
    if (dom.hasPhone2) dom.hasPhone2.checked = visible;
    const wrapper = document.getElementById('phone2Wrapper');
    if (dom.phone2Section) dom.phone2Section.classList.toggle('expanded', visible);
    if (wrapper) wrapper.classList.toggle('active', visible);
    if (!visible && dom.phone2) dom.phone2.value = '';
    const t = i18n[state.lang] || i18n['es'];
    const lblToggle = document.getElementById('lblPhone2Toggle');
    if (lblToggle) lblToggle.textContent = visible ? (t.phone2ToggleRemove || 'Remove 2nd phone') : (t.phone2Toggle || 'Add a 2nd phone number');
}

if (dom.btnTogglePhone2) {
    dom.btnTogglePhone2.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-checkbox')) {
            dom.hasPhone2.click();
        }
    });
}

if (dom.hasPhone2) {
    dom.hasPhone2.addEventListener('change', (e) => {
        setPhone2Visible(e.target.checked);
        debouncedSendToAdvisor();
    });
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

// ============================================================================
// Searchable country combobox — replaces native <select> overlay pattern
// ============================================================================

function initSearchableSelects() {
    document.querySelectorAll('.cs-wrap').forEach(wrap => {
        const face   = wrap.querySelector('.cs-face');
        const search = wrap.querySelector('.cs-search');
        const list   = wrap.querySelector('.cs-list');
        const select = wrap.querySelector('select');
        const arrow  = wrap.querySelector('.cs-arrow');
        if (!face || !search || !list || !select) return;

        let allItems = [];

        function syncItems() {
            allItems = Array.from(select.options).map(opt => ({
                value: opt.value,
                label: opt.textContent.trim(),
                short: opt.dataset.short || opt.textContent.trim()
            }));
        }

        function renderList(items) {
            list.innerHTML = '';
            const cur = select.value;
            items.forEach(item => {
                const li = document.createElement('li');
                li.setAttribute('role', 'option');
                li.setAttribute('tabindex', '-1');
                li.textContent = item.label;
                li.dataset.value = item.value;
                if (item.value === cur) li.setAttribute('aria-selected', 'true');
                li.addEventListener('mousedown', e => { e.preventDefault(); pick(item); });
                list.appendChild(li);
            });
        }

        function normalize(s) {
            return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        }

        function filterList(q) {
            if (!q.trim()) { renderList(allItems); return; }
            const terms = normalize(q).split(/\s+/).filter(Boolean);
            const matches = allItems.filter(item => {
                const hay = normalize(item.label + ' ' + item.value);
                return terms.every(t => hay.includes(t));
            });
            renderList(matches);
        }

        function pick(item) {
            select.value = item.value;
            face.textContent = item.short;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            close();
        }

        function open() {
            if (wrap.classList.contains('is-open')) return;
            syncItems();
            renderList(allItems);
            // Flip above if not enough space below
            const rect = wrap.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            wrap.classList.toggle('cs-above', spaceBelow < 250 && rect.top > spaceBelow);
            wrap.classList.add('is-open');
            search.placeholder = face.textContent;
            search.focus();
            // Scroll to currently selected item
            const sel = list.querySelector('[aria-selected="true"]');
            if (sel) setTimeout(() => sel.scrollIntoView({ block: 'nearest' }), 0);
        }

        function close() {
            if (!wrap.classList.contains('is-open')) return;
            wrap.classList.remove('is-open');
            search.value = '';
            list.innerHTML = '';
        }

        face.addEventListener('click', open);
        wrap.addEventListener('click', e => { if (e.target === wrap || e.target === arrow) open(); });

        search.addEventListener('input', () => filterList(search.value));
        search.addEventListener('blur', () => setTimeout(close, 180));
        search.addEventListener('keydown', e => {
            if (e.key === 'Escape') { close(); face.focus?.(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); list.firstElementChild?.focus(); }
        });

        list.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                (document.activeElement.nextElementSibling || list.firstElementChild)?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = document.activeElement.previousElementSibling;
                prev ? prev.focus() : search.focus();
            } else if (e.key === 'Enter') {
                const li = document.activeElement;
                if (li.dataset?.value !== undefined) {
                    const item = allItems.find(i => i.value === li.dataset.value);
                    if (item) pick(item);
                }
            } else if (e.key === 'Escape') {
                close();
            }
        });

        // Sync face when select value is changed externally
        select.addEventListener('change', () => {
            if (!wrap.classList.contains('is-open')) {
                const opt = select.options[select.selectedIndex];
                if (opt) face.textContent = opt.dataset.short || opt.textContent.trim();
            }
        });
    });
}

// ============================================================================
// Address Autocomplete — Photon API (OpenStreetMap, EU-hosted, no key needed)
// ============================================================================

/**
 * Format a street address per country convention:
 *   FR/GB/US/CA/AU → "15 Rue de Rivoli"   (number before)
 *   ES/IT/PT/BR    → "Gran Vía, 15"        (number after, comma)
 *   DE/NL/SE/...   → "Alexanderplatz 4"    (number after, no comma)
 */
function formatStreetAddress(housenumber, street, countryCode) {
    if (!street) return housenumber || '';
    if (!housenumber) return street;
    const cc = (countryCode || '').toLowerCase();
    if (['es', 'it', 'pt', 'br', 'ar', 'mx', 'co', 'cl', 'pe', 'uy'].includes(cc)) {
        return `${street}, ${housenumber}`;
    }
    if (['fr', 'be', 'gb', 'us', 'ca', 'au', 'nz', 'ie', 'lu'].includes(cc)) {
        return `${housenumber} ${street}`;
    }
    // DE, NL, AT, CH, DK, SE, NO, FI, PL, CZ, SK, HU, RO, HR, SI, GR, TR…
    return `${street} ${housenumber}`;
}

async function fetchPhotonSuggestions(query, langCode) {
    const photonLang = ['de', 'en', 'fr'].includes(langCode) ? langCode : 'default';
    const params = new URLSearchParams({ q: query, limit: 6, lang: photonLang });
    const resp = await fetch(`https://photon.komoot.io/api/?${params}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.features || [];
}

function buildSuggestionItem(feature) {
    const p = feature.properties || {};
    const cc = p.countrycode || p.country_code || '';
    const street = p.street || p.name || '';
    const line1 = formatStreetAddress(p.housenumber || '', street, cc);
    const cityPart = p.city || p.town || p.village || '';
    const line2 = [p.postcode, cityPart, p.country].filter(Boolean).join(', ');
    return { line1, line2, props: p };
}

function renderAddressSuggestions(features, listEl, onSelect, closeList) {
    listEl.innerHTML = '';
    const items = features.map(buildSuggestionItem).filter(i => i.line1);
    if (!items.length) { closeList(); return; }

    items.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.setAttribute('role', 'option');
        li.dataset.idx = idx;
        li.innerHTML = `<span class="suggestion-main">${item.line1}</span><span class="suggestion-sub">${item.line2}</span>`;
        li.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onSelect(item.line1, item.props);
            closeList();
        });
        listEl.appendChild(li);
    });
    listEl.classList.add('open');
}

function initAddressAutocomplete() {
    const mainInput  = dom.address;
    const mainList   = document.getElementById('addressSuggestions');
    const tempInput  = dom.tempAddress;
    const tempList   = document.getElementById('tempAddressSuggestions');

    // overflowEl: .temp-address-content-inner has overflow:hidden for its slide animation;
    // temporarily set to visible while suggestions are open so they aren't clipped.
    function bindField(inputEl, listEl, getCountry, overflowEl) {
        if (!inputEl || !listEl) return;
        let timer = null;

        function closeList() {
            listEl.classList.remove('open');
            if (overflowEl) {
                listEl.addEventListener('transitionend', () => {
                    overflowEl.style.overflow = '';
                }, { once: true });
            }
        }

        inputEl.addEventListener('input', () => {
            const q = inputEl.value.trim();
            clearTimeout(timer);
            if (q.length < 3) { closeList(); return; }
            timer = setTimeout(async () => {
                try {
                    const countryCode = getCountry ? getCountry() : '';
                    let features = await fetchPhotonSuggestions(q, state.lang);
                    if (countryCode) {
                        features = features.filter(f =>
                            (f.properties?.countrycode || '').toLowerCase() === countryCode.toLowerCase()
                        );
                    }
                    if (overflowEl) overflowEl.style.overflow = 'visible';
                    renderAddressSuggestions(features, listEl, (formatted, props) => {
                        inputEl.value = formatted;
                        const zip  = props.postcode || '';
                        const city = props.city || props.town || props.village || '';
                        if (inputEl === mainInput) {
                            if (zip  && dom.zipCode)  dom.zipCode.value  = zip;
                            if (city && dom.city)      dom.city.value     = city;
                            const cc = (props.countrycode || props.country_code || '').toUpperCase();
                            if (cc && dom.country && dom.country.value !== cc) {
                                dom.country.value = cc;
                                dom.country.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        } else {
                            if (zip  && dom.tempZipCode)  dom.tempZipCode.value  = zip;
                            if (city && dom.tempCity)      dom.tempCity.value     = city;
                        }
                        debouncedSendToAdvisor();
                    }, closeList);
                    if (overflowEl && !listEl.classList.contains('open')) overflowEl.style.overflow = '';
                } catch (_) { /* network error — silent */ }
            }, 380);
        });

        inputEl.addEventListener('blur',    () => setTimeout(() => closeList(), 160));
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeList(); });
    }

    const tempInner = document.querySelector('.temp-address-content-inner');
    bindField(mainInput, mainList, () => state.countrySelectedManually ? (dom.country?.value || '') : '');
    bindField(tempInput, tempList, null, tempInner);
}

// Initialize
attachRealTimeListeners();
initAddressAutocomplete();
initSearchableSelects();
checkUrlForAdvisorCode();
