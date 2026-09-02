import { formatPrice } from '@/libs/currency';
import { rangTaille } from '@/libs/produit';

const agreger = (commandes, statuts) => {
  const parProduit = new Map();

  for (const cmd of commandes) {
    if (cmd.statut === statuts.ECHOUEE) continue;
    const paye = cmd.statut === statuts.PAYEE;

    for (const l of cmd.lignes) {
      let p = parProduit.get(l.productId);
      if (!p) {
        p = { id: l.productId, nom: l.nom, payes: 0, attente: 0, ca: 0, tailles: new Map() };
        parProduit.set(l.productId, p);
      }

      let t = p.tailles.get(l.size);
      if (!t) {
        t = { payes: 0, attente: 0 };
        p.tailles.set(l.size, t);
      }

      if (paye) {
        p.payes += l.qty;
        p.ca += (l.prixUnitaire ?? 0) * l.qty;
        t.payes += l.qty;
      } else {
        p.attente += l.qty;
        t.attente += l.qty;
      }
    }
  }

  return [...parProduit.values()]
    .map((p) => ({
      ...p,
      total: p.payes + p.attente,
      tailles: [...p.tailles.entries()]
        .map(([taille, t]) => ({ taille, ...t, total: t.payes + t.attente }))
        .sort((a, b) => rangTaille(a.taille) - rangTaille(b.taille)),
    }))
    .sort((a, b) => b.total - a.total || a.nom.localeCompare(b.nom, 'fr'));
};

const scinderNom = (nom) => {
  const [famille, ...reste] = nom.split(' — ');
  return [famille, reste.join(' — ')];
};

function Tuile({ pieces, nbCommandes, couleur, texte }) {
  return (
    <div className="rounded-xl border border-stone-200 p-3">
      <p className="text-2xl font-semibold tabular-nums text-stone-900">{pieces}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${couleur}`} />
        pièces {texte}
      </p>
      <p className="mt-1 text-[11px] text-stone-400 tabular-nums">
        {nbCommandes} commande{nbCommandes > 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default function StatsProduits({ commandes, statuts }) {
  const produits = agreger(commandes, statuts);
  const maxTotal = Math.max(1, ...produits.map((p) => p.total));
  const payes = produits.reduce((s, p) => s + p.payes, 0);
  const attente = produits.reduce((s, p) => s + p.attente, 0);

  const nbPayees = commandes.filter((c) => c.statut === statuts.PAYEE).length;
  // « En attente » regroupe ici les deux statuts non tranchés : tant que le
  // virement n'est pas vérifié, la pièce n'est ni vendue ni libérée.
  const nbAttente = commandes.filter(
    (c) => c.statut === statuts.EN_ATTENTE || c.statut === statuts.A_VERIFIER
  ).length;

  return (
    <aside className="lg:sticky lg:top-8">
      <h2 className="font-display text-lg uppercase text-stone-900">Par article</h2>
      <p className="mt-1 text-sm text-stone-500">
        Pièces commandées — commandes échouées exclues.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Tuile
          pieces={payes}
          nbCommandes={nbPayees}
          couleur="bg-emerald-600"
          texte="payées"
        />
        <Tuile
          pieces={attente}
          nbCommandes={nbAttente}
          couleur="bg-amber-500"
          texte="en attente"
        />
      </div>

      {produits.length === 0 ? (
        <p className="mt-6 text-center text-sm text-stone-400">
          Aucune pièce commandée pour l’instant.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {produits.map((p) => {
            const [famille, variante] = scinderNom(p.nom);
            // Les barres se comparent entre elles : la plus longue remplit la
            // colonne, les autres se lisent en proportion.
            const largeur = (q) => `${(q / maxTotal) * 100}%`;

            return (
              <li key={p.id} className="rounded-xl border border-stone-200 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-stone-900">
                    {famille}
                    {variante && (
                      <span className="block text-xs font-normal text-stone-500">
                        {variante}
                      </span>
                    )}
                  </p>
                  <span className="text-sm font-semibold tabular-nums text-stone-900">
                    {p.total}
                  </span>
                </div>

                <div
                  className="mt-2 flex h-2 gap-0.5 rounded-full bg-stone-100"
                  role="img"
                  aria-label={`${p.payes} pièce${p.payes > 1 ? 's' : ''} payée${p.payes > 1 ? 's' : ''}, ${p.attente} en attente`}
                >
                  {p.payes > 0 && (
                    <span
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: largeur(p.payes) }}
                    />
                  )}
                  {p.attente > 0 && (
                    <span
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: largeur(p.attente) }}
                    />
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                    <span className="font-semibold tabular-nums text-stone-900">
                      {p.payes}
                    </span>{' '}
                    payées
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span className="font-semibold tabular-nums text-stone-900">
                      {p.attente}
                    </span>{' '}
                    en attente
                  </span>
                </div>

                {/* Le détail par taille reprend le même partage : payées à
                    gauche, en attente à droite, pour qu'on sache quelles
                    tailles sont réellement acquises avant d'imprimer. */}
                <p className="mt-2 border-t border-stone-100 pt-2 text-[11px] uppercase tracking-wide text-stone-400">
                  Par taille · payées / en attente
                </p>
                <dl className="mt-1 flex flex-wrap gap-1.5 text-xs">
                  {p.tailles.map((t) => (
                    <div
                      key={t.taille}
                      className="rounded-md bg-stone-50 px-1.5 py-0.5 tabular-nums"
                      title={`${t.taille} : ${t.payes} payée${t.payes > 1 ? 's' : ''}, ${t.attente} en attente`}
                    >
                      <dt className="inline font-medium text-stone-700">{t.taille}</dt>{' '}
                      <dd className="inline text-stone-500">
                        <span className="font-semibold text-emerald-700">{t.payes}</span>
                        <span className="text-stone-300"> / </span>
                        <span className="font-semibold text-amber-600">{t.attente}</span>
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-1.5 text-xs text-stone-500">
                  {formatPrice(p.ca)} encaissés
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
