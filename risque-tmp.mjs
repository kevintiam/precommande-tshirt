import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';
import { chargerEnv } from './scripts/env.mjs';
chargerEnv();

const { lignes } = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const norm = (v) => {
  const x = String(v ?? '').trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (['payee', 'paye', 'paid', 'recu', 'oui'].includes(x)) return 'PAYEE';
  if (['echouee', 'echoue', 'annulee', 'annule', 'non'].includes(x)) return 'ECHOUEE';
  if (['a_verifier', 'a verifier', 'verifier', 'declare'].includes(x)) return 'A_VERIFIER';
  return 'EN_ATTENTE';
};

const cl = await new MongoClient(process.env.MONGODB_URI).connect();
const base = cl.db(process.env.MONGODB_DB || 'camp_impact_adn');
const marques = new Set((await base.collection('prelevements').find({}, { projection: { _id: 1 } }).toArray()).map((d) => d._id));

let aPrelever = 0, pieces = 0;
const refs = [];
for (const r of lignes) {
  const s = norm(r[2]);
  if (s !== 'PAYEE' && s !== 'A_VERIFIER') continue;
  if (marques.has(r[0])) continue;
  let d = []; try { d = JSON.parse(r[11] || '[]'); } catch {}
  aPrelever++; pieces += d.reduce((a, l) => a + l.qty, 0);
  refs.push(r[0]);
}
console.log('marques dans « prelevements »      :', marques.size);
console.log('commandes payées / à vérifier      :', lignes.filter((r) => ['PAYEE', 'A_VERIFIER'].includes(norm(r[2]))).length);
console.log('SANS marque → seraient décrémentées :', aPrelever, `(${pieces} pièces)`);
if (refs.length) console.log('  ', refs.slice(0, 30).join(' '));

let aRendre = 0;
for (const r of lignes) {
  if (norm(r[2]) !== 'ECHOUEE') continue;
  if (marques.has(r[0])) aRendre++;
}
console.log('échouées encore marquées → seraient restituées :', aRendre);
await cl.close();
process.exit(0);
