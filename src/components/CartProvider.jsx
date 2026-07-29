'use client';

import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

// Identifiant unique d'une ligne de panier : une même référence
// déclinée en plusieurs tailles compte comme plusieurs lignes.
export const lineId = (productId, size) => `${productId}::${size}`;

// Livraison offerte à partir de ce montant, sinon frais forfaitaires.
export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_FEE = 4.9;

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const addToCart = (product, size) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.size === size
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { product, size, qty: 1 }];
    });
    setOpen(true);
  };

  const inc = (id) =>
    setCart((p) =>
      p.map((i) =>
        lineId(i.product.id, i.size) === id ? { ...i, qty: i.qty + 1 } : i
      )
    );

  const dec = (id) =>
    setCart((p) =>
      p
        .map((i) =>
          lineId(i.product.id, i.size) === id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0)
    );

  const remove = (id) =>
    setCart((p) => p.filter((i) => lineId(i.product.id, i.size) !== id));

  const clearCart = () => setCart([]);

  const openCart = () => setOpen(true);
  const closeCart = () => setOpen(false);

  // Ouvre le tunnel de paiement en refermant le tiroir panier.
  const openCheckout = () => {
    setOpen(false);
    setCheckoutOpen(true);
  };
  const closeCheckout = () => setCheckoutOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        shipping,
        total,
        addToCart,
        inc,
        dec,
        remove,
        clearCart,
        open,
        openCart,
        closeCart,
        checkoutOpen,
        openCheckout,
        closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>');
  }
  return ctx;
}
