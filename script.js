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
      "address": "Adresse de résidence",
      "addressPlaceholder": "Ex: 15 Rue de Rivoli",
      "tempAddressCheck": "J'ai une adresse temporaire locale (Hôtel, etc.)",
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
      "legalText": "OK MOBILITY GROUP, S.L.U. est le Responsable du traitement des données personnelles de l'intéressé et l'informe que ces données seront traitées conformément aux dispositions du Règlement (UE) 2016/679 du 27 avril (RGPD) et de la Loi Organique 3/2018 du 5 décembre (LOPDG).",
      "summaryTitle": "Veuillez présenter ce résumé au conseiller"
    },
    "en": {
      "dir": "ltr",
      "pageTitle": "Your information",
      "address": "Home Address",
      "address": "Home Address",
      "addressPlaceholder": "Ex: 221B Baker Street",
      "tempAddressCheck": "I have a local temporary address (Hotel, etc.)",
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
      "legalText": "OK MOBILITY GROUP, S.L.U. is the Data Controller of the Data Subject's personal data and informs them that this data will be processed in accordance with the provisions of Regulation (EU) 2016/679 of April 27 (GDPR) and Organic Law 3/2018 of December 5 (LOPDG).",
      "summaryTitle": "Please present this summary to the advisor"
    },
    "es": {
      "dir": "ltr",
      "pageTitle": "Su información",
      "address": "Dirección de residencia",
      "address": "Dirección de residencia",
      "addressPlaceholder": "Ej: Gran Vía, 15",
      "tempAddressCheck": "Tengo una dirección temporal local (Hotel, etc.)",
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
      "summaryTitle": "Por favor, presente este resumen al asesor"
    },
    "it": {
      "dir": "ltr",
      "pageTitle": "Le tue informazioni",
      "address": "Indirizzo di residenza",
      "address": "Indirizzo di residenza",
      "addressPlaceholder": "Es: Via Roma, 10",
      "tempAddressCheck": "Ho un indirizzo temporaneo locale (Hotel, ecc.)",
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
      "legalText": "OK MOBILITY GROUP, S.L.U. è il Titolare del trattamento dei dati personali dell'Interessato e lo informa che tali dati saranno trattati in conformità a quanto disposto dal Regolamento (UE) 2016/679 del 27 aprile (GDPR) e dalla Legge Organica 3/2018 del 5 dicembre (LOPDG).",
      "summaryTitle": "Si prega di presentare questo riepilogo al consulente"
    },
    "pt": {
      "dir": "ltr",
      "pageTitle": "As suas informações",
      "address": "Morada",
      "address": "Morada",
      "addressPlaceholder": "Ex: Rua Augusta, 20",
      "tempAddressCheck": "Tenho um endereço temporário local (Hotel, etc.)",
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
      "legalText": "A OK MOBILITY GROUP, S.L.U. é a Responsável pelo tratamento dos dados pessoais do Titular e informa que estes dados serão tratados de acordo com o Regulamento (UE) 2016/679 de 27 de abril (RGPD) e a Lei Orgânica 3/2018 de 5 de dezembro (LOPDG).",
      "summaryTitle": "Por favor, apresente este resumo ao consultor"
    },
    "de": {
      "dir": "ltr",
      "pageTitle": "Ihre Informationen",
      "address": "Wohnanschrift",
      "address": "Wohnanschrift",
      "addressPlaceholder": "Bsp: Alexanderplatz 4",
      "tempAddressCheck": "Ich habe eine lokale temporäre Adresse (Hotel usw.)",
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
      "legalText": "OK MOBILITY GROUP, S.L.U. ist der Verantwortliche für die Verarbeitung der personenbezogenen Daten der betroffenen Person und teilt mit, dass diese Daten gemäß den Bestimmungen der Verordnung (EU) 2016/679 vom 27. April (DSGVO) und dem Organgesetz 3/2018 vom 5. Dezember (LOPDG) verarbeitet werden.",
      "summaryTitle": "Bitte legen Sie diese Zusammenfassung dem Berater vor"
    }
};

// ============================================================================
// 2. DOM Elements & State
// ============================================================================
const state = {
    lang: 'es', // Default fallback
    debounceTimer: null,
    addressSelected: false
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
    phone: document.getElementById('phone'),
    email: document.getElementById('email')
};

// ============================================================================
// 3. Language Switcher (i18n & RTL)
// ============================================================================
function applyLanguage(langCode) {
    const t = i18n[langCode];
    if (!t) return;

    state.lang = langCode;

    // Apply Directionality & Lang Attribute
    dom.html.setAttribute('dir', t.dir);
    dom.html.setAttribute('lang', langCode);

    // Update Text Nodes
    document.getElementById('pageTitle').textContent = t.pageTitle;
    
    document.getElementById('lblAddress').textContent = t.address;
    dom.address.placeholder = t.addressPlaceholder;
    
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
    
    document.getElementById('lblPhone').textContent = t.phone;
    dom.phone.placeholder = t.placeholderPhone;
    
    document.getElementById('lblEmail').textContent = t.email;
    dom.email.placeholder = t.placeholderEmail;
    
    document.getElementById('txtBtnGenerate').textContent = t.btnGenerate;
    document.getElementById('txtBtnEdit').textContent = t.btnEdit;
    
    document.getElementById('summaryTitle').textContent = t.summaryTitle;
    
    // Legal Texts
    document.querySelectorAll('.legal-text').forEach(el => {
        el.textContent = t.legalText;
    });
}

