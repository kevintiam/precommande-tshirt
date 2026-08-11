import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Hourglass, XCircle } from 'lucide-react';
import { lireCommande, STATUTS } from '@/libs/commandes';
import { formatPrice } from '@/libs/currency';

export const dynamic = 'force-dynamic';

const AFFICHAGE = {
  [STATUTS.PAYEE]: {
    Icone: CheckCircle2,
    couleur: 'text-emerald-500',
    titre: 'Paiement reçu',
    texte: 'Merci ! Ta commande est confirmée. Retrait sur place pendant le camp.',
  },
  [STATUTS.EN_ATTENTE]: {
    Icone: Clock,
    couleur: 'text-amber-500',
    titre: 'En attente de paiement',
    texte:
      'Envoie ton virement Interac en indiquant la référence ci-dessous, puis joins ta capture depuis l’écran de commande.',
  },
  [STATUTS.A_VERIFIER]: {
    Icone: Hourglass,
    couleur: 'text-royal-600',
    titre: 'Paiement en vérification',
    texte:
      'Nous avons bien reçu ta capture. Ta commande sera confirmée dès que le virement aura été vérifié sur notre relevé.',
  },
  [STATUTS.ECHOUEE]: {
    Icone: XCircle,
    couleur: 'text-red-500',
    titre: 'Paiement non abouti',
    texte:
      'La demande a été refusée, annulée ou expirée. Tu peux repasser commande.',
  },
};

export default async function PageCommande({ params }) {
  const { ref } = await params;
  const commande = await lireCommande(ref);
  if (!commande) notFound();

  const { Icone, couleur, titre, texte } =
    AFFICHAGE[commande.statut] ?? AFFICHAGE[STATUTS.EN_ATTENTE];

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-16">
      <div className="flex flex-col items-center text-center">
        <Icone className={`h-12 w-12 ${couleur}`} />
        <h1 className="mt-4 font-display text-3xl uppercase text-stone-900">
          {titre}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{texte}</p>
      </div>

      <div className="mt-8 rounded-xl border border-stone-200 p-5 text-sm">
        <div className="flex justify-between text-stone-500">
          <span>Référence</span>
          <span className="font-semibold text-stone-900">{commande.ref}</span>
        </div>
        <ul className="mt-4 space-y-2 border-t border-stone-200 pt-4">
          {commande.lignes.map((l) => (
            <li key={`${l.productId}::${l.size}`} className="flex justify-between">
              <span className="text-stone-600">
                <span className="font-medium text-stone-900">{l.qty} ×</span>{' '}
                {l.nom} <span className="text-stone-400">· {l.size}</span>
              </span>
              <span className="text-stone-700">
                {formatPrice(l.prixUnitaire * l.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-base font-semibold text-stone-900">
          <span>Total</span>
          <span>{formatPrice(commande.total)}</span>
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 block rounded-lg bg-bordeaux-700 py-3 text-center font-display text-lg uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800"
      >
        Retour à la boutique
      </Link>
    </main>
  );
}
