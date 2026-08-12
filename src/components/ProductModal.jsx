'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/libs/currency';

// Seuil de glissement, en pixels. En dessous, c'est une hésitation du
// doigt, pas une intention de changer d'image.
const SEUIL_GLISSEMENT = 50;

// Modale produit : même panneau blanc, mêmes bordures et même en-tête que
// le tunnel de paiement. L'image reste dans le site plutôt que de basculer
// dans une visionneuse plein écran, qui donne un air de galerie photo.
export default function ProductModal({ product, images, onClose }) {
  const [index, setIndex] = useState(0);
  const debutX = useRef(null);
  const fermeture = useRef(null);

  const plusieurs = images.length > 1;

  useEffect(() => {
    const auClavier = (e) => {
      if (e.key === 'Escape') onClose();
      if (!plusieurs) return;
      if (e.key === 'ArrowLeft')
        setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
    };

    window.addEventListener('keydown', auClavier);
    // Bloque le défilement de la page derrière la modale : sans ça, le
    // glissement fait défiler la boutique sous l'image.
    const debordement = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fermeture.current?.focus();

    return () => {
      window.removeEventListener('keydown', auClavier);
      document.body.style.overflow = debordement;
    };
  }, [images.length, plusieurs, onClose]);

  const aller = (pas) => setIndex((i) => (i + pas + images.length) % images.length);

  const finGlissement = (e) => {
    if (debutX.current === null || !plusieurs) return;
    const parcouru = e.changedTouches[0].clientX - debutX.current;
    if (Math.abs(parcouru) > SEUIL_GLISSEMENT) aller(parcouru < 0 ? 1 : -1);
    debutX.current = null;
  };

  const fleche =
    'absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-stone-300 bg-white/90 p-2 text-stone-700 shadow-sm transition-colors hover:border-bordeaux-300 hover:bg-white hover:text-bordeaux-700';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-70 overflow-y-auto bg-stone-950/50 px-4 py-8 backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-snug text-stone-900">
              {product.name}
            </h2>
            <p className="mt-0.5 font-display text-lg text-bordeaux-700">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            ref={fermeture}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-1 flex-none cursor-pointer rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          className="relative aspect-4/5 bg-stone-50"
          onTouchStart={(e) => (debutX.current = e.touches[0].clientX)}
          onTouchEnd={finGlissement}
        >
          {/* object-contain : rien n'est rogné, ce qui compte pour les
              visuels recto-verso où devant et dos sont côte à côte. */}
          <Image
            key={images[index]}
            src={images[index]}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 512px, 100vw"
            className="object-contain"
            priority
          />

          {plusieurs && (
            <>
              <button
                type="button"
                onClick={() => aller(-1)}
                aria-label="Image précédente"
                className={`${fleche} left-3`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => aller(1)}
                aria-label="Image suivante"
                className={`${fleche} right-3`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {plusieurs && (
          <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-5 py-3">
            <div className="flex gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === index}
                  className={`relative h-12 w-10 cursor-pointer overflow-hidden rounded-md border transition-colors ${
                    i === index
                      ? 'border-bordeaux-700'
                      : 'border-stone-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                </button>
              ))}
            </div>
            <span className="text-xs tabular-nums text-stone-400">
              {index + 1} / {images.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
