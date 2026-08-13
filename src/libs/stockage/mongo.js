import { MongoClient } from 'mongodb';
import { StockageIndisponible } from '@/libs/stockage/contrat';
import { products as catalogueInitial } from '@/data/products';

const URI = process.env.MONGODB_URI;
const NOM_BASE = process.env.MONGODB_DB || 'camp_impact_adn';

export const configure = Boolean(URI);

// Patron singleton : une seule connexion pour tous les appels, réutilisée.
// Elle est portée par globalThis car Next recharge les modules à chaud en
// développement — sans ça, une connexion par rechargement.
async function client() {
  if (!URI) throw new StockageIndisponible('MONGODB_URI absente.');

  if (!globalThis.__mongo) {
    globalThis.__mongo = new MongoClient(URI).connect();
  }

  try {
    return await globalThis.__mongo;
  } catch (err) {
    // On VIDE le cache avant de propager. Sans cette ligne, une promesse
    // rejetée resterait mémorisée et tous les appels suivants
    // échoueraient à l'identique — même une fois MongoDB revenu, jusqu'au
    // redémarrage du serveur.
    globalThis.__mongo = null;
    throw new StockageIndisponible(
      `Connexion MongoDB impossible : ${err.message.split('\n')[0]}`
    );
  }
}

const produitsCol = async () => (await client()).db(NOM_BASE).collection('produits');

// Erreur porteuse de la ligne fautive, pour un message précis au client.
export class StockInsuffisant extends Error {
  constructor(ligne, dispo) {
    super(`Stock insuffisant : ${ligne.nom ?? ligne.productId} (${ligne.size})`);
    this.ligne = ligne;
    this.dispo = dispo;
  }
}

// Synchronise le catalogue depuis src/data/products.js.
//
// Le partage des rôles :
//   MongoDB               → fait AUTORITÉ. Ce que tu modifies dans Atlas
//                           — nom, prix, images, stock — n'est jamais
//                           écrasé par un déploiement.
//   src/data/products.js  → peut AJOUTER, jamais modifier. Un nouveau
//                           produit, une nouvelle taille ou un nouveau
//                           champ arrive en base ; une valeur changée
//                           dans le fichier, non.
//
// Cette règle « ajouter seulement » évite les deux pièges opposés : un
// déploiement qui écrase tes retouches, et un catalogue figé où plus
// aucune nouveauté ne passe.
//
// `forcer: true` inverse la règle et impose le fichier — c'est la porte
// de sortie, exposée par `npm run catalogue:resync`.
//
// Exécutée une fois par instance de serveur : elle coûte 79 écritures et
// le contenu ne bouge qu'au déploiement, lequel crée de nouvelles
// instances et la relance donc naturellement.
let catalogueSynchronise = false;

export async function amorcerCatalogue({ forcer = false } = {}) {
  if (catalogueSynchronise && !forcer) return;

  const produits = await produitsCol();
  const operations = [];

  for (const p of catalogueInitial) {
    const images = p.images?.length ? p.images : p.image ? [p.image] : [];
    // `image` reste la vignette. S'il est absent, on prend la première de
    // la galerie plutôt que de laisser un champ vide.
    const contenu = {
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image ?? images[0],
      images,
      ...(p.imagePosition ? { imagePosition: p.imagePosition } : {}),
    };

    if (forcer) {
      operations.push({
        updateOne: {
          filter: { _id: p.id },
          update: {
            $set: contenu,
            // Un `imagePosition` retiré du fichier doit disparaître aussi
            // du document, sinon le recadrage resterait collé au produit.
            ...(p.imagePosition ? {} : { $unset: { imagePosition: '' } }),
          },
          upsert: true,
        },
      });
    } else {
      // Création seule : un document existant n'est jamais touché.
      operations.push({
        updateOne: {
          filter: { _id: p.id },
          update: { $setOnInsert: contenu },
          upsert: true,
        },
      });

      // Rattrapage additif, champ par champ : `$exists: false` fait que
      // seuls les champs ABSENTS sont remplis. C'est ce qui permet
      // d'introduire un nouveau champ sans rien écraser.
      for (const [champ, valeur] of Object.entries(contenu)) {
        operations.push({
          updateOne: {
            filter: { _id: p.id, [champ]: { $exists: false } },
            update: { $set: { [champ]: valeur } },
          },
        });
      }
    }

    for (const [taille, quantite] of Object.entries(p.stock ?? {})) {
      // Taille nouvelle : on crée `initial` ET `restant`.
      operations.push({
        updateOne: {
          filter: { _id: p.id, [`stock.${taille}`]: { $exists: false } },
          update: {
            $set: { [`stock.${taille}`]: { initial: quantite, restant: quantite } },
          },
        },
      });

      // Taille connue : seul le mode forcé réaligne `initial`. `restant`
      // n'est JAMAIS réécrit, même en forçant : remettre le stock à neuf
      // en pleine vente serait la pire des surprises.
      if (forcer) {
        operations.push({
          updateOne: {
            filter: { _id: p.id, [`stock.${taille}`]: { $exists: true } },
            update: { $set: { [`stock.${taille}.initial`]: quantite } },
          },
        });
      }
    }
  }

  // `ordered` est indispensable : la création du document doit précéder
  // les mises à jour de son stock.
  if (operations.length) await produits.bulkWrite(operations, { ordered: true });

  // Marqué seulement après succès : un échec réseau doit pouvoir être
  // retenté au prochain appel, pas rester silencieusement inachevé.
  catalogueSynchronise = true;
}

