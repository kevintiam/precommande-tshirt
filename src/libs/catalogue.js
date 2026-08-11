import * as mongo from '@/libs/stockage/mongo';
import { products as amorce } from '@/data/products';

// Seule raison d'être de ce fichier : savoir que MongoDB peut être
// absent. Sans lui, route.js et page.js porteraient chacun le même test,
// et une évolution du stockage devrait être répercutée aux deux endroits.
//
// src/data/products.js reste la source d'amorçage : il remplit Mongo au
// premier démarrage, et sert de repli quand Mongo n'est pas configuré
// (développement sans identifiants). Dans ce repli, `restant` est absent :
// l'interface n'affiche aucun compteur et ne bloque rien, tandis que le
// serveur refuse les commandes faute de pouvoir réserver.

export { StockInsuffisant } from '@/libs/stockage/mongo';

export const lireCatalogue = () =>
  mongo.configure ? mongo.listerProduits() : Promise.resolve(amorce);

export const reserver = (lignes) =>
  mongo.configure ? mongo.reserver(lignes) : Promise.resolve();

export const restituer = (lignes) =>
  mongo.configure ? mongo.restituer(lignes) : Promise.resolve();

export const marquerLibere = (ref) =>
  mongo.configure ? mongo.marquerLibere(ref) : Promise.resolve(false);
