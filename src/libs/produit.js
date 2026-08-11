// Aides sur la forme d'un produit. Aucune dépendance : ce module est
// importé par des composants clients, il ne doit rien entraîner du
// pilote MongoDB dans le bundle du navigateur.

// Les tailles proposées sont les clés de `stock` : une seule source de
// vérité, impossible d'ouvrir une taille sans lui donner de quantité.
export const taillesDe = (produit) => Object.keys(produit?.stock ?? {});

// null = stock inconnu (MongoDB non configuré) : l'interface n'affiche
// alors aucun compteur et ne bloque rien.
export const restantPour = (produit, taille) =>
  produit?.restant ? (produit.restant[taille] ?? 0) : null;
