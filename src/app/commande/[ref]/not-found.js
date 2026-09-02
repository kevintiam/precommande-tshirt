import Link from 'next/link';
import { SearchX } from 'lucide-react';
import SuiviCommande from '@/components/SuiviCommande';
import { INTERAC_EMAIL } from '@/components/PaymentMarks';

// Atterrissage d'une référence bien formée mais inconnue — faute de
// frappe, ou commande d'une autre édition. Le 404 par défaut de Next
// serait un cul-de-sac : on redonne le champ de recherche sur place,
// pour que la deuxième tentative ne coûte pas une navigation de plus.
export default function CommandeIntrouvable() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-16">
      <div className="flex flex-col items-center text-center">
        <SearchX className="h-12 w-12 text-stone-300" />
        <h1 className="mt-4 font-display text-3xl uppercase text-stone-900">
          Référence introuvable
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          Aucune commande ne porte cette référence. Vérifiez la saisie —
          elle figure sur l’écran de confirmation reçu au moment de la
          commande.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5">
        <SuiviCommande compact />
      </div>

      <Link
        href="/"
        className="mt-6 block rounded-lg bg-bordeaux-700 py-3 text-center font-display text-lg uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800"
      >
        Retour à la boutique
      </Link>

      <p className="mt-4 text-center text-xs leading-relaxed text-stone-400">
        Vous ne retrouvez pas votre référence ? Écrivez-nous à{' '}
        <a
          href={`mailto:${INTERAC_EMAIL}`}
          className="underline underline-offset-2 hover:text-stone-600"
        >
          {INTERAC_EMAIL}
        </a>{' '}
        avec le nom et l’adresse utilisés lors de la commande.
      </p>
    </main>
  );
}