// Le catalogue tel que l'affiche la boutique. `stock` y est aplati en
// { taille: restant } : c'est tout ce dont l'interface a besoin.
export async function listerProduits() {
  await amorcerCatalogue();
  const documents = await (await produitsCol()).find({}).toArray();

  const produits = [];

  for (const d of documents) {
    const produit = {
      id: d._id,
      name: d.name,
      description: d.description,
      price: d.price,
      image: d.image,
      // Documents créés avant l'ajout de la galerie : on retombe sur la
      // vignette seule plutôt que de renvoyer un tableau vide.
      images: d.images?.length ? d.images : [d.image],
      stock: {},
      restant: {},
    };

    if (d.imagePosition) {
      produit.imagePosition = d.imagePosition;
    }

    for (const taille in d.stock) {
      produit.stock[taille] = d.stock[taille].initial;
      produit.restant[taille] = d.stock[taille].restant;
    }

    produits.push(produit);
  }

  // MongoDB ne garantit aucun ordre sur un find() sans sort. On rétablit
  // celui de src/data/products.js : l'ordre d'affichage de la boutique est
  // un choix éditorial, pas un hasard de stockage.
  const rang = new Map(catalogueInitial.map((p, i) => [p.id, i]));
  produits.sort((a, b) => (rang.get(a.id) ?? 999) - (rang.get(b.id) ?? 999));

  return produits;
}

// Décrémente toutes les lignes, ou aucune. La transaction est ce qui
// empêche qu'une commande refusée sur sa deuxième ligne laisse la première réservée.
export async function reserver(lignes) {
  const c = await client();
  const produits = c.db(NOM_BASE).collection('produits');
  const session = c.startSession();

  try {
    await session.withTransaction(async () => {
      for (const ligne of lignes) {
        const { productId, size, qty } = ligne;
        const qteRestante = `stock.${size}.restant`;

        const filtre = {
          _id: productId,
          [qteRestante]: { $gte: qty }, 
        };

        // Si on le trouve, on enlève la quantité du stock
        const modification = {
          $inc: { [qteRestante]: -qty },
        };

        const resultat = await produits.updateOne(filtre, modification, { session });

        const aucunProduitTrouve = resultat.matchedCount === 0;

        if (aucunProduitTrouve) {
          // Soit le produit/taille n'existe pas, soit il n'y a pas assez de stock.
          // On va chercher le stock réel pour donner un message clair.
          const produitActuel = await produits.findOne({ _id: productId }, { session });
          const stockRestant = produitActuel?.stock?.[size]?.restant ?? 0;

          throw new StockInsuffisant(ligne, stockRestant);
        }
      }
    });
  } finally {
    await session.endSession();
  }
}

// Remet le stock en vente : compensation si l'enregistrement de la
// commande échoue, ou libération d'une commande passée à « echouee ».
export async function restituer(lignes) {
  const produits = await produitsCol();
  for (const l of lignes) {
    await produits.updateOne(
      { _id: l.productId, [`stock.${l.size}`]: { $exists: true } },
      { $inc: { [`stock.${l.size}.restant`]: l.qty } }
    );
  }
}

// Registre « le stock de cette commande est actuellement pris ».
//
// Il est indispensable parce que le rapprochement est déclenché par une
// relecture périodique de la feuille : il SERA rejoué. Sans registre,
// chaque passage prélèverait une fois de plus, et chaque libération
// rendrait une fois de trop.
//
// Une marque, pas deux : le même enregistrement sert à savoir s'il faut
// prélever et s'il faut restituer. Deux journaux séparés finiraient par
// se contredire.
//
// Ordre d'écriture : marquer AVANT de décrémenter, effacer APRÈS avoir
// rendu. Une panne au milieu laisse alors une marque sans décrément —
// visible, et rattrapable — plutôt qu'un décrément que plus rien ne
// rattache à une commande.
const prelevements = async () =>
  (await client()).db(NOM_BASE).collection('prelevements');

// true = la marque vient d'être posée, le stock est à prélever.
// false = elle existait déjà, il n'y a rien à faire.
export async function marquerPreleve(ref) {
  const r = await (await prelevements()).updateOne(
    { _id: ref },
    { $setOnInsert: { le: new Date().toISOString() } },
    { upsert: true }
  );
  return r.upsertedCount === 1;
}

export async function oublierPreleve(ref) {
  await (await prelevements()).deleteOne({ _id: ref });
}

export async function estPreleve(ref) {
  const marque = await (await prelevements()).findOne(
    { _id: ref },
    { projection: { _id: 1 } }
  );
  return Boolean(marque);
}
