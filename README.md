# OK Mobility - Formulaire Client

Une application web statique moderne, élégante et ultra-rapide permettant de recueillir les informations des clients (nom, prénom remplacés par adresse, téléphone, email) de manière fluide et intuitive. L'interface utilise un design "Liquid Glass" inspiré des standards haut de gamme modernes (Apple HIG, Airbnb DLS).

## ✨ Fonctionnalités
- **Design "Liquid Glass" Premium** : Interface semi-transparente avec arrière-plan dynamique, adaptée aux modes Clair et Sombre (Dark Mode) natifs.
- **Multilingue Automatique** : Supporte 6 langues (FR, EN, ES, IT, PT, DE). La langue est détectée automatiquement selon les préférences de l'appareil du client, avec l'Espagnol par défaut.
- **Autocomplétion d'Adresse** : Recherche d'adresse mondiale alimentée par `Photon / Komoot`. Le formatage (Numéro avant la rue vs. Rue avant le numéro) s'ajuste dynamiquement selon la langue de l'interface.
- **Saisie de Numéro de Téléphone Internationale** : Sélecteur de pays avec drapeaux emoji intelligent pré-rempli, récupération dynamique des indicatifs depuis `restcountries.com`.
- **Mode 100% Client/Front-End** : Pas de serveur lourd, pas de base de données logicielle requise. Fichiers ultra-légers prêts à être hébergés n'importe où.
- **Génération de Résumé Visuel** : Transforme instantanément la saisie dans une vue carte propre et moderne pour validation par le conseiller.

## 🎨 Charte graphique (DA)
Couleurs de référence utilisées dans l'application :

- **Bleu principal** : `#2054EA`
- **Blanc** : `#FFFFFF`
- **Noir/Anthracite** : `#17181D`

Ces couleurs sont appliquées aux éléments clés (fonds, textes, accent, boutons, états focus) pour améliorer la lisibilité (notamment sur les labels type Adresse, Email, etc.).

## 🔒 Confidentialité / visibilité publique
- Le site reste une application statique front-end (pas de stockage serveur natif).
- Ajout de directives anti-indexation (`noindex`, `nofollow`, etc.) dans la page pour limiter l'exposition dans les moteurs.
- Le menu d'indicatifs téléphoniques est piloté par la **langue choisie dans l'app** (sélecteur en haut), et non directement par la langue navigateur. Au premier chargement, la langue navigateur sert seulement à pré-remplir ce choix.

## 🚀 Déploiement : Hébergement gratuit sur Cloudflare Pages

Cloudflare Pages est l'une des plateformes les plus rapides et sécurisées pour héberger des sites web statiques. Votre site sera disponible sous une URL professionnelle finissant par `.pages.dev`.

### Mises à jour automatiques
Une fois cette configuration terminée, **le lien entre GitHub et Cloudflare est permanent et automatique**. Dès qu'une modification est validée et transférée (push) sur la branche `main` du dépôt GitHub, Cloudflare déploiera instantanément la nouvelle version en moins d'une minute, sans aucune action de votre part !

## 📦 Provenance des assets externes (self-hosted)

Pour confidentialité et fiabilité réseau, les ressources suivantes sont désormais hébergées localement dans le dépôt :

- **Inter (police principale)**
	- Source : Google Fonts / Google Fonts static (`fonts.gstatic.com`)
	- Emplacement local : [assets/fonts/inter/Inter-400.ttf](assets/fonts/inter/Inter-400.ttf), [assets/fonts/inter/Inter-500.ttf](assets/fonts/inter/Inter-500.ttf), [assets/fonts/inter/Inter-600.ttf](assets/fonts/inter/Inter-600.ttf), [assets/fonts/inter/Inter-700.ttf](assets/fonts/inter/Inter-700.ttf)
	- Chargement : [style.css](style.css)

- **Boxicons (icônes)**
	- Source : `boxicons@2.1.4` (distribution npm/CDN)
	- Emplacement local CSS : [assets/boxicons/css/boxicons.min.css](assets/boxicons/css/boxicons.min.css)
	- Emplacement local fonts : [assets/boxicons/fonts/boxicons.woff2](assets/boxicons/fonts/boxicons.woff2), [assets/boxicons/fonts/boxicons.woff](assets/boxicons/fonts/boxicons.woff), [assets/boxicons/fonts/boxicons.ttf](assets/boxicons/fonts/boxicons.ttf), [assets/boxicons/fonts/boxicons.eot](assets/boxicons/fonts/boxicons.eot), [assets/boxicons/fonts/boxicons.svg](assets/boxicons/fonts/boxicons.svg)
	- Chargement : [index.html](index.html), [retailer/index.html](retailer/index.html)

> Note: conservez les versions d'origine et licences associées lors de futures mises à jour de ces assets.

## 🧭 Structure actuelle (repère rapide)

- **Client (page publique)** : [index.html](index.html)
- **Conseiller (page interne)** : [retailer/index.html](retailer/index.html)
- **Styles partagés** : [style.css](style.css)
- **JS Client** : [assets/js/script.js](assets/js/script.js)
- **JS Conseiller** : [assets/js/conseiller.js](assets/js/conseiller.js)
- **Favicon** : [assets/favicon.ico](assets/favicon.ico)
- **Headers de sécurité Cloudflare Pages** : [_headers](_headers)
- **Redirections** : [_redirects](_redirects)
- **API TURN (Cloudflare Functions)** : [functions/api/turn-credentials.js](functions/api/turn-credentials.js)

## 🔐 Durcissement sécurité (100% compatible plan gratuit)

Le projet applique une protection « raisonnable » gratuite. Objectif: limiter la réutilisation abusive et protéger les secrets, tout en restant simple à maintenir.

### 1) En-têtes HTTP de sécurité
Configurés dans [_headers](_headers):

- `Content-Security-Policy` (CSP) stricte
- `X-Frame-Options: DENY` + `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restrictive
- `X-Robots-Tag` + meta robots anti-indexation

### 2) Endpoint TURN renforcé
Implémenté dans [functions/api/turn-credentials.js](functions/api/turn-credentials.js):

- Vérification d'origine (`origin` / `referer`) sur domaine autorisé
- Support `OPTIONS` (preflight CORS)
- Limitation de débit par IP mémoire (fenêtre glissante)
- Réponses JSON sans cache (`Cache-Control: no-store`)

### 3) Limite importante à connaître
Un code exécuté côté navigateur n'est **jamais** incopiable à 100%. La bonne stratégie est:

- secrets et logique sensible côté API/serveur
- durcissement côté front pour compliquer la copie opportuniste
- évolution progressive sans verrouiller le projet

## ↩️ Revenir en arrière sans se perdre

Oui, retour arrière possible à tout moment grâce à Git.

### Cas A — Annuler le dernier commit (sans réécrire l'historique partagé)

Utiliser un revert:

- `git log --oneline -n 10`
- `git revert <sha_du_commit_a_annuler>`
- `git push`

### Cas B — Revenir temporairement à une ancienne version pour test local

- `git checkout <sha_ancien>`
- tester
- `git checkout main`

### Cas C — Restaurer un fichier précis

- `git checkout <sha_ancien> -- path/du/fichier`
- `git commit -m "restore: path/du/fichier depuis <sha>"`
- `git push`

### Bonne pratique recommandée pour les prochaines évolutions

- Créer une branche de travail par changement important (`feature/...`, `chore/...`, `security/...`)
- Valider puis fusionner dans `main` quand c'est stable
- Déployer ensuite pour garder un historique clair et réversible

---

Dernière mise à jour : 2026.
