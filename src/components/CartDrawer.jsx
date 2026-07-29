'use client';

import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart, lineId } from '@/components/CartProvider';

export default function CartDrawer() {
  const { cart: items, subtotal, open, closeCart, inc, dec, remove } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <h2 className="flex items-center gap-2 font-serif text-xl text-stone-900">
            <ShoppingBag className="h-5 w-5" />
            Votre panier
          </h2>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            aria-label="Fermer le panier"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-stone-400">
              <ShoppingBag className="mb-3 h-12 w-12" />
              <p>Votre panier est vide.</p>
              <p className="mt-1 text-sm">Ajoutez un t-shirt pour commencer.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, size, qty }) => {
                const id = lineId(product.id, size);
                return (
                  <li
                    key={id}
                    className="flex gap-4 rounded-xl border border-stone-100 p-3"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={80}
                      height={96}
                      className="h-24 w-20 flex-none rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-stone-900">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => remove(id)}
                          className="text-stone-400 transition-colors hover:text-red-500"
                          aria-label={`Retirer ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-sm text-stone-500">
                        Taille {size} · {product.price} €
                      </p>
                      <div className="mt-auto flex items-center gap-3 pt-2">
                        <button
                          onClick={() => dec(id)}
                          className="rounded-full border border-stone-200 p-1 text-stone-600 transition-colors hover:bg-stone-100"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {qty}
                        </span>
                        <button
                          onClick={() => inc(id)}
                          className="rounded-full border border-stone-200 p-1 text-stone-600 transition-colors hover:bg-stone-100"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-stone-200 px-6 py-5">
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>Sous-total</span>
              <span className="text-lg font-semibold text-stone-900">
                {subtotal} €
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              Frais de port calculés à l&apos;étape suivante.
            </p>
            <button
              onClick={() =>
                alert(
                  'Le paiement en ligne arrive bientôt ! Vous pourrez payer par carte bancaire, Apple Pay et plus.'
                )
              }
              className="mt-4 w-full rounded-full bg-stone-900 py-3.5 text-base font-semibold text-white transition-all hover:bg-amber-500 hover:text-stone-950"
            >
              Passer commande
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
