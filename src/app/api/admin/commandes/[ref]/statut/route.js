import { cookies } from 'next/headers';
import { COOKIE_ADMIN, jetonValide } from '@/libs/adminAuth';
import { majStatut, STATUTS } from '@/libs/commandes';

// Le proxy filtre déjà /api/admin/*, mais on revérifie ici : c'est la
// route elle-même qui doit rester sûre si jamais sa protection en amont
// change un jour (voir la doc Next.js sur le Proxy à ce sujet).
const erreur = (message, status = 400) => Response.json({ message }, { status });

// Seuls ces deux statuts sont des décisions humaines qu'un organisateur
// prend depuis cette interface. « en_attente_paiement » et « a_verifier »
// ne sont que des étapes automatiques du parcours client.
const AUTORISES = new Set([STATUTS.PAYEE, STATUTS.ECHOUEE]);

export async function POST(request, { params }) {
  if (!jetonValide((await cookies()).get(COOKIE_ADMIN)?.value)) {
    return erreur('Authentification requise.', 401);
  }

  const { ref } = await params;

  let corps;
  try {
    corps = await request.json();
  } catch {
    return erreur('Requête illisible.');
  }

  if (!AUTORISES.has(corps?.statut)) return erreur('Statut invalide.');

  let commande;
  try {
    commande = await majStatut(ref, corps.statut);
  } catch (err) {
    console.error('[admin] changement de statut impossible :', err);
    return erreur('Service indisponible, réessaie dans quelques minutes.', 503);
  }

  if (!commande) return erreur('Commande introuvable.', 404);
  return Response.json({ statut: commande.statut });
}
