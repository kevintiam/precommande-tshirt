'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { findLine } from '@/libs/cart';
import { taillesDe, restantPour } from '@/libs/produit';

export default function ProductActions({ product, cart, onAdd, onInc, onDec }) {
  const tailles = taillesDe(product);

  // `product.restant` est absent quand MongoDB n'est pas configuré. On ne
  // bloque alors rien à l'affichage — le serveur reste seul juge au
  // moment de la commande.
  const stockConnu = Boolean(product.restant);
  const dispo = (t) => restantPour(product, t);

  // On présélectionne la première taille encore disponible plutôt que la
  // première tout court : proposer d'emblée une taille épuisée oblige le
  // client à comprendre pourquoi le bouton est grisé.
  const [size, setSize] = useState(
    () => tailles.find((t) => !stockConnu || dispo(t) > 0) ?? tailles[0]
  );

  const line = findLine(cart, product.id, size);

  const restantTaille = dispo(size);
  const epuise = stockConnu && restantTaille <= 0;
  const auPlafond = stockConnu && line && line.qty >= restantTaille;

  const choixTaille = tailles.length > 1;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {choixTaille && (
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={`Taille — ${product.name}`}
          >
            {tailles.map((t) => {
              const active = t === size;
              const sansStock = stockConnu && dispo(t) <= 0;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSize(t)}
                  aria-pressed={active}
                  disabled={sansStock}
                  title={sansStock ? 'Épuisé' : undefined}
                  className={`min-w-8 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    sansStock
                      ? 'cursor-not-allowed border-stone-100 text-stone-300 line-through'
                      : active
                        ? 'cursor-pointer border-bordeaux-700 bg-bordeaux-700 text-white'
                        : 'cursor-pointer border-stone-200 text-stone-600 hover:border-bordeaux-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {line ? (
          <div
            className={`flex items-center gap-2 ${choixTaille ? '' : 'ml-auto'}`}
          >
            <button
              type="button"
              onClick={() => onDec(product.id, size)}
              className="cursor-pointer rounded-full border border-stone-300 p-1.5 text-stone-600 transition-colors hover:border-bordeaux-300 hover:bg-bordeaux-50 hover:text-bordeaux-700"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-semibold text-stone-900">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => onInc(product.id, size)}
              disabled={auPlafond}
              title={auPlafond ? 'Stock atteint' : undefined}
              className="cursor-pointer rounded-full border border-stone-300 p-1.5 text-stone-600 transition-colors hover:border-bordeaux-300 hover:bg-bordeaux-50 hover:text-bordeaux-700 disabled:cursor-not-allowed disabled:border-stone-100 disabled:text-stone-300 disabled:hover:bg-transparent"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(product, size)}
            disabled={epuise}
            className={`rounded-lg border px-5 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
              choixTaille ? '' : 'ml-auto'
            } ${
              epuise
                ? 'cursor-not-allowed border-stone-200 text-stone-300'
                : 'cursor-pointer border-bordeaux-700 text-bordeaux-700 hover:bg-bordeaux-700 hover:text-white'
            }`}
          >
            {epuise ? 'Épuisé' : 'Ajouter'}
          </button>
        )}
      </div>

      {/* Le compteur n'apparaît qu'en fin de stock : afficher « 20 restants »
          sur tout le catalogue est du bruit, « 3 restants » fait agir. */}
      {stockConnu && !epuise && restantTaille <= 5 && (
        <p className="mt-2 text-xs font-medium text-bordeaux-700">
          Plus que {restantTaille} en taille {size}
        </p>
      )}
    </div>
  );
}
