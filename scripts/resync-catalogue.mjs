// Force src/data/products.js à écraser le catalogue MongoDB.
//
// En temps normal, MongoDB fait autorité : le fichier ne peut qu'AJOUTER
// des produits, des tailles ou des champs. Ce script inverse la règle,
// pour les cas où le fichier doit reprendre la main — après une retouche
// malheureuse dans Atlas, ou pour réaligner prix et descriptions.
//
//   npm run catalogue:resync
//
// `restant` n'est jamais réécrit, même ici : remettre le stock à neuf en
// pleine vente serait la pire des surprises.

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { chargerEnv } from './env.mjs';

register('./scripts/alias.mjs', pathToFileURL('./'));
chargerEnv();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI absente de .env.local — rien à faire.');
  process.exit(1);
}

const mongo = await import('@/libs/stockage/mongo');

console.log('Base :', process.env.MONGODB_DB || 'camp_impact_adn');
console.log('Réalignement du catalogue depuis src/data/products.js…');

await mongo.amorcerCatalogue({ forcer: true });

const produits = await mongo.listerProduits();
console.log(`\n${produits.length} produit(s) réalignés :\n`);
for (const p of produits) {
  const stock = Object.entries(p.restant)
    .map(([t, r]) => `${t}:${r}`)
    .join(' ');
  console.log(
    '  ' + p.id.padEnd(28) + String(p.price).padStart(4) + ' $   ' + stock
  );
}
console.log('\n`restant` a été préservé.');
process.exit(0);
