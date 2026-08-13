// Logique du panier, sans React : chaque fonction reçoit le panier courant
// et en renvoie un nouveau. Aucune mutation, pour que React détecte le
// changement par comparaison de référence.

// Identifiant unique d'une ligne : une même référence déclinée en
// plusieurs tailles compte comme plusieurs lignes.
export const lineId = (productId, size) => `${productId}::${size}`;

export const cartTotal = (cart) =>
  cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

export const findLine = (cart, productId, size) =>
  cart.find((i) => i.product.id === productId && i.size === size);

// Plafond de stock. `max` est la quantité encore disponible pour cette
// taille, ou null quand le stock est inconnu (MongoDB non configuré) —
// on ne bloque alors rien, le serveur reste seul juge.
//
// Ce test vit ici, et pas seulement dans le `disabled` d'un bouton :
// l'attribut décrit l'état de l'écran, il n'empêche pas la quantité de
// monter. Tant que la règle n'est écrite qu'une fois, à l'endroit qui
// fabrique le panier, aucun chemin d'ajout ne peut la contourner.
const admis = (qty, max) => max == null || qty <= max;

export const addLine = (cart, product, size, max = null) =>
  findLine(cart, product.id, size)
    ? incLine(cart, lineId(product.id, size), max)
    : admis(1, max)
      ? [...cart, { product, size, qty: 1 }]
      : cart;

export const incLine = (cart, id, max = null) =>
  cart.map((i) =>
    lineId(i.product.id, i.size) === id && admis(i.qty + 1, max)
      ? { ...i, qty: i.qty + 1 }
      : i
  );

// Passer sous 1 retire la ligne du panier.
export const decLine = (cart, id) =>
  cart
    .map((i) =>
      lineId(i.product.id, i.size) === id ? { ...i, qty: i.qty - 1 } : i
    )
    .filter((i) => i.qty > 0);

export const removeLine = (cart, id) =>
  cart.filter((i) => lineId(i.product.id, i.size) !== id);
