'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, PackageSearch } from 'lucide-react';
import { normaliserReference } from '@/libs/validation';

export default function SuiviCommande({ compact = false }) {
  const router = useRouter();
  const [saisie, setSaisie] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const chercher = (ev) => {
    ev.preventDefault();
    if (enCours) return;

    const ref = normaliserReference(saisie);
    if (!ref) {
      setErreur(
        'Cette référence ne ressemble pas à celles que nous émettons. Elle a la forme CR-XXXXXX, sans les lettres O, I ou L.'
      );
      return;
    }

    setErreur('');
    // Volontairement jamais remis à false : la navigation remplace la
    // page. Le rétablir ferait clignoter le bouton avant la transition.
    setEnCours(true);
    router.push(`/commande/${ref}`);
  };

  return (
    <section
      className={
        compact ? '' : 'mt-10 rounded-xl border border-stone-200 bg-stone-50 p-5'
      }
    >
      {!compact && (
        <>
          <h2 className="flex items-center gap-2 font-display text-lg uppercase tracking-wide text-stone-900">
            <PackageSearch className="h-4 w-4 flex-none text-bordeaux-700" />
            Suivre ma commande
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-500">
            Entrez la référence reçue au moment de la commande pour consulter
            son état, le détail des articles et joindre votre capture de
            paiement.
          </p>
        </>
      )}

      <form
        onSubmit={chercher}
        className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-3'}`}
      >
        <label htmlFor="ref-commande" className="sr-only">
          Référence de commande
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id="ref-commande"
            type="text"
            value={saisie}
            onChange={(e) => {
              setSaisie(e.target.value);
              if (erreur) setErreur('');
            }}
            placeholder="CR-XXXXXX"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(erreur)}
            aria-describedby={erreur ? 'ref-erreur' : undefined}
            className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 font-mono text-sm uppercase text-stone-900 outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:text-stone-300 focus:ring-2 focus:ring-stone-900/10 ${
              erreur ? 'border-red-400' : 'border-stone-200 focus:border-stone-900'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={enCours}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-bordeaux-700 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
        >
          {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Voir'}
        </button>
      </form>

      {erreur && (
        <p id="ref-erreur" role="alert" className="mt-2 text-xs text-red-600">
          {erreur}
        </p>
      )}
    </section>
  );
}
