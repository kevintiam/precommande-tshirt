// Aides sur la forme d'un produit. Aucune dépendance : ce module est
// importé par des composants clients, il ne doit rien entraîner du
// pilote MongoDB dans le bundle du navigateur.

// Ordre d'essayage, du plus petit au plus grand. MongoDB restitue les
// clés de `stock` dans l'ordre où elles ont été écrites dans le document,
// donc une taille ajoutée après coup arrive en fin de liste — « XXXL »
// après « S » n'a aucun sens sur une étiquette. On rétablit l'ordre ici,
// une fois, pour la boutique comme pour l'admin.
export const ORDRE_TAILLES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'];

// Une taille hors barème (« Unique » du tote bag) passe en fin : le tri
// est stable, elles gardent donc leur ordre d'origine entre elles.
export const rangTaille = (taille) => {
  const rang = ORDRE_TAILLES.indexOf(taille);
  return rang === -1 ? ORDRE_TAILLES.length : rang;
};

// Les tailles proposées sont les clés de `stock` : une seule source de
// vérité, impossible d'ouvrir une taille sans lui donner de quantité.
export const taillesDe = (produit) =>
  Object.keys(produit?.stock ?? {}).sort((a, b) => rangTaille(a) - rangTaille(b));

// null = stock inconnu (MongoDB non configuré) : l'interface n'affiche
// alors aucun compteur et ne bloque rien.
export const restantPour = (produit, taille) =>
  produit?.restant ? (produit.restant[taille] ?? 0) : null;

// Épuisé = plus une seule taille disponible. Un stock inconnu ne compte
// jamais comme épuisé : sans MongoDB, on n'affirme rien.
export const estEpuise = (produit) =>
  Boolean(produit?.restant) &&
  taillesDe(produit).every((t) => restantPour(produit, t) <= 0);
