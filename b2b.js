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
                feat1Title: "Interface Adaptative",
                feat1Desc: "Votre logo, vos couleurs, vos champs. L'interface s'adapte intégralement à votre identité visuelle.",
                feat2Title: "7 langues natives",
                feat2Desc: "Détection automatique de la langue du smartphone. Autocomplétion d'adresse mondiale.",
                feat3Title: "ROI dès le 1er jour",
                feat3Desc: "3 à 5 minutes économisées par dossier. Jusqu'à 6 heures récupérées par jour pour un comptoir de 2 agents.",
                privTitle: "Sécurité Absolue.",
                privDesc: "Vos données sont protégées par chiffrement de bout en bout. Nous utilisons la technologie WebRTC peer-to-peer : aucune donnée personnelle n'est stockée sur nos serveurs. Vos échanges clients-vendeurs restent strictement confidentiels et conformes au RGPD.",
                priceTitle: "Des tarifs adaptés à votre flotte.",
                plan1Name: "Indépendant",
                plan1Price: "2,99€",
                perMonth: "/mois",
                plan1Year: "Soit 29€/an",
                plan1Feat1: "1 Agence",
                plan1Feat2: "Logo & Couleurs",
                plan1Feat3: "1 Langue",
                plan1Feat4: "Support par email",
                plan1Action: "Commencer gratuitement",
                badgePopular: "Le plus populaire",
                plan2Name: "Multi-Agences",
                plan2Price: "9,99€",
                plan2Year: "Soit 99€/an",
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
                probTitle: "L'ancien monde.",
                probDesc: "Saisie manuelle. Fautes de frappe. Files d'attente interminables. La collecte de données au comptoir fait perdre de 3 à 5 minutes par client.",
                solTitle: "Le nouveau monde.",
                solDesc: "Le client scanne un QR code et saisit ses informations lui-même. Vous les recevez instantanément. Zéro friction.",
                expTitle: "Une expérience à 360°",
                expAgentTitle: "Côté Conseiller",
                expAgent1: "Génère un QR code unique en 1 clic",
                expAgent2: "Reçoit les données en temps réel",
                expAgent3: "Copie instantanée vers le CRM interne",
                expClientTitle: "Côté Client",
                expClient1: "Scanne sans installer d'application",
                expClient2: "Saisie simplifiée (autocomplétion mondiale)",
                expClient3: "Transmission P2P chiffrée de bout en bout",
                archTitle: "Conçu pour l'Edge.",
                archDesc: "Rendement de niveau entreprise dès le premier jour, sans serveurs à gérer.",
                archTrad: "Traditionnel",
                archNew: "MobilityOS",
                archLat: "Latence de réseau",
                archData: "Stockage des données",
                archDataTrad: "Base de données centralisée",
                archDataNew: "Zéro (Transfert P2P)",
                fn1: "Disponibilité garantie contractuellement par l'infrastructure Cloudflare Edge, avec plus de 300 points de présence mondiaux.",
                fn2: "Le protocole WebRTC chiffre nativement les transferts de données en DTLS/SRTP de bout en bout.",
                navFaq: "FAQ & Objections IT",
                navLogin: "Accès Vendeur",
                footerRights: "Tous droits réservés."
            },
            en: {
                heroTitle: "The end of manual data entry.",
                heroSubtitle: "The universal solution for hotels, agencies, and physical receptions. Clients scan a QR code, enter their info on their smartphone, and you receive it instantly. Zero server, 100% secure via WebRTC.",
                btnDemo: "Request a demo",
                aiDisclaimer: "Automatically generated from your company profile.",
                videoWatch: "See how it works",
                feat1Title: "Adaptive Interface",
                feat1Desc: "Your logo, your colors, your fields. The interface adapts entirely to your brand identity.",
                feat2Title: "7 Native Languages",
                feat2Desc: "Automatic smartphone language detection. Global address autocomplete.",
                feat3Title: "ROI from Day 1",
                feat3Desc: "3 to 5 minutes saved per case. Up to 6 hours recovered daily for a 2-agent counter.",
                privTitle: "Absolute Security.",
                privDesc: "Your data is protected by end-to-end encryption. We use WebRTC peer-to-peer technology: no personal data is stored on our servers. Your transactions remain strictly confidential and GDPR compliant.",
                priceTitle: "Pricing adapted to your fleet.",
                plan1Name: "Independent",
                plan1Price: "2,99€",
                perMonth: "/month",
                plan1Year: "Or 29€/year",
                plan1Feat1: "1 Branch",
                plan1Feat2: "Logo & Colors",
                plan1Feat3: "1 Language",
                plan1Feat4: "Email Support",
                plan1Action: "Start for free",
                badgePopular: "Most Popular",
                plan2Name: "Multi-Branch",
                plan2Price: "9,99€",
                plan2Year: "Or 99€/year",
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
                probTitle: "The old world.",
                probDesc: "Manual entry. Typos. Endless queues. Collecting data at the counter wastes 3 to 5 minutes per client.",
                solTitle: "The new world.",
                solDesc: "The client scans a QR code and enters their info themselves. You receive it instantly. Zero friction.",
                expTitle: "A 360° Experience",
                expAgentTitle: "Agent Side",
                expAgent1: "Generates a unique QR code in 1 click",
                expAgent2: "Receives data in real time",
                expAgent3: "Instant copy to internal CRM",
                expClientTitle: "Client Side",
                expClient1: "Scans without installing an app",
                expClient2: "Simplified entry (global autocomplete)",
                expClient3: "End-to-end encrypted P2P transmission",
                archTitle: "Built for the Edge.",
                archDesc: "Enterprise-grade performance from day one, with no servers to manage.",
                archTrad: "Traditional",
                archNew: "MobilityOS",
                archLat: "Network latency",
                archData: "Data storage",
                archDataTrad: "Centralized database",
                archDataNew: "Zero (P2P Transfer)",
                fn1: "Availability contractually guaranteed by Cloudflare Edge infrastructure, with over 300 global points of presence.",
                fn2: "The WebRTC protocol natively encrypts data transfers via end-to-end DTLS/SRTP.",
                navFaq: "FAQ & IT Objections",
                navLogin: "Seller Access",
                footerRights: "All rights reserved."
            },
            es: {
                heroTitle: "El fin de la entrada manual.",
                heroSubtitle: "La solución universal para hoteles, agencias y recepciones. Sus clientes escanean un QR, introducen sus datos en su smartphone y usted los recibe al instante. 100% seguro.",
                btnDemo: "Solicitar demo",
                aiDisclaimer: "Generado automáticamente desde su perfil de empresa.",
                videoWatch: "Ver cómo funciona",
                feat1Title: "Interfaz Adaptativa",
                feat1Desc: "Su logo, sus colores, sus campos. La interfaz se adapta completamente a su identidad visual.",
                feat2Title: "7 idiomas nativos",
                feat2Desc: "Detección automática del idioma. Autocompletado de dirección mundial.",
                feat3Title: "ROI desde el día 1",
                feat3Desc: "3 a 5 minutos ahorrados por expediente. Hasta 6 horas recuperadas al día.",
                privTitle: "Seguridad Absoluta.",
                privDesc: "Sus datos están protegidos con cifrado de extremo a extremo. Utilizamos tecnología P2P WebRTC: no se almacenan datos en nuestros servidores. 100% conforme al RGPD.",
                priceTitle: "Tarifas adaptadas a su flota.",
                plan1Name: "Independiente",
                plan1Price: "2,99€",
                perMonth: "/mes",
                plan1Year: "O 29€/año",
                plan1Feat1: "1 Sucursal",
                plan1Feat2: "Logo y Colores",
                plan1Feat3: "1 Idioma",
                plan1Feat4: "Soporte por email",
                plan1Action: "Comenzar gratis",
                badgePopular: "Más Popular",
                plan2Name: "Multi-Sucursales",
                plan2Price: "9,99€",
                plan2Year: "O 99€/año",
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
                probTitle: "El viejo mundo.",
                probDesc: "Entrada manual. Errores. Colas interminables. Recopilar datos en el mostrador hace perder de 3 a 5 minutos por cliente.",
                solTitle: "El nuevo mundo.",
                solDesc: "El cliente escanea un QR e introduce su información él mismo. Usted la recibe al instante. Cero fricción.",
                expTitle: "Una experiencia 360°",
                expAgentTitle: "Lado Asesor",
                expAgent1: "Genera un código QR único en 1 clic",
                expAgent2: "Recibe los datos en tiempo real",
                expAgent3: "Copia instantánea al CRM interno",
                expClientTitle: "Lado Cliente",
                expClient1: "Escanea sin instalar ninguna app",
                expClient2: "Entrada simplificada (autocompletado global)",
                expClient3: "Transmisión P2P cifrada de extremo a extremo",
                archTitle: "Diseñado para el Edge.",
                archDesc: "Rendimiento de nivel empresarial desde el primer día, sin servidores que gestionar.",
                archTrad: "Tradicional",
                archNew: "MobilityOS",
                archLat: "Latencia de red",
                archData: "Almacenamiento de datos",
                archDataTrad: "Base de datos centralizada",
                archDataNew: "Cero (Transferencia P2P)",
                fn1: "Disponibilidad garantizada contractualmente por la infraestructura Cloudflare Edge, con más de 300 puntos de presencia globales.",
                fn2: "El protocolo WebRTC cifra de forma nativa las transferencias de datos mediante DTLS/SRTP de extremo a extremo.",
                navFaq: "FAQ y Objeciones IT",
                navLogin: "Acceso Vendedor",
                footerRights: "Todos los derechos reservados."
            },
            it: {
                heroTitle: "La fine dell'inserimento manuale.",
                heroSubtitle: "La soluzione universale per hotel, agenzie e reception fisiche. I clienti scansionano un QR, inseriscono i dati sul loro smartphone e tu li ricevi all'istante. 100% sicuro.",
                btnDemo: "Richiedi demo",
                aiDisclaimer: "Generato automaticamente dal profilo aziendale.",
                videoWatch: "Guarda come funziona",
                feat1Title: "Interfaccia Adattiva",
                feat1Desc: "Il vostro logo, i vostri colori, i vostri campi. Si adatta alla vostra identità visiva.",
                feat2Title: "7 lingue native",
                feat2Desc: "Rilevamento automatico della lingua. Autocompletamento indirizzi globale.",
                feat3Title: "ROI dal giorno 1",
                feat3Desc: "3-5 minuti risparmiati per pratica. Fino a 6 ore recuperate al giorno.",
                privTitle: "Sicurezza Assoluta.",
                privDesc: "Dati protetti da crittografia end-to-end. Utilizziamo WebRTC P2P: nessun dato personale viene archiviato sui nostri server. Pienamente conforme al GDPR.",
                priceTitle: "Prezzi adattati alla tua flotta.",
                plan1Name: "Indipendente",
                plan1Price: "2,99€",
                perMonth: "/mese",
                plan1Year: "O 29€/anno",
                plan1Feat1: "1 Agenzia",
                plan1Feat2: "Logo & Colori",
                plan1Feat3: "1 Lingua",
                plan1Feat4: "Supporto email",
                plan1Action: "Inizia gratis",
                badgePopular: "Più Popolare",
                plan2Name: "Multi-Agenzia",
                plan2Price: "9,99€",
                plan2Year: "O 99€/anno",
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
                probTitle: "Il vecchio mondo.",
                probDesc: "Inserimento manuale. Errori di battitura. Code infinite. Raccogliere dati al banco fa perdere da 3 a 5 minuti per cliente.",
                solTitle: "Il nuovo mondo.",
                solDesc: "Il cliente scansiona un QR code e inserisce i suoi dati. Tu li ricevi all'istante. Zero attriti.",
                expTitle: "Un'esperienza a 360°",
                expAgentTitle: "Lato Agente",
                expAgent1: "Genera un QR code unico in 1 clic",
                expAgent2: "Riceve i dati in tempo reale",
                expAgent3: "Copia istantanea nel CRM interno",
                expClientTitle: "Lato Cliente",
                expClient1: "Scansiona senza installare un'app",
                expClient2: "Inserimento semplificato (autocompletamento globale)",
                expClient3: "Trasmissione P2P crittografata end-to-end",
                archTitle: "Progettato per l'Edge.",
                archDesc: "Prestazioni di livello enterprise dal primo giorno, senza server da gestire.",
                archTrad: "Tradizionale",
                archNew: "MobilityOS",
                archLat: "Latenza di rete",
                archData: "Archiviazione dati",
                archDataTrad: "Database centralizzato",
                archDataNew: "Zero (Trasferimento P2P)",
                fn1: "Disponibilità garantita contrattualmente dall'infrastruttura Cloudflare Edge, con oltre 300 punti di presenza globali.",
                fn2: "Il protocollo WebRTC crittografa nativamente i trasferimenti di dati tramite DTLS/SRTP end-to-end.",
                navFaq: "FAQ e Obiezioni IT",
                navLogin: "Accesso Venditore",
                footerRights: "Tutti i diritti riservati."
            },
            pt: {
                heroTitle: "O fim da digitação manual.",
                heroSubtitle: "A solução universal para hotéis, agências e recepções. Os clientes escaneiam um QR, inserem seus dados no smartphone e você recebe instantaneamente. 100% seguro.",
                btnDemo: "Pedir uma demo",
                aiDisclaimer: "Gerado automaticamente a partir do perfil da empresa.",
                videoWatch: "Veja como funciona",
                feat1Title: "Interface Adaptativa",
                feat1Desc: "Seu logo, suas cores, seus campos. A interface se adapta à sua identidade visual.",
                feat2Title: "7 idiomas nativos",
                feat2Desc: "Detecção automática do idioma. Preenchimento automático de endereço mundial.",
                feat3Title: "ROI desde o 1º dia",
                feat3Desc: "3-5 minutos economizados por caso. Até 6 horas recuperadas por dia.",
                privTitle: "Segurança Absoluta.",
                privDesc: "Seus dados são protegidos por criptografia de ponta a ponta. Usamos WebRTC P2P: sem armazenamento de dados nos nossos servidores. Em conformidade com o RGPD.",
                priceTitle: "Preços adaptados à sua frota.",
                plan1Name: "Independente",
                plan1Price: "2,99€",
                perMonth: "/mês",
                plan1Year: "Ou 29€/ano",
                plan1Feat1: "1 Agência",
                plan1Feat2: "Logo & Cores",
                plan1Feat3: "1 Idioma",
                plan1Feat4: "Suporte por email",
                plan1Action: "Começar grátis",
                badgePopular: "Mais Popular",
                plan2Name: "Multi-Agências",
                plan2Price: "9,99€",
                plan2Year: "Ou 99€/ano",
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
                probTitle: "O mundo antigo.",
                probDesc: "Entrada manual. Erros de digitação. Filas intermináveis. Coletar dados no balcão desperdiça de 3 a 5 minutos por cliente.",
                solTitle: "O novo mundo.",
                solDesc: "O cliente escaneia um QR code e insere suas informações. Você as recebe instantaneamente. Zero atrito.",
                expTitle: "Uma experiência 360°",
                expAgentTitle: "Lado do Agente",
                expAgent1: "Gera um QR code único com 1 clique",
                expAgent2: "Recebe dados em tempo real",
                expAgent3: "Cópia instantânea para o CRM interno",
                expClientTitle: "Lado do Cliente",
                expClient1: "Escaneia sem instalar app",
                expClient2: "Entrada simplificada (preenchimento automático global)",
                expClient3: "Transmissão P2P criptografada de ponta a ponta",
                archTitle: "Construído para o Edge.",
                archDesc: "Desempenho de nível empresarial desde o primeiro dia, sem servidores para gerenciar.",
                archTrad: "Tradicional",
                archNew: "MobilityOS",
                archLat: "Latência de rede",
                archData: "Armazenamento de dados",
                archDataTrad: "Banco de dados centralizado",
                archDataNew: "Zero (Transferência P2P)",
                fn1: "Disponibilidade contratualmente garantida pela infraestrutura Cloudflare Edge, com mais de 300 pontos de presença globais.",
                fn2: "O protocolo WebRTC criptografa nativamente as transferências de dados via DTLS/SRTP de ponta a ponta.",
                navFaq: "FAQ & Objeções de TI",
                footerRights: "Todos os direitos reservados."
            },
            de: {
                heroTitle: "Das Ende der manuellen Dateneingabe.",
                heroSubtitle: "Die universelle Lösung für Hotels, Agenturen und physische Empfänge. Kunden scannen einen QR-Code, geben ihre Daten am Smartphone ein und Sie erhalten diese sofort.",
                btnDemo: "Demo anfordern",
                aiDisclaimer: "Automatisch aus dem Firmenprofil generiert.",
                videoWatch: "So funktioniert es",
                feat1Title: "Adaptives Interface",
                feat1Desc: "Ihr Logo, Ihre Farben, Ihre Felder. Das Interface passt sich Ihrer Markenidentität an.",
                feat2Title: "7 native Sprachen",
                feat2Desc: "Automatische Spracherkennung. Globale Adressvervollständigung.",
                feat3Title: "ROI ab Tag 1",
                feat3Desc: "3-5 Minuten pro Vorgang gespart. Bis zu 6 Stunden pro Tag gewonnen.",
                privTitle: "Absolute Sicherheit.",
                privDesc: "Daten durch End-to-End-Verschlüsselung geschützt. Keine personenbezogenen Daten auf unseren Servern gespeichert. DSGVO-konform.",
                priceTitle: "Preise angepasst an Ihre Flotte.",
                plan1Name: "Unabhängig",
                plan1Price: "2,99€",
                perMonth: "/Monat",
                plan1Year: "Oder 29€/Jahr",
                plan1Feat1: "1 Filiale",
                plan1Feat2: "Logo & Farben",
                plan1Feat3: "1 Sprache",
                plan1Feat4: "E-Mail-Support",
                plan1Action: "Kostenlos starten",
                badgePopular: "Am beliebtesten",
                plan2Name: "Mehrere Filialen",
                plan2Price: "9,99€",
                plan2Year: "Oder 99€/Jahr",
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
                probTitle: "Die alte Welt.",
                probDesc: "Manuelle Eingabe. Tippfehler. Endlose Warteschlangen. Die Datenerfassung am Schalter verschwendet 3 bis 5 Minuten pro Kunde.",
                solTitle: "Die neue Welt.",
                solDesc: "Der Kunde scannt einen QR-Code und gibt seine Daten selbst ein. Sie erhalten diese sofort. Keine Reibungsverluste.",
                expTitle: "Ein 360°-Erlebnis",
                expAgentTitle: "Mitarbeiter-Seite",
                expAgent1: "Generiert einen eindeutigen QR-Code mit 1 Klick",
                expAgent2: "Empfängt Daten in Echtzeit",
                expAgent3: "Sofortige Kopie in das interne CRM",
                expClientTitle: "Kunden-Seite",
                expClient1: "Scannt, ohne eine App zu installieren",
                expClient2: "Vereinfachte Eingabe (globale Autovervollständigung)",
                expClient3: "End-to-End verschlüsselte P2P-Übertragung",
                archTitle: "Gebaut für das Edge.",
                archDesc: "Unternehmensleistung vom ersten Tag an, ohne Server verwalten zu müssen.",
                archTrad: "Traditionell",
                archNew: "MobilityOS",
                archLat: "Netzwerklatenz",
                archData: "Datenspeicherung",
                archDataTrad: "Zentralisierte Datenbank",
                archDataNew: "Null (P2P-Übertragung)",
                fn1: "Verfügbarkeit vertraglich garantiert durch Cloudflare Edge-Infrastruktur mit über 300 weltweiten Präsenzpunkten.",
                fn2: "Das WebRTC-Protokoll verschlüsselt Datenübertragungen nativ durchgängig über DTLS/SRTP.",
                navFaq: "FAQ & IT-Einwände",
                footerRights: "Alle Rechte vorbehalten."
            },
            nl: {
                heroTitle: "Het einde van handmatige invoer.",
                heroSubtitle: "De universele oplossing voor hotels, bureaus en fysieke recepties. Klanten scannen een QR-code, vullen hun info in op hun smartphone en u ontvangt deze direct.",
                btnDemo: "Demo aanvragen",
                aiDisclaimer: "Automatisch gegenereerd op basis van bedrijfsprofiel.",
                videoWatch: "Bekijk hoe het werkt",
                feat1Title: "Adaptieve Interface",
                feat1Desc: "Uw logo, uw kleuren, uw velden. De interface past zich aan uw merkidentiteit aan.",
                feat2Title: "7 native talen",
                feat2Desc: "Automatische taaldetectie. Wereldwijde adressen aanvulling.",
                feat3Title: "ROI vanaf dag 1",
                feat3Desc: "3-5 minuten bespaard per dossier. Tot 6 uur per dag herwonnen.",
                privTitle: "Absolute Veiligheid.",
                privDesc: "Gegevens beschermd door end-to-end codering. WebRTC P2P-technologie: geen persoonlijke gegevens op onze servers. Volledig AVG-conform.",
                priceTitle: "Prijzen afgestemd op uw vloot.",
                plan1Name: "Onafhankelijk",
                plan1Price: "2,99€",
                perMonth: "/maand",
                plan1Year: "Of 29€/jaar",
                plan1Feat1: "1 Vestiging",
                plan1Feat2: "Logo & Kleuren",
                plan1Feat3: "1 Taal",
                plan1Feat4: "E-mailondersteuning",
                plan1Action: "Gratis starten",
                badgePopular: "Meest Populair",
                plan2Name: "Meerdere Vestigingen",
                plan2Price: "9,99€",
                plan2Year: "Of 99€/jaar",
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
                probTitle: "De oude wereld.",
                probDesc: "Handmatige invoer. Typfouten. Eindeloze wachtrijen. Gegevens verzamelen aan de balie kost 3 tot 5 minuten per klant.",
                solTitle: "De nieuwe wereld.",
                solDesc: "De klant scant een QR-code en vult zelf zijn gegevens in. U ontvangt ze direct. Nul wrijving.",
                expTitle: "Een 360° Ervaring",
                expAgentTitle: "Kant van de Agent",
                expAgent1: "Genereert een unieke QR-code in 1 klik",
                expAgent2: "Ontvangt gegevens in realtime",
                expAgent3: "Directe kopie naar interne CRM",
                expClientTitle: "Kant van de Klant",
                expClient1: "Scant zonder app te installeren",
                expClient2: "Vereenvoudigde invoer (wereldwijde automatische aanvulling)",
                expClient3: "End-to-end gecodeerde P2P-transmissie",
                archTitle: "Gebouwd voor de Edge.",
                archDesc: "Enterprise-grade prestaties vanaf dag één, zonder servers te beheren.",
                archTrad: "Traditioneel",
                archNew: "MobilityOS",
                archLat: "Netwerklatentie",
                archData: "Gegevensopslag",
                archDataTrad: "Gecentraliseerde database",
                archDataNew: "Nul (P2P-overdracht)",
                fn1: "Beschikbaarheid contractueel gegarandeerd door Cloudflare Edge-infrastructuur, met meer dan 300 wereldwijde aanwezigheidspunten.",
                fn2: "Het WebRTC-protocol codeert van nature gegevensoverdrachten via end-to-end DTLS/SRTP.",
                navFaq: "FAQ & IT Bezwaren",
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
            localStorage.setItem('userLanguage', lang);
        };

        const langSelect = document.getElementById('languageSelect');
        const langDisplay = document.getElementById('langDisplay');
        
        // Initial language detection: Storage > Browser > Default(fr)
        const storedLang = localStorage.getItem('userLanguage');
        const browserLang = (navigator.language || 'fr').slice(0, 2).toLowerCase();
        const supportedLangs = Object.keys(i18n);
        const initialLang = storedLang || (supportedLangs.includes(browserLang) ? browserLang : 'fr');

        if (langSelect && langDisplay) {
            langSelect.value = initialLang;
            langDisplay.textContent = langSelect.options[langSelect.selectedIndex].text;
            langSelect.addEventListener('change', (e) => {
                const text = e.target.options[e.target.selectedIndex].text;
                const lang = e.target.value;
                langDisplay.textContent = text;
                updateLanguage(lang);
            });
        }
        updateLanguage(initialLang);

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
