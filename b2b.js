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
                heroTitle: "Digitalisez l'accueil en agence.",
                heroSubtitle: "La plateforme en marque blanche pour les loueurs de mobilité. Vos clients scannent, remplissent leurs informations sur leur smartphone, et vous les recevez instantanément au comptoir. Zéro serveur, 100% RGPD.",
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
                plan1Name: "Starter",
                plan1Price: "29€",
                perMonth: "/mois",
                plan1Feat1: "1 Agence",
                plan1Feat2: "Personnalisation Logo",
                plan1Feat3: "Connexions P2P illimitées",
                btnChoose: "Choisir",
                badgePopular: "Le plus populaire",
                plan2Name: "Pro",
                plan2Price: "89€",
                plan2Feat1: "Agences illimitées",
                plan2Feat2: "Marque blanche totale",
                plan2Feat3: "Support prioritaire 24/7",
                plan2Feat4: "Déploiement sur-mesure",
                btnContact: "Démarrer l'essai",
                footerRights: "Tous droits réservés."
            },
            en: {
                heroTitle: "Digitize your agency onboarding.",
                heroSubtitle: "The white-label platform for mobility renters. Your clients scan a QR code, fill in their information on their smartphone, and you receive it instantly at the counter. Zero server, 100% GDPR.",
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
                plan1Name: "Starter",
                plan1Price: "29€",
                perMonth: "/month",
                plan1Feat1: "1 Agency",
                plan1Feat2: "Custom Logo",
                plan1Feat3: "Unlimited P2P connections",
                btnChoose: "Choose",
                badgePopular: "Most popular",
                plan2Name: "Pro",
                plan2Price: "89€",
                plan2Feat1: "Unlimited agencies",
                plan2Feat2: "Total white-label",
                plan2Feat3: "24/7 priority support",
                plan2Feat4: "Custom deployment",
                btnContact: "Start Trial",
                footerRights: "All rights reserved."
            },
            es: {
                heroTitle: "Digitalice la recepción en su agencia.",
                heroSubtitle: "La plataforma de marca blanca para alquileres de movilidad. Sus clientes escanean, rellenan su información en su smartphone, y usted la recibe al instante en el mostrador. 100% seguro.",
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
                plan1Name: "Starter",
                plan1Price: "29€",
                perMonth: "/mes",
                plan1Feat1: "1 Agencia",
                plan1Feat2: "Logo personalizado",
                plan1Feat3: "Conexiones P2P ilimitadas",
                btnChoose: "Elegir",
                badgePopular: "Más popular",
                plan2Name: "Pro",
                plan2Price: "89€",
                plan2Feat1: "Agencias ilimitadas",
                plan2Feat2: "Marca blanca total",
                plan2Feat3: "Soporte 24/7",
                plan2Feat4: "Despliegue a medida",
                btnContact: "Iniciar prueba",
                footerRights: "Todos los derechos reservados."
            },
            it: {
                heroTitle: "Digitalizza l'accoglienza in agenzia.",
                heroSubtitle: "La piattaforma white-label per il noleggio. I clienti scansionano, inseriscono le informazioni sul loro smartphone e le ricevi all'istante al banco. 100% sicuro.",
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
                plan1Name: "Starter",
                plan1Price: "29€",
                perMonth: "/mese",
                plan1Feat1: "1 Agenzia",
                plan1Feat2: "Logo personalizzato",
                plan1Feat3: "Connessioni P2P illimitate",
                btnChoose: "Scegli",
                badgePopular: "Più popolare",
                plan2Name: "Pro",
                plan2Price: "89€",
                plan2Feat1: "Agenzie illimitate",
                plan2Feat2: "White-label totale",
                plan2Feat3: "Supporto 24/7",
                plan2Feat4: "Implementazione su misura",
                btnContact: "Inizia prova",
                footerRights: "Tutti i diritti riservati."
            },
            pt: {
                heroTitle: "Digitalize o atendimento na agência.",
                heroSubtitle: "A plataforma marca branca para aluguel de mobilidade. Seus clientes escaneiam, preenchem suas informações no smartphone e você as recebe instantaneamente no balcão.",
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
                plan1Name: "Starter",
                plan1Price: "29€",
                perMonth: "/mês",
                plan1Feat1: "1 Agência",
                plan1Feat2: "Logo personalizado",
                plan1Feat3: "Conexões P2P ilimitadas",
                btnChoose: "Escolher",
                badgePopular: "Mais popular",
                plan2Name: "Pro",
                plan2Price: "89€",
                plan2Feat1: "Agências ilimitadas",
                plan2Feat2: "Marca branca total",
                plan2Feat3: "Suporte 24/7",
                plan2Feat4: "Implantação sob medida",
                btnContact: "Iniciar teste",
                footerRights: "Todos os direitos reservados."
            },
            de: {
                heroTitle: "Digitalisieren Sie Ihren Empfang.",
                heroSubtitle: "Die White-Label-Plattform für Mobilitätsvermieter. Kunden scannen, füllen ihre Infos auf dem Smartphone aus und Sie erhalten sie sofort am Schalter. 100% sicher.",
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
                plan1Name: "Starter",
                plan1Price: "29€",
                perMonth: "/Monat",
                plan1Feat1: "1 Filiale",
                plan1Feat2: "Individuelles Logo",
                plan1Feat3: "Unbegrenzte P2P-Verbindungen",
                btnChoose: "Wählen",
                badgePopular: "Am beliebtesten",
                plan2Name: "Pro",
                plan2Price: "89€",
                plan2Feat1: "Unbegrenzte Filialen",
                plan2Feat2: "Komplettes White-Label",
                plan2Feat3: "24/7 Support",
                plan2Feat4: "Maßgeschneiderte Bereitstellung",
                btnContact: "Test starten",
                footerRights: "Alle Rechte vorbehalten."
            },
            nl: {
                heroTitle: "Digitaliseer uw receptie.",
                heroSubtitle: "Het white-label platform voor mobiliteitsverhuur. Uw klanten scannen, vullen hun info in op hun smartphone en u ontvangt deze direct aan de balie. 100% veilig.",
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
                plan1Name: "Starter",
                plan1Price: "29€",
                perMonth: "/maand",
                plan1Feat1: "1 Vestiging",
                plan1Feat2: "Aangepast logo",
                plan1Feat3: "Onbeperkte P2P-verbindingen",
                btnChoose: "Kiezen",
                badgePopular: "Meest populair",
                plan2Name: "Pro",
                plan2Price: "89€",
                plan2Feat1: "Onbeperkte vestigingen",
                plan2Feat2: "Volledig white-label",
                plan2Feat3: "24/7 ondersteuning",
                plan2Feat4: "Aangepaste implementatie",
                btnContact: "Start proefperiode",
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
