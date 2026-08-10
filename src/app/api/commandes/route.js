import { products } from '@/data/products';
import {
  creerCommande,
  attacherPaiement,
  lireParJeton,
  STATUTS,
} from '@/libs/commandes';
import { configuree, demanderPaiement } from '@/libs/vopay';

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
        return Response.json({
          mode: dejaVue.mode ?? 'manuel',
          ...resume(dejaVue),
        });
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
    if (!produit.sizes.includes(l.size))
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

  // Sans identifiants VoPay, on retombe sur le virement manuel plutôt
  // que d'échouer : la commande est enregistrée, le client reçoit les
  // instructions à recopier. Le mode est renvoyé explicitement pour que
  // l'interface ne promette jamais ce qui n'a pas eu lieu.
  if (!configuree) {
    console.warn(
      '[VoPay] identifiants absents — commande %s en virement manuel',
      commande.ref
    );
    return Response.json({ mode: 'manuel', ...resume(commande) });
  }

  try {
    const paiement = await demanderPaiement({
      ref: commande.ref,
      montant: commande.total,
      email: commande.email,
      nom: `${commande.firstName} ${commande.lastName}`,
      message: `Camp Impact ADN — commande ${commande.ref}`,
    });

    await attacherPaiement(commande.ref, paiement.transactionId);

    return Response.json({
      mode: 'passerelle',
      url: paiement.url,
      ...resume(commande),
    });
  } catch (err) {
    // La commande reste enregistrée : elle est récupérable côté admin,
    // et le client repart avec les instructions manuelles.
    console.error('[VoPay] demande de paiement refusée :', err);
    return Response.json({ mode: 'manuel', ...resume(commande) });
  }
}

const resume = (commande) => ({
  ref: commande.ref,
  total: commande.total,
  email: commande.email,
});
