import Image from 'next/image';
import ProductActions from '@/components/ProductActions';
import { formatPrice } from '@/libs/currency';

export default function ProductCard({ product, cart, onAdd, onInc, onDec }) {
  return (
    <article className="flex gap-4 border-b border-stone-200 py-5 last:border-b-0">
      <Image
        src={product.image}
        alt={product.name}
        width={72}
        height={90}
        className="h-[90px] w-[72px] flex-none rounded-lg bg-stone-100 object-cover"
      />

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-stone-900">{product.name}</h3>
        <p className="mt-0.5 font-semibold text-stone-900">
          {formatPrice(product.price)}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
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
