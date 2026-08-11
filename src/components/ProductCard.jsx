import Image from 'next/image';
import ProductActions from '@/components/ProductActions';
import { formatPrice } from '@/libs/currency';

export default function ProductCard({
  product,
  cart,
  restant,
  onAdd,
  onInc,
  onDec,
}) {
  return (
    <article className="flex gap-4 border-b border-stone-200 py-6 last:border-b-0">
      <Image
        src={product.image}
        alt={product.name}
        width={88}
        height={110}
        className={`h-27.5 w-22 flex-none rounded-lg bg-stone-100 object-cover ${
          product.imagePosition === 'left' ? 'object-left' : ''
        }`}
      />

      <div className="min-w-0 flex-1">
        {/* Nom et prix sur la même ligne : l'œil balaie une seule colonne
            de prix au lieu de les chercher au fil du texte. */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-stone-900">
            {product.name}
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
          restant={restant}
          onAdd={onAdd}
          onInc={onInc}
          onDec={onDec}
        />
      </div>
    </article>
  );
}