dom.langSelect.addEventListener('change', (e) => {
    applyLanguage(e.target.value);
});

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
    
    // Combine Phone Input
    const fullPhone = `${formData.get('countryCode')} ${formData.get('phone')}`;

    // Prepare Summary View with Beautiful UI Components
    const t = i18n[state.lang];
    
    // Base Document
    let summaryHTML = `
        <div class="summary-row">
            <span class="summary-label">${t.address || 'Adresse'}</span>
            <span class="summary-value">${addr}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.zipCode || 'CP'} / ${t.city || 'Ville'}</span>
            <span class="summary-value">${formData.get('zipCode')} ${formData.get('city')}</span>
        </div>
    `;

    // Add Temporary Address Block if checked
    if (dom.hasTempAddress.checked) {
        summaryHTML += `
            <div class="summary-row" style="margin-top: 15px; border-top: 1px dashed var(--color-border); padding-top: 15px;">
                <span class="summary-label" style="color: var(--color-accent);"><i class='bx bx-map-pin'></i> ${t.tempAddress || 'Adresse temporaire'}</span>
                <span class="summary-value">${formData.get('tempAddress')}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">${t.tempZipCode || 'CP'} / ${t.tempCity || 'Ville'}</span>
                <span class="summary-value">${formData.get('tempZipCodePlaceholder')} ${formData.get('tempCityPlaceholder')}</span>
            </div>
            <div class="summary-row" style="margin-bottom: 15px; border-bottom: 1px dashed var(--color-border); padding-bottom: 15px;"></div>
        `;
    }

    // Add Phone and Email
    summaryHTML += `
        <div class="summary-row">
            <span class="summary-label">${t.phone || 'Tél'}</span>
            <span class="summary-value">${fullPhone}</span>
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
    dom.form.style.display = 'none';
    dom.summaryView.style.display = 'flex';
});

// Edit Button logic
dom.btnEdit.addEventListener('click', () => {
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
        // Check if we support this exact language (fr, en, es, it, pt, de)
        if (i18n[browserLang]) {
            return browserLang;
        }
    }
    // Ultimate fallback if language is unsupported or undetected
    return 'es'; 
}

state.lang = detectUserLanguage();
dom.langSelect.value = state.lang; // Sync UI Select box
applyLanguage(state.lang);

// ============================================================================
// 7. Dynamic Data (Country Dial Codes)
// ============================================================================
async function populateCountryCodes() {
    const select = document.getElementById('countryCode');
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

        // Auto-detect user's country based on browser language
        let userCountryCode = 'ES'; // Ultimate default
        if (navigator.language) {
            const parts = navigator.language.split('-');
            if (parts.length > 1) {
                userCountryCode = parts[1].toUpperCase(); // e.g., 'en-US' -> 'US'
            } else {
                // Map common languages to likely countries if no region is provided
                const langToCountry = {
                    'fr': 'FR', 'es': 'ES', 'en': 'GB', 'it': 'IT', 'pt': 'PT', 'de': 'DE'
                };
                userCountryCode = langToCountry[parts[0].toLowerCase()] || 'ES';
            }
        }

        // Find the best matching country or fallback to ES
        let defaultCountryIndex = countries.findIndex(c => c.cca2 === userCountryCode);
        if (defaultCountryIndex === -1) {
            defaultCountryIndex = countries.findIndex(c => c.cca2 === 'ES');
        }
        
        // Extract default country to put it at the top
        const defaultCountry = countries.splice(defaultCountryIndex, 1)[0];

        select.innerHTML = '';
        
        // 1. Add the predicted country at the very top
        if (defaultCountry) {
            const topOption = document.createElement('option');
            topOption.value = defaultCountry.code;
            topOption.textContent = defaultCountry.fullLabel;
            topOption.dataset.short = defaultCountry.shortLabel;
            topOption.selected = true;
            select.appendChild(topOption);
            
            // Set initial display
            document.getElementById('countryCodeDisplay').textContent = defaultCountry.shortLabel;
            
            // Add a separator
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '──────────';
            select.appendChild(separator);
        }

        // 2. Add all other countries sorted alphabetically
        countries.forEach(c => {
            const option = document.createElement('option');
            option.value = c.code;
            option.textContent = c.fullLabel;
            option.dataset.short = c.shortLabel;
            select.appendChild(option);
        });
        
        // 3. Update the overlay view when the native select changes
        select.addEventListener('change', (e) => {
            const selectedOpt = e.target.options[e.target.selectedIndex];
            if (selectedOpt && selectedOpt.dataset.short) {
                document.getElementById('countryCodeDisplay').textContent = selectedOpt.dataset.short;
            }
        });
        
    } catch (error) {
        console.error("Failed to load country codes:", error);
        // Fallback already in HTML
    }
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
