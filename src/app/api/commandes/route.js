import { products } from '@/data/products';
import {
  creerCommande,
  lireParJeton,
  listerCommandes,
  STATUTS,
} from '@/libs/commandes';
import { taillesDe, calculerRestant, restantPour } from '@/libs/stock';

// Le navigateur peut envoyer n'importe quoi : la validation de
// src/libs/validation.js tourne côté client et se contourne trivialement.
// Tout est donc revalidé ici, et le prix est relu depuis le catalogue.
const MAX_QTY = 20;
const MAX_LIGNES = 20;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Alphabet sans O/0/I/1/L : la référence est recopiée à la main dans le
// message du virement Interac, une ambiguïté visuelle coûte un
// rapprochement raté.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const genererReference = () =>
  'CR-' +
  Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (b) => ALPHABET[b % ALPHABET.length]
  ).join('');

const erreur = (message, status = 400) => Response.json({ message }, { status });

const indisponible =
  'Les commandes ne peuvent pas être enregistrées pour le moment. ' +
  'Réessaie dans quelques minutes ou écris-nous.';

export async function POST(request) {
  let corps;
  try {
    corps = await request.json();
  } catch {
    return erreur('Requête illisible.');
  }

  const { email, firstName, lastName, lignes, clientToken } = corps ?? {};

  // Avant toute création : cet essai reprend-il une commande déjà passée ?
  // La lecture touche le stockage, donc elle peut échouer comme
  // l'écriture — sans ce garde, un stockage cassé renvoyait un 500 nu.
  if (typeof clientToken === 'string' && clientToken) {
    try {
      const dejaVue = await lireParJeton(clientToken);
      if (dejaVue) {
        console.warn('[commandes] rejeu du jeton %s → %s', clientToken, dejaVue.ref);
        return Response.json(resume(dejaVue));
      }
    } catch (err) {
      console.error('[commandes] stockage illisible :', err);
      return erreur(indisponible, 503);
    }
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email))
    return erreur('E-mail invalide.');
  if (typeof firstName !== 'string' || !firstName.trim())
    return erreur('Prénom requis.');
  if (typeof lastName !== 'string' || !lastName.trim())
    return erreur('Nom requis.');
  if (!Array.isArray(lignes) || lignes.length === 0)
    return erreur('Votre panier est vide.');
  if (lignes.length > MAX_LIGNES)
    return erreur('Trop d’articles distincts dans cette commande.');

  const detail = [];
  const vues = new Set();

  for (const l of lignes) {
    const produit = products.find((p) => p.id === l?.productId);
    if (!produit) return erreur('Cette commande contient un article inconnu.');
    if (!taillesDe(produit).includes(l.size))
      return erreur(`Taille indisponible pour « ${produit.name} ».`);
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY)
      return erreur(`Quantité invalide pour « ${produit.name} ».`);

    const cle = `${produit.id}::${l.size}`;
    if (vues.has(cle))
      return erreur(`« ${produit.name} » apparaît deux fois en taille ${l.size}.`);
    vues.add(cle);

    detail.push({
      productId: produit.id,
      nom: produit.name,
      size: l.size,
      qty: l.qty,
      prixUnitaire: produit.price,
    });
  }

  const total = detail.reduce((s, l) => s + l.prixUnitaire * l.qty, 0);

  // Contrôle du stock sur l'état réel, sans cache : la page d'accueil
  // affiche un compteur vieux d'au plus une minute, ce qui suffit à
  // informer mais pas à décider.
  try {
    const restant = calculerRestant(products, await listerCommandes());
    for (const l of detail) {
      const dispo = restantPour(restant, l.productId, l.size);
      if (l.qty > dispo) {
        return erreur(
          dispo <= 0
            ? `« ${l.nom} » est épuisé en taille ${l.size}.`
            : `Il ne reste que ${dispo} « ${l.nom} » en taille ${l.size}.`,
          409
        );
      }
    }
  } catch (err) {
    // Stock incalculable : refuser vaut mieux que survendre.
    console.error('[commandes] stock illisible :', err);
    return erreur(indisponible, 503);
  }

  let commande;
  try {
    commande = await creerCommande({
      ref: genererReference(),
      clientToken: clientToken ?? null,
      date: new Date().toISOString(),
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      lignes: detail,
      total,
      statut: STATUTS.EN_ATTENTE,
    });
  } catch (err) {
    // Sans enregistrement, accepter la commande reviendrait à encaisser
    // un virement dont on ne saurait rien. On refuse franchement.
    console.error('[commandes] enregistrement impossible :', err);
    return erreur(indisponible, 503);
  }

  // Le paiement se fait hors du site : le client repart avec l'adresse
  // Interac, le montant et sa référence, puis envoie son virement depuis
  // sa banque. Le statut est ensuite passé à « payee » dans la feuille.
  return Response.json(resume(commande));
}

const resume = (commande) => ({
  ref: commande.ref,
  total: commande.total,
  email: commande.email,
});
