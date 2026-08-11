import { ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Boutique from '@/components/Boutique';
import { products as amorce } from '@/data/products';
import { lireCatalogue, restituer, marquerLibere } from '@/libs/catalogue';
import { listerCommandes, STATUTS } from '@/libs/commandes';

// Le catalogue et le stock viennent de MongoDB, les commandes de Google
// Sheets : deux appels réseau par rendu. Sans ce cache, chaque visiteur
// les déclencherait et le quota Sheets de 60/minute sauterait dès
// l'annonce de la boutique.
export const revalidate = 60;

// Le trésorier passe une commande à « echouee » dans la feuille quand un
// virement n'arrive jamais. C'est ici qu'on remet les articles en vente,
// puisque rien ne relie la feuille à Mongo. `marquerLibere` retient les
// références déjà traitées : sans lui, chaque passage rendrait le stock
// une fois de plus.
async function libererCommandesAbandonnees() {
  const commandes = await listerCommandes();
  let liberees = 0;

  for (const c of commandes) {
    if (c.statut !== STATUTS.ECHOUEE) continue;
    if (!(await marquerLibere(c.ref))) continue; // déjà rendu
    await restituer(c.lignes ?? []);
    liberees += 1;
  }

  if (liberees) console.log('[stock] %d commande(s) remise(s) en vente', liberees);
}

export default async function Home() {
  let produits = amorce;

  try {
    await libererCommandesAbandonnees();
    produits = await lireCatalogue();
  } catch (err) {
    // Catalogue injoignable : on sert la version du fichier, sans
    // compteur de stock. La commande, elle, sera refusée côté serveur
    // faute de pouvoir réserver — refuser vaut mieux que survendre.
    console.error('[catalogue] lecture impossible :', err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-stone-800">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <Hero />

        <Boutique products={produits} />

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
