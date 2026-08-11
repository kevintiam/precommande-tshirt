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

// Amorce le catalogue depuis src/data/products.js sans jamais écraser
// l'existant : $setOnInsert garantit qu'un prix corrigé ou un stock
// ajusté dans Mongo survit à tous les déploiements suivants.
export async function amorcerCatalogue() {
  const produits = await produitsCol();

  const operations = catalogueInitial.map((p) => ({
    updateOne: {
      filter: { _id: p.id },
      update: {
        $setOnInsert: {
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          ...(p.imagePosition ? { imagePosition: p.imagePosition } : {}),
          stock: Object.fromEntries(
            Object.entries(p.stock ?? {}).map(([taille, quantite]) => [
              taille,
              { initial: quantite, restant: quantite },
            ])
          ),
        },
      },
      upsert: true,
    },
  }));

  if (operations.length) await produits.bulkWrite(operations);
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

// Journal des restitutions déjà faites : la libération est déclenchée par
// une relecture périodique de la feuille, donc elle sera rejouée. Sans ce
// garde-fou, chaque passage rendrait le stock une fois de plus.
export async function marquerLibere(ref) {
  const col = (await client()).db(NOM_BASE).collection('liberations');
  const r = await col.updateOne(
    { _id: ref },
    { $setOnInsert: { le: new Date().toISOString() } },
    { upsert: true }
  );
  return r.upsertedCount === 1;
}
