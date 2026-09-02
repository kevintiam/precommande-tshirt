import { taillesDe, restantPour } from '@/libs/produit';
import { MOYENS } from '@/libs/stockage/contrat';


export const MAX_QTY = 20;
export const MAX_LIGNES = 20;

export const ALPHABET_REFERENCE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const normaliserReference = (saisie) => {
  const nettoye = String(saisie ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (!nettoye.startsWith('CR')) {
    return null;
  }

  const noyau = nettoye.slice(2);

  if (noyau.length !== 6) {
    return null;
  }
  return `CR-${noyau}`;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const isValidEmail = (email) =>
  typeof email === 'string' && EMAIL_RE.test(email);

export const isValidName = (nom) =>
  typeof nom === 'string' && nom.trim().length > 0;

export const validate = (form) => {
  const e = {};
  if (!isValidEmail(form.email)) e.email = 'E-mail invalide';
  if (!isValidName(form.firstName)) e.firstName = 'Requis';
  if (!isValidName(form.lastName)) e.lastName = 'Requis';
  return e;
};

// Fabrique le gestionnaire onChange lié à l'état du composant.
// À instancier dans le composant : const set = createSet(setForm);
export const createSet = (setForm) => (key) => (e) => {
  const { value } = e.target;
  setForm((f) => ({ ...f, [key]: value }));
};


export const moyenValide = (moyen) =>
  Object.values(MOYENS).includes(moyen);

export const validateLignes = (lignes, catalogue) => {
  if (!Array.isArray(lignes) || lignes.length === 0) return 'Votre panier est vide.';
  if (lignes.length > MAX_LIGNES)
    return 'Trop d’articles distincts dans cette commande.';

  const vues = new Set();

  for (const l of lignes) {
    const produit = catalogue.find((p) => p.id === l?.productId);
    if (!produit) return 'Cette commande contient un article inconnu.';

    if (!taillesDe(produit).includes(l.size))
      return `Taille indisponible pour « ${produit.name} ».`;

    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY)
      return `Quantité invalide pour « ${produit.name} ».`;

    // Disponibilité au moment de la commande. Ce contrôle ne RÉSERVE
    // rien — le stock n'est retenu qu'à la déclaration de paiement — il
    // évite seulement d'annoncer un virement à quelqu'un qui n'aura
    // manifestement pas son article. `null` = stock inconnu, on ne juge pas.
    const restant = restantPour(produit, l.size);
    if (restant !== null && l.qty > restant) {
      return restant <= 0
        ? `« ${produit.name} » est épuisé en taille ${l.size}.`
        : `Il ne reste que ${restant} « ${produit.name} » en taille ${l.size}.`;
    }

    // Deux lignes identiques contourneraient MAX_QTY en additionnant
    // leurs quantités sur une même taille.
    const cle = `${produit.id}::${l.size}`;
    if (vues.has(cle))
      return `« ${produit.name} » apparaît deux fois en taille ${l.size}.`;
    vues.add(cle);
  }

  return null;
};
