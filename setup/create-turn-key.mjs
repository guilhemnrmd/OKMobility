#!/usr/bin/env node
/**
 * Crée une clé TURN Cloudflare Calls et affiche les secrets à configurer.
 * Usage : node setup/create-turn-key.mjs
 *
 * Prérequis :
 *  - CLOUDFLARE_ACCOUNT_ID  (ex: ff6231688658a3f9acaa90fec7b3a218)
 *  - CLOUDFLARE_API_TOKEN   (token API Cloudflare avec permission "Cloudflare Calls: Edit")
 *
 * Si vous n'avez pas encore de token API :
 *   https://dash.cloudflare.com/profile/api-tokens
 *   → "Create Token" → "Custom Token"
 *   → Permission: Account | Cloudflare Calls | Edit
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'ff6231688658a3f9acaa90fec7b3a218';
const API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN;
const KEY_NAME   = process.env.TURN_KEY_NAME || 'OKMobility-WebRTC';

if (!API_TOKEN) {
  console.error(`
❌  CLOUDFLARE_API_TOKEN manquant.

Crée un token API ici :
  https://dash.cloudflare.com/profile/api-tokens

Puis relance :
  CLOUDFLARE_API_TOKEN=ton_token node setup/create-turn-key.mjs
`);
  process.exit(1);
}

async function main() {
  console.log(`\n🔑  Création de la clé TURN "${KEY_NAME}"…\n`);

  // 1. Créer la clé TURN
  const createRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/turn_keys`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: KEY_NAME })
    }
  );

  const createJson = await createRes.json();

  if (!createRes.ok || !createJson.success) {
    console.error('❌  Erreur Cloudflare API :', JSON.stringify(createJson, null, 2));
    process.exit(1);
  }

  const key = createJson.result;

  console.log('✅  Clé TURN créée avec succès !\n');
  console.log('─'.repeat(60));
  console.log(`  Key ID    : ${key.uid ?? key.id ?? '(voir ci-dessous)'}`);
  console.log(`  Key Name  : ${key.name}`);
  console.log(`  API Token : ${key.key}`);
  console.log('─'.repeat(60));

  // 2. Afficher les commandes wrangler à copier-coller
  const keyId    = key.uid ?? key.id;
  const keyToken = key.key;

  console.log(`
📋  Configure les secrets Wrangler en collant ces commandes :

  npx wrangler pages secret put TURN_KEY_ID --project-name ok-mobility-retailer
  → Valeur : ${keyId}

  npx wrangler pages secret put TURN_API_TOKEN --project-name ok-mobility-retailer
  → Valeur : ${keyToken}

📦  Puis redéploie :

  npx wrangler pages deploy . --project-name ok-mobility-retailer --branch main

🧪  Et vérifie (doit retourner 200 + JSON iceServers) :

  curl -s -o - -w "\\n\\nHTTP %{http_code}\\n" -X POST \\
    -H "Origin: https://ok-mobility-retailer.pages.dev" \\
    https://ok-mobility-retailer.pages.dev/api/turn-credentials
`);
}

main().catch(err => {
  console.error('❌  Erreur inattendue :', err.message);
  process.exit(1);
});
