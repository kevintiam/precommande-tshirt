import { ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Boutique from '@/components/Boutique';
import { products } from '@/data/products';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-stone-800">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <Hero />

        <Boutique products={products} />

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
          <ShieldCheck className="h-3.5 w-3.5 flex-none" />
          Paiement par virement Interac uniquement.
        </p>
      </main>

      <footer className="border-t border-stone-200 px-5 py-6">
        <p className="mx-auto max-w-2xl text-center text-xs text-stone-400">
          © 2026 Camp Impact ADN
        </p>
      </footer>
    </div>
  );
}
