#!/usr/bin/env node
/**
 * OKM Licenses — KV Seed Script
 * Usage: node setup/seed-kv.mjs <KV_NAMESPACE_ID>
 *
 * BEFORE running:
 *   1. Create a KV namespace in your Cloudflare dashboard: Workers & Pages → KV
 *   2. Copy the namespace ID
 *   3. Set your Cloudflare API token: export CLOUDFLARE_API_TOKEN="..."
 *   4. Set your account ID:            export CLOUDFLARE_ACCOUNT_ID="..."
 *
 * Then run:
 *   node setup/seed-kv.mjs <KV_NAMESPACE_ID>
 *
 * This will create the 2 agency entries for OK Mobility Valencia.
 */

import { writeFileSync } from 'fs';

const namespaceId = process.argv[2];
if (!namespaceId) {
    console.error('❌  Usage: node setup/seed-kv.mjs <KV_NAMESPACE_ID>');
    process.exit(1);
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !apiToken) {
    console.error('❌  Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN env vars.');
    process.exit(1);
}

const agencies = [
    {
        key: 'agency:valencia_aero_01',
        value: {
            agencyName: 'OK Mobility Valencia Aeropuerto',
            licenseExpiresAt: '2027-03-16T00:00:00Z',
            firstActivation: true,
            licenseVersion: 1
        }
    },
    {
        key: 'agency:valencia_sorolla_01',
        value: {
            agencyName: 'OK Mobility Estación Joaquín Sorolla',
            licenseExpiresAt: '2027-03-16T00:00:00Z',
            firstActivation: true,
            licenseVersion: 1
        }
    }
];

async function putKvEntry(key, value) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(value)
    });
    const json = await res.json();
    if (!json.success) {
        throw new Error(`Failed to write "${key}": ${JSON.stringify(json.errors)}`);
    }
    return json;
}

async function main() {
    console.log(`\n🔑  Seeding KV namespace: ${namespaceId}\n`);
    for (const { key, value } of agencies) {
        process.stdout.write(`  Writing "${key}"... `);
        await putKvEntry(key, value);
        console.log('✅');
    }
    console.log('\n✨  Done! Both agencies are ready in KV.\n');
    console.log('📝  URLs à scanner pour chaque agence :');
    console.log('    Valencia Aeropuerto : /retailer/?agency=valencia_aero_01');
    console.log('    Joaquín Sorolla     : /retailer/?agency=valencia_sorolla_01\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
