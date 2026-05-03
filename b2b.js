/**
 * B2B Landing Page - Interactive Logic
 * Handles QR Code Redirection, Parallax, Magnetic Effects, Liquid Glass Shines, and Scroll Snap.
 */

(function initB2B() {
    // 1. Compatibility Redirect for Old QR Codes
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
        window.location.replace('/client/' + window.location.search);
        return; // Stop execution
    }

    document.addEventListener('DOMContentLoaded', () => {
        
        // 2. Internationalization (i18n)
        const i18n = {
            fr: {
                heroTitle: "La fin des saisies au comptoir.",
                heroSubtitle: "La solution universelle pour les hôtels, agences et accueils physiques. Vos clients scannent un QR code, saisissent leurs informations sur leur smartphone, et vous les recevez instantanément. Zéro serveur, 100% sécurisé via WebRTC.",
                btnDemo: "Demander une démo",
                aiDisclaimer: "Généré automatiquement à partir de votre profil d'entreprise.",
                videoWatch: "Voir le fonctionnement",
                feat1Title: "Design Liquid Glass",
                feat1Desc: "Une interface utilisateur s'adaptant dynamiquement à votre identité.",
                feat2Title: "Scan Express",
                feat2Desc: "Connectez vos clients instantanément via QR Code. Rapide et sécurisé.",
                feat3Title: "Marque Blanche",
                feat3Desc: "Déployez notre technologie sous votre propre nom et vos propres couleurs.",
                privTitle: "Sécurité Absolue.",
                privDesc: "Vos données sont protégées par chiffrement de bout en bout. Nous utilisons la technologie WebRTC peer-to-peer : aucune donnée personnelle n'est stockée sur nos serveurs. Vos échanges clients-vendeurs restent strictement confidentiels et conformes au RGPD.",
                priceTitle: "Des tarifs adaptés à votre flotte.",
                plan1Name: "Indépendant",
                plan1Price: "2€",
                perMonth: "/mois",
                plan1Year: "Soit 20€/an",
                plan1Feat1: "1 Agence",
                plan1Feat2: "Logo & Couleurs",
                plan1Feat3: "Champs personnalisés",
                btnChoose: "Choisir",
                badgePopular: "Le plus populaire",
                plan2Name: "Multi-Agences",
                plan2Price: "8€",
                plan2Year: "Soit 80€/an",
                plan2Feat1: "Jusqu'à 10 Agences",
                plan2Feat2: "Déploiement centralisé",
                plan2Feat3: "Support prioritaire",
                btnContact: "Démarrer l'essai",
                plan3Name: "Réseau & Franchise",
                plan3Price: "Sur devis",
                plan3Year: "Contactez-nous",
                plan3Feat1: "Marque blanche intégrale",
                plan3Feat2: "Intégration API",
                plan3Feat3: "Développement spécifique",
                btnQuote: "Nous contacter",
                btnSecurityNote: "Lire la note technique",
                navSecurity: "Sécurité & Confidentialité",
                footerRights: "Tous droits réservés."
            },
            en: {
                heroTitle: "The end of manual data entry.",
                heroSubtitle: "The universal solution for hotels, agencies, and physical receptions. Clients scan a QR code, enter their info on their smartphone, and you receive it instantly. Zero server, 100% secure via WebRTC.",
                btnDemo: "Request a demo",
                aiDisclaimer: "Automatically generated from your company profile.",
                videoWatch: "See how it works",
                feat1Title: "Liquid Glass Design",
                feat1Desc: "A user interface that dynamically adapts to your brand identity.",
                feat2Title: "Express Scan",
                feat2Desc: "Connect customers instantly via QR Code. Fast and secure.",
                feat3Title: "White Label",
                feat3Desc: "Deploy our technology under your own name and brand colors.",
                privTitle: "Absolute Security.",
                privDesc: "Your data is protected by end-to-end encryption. We use WebRTC peer-to-peer technology: no personal data is stored on our servers. Your transactions remain strictly confidential and GDPR compliant.",
                priceTitle: "Pricing adapted to your fleet.",
                plan1Name: "Independent",
                plan1Price: "2€",
                perMonth: "/month",
                plan1Year: "Or 20€/year",
                plan1Feat1: "1 Agency",
                plan1Feat2: "Custom Logo & Colors",
                plan1Feat3: "Custom fields",
                btnChoose: "Choose",
                badgePopular: "Most popular",
                plan2Name: "Multi-Agency",
                plan2Price: "8€",
                plan2Year: "Or 80€/year",
                plan2Feat1: "Up to 10 Agencies",
                plan2Feat2: "Centralized deployment",
                plan2Feat3: "Priority support",
                btnContact: "Start Trial",
                plan3Name: "Enterprise",
                plan3Price: "Custom quote",
                plan3Year: "Contact us",
                plan3Feat1: "Full white-label",
                plan3Feat2: "API Integration",
                plan3Feat3: "Custom development",
                btnQuote: "Contact us",
                btnSecurityNote: "Read technical note",
                navSecurity: "Security & Privacy",
                footerRights: "All rights reserved."
            },
            es: {
                heroTitle: "El fin de la entrada manual.",
                heroSubtitle: "La solución universal para hoteles, agencias y recepciones. Sus clientes escanean un QR, introducen sus datos en su smartphone y usted los recibe al instante. 100% seguro.",
                btnDemo: "Solicitar demo",
                aiDisclaimer: "Generado automáticamente desde su perfil de empresa.",
                videoWatch: "Ver cómo funciona",
                feat1Title: "Diseño Liquid Glass",
                feat1Desc: "Una interfaz de usuario que se adapta dinámicamente a tu identidad.",
                feat2Title: "Escaneo Exprés",
                feat2Desc: "Conecta a tus clientes al instante mediante Código QR. Rápido y seguro.",
                feat3Title: "Marca Blanca",
                feat3Desc: "Despliega nuestra tecnología bajo tu propio nombre y colores.",
                privTitle: "Seguridad Absoluta.",
                privDesc: "Sus datos están protegidos con cifrado de extremo a extremo. Utilizamos tecnología P2P WebRTC: no se almacenan datos en nuestros servidores. 100% conforme al RGPD.",
                priceTitle: "Tarifas adaptadas a su flota.",
                plan1Name: "Independiente",
                plan1Price: "2€",
                perMonth: "/mes",
                plan1Year: "O 20€/año",
                plan1Feat1: "1 Agencia",
                plan1Feat2: "Logo y colores",
                plan1Feat3: "Campos personalizados",
                btnChoose: "Elegir",
                badgePopular: "Más popular",
                plan2Name: "Multi-Agencia",
                plan2Price: "8€",
                plan2Year: "O 80€/año",
                plan2Feat1: "Hasta 10 Agencias",
                plan2Feat2: "Despliegue centralizado",
                plan2Feat3: "Soporte prioritario",
                btnContact: "Iniciar prueba",
                plan3Name: "Empresa",
                plan3Price: "A medida",
                plan3Year: "Contáctenos",
                plan3Feat1: "Marca blanca total",
                plan3Feat2: "Integración API",
                plan3Feat3: "Desarrollo a medida",
                btnQuote: "Contáctenos",
                btnSecurityNote: "Leer nota técnica",
                navSecurity: "Seguridad y Privacidad",
                footerRights: "Todos los derechos reservados."
            },
            it: {
                heroTitle: "La fine dell'inserimento manuale.",
                heroSubtitle: "La soluzione universale per hotel, agenzie e reception fisiche. I clienti scansionano un QR, inseriscono i dati sul loro smartphone e tu li ricevi all'istante. 100% sicuro.",
                btnDemo: "Richiedi demo",
                aiDisclaimer: "Generato automaticamente dal profilo aziendale.",
                videoWatch: "Guarda come funziona",
                feat1Title: "Design Liquid Glass",
                feat1Desc: "Un'interfaccia utente che si adatta dinamicamente alla tua identità.",
                feat2Title: "Scansione Express",
                feat2Desc: "Connetti i tuoi clienti all'istante tramite QR Code. Rapido e sicuro.",
                feat3Title: "White Label",
                feat3Desc: "Distribuisci la nostra tecnologia con il tuo nome e i tuoi colori.",
                privTitle: "Sicurezza Assoluta.",
                privDesc: "Dati protetti da crittografia end-to-end. Utilizziamo WebRTC P2P: nessun dato personale viene archiviato sui nostri server. Pienamente conforme al GDPR.",
                priceTitle: "Prezzi adattati alla tua flotta.",
                plan1Name: "Indipendente",
                plan1Price: "2€",
                perMonth: "/mese",
                plan1Year: "O 20€/anno",
                plan1Feat1: "1 Agenzia",
                plan1Feat2: "Logo e colori",
                plan1Feat3: "Campi personalizzati",
                btnChoose: "Scegli",
                badgePopular: "Più popolare",
                plan2Name: "Multi-Agenzia",
                plan2Price: "8€",
                plan2Year: "O 80€/anno",
                plan2Feat1: "Fino a 10 Agenzie",
                plan2Feat2: "Distribuzione centralizzata",
                plan2Feat3: "Supporto prioritario",
                btnContact: "Inizia prova",
                plan3Name: "Azienda",
                plan3Price: "Su misura",
                plan3Year: "Contattaci",
                plan3Feat1: "White-label totale",
                plan3Feat2: "Integrazione API",
                plan3Feat3: "Sviluppo su misura",
                btnQuote: "Contattaci",
                btnSecurityNote: "Leggi la nota tecnica",
                navSecurity: "Sicurezza e Privacy",
                footerRights: "Tutti i diritti riservati."
            },
            pt: {
                heroTitle: "O fim da digitação manual.",
                heroSubtitle: "A solução universal para hotéis, agências e recepções. Os clientes escaneiam um QR, inserem seus dados no smartphone e você recebe instantaneamente. 100% seguro.",
                btnDemo: "Pedir uma demo",
                aiDisclaimer: "Gerado automaticamente a partir do perfil da empresa.",
                videoWatch: "Veja como funciona",
                feat1Title: "Design Liquid Glass",
                feat1Desc: "Uma interface que se adapta dinamicamente à sua identidade.",
                feat2Title: "Digitalização Express",
                feat2Desc: "Conecte os clientes via código QR. Rápido e seguro.",
                feat3Title: "Marca Branca",
                feat3Desc: "Implemente nossa tecnologia sob seu próprio nome e cores.",
                privTitle: "Segurança Absoluta.",
                privDesc: "Seus dados são protegidos por criptografia de ponta a ponta. Usamos WebRTC P2P: sem armazenamento de dados nos nossos servidores. Em conformidade com o RGPD.",
                priceTitle: "Preços adaptados à sua frota.",
                plan1Name: "Independente",
                plan1Price: "2€",
                perMonth: "/mês",
                plan1Year: "Ou 20€/ano",
                plan1Feat1: "1 Agência",
                plan1Feat2: "Logo e cores",
                plan1Feat3: "Campos personalizados",
                btnChoose: "Escolher",
                badgePopular: "Mais popular",
                plan2Name: "Multi-Agência",
                plan2Price: "8€",
                plan2Year: "Ou 80€/ano",
                plan2Feat1: "Até 10 Agências",
                plan2Feat2: "Implantação centralizada",
                plan2Feat3: "Suporte prioritário",
                btnContact: "Iniciar teste",
                plan3Name: "Empresa",
                plan3Price: "Personalizado",
                plan3Year: "Contacte-nos",
                plan3Feat1: "Marca branca total",
                plan3Feat2: "Integração API",
                plan3Feat3: "Desenvolvimento sob medida",
                btnQuote: "Contacte-nos",
                btnSecurityNote: "Ler nota técnica",
                navSecurity: "Segurança e Privacidade",
                footerRights: "Todos os direitos reservados."
            },
            de: {
                heroTitle: "Das Ende der manuellen Dateneingabe.",
                heroSubtitle: "Die universelle Lösung für Hotels, Agenturen und physische Empfänge. Kunden scannen einen QR-Code, geben ihre Daten am Smartphone ein und Sie erhalten diese sofort.",
                btnDemo: "Demo anfordern",
                aiDisclaimer: "Automatisch aus dem Firmenprofil generiert.",
                videoWatch: "So funktioniert es",
                feat1Title: "Liquid Glass Design",
                feat1Desc: "Eine Benutzeroberfläche, die sich dynamisch anpasst.",
                feat2Title: "Express-Scan",
                feat2Desc: "Kunden sofort über QR-Code verbinden. Schnell und sicher.",
                feat3Title: "White-Label",
                feat3Desc: "Nutzen Sie unsere Technologie unter Ihrem eigenen Namen.",
                privTitle: "Absolute Sicherheit.",
                privDesc: "Daten durch End-to-End-Verschlüsselung geschützt. Keine personenbezogenen Daten auf unseren Servern gespeichert. DSGVO-konform.",
                priceTitle: "Preise angepasst an Ihre Flotte.",
                plan1Name: "Unabhängig",
                plan1Price: "2€",
                perMonth: "/Monat",
                plan1Year: "Oder 20€/Jahr",
                plan1Feat1: "1 Filiale",
                plan1Feat2: "Individuelles Logo",
                plan1Feat3: "Eigene Felder",
                btnChoose: "Wählen",
                badgePopular: "Am beliebtesten",
                plan2Name: "Multi-Filialen",
                plan2Price: "8€",
                plan2Year: "Oder 80€/Jahr",
                plan2Feat1: "Bis zu 10 Filialen",
                plan2Feat2: "Zentrale Bereitstellung",
                plan2Feat3: "Prioritätssupport",
                btnContact: "Test starten",
                plan3Name: "Unternehmen",
                plan3Price: "Nach Maß",
                plan3Year: "Kontaktieren Sie uns",
                plan3Feat1: "Komplettes White-Label",
                plan3Feat2: "API-Integration",
                plan3Feat3: "Maßgeschneiderte Entwicklung",
                btnQuote: "Kontaktieren Sie uns",
                btnSecurityNote: "Technische Notiz lesen",
                navSecurity: "Sicherheit & Datenschutz",
                footerRights: "Alle Rechte vorbehalten."
            },
            nl: {
                heroTitle: "Het einde van handmatige invoer.",
                heroSubtitle: "De universele oplossing voor hotels, bureaus en fysieke recepties. Klanten scannen een QR-code, vullen hun info in op hun smartphone en u ontvangt deze direct.",
                btnDemo: "Demo aanvragen",
                aiDisclaimer: "Automatisch gegenereerd op basis van bedrijfsprofiel.",
                videoWatch: "Bekijk hoe het werkt",
                feat1Title: "Liquid Glass Ontwerp",
                feat1Desc: "Een gebruikersinterface die zich dynamisch aanpast.",
                feat2Title: "Express Scan",
                feat2Desc: "Verbind klanten onmiddellijk via QR-code. Snel en veilig.",
                feat3Title: "White-Label",
                feat3Desc: "Implementeer onze technologie onder uw eigen naam.",
                privTitle: "Absolute Veiligheid.",
                privDesc: "Gegevens beschermd door end-to-end codering. WebRTC P2P-technologie: geen persoonlijke gegevens op onze servers. Volledig AVG-conform.",
                priceTitle: "Prijzen afgestemd op uw vloot.",
                plan1Name: "Onafhankelijk",
                plan1Price: "2€",
                perMonth: "/maand",
                plan1Year: "Of 20€/jaar",
                plan1Feat1: "1 Vestiging",
                plan1Feat2: "Eigen logo & kleuren",
                plan1Feat3: "Aangepaste velden",
                btnChoose: "Kiezen",
                badgePopular: "Meest populair",
                plan2Name: "Meerdere vestigingen",
                plan2Price: "8€",
                plan2Year: "Of 80€/jaar",
                plan2Feat1: "Tot 10 vestigingen",
                plan2Feat2: "Gecentraliseerde implementatie",
                plan2Feat3: "Prioriteitsondersteuning",
                btnContact: "Start proefperiode",
                plan3Name: "Onderneming",
                plan3Price: "Op maat",
                plan3Year: "Neem contact op",
                plan3Feat1: "Volledig white-label",
                plan3Feat2: "API integratie",
                plan3Feat3: "Maatwerk ontwikkeling",
                btnQuote: "Neem contact op",
                btnSecurityNote: "Lees technische notitie",
                navSecurity: "Veiligheid & Privacy",
                footerRights: "Alle rechten voorbehouden."
            }
        };

        const updateLanguage = (lang) => {
            const dict = i18n[lang] || i18n['en'];
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (dict[key]) {
                    el.textContent = dict[key];
                }
            });
            document.documentElement.lang = lang;
        };

        const langSelect = document.getElementById('languageSelect');
        const langDisplay = document.getElementById('langDisplay');
        if (langSelect && langDisplay) {
            langSelect.addEventListener('change', (e) => {
                const text = e.target.options[e.target.selectedIndex].text;
                const lang = e.target.value;
                langDisplay.textContent = text;
                updateLanguage(lang);
            });
        }

        // 3. Scroll Reveal Animation within the Scroll Container
        const scrollContainer = document.querySelector('.scroll-container');
        const revealElements = document.querySelectorAll('.reveal, .blur-reveal');
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // For blur-reveal it's handled by css animation delay, but we can trigger it
                    if (entry.target.classList.contains('reveal')) {
                        entry.target.classList.add('active');
                    }
                }
            });
        }, {
            root: scrollContainer,
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));

        // Trigger animations on load for the first section
        setTimeout(() => {
            document.querySelectorAll('.hero .blur-reveal').forEach(el => el.style.animationPlayState = 'running');
        }, 100);

        // 4. Liquid Glass 3D Hover & Shine Effect
        const glassCards = document.querySelectorAll('.glass-card');
        
        glassCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Update shine center
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                
                // 3D Tilt calculation
                if (card.classList.contains('magnetic-card')) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -8; // Max 8deg
                    const rotateY = ((x - centerX) / centerX) * 8;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (card.classList.contains('magnetic-card')) {
                    card.style.transform = card.classList.contains('featured') ? 
                        `perspective(1000px) rotateX(0) rotateY(0) scale3d(1.05, 1.05, 1.05)` : 
                        `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
                }
            });
        });

        // 5. Magnetic Buttons (Apple/Linear style)
        const magneticElements = document.querySelectorAll('.magnetic');
        
        magneticElements.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left) - rect.width / 2;
                const y = (e.clientY - rect.top) - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });

        // 6. Ambient Cursor Glow (Dynamic background tracker)
        const ambientGlow = document.createElement('div');
        ambientGlow.className = 'ambient-cursor-glow';
        document.body.appendChild(ambientGlow);

        document.addEventListener('mousemove', (e) => {
            ambientGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });

        // 7. Header Blur intensity on scroll
        const header = document.querySelector('.b2b-nav');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', () => {
                if (scrollContainer.scrollTop > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
    });
})();
