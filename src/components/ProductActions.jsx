'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { lineId, findLine } from '@/libs/cart';

export default function ProductActions({ product, cart, onAdd, onInc, onDec }) {
  // Une taille est présélectionnée : ajouter reste un seul clic.
  const [size, setSize] = useState(product.sizes[0]);

  const line = findLine(cart, product.id, size);
  const id = lineId(product.id, size);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label={`Taille — ${product.name}`}
      >
        {product.sizes.map((s) => {
          const active = s === size;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={active}
              className={`min-w-8 cursor-pointer rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {line ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDec(id)}
            className="cursor-pointer rounded-full border border-stone-300 p-1.5 text-stone-600 transition-colors hover:bg-stone-100"
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-5 text-center text-sm font-semibold text-stone-900">
            {line.qty}
          </span>
          <button
            type="button"
            onClick={() => onInc(id)}
            className="cursor-pointer rounded-full border border-stone-300 p-1.5 text-stone-600 transition-colors hover:bg-stone-100"
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onAdd(product, size)}
          className="cursor-pointer rounded-lg border border-stone-900 px-5 py-1.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
        >
          Ajouter
        </button>
      )}
    </div>
  );
}
