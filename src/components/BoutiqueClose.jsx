import Image from 'next/image';
import { Lock, PackageCheck } from 'lucide-react';
import { INTERAC_EMAIL } from '@/components/PaymentMarks';
import SuiviCommande from '@/components/SuiviCommande';


export default function BoutiqueClose() {
  return (
    <section>
      <div className="relative isolate overflow-hidden rounded-2xl">
        <Image
          src="/images/accueil.jpeg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 672px, 100vw"
          className="-z-10 object-cover grayscale"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-stone-950/95 via-bordeaux-950/90 to-bordeaux-900/80" />

        <div className="px-6 py-12 text-white sm:px-16 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-bordeaux-100">
            <Lock className="h-3.5 w-3.5 flex-none" />
            Précommandes closes
          </p>

          <h1 className="mt-5 font-display text-4xl uppercase leading-[0.92] tracking-wide drop-shadow-sm sm:text-5xl">
            La boutique est
            <span className="mt-2 block text-bordeaux-200">fermée</span>
          </h1>

          <div className="degrade-impact mt-6 h-1 w-28 rounded-full" />

          <p className="mt-6 max-w-lg text-[18px] leading-relaxed text-bordeaux-100">
            Les précommandes de t-shirts et de hoodies du Camp Impact ADN ne
            sont plus ouvertes pour le moment. Merci à tous ceux qui ont déjà
            passé commande.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 p-5">
        <p className="flex items-center gap-2 font-semibold text-stone-900">
          <PackageCheck className="h-4 w-4 flex-none text-emerald-600" />
          Vous avez déjà commandé ?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Votre commande reste valide et le retrait se fera sur place pendant
          le camp. Entrez votre référence pour consulter son état ou joindre
          votre capture de paiement.
        </p>
        <div className="mt-3">
          <SuiviCommande compact />
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-stone-400">
        Une question sur une commande ? Écrivez-nous à{' '}
        <a
          href={`mailto:${INTERAC_EMAIL}`}
          className="underline underline-offset-2 hover:text-stone-600"
        >
          {INTERAC_EMAIL}
        </a>{' '}
        en indiquant votre référence.
      </p>
    </section>
  );
}
