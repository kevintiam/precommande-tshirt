import Image from 'next/image';
import ProductActions from '@/components/ProductActions';

export default function ProductCard({ product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-4/5 overflow-hidden bg-stone-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg text-stone-900">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c}
              className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
