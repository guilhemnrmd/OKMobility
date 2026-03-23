/**
 * Brand Configuration — Single source of truth for all brand-specific values.
 *
 * To white-label this app for a different partner:
 * 1. Duplicate this file (e.g. brand-config-partner.js)
 * 2. Change the values below
 * 3. Add matching logo SVGs to /assets/logos/
 * 4. Add a CSS theme block (html.theme-<name>) in style.css or a separate CSS file
 * 5. Reference your brand config in the HTML pages instead of this one
 */

window.BRAND = {

    /* ── Identity ─────────────────────────────────────────────────── */
    name: 'OK Mobility',
    slogan: 'The Global Mobility Platform',
    legalEntity: 'OK MOBILITY GROUP, S.L.U.',
    copyright: '\u00a9 2026 Guilhem Normand \u2014 Todos los derechos reservados',

    /* ── Logos ────────────────────────────────────────────────────── */
    logos: {
        desktop: '/assets/logos/okm-logo-white.svg',
        mobile:  '/assets/logos/okm-logo-mobile-white.svg',
    },

    /* ── Theme ────────────────────────────────────────────────────── */
    // CSS class applied on <html> to override CSS variables.
    // Leave empty for the default OK Mobility theme.
    theme: '',

    /* ── Legal texts (GDPR / data protection) per language ─────── */
    legalText: {
        fr: "OK MOBILITY GROUP, S.L.U. est le Responsable du traitement des donn\u00e9es \u00e0 caract\u00e8re personnel de la personne concern\u00e9e et l\u2019informe que lesdites donn\u00e9es feront l\u2019objet d\u2019un traitement conform\u00e9ment aux dispositions du R\u00e8glement (UE) 2016/679 du Parlement europ\u00e9en et du Conseil du 27 avril 2016 (RGPD) et de la Loi Organique 3/2018 du 5 d\u00e9cembre relative \u00e0 la protection des donn\u00e9es personnelles et \u00e0 la garantie des droits num\u00e9riques (LOPDGDD).",
        en: "OK MOBILITY GROUP, S.L.U. acts as Data Controller with respect to the personal data of the Data Subject and hereby informs that such data shall be processed in accordance with the provisions of Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 (GDPR) and Organic Law 3/2018 of 5 December on the Protection of Personal Data and Guarantee of Digital Rights (LOPDGDD).",
        es: "OK MOBILITY GROUP, S.L.U. es el Responsable del tratamiento de los datos personales del Interesado y le informa de que estos datos se tratar\u00e1n de conformidad con lo dispuesto en el Reglamento (UE) 2016/679, de 27 de abril (GDPR), y la Ley Org\u00e1nica 3/2018, de 5 de diciembre (LOPDG).",
        it: "OK MOBILITY GROUP, S.L.U. \u00e8 il Titolare del trattamento dei dati personali dell\u2019Interessato e lo informa che tali dati saranno trattati in conformit\u00e0 con le disposizioni del Regolamento (UE) 2016/679 del Parlamento europeo e del Consiglio del 27 aprile 2016 (GDPR) e della Legge Organica 3/2018 del 5 dicembre sulla protezione dei dati personali e garanzia dei diritti digitali (LOPDGDD).",
        pt: "A OK MOBILITY GROUP, S.L.U. \u00e9 a Respons\u00e1vel pelo tratamento dos dados pessoais do Titular dos dados e informa que os referidos dados ser\u00e3o tratados em conformidade com o disposto no Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho, de 27 de abril de 2016 (RGPD), e na Lei Org\u00e2nica n.\u00ba 3/2018, de 5 de dezembro, relativa \u00e0 Prote\u00e7\u00e3o de Dados Pessoais e \u00e0 Garantia dos Direitos Digitais (LOPDGDD).",
        de: "OK MOBILITY GROUP, S.L.U. ist der Verantwortliche im Sinne des Datenschutzrechts f\u00fcr die Verarbeitung der personenbezogenen Daten der betroffenen Person und teilt mit, dass diese Daten gem\u00e4\u00df den Bestimmungen der Verordnung (EU) 2016/679 des Europ\u00e4ischen Parlaments und des Rates vom 27. April 2016 (DSGVO) sowie des Organgesetzes 3/2018 vom 5. Dezember \u00fcber den Schutz personenbezogener Daten und die Gew\u00e4hrleistung digitaler Rechte (LOPDGDD) verarbeitet werden.",
        nl: "OK MOBILITY GROUP, S.L.U. is de verwerkingsverantwoordelijke voor de persoonsgegevens van de betrokkene en informeert dat deze gegevens worden verwerkt in overeenstemming met Verordening (EU) 2016/679 van het Europees Parlement en de Raad van 27 april 2016 (AVG) en Organieke Wet 3/2018 van 5 december inzake de bescherming van persoonsgegevens en de waarborging van digitale rechten (LOPDGDD).",
    },

    /* ── Fallback agencies (used by license-gate when API is unavailable) */
    fallbackAgencies: [
        { id: 'valencia_aero_01',    label: 'OK Mobility Valencia Aeropuerto' },
        { id: 'valencia_sorolla_01', label: 'OK Mobility Estaci\u00f3n Joaqu\u00edn Sorolla' },
    ],
};

/* ── Auto-init: apply brand to the DOM on page load ────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const B = window.BRAND;
    if (!B) return;

    // Page title: replace "OK Mobility" if present, otherwise prepend brand name
    if (document.title.includes('OK Mobility')) {
        document.title = document.title.replace(/OK Mobility/g, B.name);
    }

    // Logos
    document.querySelectorAll('.logo-img-brand').forEach(img => {
        img.src = B.logos.desktop;
        img.alt = B.name + ' Logo';
    });
    document.querySelectorAll('source[srcset*="okm-logo-mobile"]').forEach(s => {
        s.srcset = B.logos.mobile;
    });

    // Brand slogan default (used by retailer page)
    document.querySelectorAll('.brand-slogan[data-default-slogan]').forEach(el => {
        el.dataset.defaultSlogan = B.slogan;
    });

    // Copyright
    const copyrightEl = document.getElementById('advisorCopyrightText');
    if (copyrightEl && B.copyright) {
        copyrightEl.textContent = B.copyright;
    }

    // Theme class
    if (B.theme) {
        document.documentElement.classList.add(B.theme);
    }

    // Subtle blob parallax on mouse move (desktop only)
    // Applied to the ambient-background container to avoid conflicting with blob float animations
    const ambientBg = document.querySelector('.ambient-background');
    if (ambientBg && window.matchMedia('(pointer: fine)').matches) {
        let ticking = false;
        document.addEventListener('mousemove', (e) => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const cx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
                const cy = (e.clientY / window.innerHeight - 0.5) * 2;
                const dx = cx * 12; // max ~12px displacement
                const dy = cy * 8;
                ambientBg.style.transform = `translate(${dx}px, ${dy}px)`;
                ticking = false;
            });
        });
    }
});
