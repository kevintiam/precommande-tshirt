'use client';

import { useState, useSyncExternalStore } from 'react';
import { Clock } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import Checkout from '@/components/Checkout';
import { addLine, incLine, decLine, removeLine, cartTotal } from '@/libs/cart';
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  ecrireCommande,
  effacerCommande,
} from '@/libs/pendingOrder';

export default function Boutique({ products }) {
  const [cart, setCart] = useState([]);

  const [vue, setVue] = useState(null);

  const order = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const total = cartTotal(cart);

  const onAdd = (product, size) => setCart((c) => addLine(c, product, size));
  const onInc = (id) => setCart((c) => incLine(c, id));
  const onDec = (id) => setCart((c) => decLine(c, id));
  const onRemove = (id) => setCart((c) => removeLine(c, id));

  const onConfirmed = (commande) => {
    ecrireCommande(commande);
    setCart([]);
    setVue('confirmation');
  };

  const onTerminer = () => {
    effacerCommande();
    setVue(null);
  };

  return (
    <>
      {order && vue === null && (
        <button
          type="button"
          onClick={() => setVue('confirmation')}
          className="mt-6 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100"
        >
          <Clock className="h-4 w-4 flex-none text-amber-700" />
          <span className="min-w-0 flex-1 text-sm text-amber-900">
            Commande <span className="font-semibold">{order.ref}</span> en
            attente de virement
          </span>
          <span className="flex-none text-sm font-medium text-amber-900 underline underline-offset-2">
            Voir
          </span>
        </button>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Articles
        </h2>
        <div className="mt-2">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              cart={cart}
              onAdd={onAdd}
              onInc={onInc}
              onDec={onDec}
            />
          ))}
        </div>
      </section>

      <div className="mt-8">
        <OrderSummary
          cart={cart}
          total={total}
          onRemove={onRemove}
          onCheckout={() => setVue('form')}
        />
      </div>

      <Checkout
        cart={cart}
        total={total}
        vue={vue}
        order={order}
        onClose={() => setVue(null)}
        onConfirmed={onConfirmed}
        onTerminer={onTerminer}
      />
    </>
  );
}
