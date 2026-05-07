(function(){
document.addEventListener('DOMContentLoaded', () => {
const i18n = {
fr: {
navHome:"Retour à l'accueil",navTitle:"FAQ",pageTitle:"FAQ — Réponses aux objections IT",
faqTitle:"Questions fréquentes",faqSubtitle:"Les réponses techniques que votre direction IT, votre DPO ou votre service achats attendent.",
arg1Title:"Zéro donnée stockée",arg1Desc:"Aucune base de données client. Les données transitent en P2P chiffré AES. Rien à voler.",
arg2Title:"Opérationnel en 5 min",arg2Desc:"Aucune installation côté client. Aucun serveur. Un QR code suffit. Le TCO le plus bas du marché.",
arg3Title:"7 langues natives",arg3Desc:"Détection automatique de la langue. Autocomplétion d'adresse mondiale. Formatage national adapté.",
q1:"Comment savons-nous que les données ne sont pas stockées sur vos serveurs ?",
a1p1:"C'est vérifiable techniquement — pas seulement promis contractuellement. Le code source est auditable : la connexion PeerJS établit un canal WebRTC direct entre deux navigateurs.",
a1p2:"Les fonctions Cloudflare n'acceptent aucun paramètre de données personnelles. Le serveur TURN ne fait que relayer des paquets chiffrés — il est techniquement incapable d'en lire le contenu.",
a1p3:"Preuve technique disponible sur demande : schéma d'architecture et accès au code source pour audit.",
q2:"Que se passe-t-il si Cloudflare tombe en panne ?",
a2p1:"SLA contractuel de 99,99% — moins de 52 minutes d'inactivité par an.",
a2p2:"En cas de panne partielle, la connexion WebRTC bascule sur les serveurs TURN. La procédure classique reste applicable.",
a2p3:"Un cache local (localStorage, 30 jours) permet à chaque terminal de fonctionner même si l'API est momentanément inaccessible.",
q3:"Développeur indépendant — que se passe-t-il s'il arrête ?",
a3p1:"Trois niveaux de protection :",a3l1:"Code source complet livré avec la licence.",a3l2:"Standards ouverts (WebRTC W3C, Cloudflare Workers).",a3l3:"Pile technique simple (HTML/CSS/JS vanilla + serverless).",
a3p2:"Clause d'escrow du code source sur demande. Contrat de maintenance pluriannuel disponible.",
q4:"Cette solution est-elle conforme au RGPD ?",
a4p1:"Zéro stockage serveur = meilleur argument RGPD possible.",a4l1:"Minimisation (Art. 5.1.c).",a4l2:"Suppression (Art. 17) : rien à supprimer.",a4l3:"Accès (Art. 15) : résumé en temps réel.",a4l4:"Rectification (Art. 16) : bouton Modifier avant envoi.",
a4p2:"Sous-traitants conformes EU-US Data Privacy Framework.",
q5:"Quel est le retour sur investissement ?",
a5p1:"3 à 5 minutes économisées par dossier. Avec 40 clients/jour : 2 à 3 heures récupérées.",
a5p2:"Un comptoir de 2 agents traitant 80 clients/jour récupère 4 à 6 heures de temps productif — chaque jour.",
ctaTitle:"Convaincu ?",ctaDesc:"Demandez un accès démo ou contactez-nous.",ctaBtn:"Nous contacter",
footerRights:"Tous droits réservés.",footerConfidential:"Document confidentiel — support@guilhemnormand.com"
},
en: {
navHome:"Back to Home",navTitle:"FAQ",pageTitle:"FAQ — IT Objections Answered",
faqTitle:"Frequently Asked Questions",faqSubtitle:"The technical answers your IT department, DPO, or procurement team expects.",
arg1Title:"Zero data stored",arg1Desc:"No customer database. Data transits via AES-encrypted P2P. Nothing to steal.",
arg2Title:"Operational in 5 min",arg2Desc:"No client-side installation. No server. A QR code is enough. Lowest TCO on the market.",
arg3Title:"7 native languages",arg3Desc:"Automatic language detection. Global address autocomplete. Adapted national formatting.",
q1:"How do we know data isn't stored on your servers?",
a1p1:"It's technically verifiable — not just contractually promised. The source code is auditable: PeerJS establishes a direct WebRTC channel between two browsers.",
a1p2:"Cloudflare functions accept no personal data parameters. The TURN server only relays encrypted packets — technically unable to read content.",
a1p3:"Technical proof available on request: architecture diagram and source code access for audit.",
q2:"What happens if Cloudflare goes down?",
a2p1:"Contractual SLA of 99.99% — less than 52 minutes of downtime per year.",
a2p2:"On partial failure, WebRTC falls back to TURN servers. Classic procedure remains applicable.",
a2p3:"A local cache (localStorage, 30 days) keeps terminals running even if the API is temporarily unavailable.",
q3:"Independent developer — what if they stop maintaining it?",
a3p1:"Three levels of protection:",a3l1:"Complete source code delivered with license.",a3l2:"Open standards (WebRTC W3C, Cloudflare Workers).",a3l3:"Simple tech stack (vanilla HTML/CSS/JS + serverless).",
a3p2:"Source code escrow clause available. Multi-year maintenance contract available.",
q4:"Is this solution GDPR compliant?",
a4p1:"Zero server storage = best possible GDPR argument.",a4l1:"Minimization (Art. 5.1.c).",a4l2:"Deletion (Art. 17): nothing to delete.",a4l3:"Access (Art. 15): real-time summary.",a4l4:"Rectification (Art. 16): Edit button before submission.",
a4p2:"Subcontractors comply with EU-US Data Privacy Framework.",
q5:"What is the measurable ROI?",
a5p1:"3 to 5 minutes saved per case. With 40 clients/day: 2 to 3 hours recovered.",
a5p2:"A 2-agent counter handling 80 clients/day recovers 4 to 6 hours of productive time — every day.",
ctaTitle:"Convinced?",ctaDesc:"Request a demo or contact us for a custom quote.",ctaBtn:"Contact us",
footerRights:"All rights reserved.",footerConfidential:"Confidential document — support@guilhemnormand.com"
},
es: {
navHome:"Volver al inicio",navTitle:"FAQ",pageTitle:"FAQ — Respuestas a objeciones IT",
faqTitle:"Preguntas frecuentes",faqSubtitle:"Las respuestas técnicas que su dirección IT, su DPD o su servicio de compras esperan.",
arg1Title:"Cero datos almacenados",arg1Desc:"Sin base de datos de clientes. Datos en P2P cifrado AES. Nada que robar.",
arg2Title:"Operativo en 5 min",arg2Desc:"Sin instalación. Sin servidor. Un código QR basta. El TCO más bajo del mercado.",
arg3Title:"7 idiomas nativos",arg3Desc:"Detección automática del idioma. Autocompletado de dirección mundial.",
q1:"¿Cómo sabemos que los datos no se almacenan en sus servidores?",
a1p1:"Es verificable técnicamente. El código fuente es auditable: PeerJS establece un canal WebRTC directo.",
a1p2:"Las funciones Cloudflare no aceptan parámetros de datos personales. El servidor TURN solo retransmite paquetes cifrados.",
a1p3:"Prueba técnica disponible bajo petición.",
q2:"¿Qué pasa si Cloudflare sufre una caída?",
a2p1:"SLA contractual del 99,99% — menos de 52 minutos de inactividad al año.",
a2p2:"La conexión WebRTC puede conmutar a servidores TURN. El procedimiento clásico sigue siendo aplicable.",
a2p3:"Un caché local (localStorage, 30 días) permite funcionar sin API.",
q3:"¿Qué pasa si el desarrollador deja de mantener el producto?",
a3p1:"Tres niveles de protección:",a3l1:"Código fuente completo entregado con la licencia.",a3l2:"Estándares abiertos (WebRTC W3C, Cloudflare Workers).",a3l3:"Pila técnica simple (HTML/CSS/JS vanilla + serverless).",
a3p2:"Cláusula de depósito en garantía del código fuente disponible.",
q4:"¿Es conforme al RGPD?",
a4p1:"Cero almacenamiento = mejor argumento RGPD posible.",a4l1:"Minimización (Art. 5.1.c).",a4l2:"Supresión (Art. 17): nada que suprimir.",a4l3:"Acceso (Art. 15): resumen en tiempo real.",a4l4:"Rectificación (Art. 16): botón Modificar antes del envío.",
a4p2:"Subcontratistas conformes al marco EU-US Data Privacy Framework.",
q5:"¿Cuál es el retorno de inversión?",
a5p1:"3 a 5 minutos ahorrados por expediente. Con 40 clientes/día: 2 a 3 horas recuperadas.",
a5p2:"Un mostrador de 2 agentes con 80 clientes/día recupera 4 a 6 horas de tiempo productivo — cada día.",
ctaTitle:"¿Convencido?",ctaDesc:"Solicite un acceso demo o contáctenos.",ctaBtn:"Contáctenos",
footerRights:"Todos los derechos reservados.",footerConfidential:"Documento confidencial — support@guilhemnormand.com"
},
it: {
navHome:"Torna alla Home",navTitle:"FAQ",pageTitle:"FAQ — Risposte alle obiezioni IT",
faqTitle:"Domande frequenti",faqSubtitle:"Le risposte tecniche che il vostro reparto IT, DPO o acquisti si aspetta.",
arg1Title:"Zero dati salvati",arg1Desc:"Nessun database clienti. Dati in P2P cifrato AES. Nulla da rubare.",
arg2Title:"Operativo in 5 min",arg2Desc:"Nessuna installazione. Nessun server. Un QR code basta.",
arg3Title:"7 lingue native",arg3Desc:"Rilevamento automatico della lingua. Autocompletamento indirizzi globale.",
q1:"Come sappiamo che i dati non sono salvati sui vostri server?",a1p1:"È verificabile tecnicamente. Il codice sorgente è auditabile.",a1p2:"Le funzioni Cloudflare non accettano parametri di dati personali.",a1p3:"Prova tecnica disponibile su richiesta.",
q2:"Cosa succede se Cloudflare va in crash?",a2p1:"SLA contrattuale del 99,99%.",a2p2:"WebRTC può passare ai server TURN.",a2p3:"Cache locale (localStorage, 30 giorni).",
q3:"Sviluppatore indipendente — cosa succede se smette?",a3p1:"Tre livelli di protezione:",a3l1:"Codice sorgente completo consegnato.",a3l2:"Standard aperti (WebRTC W3C).",a3l3:"Stack tecnico semplice.",a3p2:"Clausola di escrow disponibile.",
q4:"È conforme al GDPR?",a4p1:"Zero archiviazione = miglior argomento GDPR.",a4l1:"Minimizzazione (Art. 5.1.c).",a4l2:"Cancellazione (Art. 17).",a4l3:"Accesso (Art. 15).",a4l4:"Rettifica (Art. 16).",a4p2:"Subappaltatori conformi EU-US DPF.",
q5:"Qual è il ROI misurabile?",a5p1:"3-5 minuti risparmiati per pratica.",a5p2:"2 agenti, 80 clienti/giorno = 4-6 ore recuperate.",
ctaTitle:"Convinto?",ctaDesc:"Richiedi una demo o contattaci.",ctaBtn:"Contattaci",
footerRights:"Tutti i diritti riservati.",footerConfidential:"Documento riservato — support@guilhemnormand.com"
},
pt: {
navHome:"Voltar",navTitle:"FAQ",pageTitle:"FAQ — Respostas às objeções de TI",
faqTitle:"Perguntas frequentes",faqSubtitle:"As respostas técnicas que sua equipe de TI, DPO ou compras espera.",
arg1Title:"Zero dados salvos",arg1Desc:"Sem banco de dados. Dados em P2P criptografado AES.",
arg2Title:"Operacional em 5 min",arg2Desc:"Sem instalação. Sem servidor. Um QR code basta.",
arg3Title:"7 idiomas nativos",arg3Desc:"Detecção automática do idioma. Preenchimento automático global.",
q1:"Como sabemos que os dados não são armazenados?",a1p1:"Verificável tecnicamente. Código auditável.",a1p2:"Funções Cloudflare não aceitam dados pessoais.",a1p3:"Prova técnica disponível sob demanda.",
q2:"E se o Cloudflare cair?",a2p1:"SLA de 99,99%.",a2p2:"WebRTC pode usar TURN.",a2p3:"Cache local (30 dias).",
q3:"Desenvolvedor independente — e se parar?",a3p1:"Três níveis de proteção:",a3l1:"Código fonte completo entregue.",a3l2:"Padrões abertos.",a3l3:"Stack simples.",a3p2:"Escrow disponível.",
q4:"É conforme ao RGPD?",a4p1:"Zero armazenamento = melhor argumento RGPD.",a4l1:"Minimização (Art. 5.1.c).",a4l2:"Exclusão (Art. 17).",a4l3:"Acesso (Art. 15).",a4l4:"Retificação (Art. 16).",a4p2:"Subcontratados conformes EU-US DPF.",
q5:"Qual é o ROI?",a5p1:"3-5 min economizados por caso.",a5p2:"2 agentes, 80 clientes/dia = 4-6 horas recuperadas.",
ctaTitle:"Convencido?",ctaDesc:"Solicite uma demo.",ctaBtn:"Contacte-nos",
footerRights:"Todos os direitos reservados.",footerConfidential:"Confidencial — support@guilhemnormand.com"
},
de: {
navHome:"Zurück",navTitle:"FAQ",pageTitle:"FAQ — IT-Einwände beantwortet",
faqTitle:"Häufig gestellte Fragen",faqSubtitle:"Die technischen Antworten, die Ihre IT-Abteilung, Ihr DSB oder Ihr Einkauf erwartet.",
arg1Title:"Null gespeicherte Daten",arg1Desc:"Keine Kundendatenbank. Daten über AES-verschlüsseltes P2P.",
arg2Title:"In 5 Min einsatzbereit",arg2Desc:"Keine Installation. Kein Server. Ein QR-Code genügt.",
arg3Title:"7 native Sprachen",arg3Desc:"Automatische Spracherkennung. Globale Adressvervollständigung.",
q1:"Woher wissen wir, dass Daten nicht gespeichert werden?",a1p1:"Technisch überprüfbar. Quellcode auditierbar.",a1p2:"Cloudflare-Funktionen akzeptieren keine personenbezogenen Daten.",a1p3:"Technischer Nachweis auf Anfrage.",
q2:"Was passiert bei Cloudflare-Ausfall?",a2p1:"SLA von 99,99%.",a2p2:"WebRTC wechselt zu TURN-Servern.",a2p3:"Lokaler Cache (30 Tage).",
q3:"Unabhängiger Entwickler — was wenn er aufhört?",a3p1:"Drei Schutzebenen:",a3l1:"Vollständiger Quellcode mitgeliefert.",a3l2:"Offene Standards.",a3l3:"Einfacher Tech-Stack.",a3p2:"Escrow-Klausel verfügbar.",
q4:"Ist die Lösung DSGVO-konform?",a4p1:"Null Speicherung = bestes DSGVO-Argument.",a4l1:"Datenminimierung (Art. 5.1.c).",a4l2:"Löschung (Art. 17).",a4l3:"Auskunft (Art. 15).",a4l4:"Berichtigung (Art. 16).",a4p2:"Auftragsverarbeiter EU-US DPF konform.",
q5:"Wie hoch ist der ROI?",a5p1:"3-5 Min pro Vorgang gespart.",a5p2:"2 Mitarbeiter, 80 Kunden/Tag = 4-6 Stunden gewonnen.",
ctaTitle:"Überzeugt?",ctaDesc:"Demo anfordern oder kontaktieren.",ctaBtn:"Kontaktieren",
footerRights:"Alle Rechte vorbehalten.",footerConfidential:"Vertraulich — support@guilhemnormand.com"
},
nl: {
navHome:"Terug",navTitle:"FAQ",pageTitle:"FAQ — IT-bezwaren beantwoord",
faqTitle:"Veelgestelde vragen",faqSubtitle:"De technische antwoorden die uw IT-afdeling, DPO of inkoopafdeling verwacht.",
arg1Title:"Nul opgeslagen gegevens",arg1Desc:"Geen klantendatabase. Gegevens via AES-gecodeerde P2P.",
arg2Title:"Operationeel in 5 min",arg2Desc:"Geen installatie. Geen server. Een QR-code volstaat.",
arg3Title:"7 native talen",arg3Desc:"Automatische taaldetectie. Wereldwijde adressen aanvulling.",
q1:"Hoe weten we dat gegevens niet worden opgeslagen?",a1p1:"Technisch verifieerbaar. Broncode auditeerbaar.",a1p2:"Cloudflare-functies accepteren geen persoonlijke gegevens.",a1p3:"Technisch bewijs op aanvraag.",
q2:"Wat als Cloudflare uitvalt?",a2p1:"SLA van 99,99%.",a2p2:"WebRTC schakelt over naar TURN-servers.",a2p3:"Lokale cache (30 dagen).",
q3:"Onafhankelijke ontwikkelaar — wat als hij stopt?",a3p1:"Drie beschermingsniveaus:",a3l1:"Volledige broncode meegeleverd.",a3l2:"Open standaarden.",a3l3:"Eenvoudige tech stack.",a3p2:"Escrow-clausule beschikbaar.",
q4:"Is het AVG-conform?",a4p1:"Nul opslag = beste AVG-argument.",a4l1:"Minimalisatie (Art. 5.1.c).",a4l2:"Verwijdering (Art. 17).",a4l3:"Inzage (Art. 15).",a4l4:"Rectificatie (Art. 16).",a4p2:"Onderaannemers EU-US DPF conform.",
q5:"Wat is de ROI?",a5p1:"3-5 min bespaard per dossier.",a5p2:"2 agenten, 80 klanten/dag = 4-6 uur herwonnen.",
ctaTitle:"Overtuigd?",ctaDesc:"Vraag een demo aan.",ctaBtn:"Contact opnemen",
footerRights:"Alle rechten voorbehouden.",footerConfidential:"Vertrouwelijk — support@guilhemnormand.com"
}
};
const update = (lang) => {
    const d = i18n[lang] || i18n['fr'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (d[k]) el.textContent = d[k];
    });
    document.documentElement.lang = lang;
};
const sel = document.getElementById('languageSelect');
const disp = document.getElementById('langDisplay');
if (sel && disp) {
    sel.addEventListener('change', (e) => {
        disp.textContent = e.target.options[e.target.selectedIndex].text;
        update(e.target.value);
    });
}
update('fr');
// Reveal on scroll
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
// Ambient glow
const g = document.createElement('div'); g.className = 'ambient-cursor-glow'; document.body.appendChild(g);
document.addEventListener('mousemove', e => { g.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; });
});
})();
