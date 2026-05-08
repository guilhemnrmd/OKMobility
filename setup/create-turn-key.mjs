#!/usr/bin/env node
/**
 * Crée une clé TURN Cloudflare Calls et affiche les secrets à configurer.
 * Usage : node setup/create-turn-key.mjs
 *
 * Prérequis :
 *  - CLOUDFLARE_ACCOUNT_ID  (ex: ff6231688658a3f9acaa90fec7b3a218)
 *  - Option A (recommandée): CLOUDFLARE_API_TOKEN
 *  - Option B: CLOUDFLARE_EMAIL + CLOUDFLARE_GLOBAL_API_KEY
 *
 * Si vous n'avez pas encore de token API :
 *   https://dash.cloudflare.com/profile/api-tokens
 *   → "Create Token" → "Custom Token"
 *   → Permission: Account | Cloudflare Calls | Edit
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'ff6231688658a3f9acaa90fec7b3a218';
const API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN;
const CF_EMAIL = process.env.CLOUDFLARE_EMAIL;
const CF_GLOBAL_API_KEY = process.env.CLOUDFLARE_GLOBAL_API_KEY;
const KEY_NAME   = process.env.TURN_KEY_NAME || 'OKMobility-WebRTC';
const DEFAULT_PAGES_PROJECT_NAME = 'okmobility';
const WRANGLER_PROJECT_NAME = process.env.WRANGLER_PROJECT_NAME || DEFAULT_PAGES_PROJECT_NAME;
const AUTO_DEPLOY = process.env.AUTO_DEPLOY === '1';

const authHeaders = API_TOKEN
  ? { 'Authorization': `Bearer ${API_TOKEN}` }
  : (CF_EMAIL && CF_GLOBAL_API_KEY)
    ? {
      'X-Auth-Email': CF_EMAIL,
      'X-Auth-Key': CF_GLOBAL_API_KEY
    }
    : null;

if (!authHeaders) {
  console.error(`
❌  Auth Cloudflare manquante.

Option A (recommandée) :
  CLOUDFLARE_API_TOKEN=ton_token

Option B :
  CLOUDFLARE_EMAIL=ton_email CLOUDFLARE_GLOBAL_API_KEY=ta_cle_api

Pour créer un token API :
  https://dash.cloudflare.com/profile/api-tokens

Puis relance :
  CLOUDFLARE_API_TOKEN=ton_token node setup/create-turn-key.mjs
`);
  process.exit(1);
}

async function putPagesSecret(name, value, projectName) {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(
    'npx',
    ['wrangler', 'pages', 'secret', 'put', name, '--project-name', projectName],
    {
      input: value,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }
  );

  if (result.status !== 0) {
    throw new Error(`Impossible de définir le secret ${name}: ${result.stderr || result.stdout}`);
  }
}

async function deployPages(projectName) {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(
    'npx',
    ['wrangler', 'pages', 'deploy', '.', '--project-name', projectName, '--branch', 'main', '--commit-dirty=true'],
    {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }
  );

  if (result.status !== 0) {
    throw new Error(`Déploiement échoué: ${result.stderr || result.stdout}`);
  }
}

async function main() {
  console.log(`\n🔑  Création de la clé TURN "${KEY_NAME}"…\n`);

  // 1. Créer la clé TURN
  const createRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/turn_keys`,
    {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: KEY_NAME })
    }
  );

  const createJson = await createRes.json();

  if (!createRes.ok || !createJson.success) {
    if (createJson?.errors?.some(e => e?.code === 10002)) {
      console.error(`
❌  Authorization Failure (10002).

Le token n'a pas les droits suffisants pour créer une clé TURN.
Vérifie :
  - Permission: Account | Cloudflare Calls | Edit
  - Account Resources: Include | Specific account | ${ACCOUNT_ID}
`);
      process.exit(1);
    }
    console.error('❌  Erreur Cloudflare API :', JSON.stringify(createJson, null, 2));
    process.exit(1);
  }

  const key = createJson.result;
  const keyId = key.uid ?? key.id;
  const keyToken = key.secret ?? key.key;

  if (!keyId || !keyToken) {
    console.error('❌  Réponse API incomplète: id/secret TURN manquant.');
    process.exit(1);
  }

  console.log('✅  Clé TURN créée avec succès !\n');
  console.log('─'.repeat(60));
  console.log(`  Key ID    : ${keyId}`);
  console.log(`  Key Name  : ${key.name}`);
  console.log('  API Token : [MASQUÉ — jamais affiché]');
  console.log('─'.repeat(60));

  console.log(`\n🔐  Enregistrement sécurisé des secrets dans Pages (${WRANGLER_PROJECT_NAME})...`);
  await putPagesSecret('TURN_KEY_ID', keyId, WRANGLER_PROJECT_NAME);
  await putPagesSecret('TURN_API_TOKEN', keyToken, WRANGLER_PROJECT_NAME);
  console.log('✅  Secrets TURN enregistrés (sans affichage des valeurs).');
  console.log('ℹ️  Secrets Pages: liés au projet (production + preview de ce projet).');

  if (AUTO_DEPLOY) {
    console.log('\n📦  Déploiement en cours...');
    await deployPages(WRANGLER_PROJECT_NAME);
    console.log('✅  Déploiement terminé.');
  }

  console.log(`
🧪  Vérification (doit retourner 200 + JSON iceServers) :

  curl -s -o - -w "\\nHTTP %{http_code}\\n" -X POST \\
    -H "Origin: https://okmobility.pages.dev" \\
    https://okmobility.pages.dev/api/turn-credentials

Exemples :
  node setup/create-turn-key.mjs
  WRANGLER_PROJECT_NAME=okmobility AUTO_DEPLOY=1 node setup/create-turn-key.mjs
`);
}

main().catch(err => {
  console.error('❌  Erreur inattendue :', err.message);
  process.exit(1);
});
