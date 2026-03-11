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
      "summaryTitle": "Veuillez présenter ce résumé au conseiller"
    },
    "en": {
      "dir": "ltr",
      "pageTitle": "Your information",
      "address": "Home Address",
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
      "summaryTitle": "Please present this summary to the advisor"
    },
    "es": {
      "dir": "ltr",
      "pageTitle": "Su información",
      "address": "Dirección de residencia",
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
      "summaryTitle": "Por favor, presente este resumen al asesor"
    },
    "it": {
      "dir": "ltr",
      "pageTitle": "Le tue informazioni",
      "address": "Indirizzo di residenza",
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
      "summaryTitle": "Si prega di presentare questo riepilogo al consulente"
    },
    "pt": {
      "dir": "ltr",
      "pageTitle": "As suas informações",
      "address": "Morada",
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
      "summaryTitle": "Por favor, apresente este resumo ao consultor"
    },
    "de": {
      "dir": "ltr",
      "pageTitle": "Ihre Informationen",
      "address": "Wohnanschrift",
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
      "summaryTitle": "Bitte legen Sie diese Zusammenfassung dem Berater vor"
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
    phoneSelectedManually: false
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
    
    // Met à jour le h1 selon la vue active
    const summaryVisible = dom.summaryView && dom.summaryView.style.display !== 'none';
    document.getElementById('pageTitle').textContent = summaryVisible ? t.summaryTitle : t.pageTitle;
    
    // Legal Texts
    document.querySelectorAll('.legal-text').forEach(el => {
        el.textContent = t.legalText;
    });

    if (state.globalCountriesData && state.globalCountriesData.length > 0) {
        renderCountrySelect(langCode);
    }
}

dom.langSelect.addEventListener('change', (e) => {
    applyLanguage(e.target.value);
});

document.getElementById('btnReset').addEventListener('click', () => {
    const btn = document.getElementById('btnReset');
    btn.classList.add('spinning');
    sessionStorage.setItem('okm_lang', state.lang);
    setTimeout(() => location.reload(), 520);
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

    // Prepare Summary View with Beautiful UI Components (Forced to Spanish)
    const t = i18n['es'];
    
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
        // Check if we support this exact language (fr, en, es, it, pt, de)
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

        const select = document.getElementById('countryCode');
        // Update the overlay view when the native select changes (only bind once)
        select.addEventListener('change', (e) => {
            state.phoneSelectedManually = true;
            const selectedOpt = e.target.options[e.target.selectedIndex];
            if (selectedOpt && selectedOpt.dataset.short) {
                document.getElementById('countryCodeDisplay').textContent = selectedOpt.dataset.short;
            }
        });

        // Initial render
        renderCountrySelect(state.lang);
        
    } catch (error) {
        console.error('Error fetching country codes:', error);
    }
}

function renderCountrySelect(langCode) {
    if (!state.globalCountriesData || state.globalCountriesData.length === 0) return;
    const select = document.getElementById('countryCode');
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
            document.getElementById('countryCodeDisplay').textContent = c.shortLabel;
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
            document.getElementById('countryCodeDisplay').textContent = c.shortLabel;
            selectionRestored = true;
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
