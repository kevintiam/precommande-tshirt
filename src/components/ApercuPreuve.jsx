'use client';

import { useState } from 'react';
import { X, ImageIcon } from 'lucide-react';

// Aperçu de la capture de virement, sans quitter la page admin. Une
// balise <img> classique plutôt que next/image : le domaine Vercel Blob
// change d'une installation à l'autre, inutile de le déclarer dans
// next.config.mjs pour une poignée d'images vues par les organisateurs.
export default function ApercuPreuve({ url, refCommande }) {
  const [ouverte, setOuverte] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className="flex cursor-pointer items-center gap-1 text-xs font-medium text-bordeaux-700 underline underline-offset-2 hover:text-bordeaux-800"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        Voir la capture
      </button>

      {ouverte && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Capture de virement — ${refCommande}`}
          onClick={(e) => e.target === e.currentTarget && setOuverte(false)}
          className="fixed inset-0 z-70 flex items-center justify-center bg-stone-950/70 p-4"
        >
          <div className="relative max-h-full max-w-lg overflow-hidden rounded-xl bg-white p-2 shadow-xl">
            <button
              type="button"
              onClick={() => setOuverte(false)}
              aria-label="Fermer"
              className="absolute right-3 top-3 cursor-pointer rounded-full bg-white/90 p-1.5 text-stone-600 shadow-sm transition-colors hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Capture de virement — ${refCommande}`}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
