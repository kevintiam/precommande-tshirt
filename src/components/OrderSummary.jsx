'use client';

import { X } from 'lucide-react';
import { lineId } from '@/libs/cart';
import { formatPrice } from '@/libs/currency';

export default function OrderSummary({ cart, total, onRemove, onCheckout }) {
  const empty = cart.length === 0;

  return (
    <section
      id="commande"
      className="scroll-mt-6 rounded-xl border border-stone-200 p-5"
    >
      <h2 className="font-display text-xl uppercase text-stone-900">
        Votre commande
      </h2>

      {empty ? (
        <p className="mt-4 text-sm text-stone-400">
          Votre panier est vide. Ajoutez un t-shirt ci-dessus pour continuer.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-2.5">
            {cart.map(({ product, size, qty }) => (
              <li
                key={lineId(product.id, size)}
                className="flex items-center gap-3 text-sm"
              >
                <span className="min-w-0 flex-1 text-stone-700">
                  <span className="font-medium text-stone-900">{qty} ×</span>{' '}
                  {product.name}{' '}
                  <span className="text-stone-400">· {size}</span>
                </span>
                <span className="font-medium text-stone-900">
                  {formatPrice(product.price * qty)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(lineId(product.id, size))}
                  className="rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                  aria-label={`Retirer ${product.name} (taille ${size})`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-baseline justify-between border-t border-stone-200 pt-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Total
            </span>
            <span className="font-display text-2xl text-bordeaux-700">
              {formatPrice(total)}
            </span>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onCheckout}
        disabled={empty}
        className="mt-5 w-full cursor-pointer rounded-lg bg-bordeaux-700 py-3 font-display text-lg uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
      >
        Continuer
      </button>
    </section>
  );
}
