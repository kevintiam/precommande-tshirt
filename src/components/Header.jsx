'use client';

import { useState } from 'react';
import { ShoppingBag, Menu, X, Heart } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export default function Header() {
  const { cartCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '#collection', label: 'Collection' },
    { href: '#apropos', label: 'À propos' },
    { href: '#evenement', label: 'L’événement' },
  ];

  return (
    <header className="fixed top-0 z-30 w-full border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-amber-300">
            <Heart className="h-5 w-5" />
          </span>
          <span className="font-serif text-lg font-semibold text-stone-900">
            Camp de Réveille
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            className="relative rounded-full p-2.5 text-stone-700 transition-colors hover:bg-stone-200/60"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-stone-950">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2.5 text-stone-700 transition-colors hover:bg-stone-200/60 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-stone-200 bg-stone-50 px-6 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
