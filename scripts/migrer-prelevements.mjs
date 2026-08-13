// Reprise unique après le déplacement du prélèvement de stock.
//
//   npm run stock:migrer
//
// Avant : le stock partait à la CRÉATION de la commande.
// Après  : il ne part qu'au paiement déclaré, et le registre
//          `prelevements` retient les commandes dont le stock est pris.
//
// Les commandes déjà en base n'ont aucune marque. Sans cette reprise,
// chacune d'elles serait prélevée une SECONDE fois le jour où le
// trésorier la passe à « payée ». Le script pose donc la marque sur
// tout ce que l'ancienne règle avait déjà décrémenté :
//
//   en attente / à vérifier / payée  → décrémentée à la création,
//                                      toujours prise aujourd'hui.
//   échouée déjà libérée             → rendue, rien à marquer.
//   échouée pas encore libérée       → encore prise : on la marque, et
//                                      le rapprochement la rendra au
//                                      prochain rendu de la page.
//
// Rejouable sans dommage : la marque est posée en `$setOnInsert`.

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

const { listerCommandes, STATUTS } = await import('@/libs/commandes');

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const base = client.db(process.env.MONGODB_DB || 'camp_impact_adn');

// Les libérations de l'ancienne règle : ces commandes ont déjà rendu leur
// stock, il ne faut surtout pas les marquer comme prises.
const liberees = new Set(
  (await base.collection('liberations').find({}, { projection: { _id: 1 } }).toArray())
    .map((d) => d._id)
);

const commandes = await listerCommandes();
console.log(
  `${commandes.length} commande(s) lue(s), ${liberees.size} déjà libérée(s).\n`
);

let posees = 0;
let ignorees = 0;

for (const c of commandes) {
  if (c.statut === STATUTS.ECHOUEE && liberees.has(c.ref)) {
    ignorees += 1;
    continue;
  }

  const r = await base.collection('prelevements').updateOne(
    { _id: c.ref },
    { $setOnInsert: { le: new Date().toISOString(), reprise: true } },
    { upsert: true }
  );

  if (r.upsertedCount === 1) {
    posees += 1;
    console.log(`  marquée  ${c.ref.padEnd(12)} ${c.statut}`);
  } else {
    ignorees += 1;
  }
}

console.log(`\n${posees} marque(s) posée(s), ${ignorees} ignorée(s).`);
if (posees === 0) {
  console.log('Rien à reprendre — la migration a déjà été passée.');
}

await client.close();
process.exit(0);
