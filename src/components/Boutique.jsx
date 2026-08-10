'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import Checkout from '@/components/Checkout';
import {
  addLine,
  incLine,
  decLine,
  removeLine,
  cartTotal,
} from '@/libs/cart';


export default function Boutique({ products }) {
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const total = cartTotal(cart);

  const onAdd = (product, size) => setCart((c) => addLine(c, product, size));
  const onInc = (id) => setCart((c) => incLine(c, id));
  const onDec = (id) => setCart((c) => decLine(c, id));
  const onRemove = (id) => setCart((c) => removeLine(c, id));

  return (
    <>
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
          onCheckout={() => setCheckoutOpen(true)}
        />
      </div>

      <Checkout
        cart={cart}
        total={total}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onDone={() => setCart([])}
      />
    </>
  );
}
