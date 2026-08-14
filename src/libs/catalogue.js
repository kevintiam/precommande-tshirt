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

// Certains produits du fichier n'ont qu'une `images` (galerie), pas
// d'`image` (vignette) : mongo.js déduit la seconde de la première à
// l'amorçage. Ce repli doit faire pareil, sinon la vignette de ces
// produits est vide tant que MongoDB n'est pas configuré.
const avecVignette = (p) => ({ ...p, image: p.image ?? p.images?.[0] });

export const lireCatalogue = () =>
  mongo.configure
    ? mongo.listerProduits()
    : Promise.resolve(amorce.map(avecVignette));

export const reserver = (lignes) =>
  mongo.configure ? mongo.reserver(lignes) : Promise.resolve();

export const restituer = (lignes) =>
  mongo.configure ? mongo.restituer(lignes) : Promise.resolve();

// Sans MongoDB il n'y a pas de stock à tenir : « rien à prélever, rien
// de pris » est la réponse qui laisse tout le monde tranquille.
export const marquerPreleve = (ref) =>
  mongo.configure ? mongo.marquerPreleve(ref) : Promise.resolve(false);

export const oublierPreleve = (ref) =>
  mongo.configure ? mongo.oublierPreleve(ref) : Promise.resolve();

export const estPreleve = (ref) =>
  mongo.configure ? mongo.estPreleve(ref) : Promise.resolve(false);
