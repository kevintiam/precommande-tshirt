import ProductImage from '@/components/ProductImage';
import ProductActions from '@/components/ProductActions';
import { formatPrice } from '@/libs/currency';
import { estEpuise } from '@/libs/produit';

export default function ProductCard({ product, cart, onAdd, onInc, onDec }) {
  // Plus aucune taille disponible : on l'annonce dès le titre. Sans ça, le
  // client parcourt la fiche entière avant de le découvrir sur le bouton.
  const epuise = estEpuise(product);

  return (
    <article className="flex gap-4 border-b border-stone-200 py-6 last:border-b-0">
      {/* `flex-none` passe sur l'enveloppe : c'est elle, désormais, qui est
          l'enfant du flex — sans ça la vignette se comprimerait. */}
      <div className={`flex-none ${epuise ? 'opacity-50 grayscale' : ''}`}>
        <ProductImage product={product} />
      </div>

      <div className="min-w-0 flex-1">
        {/* Nom et prix sur la même ligne : l'œil balaie une seule colonne
            de prix au lieu de les chercher au fil du texte. */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-stone-900">
            {product.name}
            {epuise && (
              <span className="ml-2 whitespace-nowrap rounded-full bg-stone-100 px-2 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Épuisé
              </span>
            )}
          </h3>
          <span className="flex-none font-display text-lg text-bordeaux-700">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          {product.description}
        </p>

        <ProductActions
          product={product}
          cart={cart}
          onAdd={onAdd}
          onInc={onInc}
          onDec={onDec}
        />
      </div>
    </article>
  );
}
