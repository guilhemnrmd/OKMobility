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
                heroTitle: "Votre marque. Notre technologie.",
                heroSubtitle: "Une plateforme SaaS en marque blanche, conçue pour l'excellence opérationnelle. Fluidifiez l'expérience de location, suivez vos flottes et offrez un design avant-gardiste à vos clients.",
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
                priceTitle: "Tarification transparente.",
                plan1Name: "Essentiel",
                perMonth: "/mois",
                plan1Feat1: "Marque Blanche standard",
                plan1Feat2: "Jusqu'à 5 Agences",
                plan1Feat3: "Support email",
                btnChoose: "Choisir",
                badgePopular: "Le plus populaire",
                plan2Name: "Entreprise",
                plan2Price: "Sur mesure",
                plan2Feat1: "Customisation complète",
                plan2Feat2: "Agences illimitées",
                plan2Feat3: "Support prioritaire 24/7",
                plan2Feat4: "Accès API complet",
                btnContact: "Contacter les ventes",
                footerRights: "Tous droits réservés."
            },
            en: {
                heroTitle: "Your brand. Our technology.",
                heroSubtitle: "A white-label SaaS platform designed for operational excellence. Streamline rentals, track fleets, and offer cutting-edge design to your customers.",
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
                priceTitle: "Transparent pricing.",
                plan1Name: "Essential",
                perMonth: "/month",
                plan1Feat1: "Standard White Label",
                plan1Feat2: "Up to 5 Agencies",
                plan1Feat3: "Email support",
                btnChoose: "Choose",
                badgePopular: "Most popular",
                plan2Name: "Enterprise",
                plan2Price: "Custom",
                plan2Feat1: "Full customization",
                plan2Feat2: "Unlimited agencies",
                plan2Feat3: "24/7 priority support",
                plan2Feat4: "Full API access",
                btnContact: "Contact Sales",
                footerRights: "All rights reserved."
            },
            es: {
                heroTitle: "Tu marca. Nuestra tecnología.",
                heroSubtitle: "Una plataforma SaaS de marca blanca diseñada para la excelencia. Optimiza alquileres, rastrea flotas y ofrece un diseño de vanguardia a tus clientes.",
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
                priceTitle: "Precios transparentes.",
                plan1Name: "Esencial",
                perMonth: "/mes",
                plan1Feat1: "Marca blanca estándar",
                plan1Feat2: "Hasta 5 Agencias",
                plan1Feat3: "Soporte por email",
                btnChoose: "Elegir",
                badgePopular: "Más popular",
                plan2Name: "Empresa",
                plan2Price: "A medida",
                plan2Feat1: "Personalización completa",
                plan2Feat2: "Agencias ilimitadas",
                plan2Feat3: "Soporte 24/7",
                plan2Feat4: "Acceso a la API",
                btnContact: "Contactar",
                footerRights: "Todos los derechos reservados."
            },
            it: {
                heroTitle: "Il tuo marchio. La nostra tecnologia.",
                heroSubtitle: "Una piattaforma SaaS white-label progettata per l'eccellenza. Ottimizza i noleggi, traccia le flotte e offri un design all'avanguardia.",
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
                priceTitle: "Prezzi trasparenti.",
                plan1Name: "Essenziale",
                perMonth: "/mese",
                plan1Feat1: "White label standard",
                plan1Feat2: "Fino a 5 Agenzie",
                plan1Feat3: "Supporto email",
                btnChoose: "Scegli",
                badgePopular: "Più popolare",
                plan2Name: "Azienda",
                plan2Price: "Su misura",
                plan2Feat1: "Personalizzazione completa",
                plan2Feat2: "Agenzie illimitate",
                plan2Feat3: "Supporto prioritario 24/7",
                plan2Feat4: "Accesso completo API",
                btnContact: "Contatta le vendite",
                footerRights: "Tutti i diritti riservati."
            },
            pt: {
                heroTitle: "Sua marca. Nossa tecnologia.",
                heroSubtitle: "Plataforma SaaS marca branca projetada para a excelência. Simplifique aluguéis, acompanhe frotas e ofereça design de ponta.",
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
                priceTitle: "Preços transparentes.",
                plan1Name: "Essencial",
                perMonth: "/mês",
                plan1Feat1: "Marca Branca Padrão",
                plan1Feat2: "Até 5 Agências",
                plan1Feat3: "Suporte por e-mail",
                btnChoose: "Escolher",
                badgePopular: "Mais popular",
                plan2Name: "Empresa",
                plan2Price: "Personalizado",
                plan2Feat1: "Personalização completa",
                plan2Feat2: "Agências ilimitadas",
                plan2Feat3: "Suporte prioritário 24/7",
                plan2Feat4: "Acesso total à API",
                btnContact: "Contactar vendas",
                footerRights: "Todos os direitos reservados."
            },
            de: {
                heroTitle: "Ihre Marke. Unsere Technologie.",
                heroSubtitle: "Eine White-Label SaaS-Plattform für operative Exzellenz. Optimieren Sie Vermietungen, Flotten und bieten Sie modernstes Design.",
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
                priceTitle: "Transparente Preise.",
                plan1Name: "Essential",
                perMonth: "/Monat",
                plan1Feat1: "Standard White-Label",
                plan1Feat2: "Bis zu 5 Filialen",
                plan1Feat3: "E-Mail-Support",
                btnChoose: "Wählen",
                badgePopular: "Am beliebtesten",
                plan2Name: "Enterprise",
                plan2Price: "Nach Maß",
                plan2Feat1: "Vollständige Anpassung",
                plan2Feat2: "Unbegrenzte Filialen",
                plan2Feat3: "24/7 Prioritätssupport",
                plan2Feat4: "Voller API-Zugang",
                btnContact: "Vertrieb kontaktieren",
                footerRights: "Alle Rechte vorbehalten."
            },
            nl: {
                heroTitle: "Uw merk. Onze technologie.",
                heroSubtitle: "Een white-label SaaS-platform ontworpen voor uitmuntendheid. Stroomlijn verhuur en bied uw klanten een geavanceerd ontwerp.",
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
                priceTitle: "Transparante prijzen.",
                plan1Name: "Essentieel",
                perMonth: "/maand",
                plan1Feat1: "Standaard White-Label",
                plan1Feat2: "Tot 5 vestigingen",
                plan1Feat3: "E-mail ondersteuning",
                btnChoose: "Kiezen",
                badgePopular: "Meest populair",
                plan2Name: "Onderneming",
                plan2Price: "Op maat",
                plan2Feat1: "Volledige aanpassing",
                plan2Feat2: "Onbeperkte vestigingen",
                plan2Feat3: "24/7 prioriteitsondersteuning",
                plan2Feat4: "Volledige API-toegang",
                btnContact: "Contact verkoop",
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
