// Réaligne le stock MongoDB sur src/data/products.js — `restant` COMPRIS.
//
//   npm run stock:realigner              simulation, n'écrit rien
//   npm run stock:realigner -- --ecrire  applique
//
// Pourquoi un script à part de `catalogue:resync` : celui-ci ne touche
// jamais `restant`, et c'est une bonne règle par défaut — remettre le
// stock à neuf en pleine vente ferait réapparaître des pièces déjà
// vendues. Mais quand le bon de commande de l'imprimeur arrive, c'est
// l'inverse qu'il faut : le fichier devient la vérité, et `restant` doit
// suivre, sinon la boutique continue de vendre un stock imaginaire.
//
// La règle appliquée, taille par taille :
//
//   déjà pris = initial en base − restant en base   (commandes payées ou
//                                                    déclarées payées)
//   nouvel initial = quantité du fichier
//   nouveau restant = nouvel initial − déjà pris
//
// Les pièces déjà parties sont donc préservées : personne ne se retrouve
// avec une commande sans t-shirt. Si le bon en prévoit MOINS que ce qui
// est déjà pris, le restant serait négatif : le script s'arrête et
// nomme la ligne fautive plutôt que de plancher silencieusement à 0 —
// c'est une décision humaine, pas une décision de script.
//
// Rejouable sans dommage : « déjà pris » est recalculé depuis l'état du
// moment, donc une seconde exécution ne change plus rien.

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { MongoClient } from 'mongodb';
import { chargerEnv } from './env.mjs';

register('./scripts/alias.mjs', pathToFileURL('./'));
chargerEnv();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI absente de .env.local — rien à faire.');
  process.exit(1);
}

const ecrire = process.argv.includes('--ecrire');

const { products } = await import('@/data/products');

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const base = client.db(process.env.MONGODB_DB || 'camp_impact_adn');
const produits = base.collection('produits');

const documents = new Map(
  (await produits.find({}).toArray()).map((d) => [d._id, d])
);

const operations = [];
const conflits = [];
let inchanges = 0;

console.log(ecrire ? 'ÉCRITURE\n' : 'SIMULATION — rien ne sera écrit\n');

for (const p of products) {
  const doc = documents.get(p.id);
  if (!doc) {
    console.log(`${p.id.padEnd(28)} absent en base — ignoré (amorçage requis)`);
    continue;
  }

  const lignes = [];

  for (const [taille, cible] of Object.entries(p.stock ?? {})) {
    const actuel = doc.stock?.[taille];
    const initial = actuel?.initial ?? 0;
    const restant = actuel?.restant ?? 0;
    const pris = initial - restant;
    const nouveauRestant = cible - pris;

    if (nouveauRestant < 0) {
      conflits.push({ id: p.id, taille, cible, pris });
      continue;
    }

    if (initial === cible && restant === nouveauRestant) {
      inchanges += 1;
      continue;
    }

    lignes.push(
      `${taille} ${initial}/${restant} → ${cible}/${nouveauRestant}` +
        (pris ? ` (${pris} pris)` : '')
    );

    operations.push({
      updateOne: {
        filter: { _id: p.id },
        update: {
          $set: {
            [`stock.${taille}.initial`]: cible,
            [`stock.${taille}.restant`]: nouveauRestant,
          },
        },
      },
    });
  }

  if (lignes.length) console.log(`${p.id.padEnd(28)} ${lignes.join('  ·  ')}`);
}

if (conflits.length) {
  console.error('\n⛔ Arrêt — le bon de commande ne couvre pas des pièces déjà prises :');
  for (const c of conflits) {
    console.error(
      `   ${c.id} ${c.taille} : ${c.pris} pièce(s) déjà prise(s), ${c.cible} au fichier`
    );
  }
  console.error(
    '\nRelève la quantité dans src/data/products.js, ou traite la commande\n' +
      'concernée à la main. Aucune écriture n’a eu lieu.'
  );
  await client.close();
  process.exit(1);
}

console.log(
  `\n${operations.length} taille(s) à réaligner, ${inchanges} déjà à jour.`
);

if (!operations.length) {
  console.log('Rien à faire.');
} else if (!ecrire) {
  console.log('Relance avec `-- --ecrire` pour appliquer.');
} else {
  const r = await produits.bulkWrite(operations, { ordered: false });
  console.log(`${r.modifiedCount} document(s) modifié(s).`);
  console.log(
    '\nLe serveur en ligne relira le stock au prochain rendu de la boutique.'
  );
}

await client.close();
process.exit(0);
