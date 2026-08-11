import { STATUTS } from '@/libs/stockage/contrat';
import { lineId } from '@/libs/cart';

// Les tailles proposées sont les clés de `stock` : une seule source de
// vérité, impossible d'ouvrir une taille sans lui donner de quantité.
export const taillesDe = (product) => Object.keys(product.stock ?? {});

// Une commande réservée immobilise l'article, même impayée : sinon deux
// clients pourraient réserver le dernier exemplaire. Seul un passage à
// « echouee » le remet en vente — c'est le geste qui libère le stock.
const RESERVENT = [STATUTS.EN_ATTENTE, STATUTS.A_VERIFIER, STATUTS.PAYEE];

// Renvoie { 'produit::taille': quantité restante } pour tout le catalogue.
export function calculerRestant(products, commandes) {
  const restant = {};
  for (const p of products) {
    for (const [taille, quantite] of Object.entries(p.stock ?? {})) {
      restant[lineId(p.id, taille)] = quantite;
    }
  }

  for (const commande of commandes) {
    if (!RESERVENT.includes(commande.statut)) continue;
    for (const l of commande.lignes ?? []) {
      const cle = lineId(l.productId, l.size);
      // Une ligne dont l'article ou la taille a disparu du catalogue est
      // ignorée : elle ne doit pas créer une entrée fantôme.
      if (cle in restant) restant[cle] -= l.qty;
    }
  }

  return restant;
}

export const restantPour = (restant, productId, taille) =>
  restant?.[lineId(productId, taille)] ?? 0;
