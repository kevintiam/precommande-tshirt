import { ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Boutique from '@/components/Boutique';
import { products as amorce } from '@/data/products';
import {
  lireCatalogue,
  reserver,
  restituer,
  marquerPreleve,
  oublierPreleve,
  estPreleve,
  StockInsuffisant,
} from '@/libs/catalogue';
import { listerCommandes, STATUTS } from '@/libs/commandes';

// Le catalogue et le stock viennent de MongoDB, les commandes de Google
// Sheets : deux appels réseau par rendu. Sans ce cache, chaque visiteur
// les déclencherait et le quota Sheets de 60/minute sauterait dès
// l'annonce de la boutique.
export const revalidate = 60;

// Rapprochement du stock avec la feuille du trésorier. Rien ne relie
// Google Sheets à MongoDB : c'est ici, à la revalidation, que les
// décisions prises à la main dans la feuille atteignent le stock.
//
// Le stock ne part qu'au paiement. Deux mouvements en découlent :
//
//   payée / à vérifier, pas encore prélevée  → on prélève. Ce cas n'est
//     pas rare : l'envoi de la capture est facultatif, un client peut
//     virer l'argent sans rien téléverser et le trésorier passer la
//     ligne à « payée » lui-même. Sans ce rattrapage, ces commandes ne
//     décrémenteraient jamais rien.
//   échouée, déjà prélevée                   → on remet en vente.
//
// Le registre `prelevements` rend l'ensemble rejouable : une commande
// déjà traitée ne l'est pas deux fois, dans un sens comme dans l'autre.
async function rapprocherStock() {
  const commandes = await listerCommandes();
  let preleves = 0;
  let rendus = 0;

  for (const c of commandes) {
    const lignes = c.lignes ?? [];

    if (c.statut === STATUTS.PAYEE || c.statut === STATUTS.A_VERIFIER) {
      if (!(await marquerPreleve(c.ref))) continue; // déjà pris
      try {
        await reserver(lignes);
        preleves += 1;
      } catch (err) {
        await oublierPreleve(c.ref).catch(() => {});
        // Stock insuffisant sur une commande déjà payée : c'est une
        // survente, elle se règle avec le client. On la signale sans
        // interrompre le rendu de la page pour tous les autres.
        if (err instanceof StockInsuffisant) {
          console.error(
            '[stock] SURVENTE sur %s : %s (%s) — %d disponible(s)',
            c.ref,
            err.ligne.nom,
            err.ligne.size,
            err.dispo
          );
        } else {
          throw err;
        }
      }
      continue;
    }

    if (c.statut === STATUTS.ECHOUEE && (await estPreleve(c.ref))) {
      await restituer(lignes);
      await oublierPreleve(c.ref);
      rendus += 1;
    }
  }

  if (preleves) console.log('[stock] %d commande(s) prélevée(s)', preleves);
  if (rendus) console.log('[stock] %d commande(s) remise(s) en vente', rendus);
}

export default async function Home() {
  let produits = amorce;

  try {
    await rapprocherStock();
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
