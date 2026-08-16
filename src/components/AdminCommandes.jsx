'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Search, X } from 'lucide-react';
import { formatPrice } from '@/libs/currency';
import ApercuPreuve from '@/components/ApercuPreuve';

const creerLabels = (statuts) => ({
  [statuts.EN_ATTENTE]: {
    texte: 'En attente',
    classe: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  [statuts.A_VERIFIER]: {
    texte: 'À vérifier',
    classe: 'border-royal-600/30 bg-royal-600/10 text-royal-700',
  },
  [statuts.PAYEE]: {
    texte: 'Payée',
    classe: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  [statuts.ECHOUEE]: {
    texte: 'Échouée',
    classe: 'border-red-200 bg-red-50 text-red-700',
  },
});

const formatDate = (iso) =>
  new Date(iso).toLocaleString('fr-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export default function AdminCommandes({ commandes, statuts }) {
  const router = useRouter();
  const labels = creerLabels(statuts);

  const [filtre, setFiltre] = useState('toutes');
  const [recherche, setRecherche] = useState('');
  const [enCours, setEnCours] = useState(() => new Set());
  const [erreurs, setErreurs] = useState({});

  const compteurs = useMemo(() => {
    const c = { toutes: commandes.length };
    for (const s of Object.values(statuts)) c[s] = 0;
    for (const cmd of commandes) c[cmd.statut] = (c[cmd.statut] ?? 0) + 1;
    return c;
  }, [commandes, statuts]);

  const totalEncaisse = useMemo(
    () =>
      commandes
        .filter((c) => c.statut === statuts.PAYEE)
        .reduce((s, c) => s + c.total, 0),
    [commandes, statuts]
  );

  // Recherche par nom, prénom, référence ou e-mail — insensible à la casse
  // et aux accents, pour qu'un « Éloi » tapé « eloi » soit quand même trouvé.
  const normaliser = (v) =>
    (v ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

  const terme = normaliser(recherche.trim());

  const correspond = (cmd) =>
    !terme ||
    [cmd.ref, cmd.firstName, cmd.lastName, cmd.email].some((champ) =>
      normaliser(champ).includes(terme)
    );

  const visibles = (
    filtre === 'toutes' ? commandes : commandes.filter((c) => c.statut === filtre)
  ).filter(correspond);

  const changerStatut = async (ref, statut) => {
    if (
      statut === statuts.ECHOUEE &&
      !window.confirm(`Marquer la commande ${ref} comme échouée ? C’est définitif.`)
    ) {
      return;
    }

    setEnCours((s) => new Set(s).add(ref));
    setErreurs((e) => ({ ...e, [ref]: '' }));

    try {
      const res = await fetch(`/api/admin/commandes/${ref}/statut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Erreur ${res.status}.`);
      router.refresh();
    } catch (err) {
      setErreurs((e) => ({ ...e, [ref]: err.message || 'Échec de la mise à jour.' }));
    } finally {
      setEnCours((s) => {
        const suite = new Set(s);
        suite.delete(ref);
        return suite;
      });
    }
  };

  const deconnexion = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const onglets = [
    { cle: 'toutes', texte: 'Toutes' },
    { cle: statuts.EN_ATTENTE, texte: 'En attente' },
    { cle: statuts.A_VERIFIER, texte: 'À vérifier' },
    { cle: statuts.PAYEE, texte: 'Payée' },
    { cle: statuts.ECHOUEE, texte: 'Échouée' },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase text-stone-900">
            Commandes
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {commandes.length} commande{commandes.length > 1 ? 's' : ''} ·{' '}
            {formatPrice(totalEncaisse)} encaissé
            {totalEncaisse > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={deconnexion}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {onglets.map(({ cle, texte }) => (
          <button
            key={cle}
            type="button"
            onClick={() => setFiltre(cle)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filtre === cle
                ? 'border-bordeaux-700 bg-bordeaux-700 text-white'
                : 'border-stone-200 text-stone-600 hover:border-bordeaux-300'
            }`}
          >
            {texte} · {compteurs[cle] ?? 0}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Chercher par nom, prénom, référence ou e-mail…"
          className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-9 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        />
        {recherche && (
          <button
            type="button"
            onClick={() => setRecherche('')}
            aria-label="Effacer la recherche"
            className="absolute right-2.5 top-1/2 cursor-pointer -translate-y-1/2 rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className="mt-8 text-center text-sm text-stone-400">
          {terme
            ? 'Aucune commande ne correspond à cette recherche.'
            : 'Aucune commande dans cette catégorie.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visibles.map((cmd) => {
            const label = labels[cmd.statut] ?? labels[statuts.EN_ATTENTE];
            const modifiable =
              cmd.statut === statuts.EN_ATTENTE || cmd.statut === statuts.A_VERIFIER;
            const busy = enCours.has(cmd.ref);

            return (
              <li key={cmd.ref} className="rounded-xl border border-stone-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-stone-900">
                      {cmd.ref}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${label.classe}`}
                    >
                      {label.texte}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">{formatDate(cmd.date)}</span>
                </div>

                <p className="mt-2 text-sm text-stone-700">
                  {cmd.firstName} {cmd.lastName} ·{' '}
                  <a
                    href={`mailto:${cmd.email}`}
                    className="text-stone-500 underline underline-offset-2 hover:text-stone-700"
                  >
                    {cmd.email}
                  </a>
                </p>

                <ul className="mt-2 space-y-0.5 text-sm text-stone-600">
                  {cmd.lignes.map((l) => (
                    <li key={`${l.productId}::${l.size}`}>
                      {l.qty} × {l.nom} <span className="text-stone-400">· {l.size}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-900">
                    {formatPrice(cmd.total)}
                  </span>
                  {cmd.preuveUrl && (
                    <ApercuPreuve url={cmd.preuveUrl} refCommande={cmd.ref} />
                  )}
                </div>

                {erreurs[cmd.ref] && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {erreurs[cmd.ref]}
                  </p>
                )}

                {modifiable && (
                  <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => changerStatut(cmd.ref, statuts.PAYEE)}
                      className="cursor-pointer rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Marquer payée
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => changerStatut(cmd.ref, statuts.ECHOUEE)}
                      className="cursor-pointer rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Marquer échouée
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
