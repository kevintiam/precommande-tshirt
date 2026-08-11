import { ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Boutique from '@/components/Boutique';
import { products } from '@/data/products';
import { listerCommandes } from '@/libs/commandes';
import { calculerRestant } from '@/libs/stock';

// Afficher le stock impose de lire toutes les commandes. Sans ce cache,
// chaque visiteur déclencherait une lecture Google Sheets et le quota de
// 60/minute sauterait dès l'annonce de la boutique. Une minute de retard
// sur le compteur est sans conséquence : la validation à la commande,
// elle, lit toujours l'état réel.
export const revalidate = 60;

export default async function Home() {
  let restant = null;
  try {
    restant = calculerRestant(products, await listerCommandes());
  } catch (err) {
    // Stock incalculable : on montre la boutique sans compteur plutôt que
    // d'afficher une page d'erreur. Le serveur refusera de toute façon
    // une commande qui dépasse le stock.
    console.error('[stock] calcul impossible :', err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-stone-800">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <Hero />

        <Boutique products={products} restant={restant} />

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
