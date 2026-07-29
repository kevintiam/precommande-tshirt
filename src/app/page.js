import Image from 'next/image';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import { products } from '@/data/products';

export default function Home() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
        <Header />

        <Hero />

        {/* Collection */}
        <section id="collection" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl text-stone-900">Notre collection</h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-500">
              Chaque t-shirt est pensé pour porter le message du camp, avec des
              matières durables et un design soigné.
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* À propos */}
        <section id="apropos" className="scroll-mt-20 bg-white px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-4xl text-stone-900">
                Un camp, un message, un vêtement
              </h2>
              <p className="mt-5 leading-relaxed text-stone-600">
                Le Camp de Réveille est un rassemblement religieux annuel qui
                invite chacun à se réveiller spirituellement, à se ressourcer et
                à partager un moment de foi intense. Nos t-shirts sont bien plus
                qu&apos;un souvenir : ils prolongent l&apos;expérience au quotidien.
              </p>
              <ul className="mt-6 space-y-3 text-stone-600">
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Heart className="h-4 w-4" />
                  </span>
                  Coton biologique, impression éco-responsable
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Calendar className="h-4 w-4" />
                  </span>
                  Retrait sur place possible pendant le camp
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <MapPin className="h-4 w-4" />
                  </span>
                  Livraison partout en Europe
                </li>
              </ul>
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="https://images.pexels.com/photos/34623024/pexels-photo-34623024.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200"
                alt="Assemblée en louange"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Événement */}
        <section id="evenement" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="rounded-3xl bg-stone-900 px-8 py-14 text-center text-white sm:px-16">
            <h2 className="font-serif text-4xl text-amber-200">
              Rejoignez le Camp de Réveille 2026
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-300">
              Quatre jours de louange, d&apos;enseignement et de communion. Réservez vos
              t-shirts dès maintenant pour les porter sur place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
              <div>
                <p className="font-serif text-3xl text-amber-200">14–17 Août</p>
                <p className="mt-1 text-sm text-stone-400">2026</p>
              </div>
              <div className="hidden h-12 w-px bg-stone-700 sm:block" />
              <div>
                <p className="font-serif text-3xl text-amber-200">Lyon, France</p>
                <p className="mt-1 text-sm text-stone-400">Parc des Expositions</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-stone-200 bg-stone-100 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-amber-300">
                <Heart className="h-4 w-4" />
              </span>
              <span className="font-serif text-stone-900">Camp de Réveille</span>
            </div>
            <p className="text-sm text-stone-500">
              © 2026 Camp de Réveille. Conçu avec foi.
            </p>
          </div>
        </footer>

        <CartDrawer />
      </div>
    </CartProvider>
  );
}
