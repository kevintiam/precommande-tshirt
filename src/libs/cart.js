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

export const addLine = (cart, product, size) =>
  findLine(cart, product.id, size)
    ? incLine(cart, lineId(product.id, size))
    : [...cart, { product, size, qty: 1 }];

export const incLine = (cart, id) =>
  cart.map((i) =>
    lineId(i.product.id, i.size) === id ? { ...i, qty: i.qty + 1 } : i
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
