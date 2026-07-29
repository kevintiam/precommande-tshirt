'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export default function ProductActions({ product }) {
  const { addToCart } = useCart();
  const [size, setSize] = useState(null);

  return (
    <div>
      <div className="mb-3">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-400">
          Taille
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choisir une taille">
          {product.sizes.map((s) => {
            const active = s === size;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={active}
                className={`min-w-9 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-stone-900">
          {product.price} €
        </span>
        <button
          type="button"
          onClick={() => addToCart(product, size)}
          disabled={!size}
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-500 hover:text-stone-950 active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:hover:bg-stone-300"
        >
          <ShoppingBag className="h-4 w-4" />
          {size ? 'Ajouter' : 'Choisir une taille'}
        </button>
      </div>
    </div>
  );
}
