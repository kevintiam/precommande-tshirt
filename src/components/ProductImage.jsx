'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import ProductModal from '@/components/ProductModal';

// Vignette cliquable + visionneuse. Isolée dans son propre composant pour
// que l'état d'ouverture reste au plus près de son bouton : ProductCard
// n'a pas à savoir qu'une visionneuse existe.
export default function ProductImage({ product }) {
  const [ouverte, setOuverte] = useState(false);
  const images = product.images?.length ? product.images : [product.image];

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        aria-label={`Agrandir — ${product.name}`}
        className="group relative h-27.5 w-22 flex-none cursor-zoom-in overflow-hidden rounded-lg bg-stone-100"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="88px"
          className={`object-cover ${
            product.imagePosition === 'left' ? 'object-left' : ''
          }`}
        />

        {/* Indice visuel : sans lui, rien ne dit que l'image est cliquable. */}
        <span className="absolute inset-0 flex items-center justify-center bg-stone-950/0 transition-colors group-hover:bg-stone-950/30">
          <Expand className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </span>

        {images.length > 1 && (
          <span className="absolute bottom-1 right-1 rounded bg-stone-950/70 px-1.5 text-[10px] font-medium tabular-nums text-white">
            {images.length}
          </span>
        )}
      </button>

      {ouverte && (
        <ProductModal
          product={product}
          images={images}
          onClose={() => setOuverte(false)}
        />
      )}
    </>
  );
}
