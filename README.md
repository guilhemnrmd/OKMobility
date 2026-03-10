# OK Mobility - Formulaire Client

Une application web statique moderne, élégante et ultra-rapide permettant de recueillir les informations des clients (nom, prénom remplacés par adresse, téléphone, email) de manière fluide et intuitive. L'interface utilise un design "Liquid Glass" inspiré des standards haut de gamme modernes (Apple HIG, Airbnb DLS).

## ✨ Fonctionnalités
- **Design "Liquid Glass" Premium** : Interface semi-transparente avec arrière-plan dynamique, adaptée aux modes Clair et Sombre (Dark Mode) natifs.
- **Multilingue Automatique** : Supporte 6 langues (FR, EN, ES, IT, PT, DE). La langue est détectée automatiquement selon les préférences de l'appareil du client, avec l'Espagnol par défaut.
- **Autocomplétion d'Adresse** : Recherche d'adresse mondiale alimentée par `Photon / Komoot`. Le formatage (Numéro avant la rue vs. Rue avant le numéro) s'ajuste dynamiquement selon la langue de l'interface.
- **Saisie de Numéro de Téléphone Internationale** : Sélecteur de pays avec drapeaux emoji intelligent pré-rempli, récupération dynamique des indicatifs depuis `restcountries.com`.
- **Mode 100% Client/Front-End** : Pas de serveur lourd, pas de base de données logicielle requise. Fichiers ultra-légers prêts à être hébergés n'importe où.
- **Génération de Résumé Visuel** : Transforme instantanément la saisie dans une vue carte propre et moderne pour validation par le conseiller.

## 🚀 Déploiement : Hébergement gratuit sur Cloudflare Pages

Cloudflare Pages est l'une des plateformes les plus rapides et sécurisées pour héberger des sites web statiques. Votre site sera disponible sous une URL professionnelle finissant par `.pages.dev`.

### Étapes à suivre par le propriétaire du projet :
1. **Créer un compte Cloudflare** : Rendez-vous sur [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) et créez un compte gratuit si vous n'en avez pas déjà un.
2. **Aller dans Workers & Pages** : Dans le menu de gauche du tableau de bord Cloudflare, cliquez sur **"Workers & Pages"**.
3. **Créer une application de type "Pages"** : 
   - Cliquez sur le bouton bleu **"Create"** (ou Créer).
   - Sélectionnez l'onglet **"Pages"**.
   - Cliquez sur **"Connect to Git"**.
4. **Lier GitHub** :
   - Autorisez Cloudflare à accéder à votre compte GitHub personnel `guilhemnrmd`.
   - Sélectionnez uniquement le dépôt **`OKMobility`**.
   - Cliquez sur "Begin setup" (Commencer la configuration).
5. **Configuration du Build** :
   - **Project name (Nom du projet)** : Cloudflare en choisira un (ex: `okmobility-vw2`), vous pouvez le modifier pour quelque chose de plus propre comme `okmobility-form`. L'URL finale de votre site sera `nom-du-projet.pages.dev`.
   - **Production branch** : Laissez `main`.
   - **Framework preset** : Laissez `None` (Aucun).
   - **Build command** : Laissez vide.
   - **Build output directory** : Laissez vide.
6. **Lancement** :
   - Cliquez sur **"Save and Deploy"** (Enregistrer et déployer).
   - En quelques secondes, votre projet sera compilé et mis en ligne. Cloudflare vous fournira un lien du type `https://okmobility-form.pages.dev`.

### Mises à jour automatiques
Une fois cette configuration terminée, **le lien entre GitHub et Cloudflare est permanent et automatique**. Dès qu'une modification est validée et transférée (push) sur la branche `main` du dépôt GitHub, Cloudflare déploiera instantanément la nouvelle version en moins d'une minute, sans aucune action de votre part !

---

Dernière mise à jour : 2026.
