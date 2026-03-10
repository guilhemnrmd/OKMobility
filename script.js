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
      "searchAddress": "Rechercher une adresse...",
      "zipCode": "Code Postal",
      "city": "Ville",
      "phone": "Téléphone Mobile",
      "email": "E-mail",
      "placeholderCity": "Paris",
      "placeholderZip": "75001",
      "placeholderPhone": "6 12 34 56 78",
      "placeholderEmail": "jean.dupont@email.com",
      "btnGenerate": "Générer mon résumé",
      "btnSend": "Envoyer par e-mail",
      "btnEdit": "Modifier",
      "legalText": "OK MOBILITY GROUP, S.L.U. est le Responsable du traitement des données personnelles de l'intéressé et l'informe que ces données seront traitées conformément aux dispositions du Règlement (UE) 2016/679 du 27 avril (RGPD) et de la Loi Organique 3/2018 du 5 décembre (LOPDG).",
      "summaryTitle": "Veuillez présenter ce résumé au conseiller"
    },
    "en": {
      "dir": "ltr",
      "pageTitle": "Your information",
      "address": "Home Address",
      "searchAddress": "Search for an address...",
      "zipCode": "Postal Code / Zip",
      "city": "City",
      "phone": "Mobile Telephone Number",
      "email": "E-mail",
      "placeholderCity": "London",
      "placeholderZip": "SW1A 1AA",
      "placeholderPhone": "7911 123456",
      "placeholderEmail": "john.doe@email.com",
      "btnGenerate": "Generate my summary",
      "btnSend": "Send by e-mail",
      "btnEdit": "Edit",
      "legalText": "OK MOBILITY GROUP, S.L.U. is the Data Controller of the Data Subject's personal data and informs them that this data will be processed in accordance with the provisions of Regulation (EU) 2016/679 of April 27 (GDPR) and Organic Law 3/2018 of December 5 (LOPDG).",
      "summaryTitle": "Please present this summary to the advisor"
    },
    "es": {
      "dir": "ltr",
      "pageTitle": "Su información",
      "address": "Dirección de residencia",
      "searchAddress": "Buscar dirección...",
      "zipCode": "Código Postal / CP",
      "city": "Ciudad",
      "phone": "Teléfono Móvil",
      "email": "E-mail",
      "placeholderCity": "Madrid",
      "placeholderZip": "28001",
      "placeholderPhone": "612 34 56 78",
      "placeholderEmail": "juan.perez@email.com",
      "btnGenerate": "Generar mi resumen",
      "btnSend": "Enviar por e-mail",
      "btnEdit": "Modificar",
      "legalText": "OK MOBILITY GROUP, S.L.U. es el Responsable del tratamiento de los datos personales del Interesado y le informa de que estos datos se tratarán de conformidad con lo dispuesto en el Reglamento (UE) 2016/679, de 27 de abril (GDPR), y la Ley Orgánica 3/2018, de 5 de diciembre (LOPDG).",
      "summaryTitle": "Por favor, presente este resumen al asesor"
    },
    "it": {
      "dir": "ltr",
      "pageTitle": "Le tue informazioni",
      "address": "Indirizzo di residenza",
      "searchAddress": "Cerca indirizzo...",
      "zipCode": "Codice Postale / CAP",
      "city": "Città",
      "phone": "Telefono Cellulare",
      "email": "E-mail",
      "placeholderCity": "Roma",
      "placeholderZip": "00118",
      "placeholderPhone": "312 345 6789",
      "placeholderEmail": "mario.rossi@email.com",
      "btnGenerate": "Genera il mio riepilogo",
      "btnSend": "Invia tramite e-mail",
      "btnEdit": "Modifica",
      "legalText": "OK MOBILITY GROUP, S.L.U. è il Titolare del trattamento dei dati personali dell'Interessato e lo informa che tali dati saranno trattati in conformità a quanto disposto dal Regolamento (UE) 2016/679 del 27 aprile (GDPR) e dalla Legge Organica 3/2018 del 5 dicembre (LOPDG).",
      "summaryTitle": "Si prega di presentare questo riepilogo al consulente"
    },
    "pt": {
      "dir": "ltr",
      "pageTitle": "As suas informações",
      "address": "Morada",
      "searchAddress": "Pesquisar endereço...",
      "zipCode": "Código Postal",
      "city": "Cidade",
      "phone": "Telemóvel",
      "email": "E-mail",
      "placeholderCity": "Lisboa",
      "placeholderZip": "1000-001",
      "placeholderPhone": "912 345 678",
      "placeholderEmail": "joao.silva@email.com",
      "btnGenerate": "Gerar o meu resumo",
      "btnSend": "Enviar por e-mail",
      "btnEdit": "Editar",
      "legalText": "A OK MOBILITY GROUP, S.L.U. é a Responsável pelo tratamento dos dados pessoais do Titular e informa que estes dados serão tratados de acordo com o Regulamento (UE) 2016/679 de 27 de abril (RGPD) e a Lei Orgânica 3/2018 de 5 de dezembro (LOPDG).",
      "summaryTitle": "Por favor, apresente este resumo ao consultor"
    },
    "de": {
      "dir": "ltr",
      "pageTitle": "Ihre Informationen",
      "address": "Wohnanschrift",
      "searchAddress": "Adresse suchen...",
      "zipCode": "Postleitzahl / PLZ",
      "city": "Stadt",
      "phone": "Handynummer",
      "email": "E-Mail",
      "placeholderCity": "Berlin",
      "placeholderZip": "10115",
      "placeholderPhone": "151 23456789",
      "placeholderEmail": "max.mustermann@email.com",
      "btnGenerate": "Meine Zusammenfassung erstellen",
      "btnSend": "Per E-Mail senden",
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
    btnSend: document.getElementById('btnSend'),
    // Inputs
    searchAddress: document.getElementById('addressSearch'),
    addressResults: document.getElementById('addressResults'),
    zipCode: document.getElementById('zipCode'),
    city: document.getElementById('city'),
    fullAddress: document.getElementById('fullAddress'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    addressLoader: document.getElementById('addressLoader'),
    btnEdit: document.getElementById('btnEdit')
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
    dom.searchAddress.placeholder = t.searchAddress;
    
    document.getElementById('lblZipCode').textContent = t.zipCode;
    dom.zipCode.placeholder = t.placeholderZip;
    
    document.getElementById('lblCity').textContent = t.city;
    dom.city.placeholder = t.placeholderCity;
    
    document.getElementById('lblPhone').textContent = t.phone;
    dom.phone.placeholder = t.placeholderPhone;
    
    document.getElementById('lblEmail').textContent = t.email;
    dom.email.placeholder = t.placeholderEmail;
    
    document.getElementById('txtBtnGenerate').textContent = t.btnGenerate;
    document.getElementById('txtBtnSend').textContent = t.btnSend;
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
// 4. Address Autocomplete (Photon API)
// ============================================================================
async function fetchAddressSuggestions(query) {
    if (!query || query.length < 3) {
        dom.addressResults.style.display = 'none';
        return;
    }

    try {
        dom.addressLoader.style.display = 'block';
        // Limit to 5 results to keep UI clean
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        
        renderAddressSuggestions(data.features);
    } catch (error) {
        console.error('Error fetching addresses:', error);
    } finally {
        dom.addressLoader.style.display = 'none';
    }
}

function renderAddressSuggestions(features) {
    dom.addressResults.innerHTML = '';
    
    if (!features || features.length === 0) {
        dom.addressResults.style.display = 'none';
        return;
    }

    features.forEach(feature => {
        const p = feature.properties;
        
        // Construct display string safely
        const street = p.street || p.name || '';
        const houseNumber = p.housenumber || '';
        const city = p.city || p.town || p.village || p.state || '';
        const postcode = p.postcode || '';
        const country = p.country || '';

        // Build main text (street + number) and sub text (postcode + city)
        let mainText = `${houseNumber} ${street}`.trim();
        if (!mainText) mainText = p.name || city;
        
        let subText = `${postcode} ${city}, ${country}`.replace(/^[\s,]+/, '').trim();

        const li = document.createElement('li');
        li.innerHTML = `
            <span class="ac-main">${mainText}</span>
            <span class="ac-sub">${subText}</span>
        `;

        li.addEventListener('click', () => {
            selectAddress(p, mainText);
        });

        dom.addressResults.appendChild(li);
    });

    dom.addressResults.style.display = 'block';
}

function selectAddress(properties, mainText) {
    // Fill the visual search input with the main street text
    dom.searchAddress.value = mainText;
    
    // Fill hidden full address just in case
    dom.fullAddress.value = `${mainText}, ${properties.postcode || ''} ${properties.city || properties.town || properties.state || ''}, ${properties.country || ''}`;
    
    // Auto-fill Readonly fields
    dom.zipCode.value = properties.postcode || '';
    dom.city.value = properties.city || properties.town || properties.village || properties.state || '';

    dom.addressResults.style.display = 'none';
    state.addressSelected = true;

    // Optional: Visual cue (Green check on focus out or transition)
    dom.zipCode.parentElement.style.boxShadow = "0 0 0 2px rgba(52, 199, 89, 0.3)";
    dom.city.parentElement.style.boxShadow = "0 0 0 2px rgba(52, 199, 89, 0.3)";
    setTimeout(() => {
        dom.zipCode.parentElement.style.boxShadow = "none";
        dom.city.parentElement.style.boxShadow = "none";
    }, 1000);
}

// Event Listeners for search with Debounce (300ms)
dom.searchAddress.addEventListener('input', (e) => {
    // If we just selected an address programmatically, ignore this input event
    if (state.addressSelected) {
        state.addressSelected = false; // Reset for next manual typing
        return;
    }

    clearTimeout(state.debounceTimer);
    
    state.debounceTimer = setTimeout(() => {
        fetchAddressSuggestions(e.target.value.trim());
    }, 300);
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!dom.searchAddress.contains(e.target) && !dom.addressResults.contains(e.target)) {
        dom.addressResults.style.display = 'none';
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
    
    // Fallback: If no address was properly "selected" from Photon, use raw search input
    let addr = dom.fullAddress.value;
    if (!state.addressSelected || !addr) {
        addr = `${formData.get('addressSearch')} - ${formData.get('zipCode')} ${formData.get('city')}`;
    }
    
    // Combine Phone Input
    const fullPhone = `${formData.get('countryCode')} ${formData.get('phone')}`;

    // Build plain text body for email
    const mailBody = `Nouveau Client

ADRESSE : ${addr}
CODE POSTAL : ${formData.get('zipCode')}
VILLE : ${formData.get('city')}

TÉLÉPHONE : ${fullPhone}
EMAIL : ${formData.get('email')}
`;

    // Encode for safely putting in mailto link
    const subject = "Nouveau Client OK Mobility";
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;

    // Prepare Summary View with Beautiful UI Components
    const t = i18n[state.lang];
    dom.summaryContentBody.innerHTML = `
        <div class="summary-row">
            <span class="summary-label">${t.address || 'Adresse'}</span>
            <span class="summary-value">${addr}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.zipCode || 'CP'} / ${t.city || 'Ville'}</span>
            <span class="summary-value">${formData.get('zipCode')} ${formData.get('city')}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.phone || 'Tél'}</span>
            <span class="summary-value">${fullPhone}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">${t.email || 'Email'}</span>
            <span class="summary-value">${formData.get('email')}</span>
        </div>
    `;

    // Configure Send Button
    dom.btnSend.href = mailtoLink;

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
