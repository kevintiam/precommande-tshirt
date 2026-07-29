'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-500 hover:text-stone-950 active:scale-95"
    >
      <ShoppingBag className="h-4 w-4" />
      Ajouter
    </button>
  );
}
