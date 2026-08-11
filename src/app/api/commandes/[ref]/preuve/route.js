import { put } from '@vercel/blob';
import { lireCommande, majStatut, STATUTS } from '@/libs/commandes';

// Envoi de la capture du virement par le client.
//
// ⚠️ Une capture n'est PAS une preuve : elle se falsifie et se réutilise.
// Cette route ne fait donc JAMAIS passer une commande à « payee ». Elle
// la place à « a_verifier », c'est-à-dire « le client dit avoir payé,
// va regarder ton relevé ». La décision reste humaine.
//
// Le point d'entrée est public : n'importe qui connaissant une référence
// peut poster. D'où les bornes ci-dessous.

// Vercel coupe les requêtes de plus de 4,5 Mo avant même d'atteindre ce
// code : au-delà, le client voit une connexion interrompue et non un
// message. On reste donc sous ce plafond pour que le refus soit lisible.
export const TAILLE_MAX = 4 * 1024 * 1024; // 4 Mo
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

const erreur = (message, status = 400) => Response.json({ message }, { status });

export async function POST(request, { params }) {
  const { ref } = await params;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[preuve] BLOB_READ_WRITE_TOKEN absent');
    return erreur(
      'L’envoi de capture n’est pas disponible pour le moment.',
      503
    );
  }

  let commande;
  try {
    commande = await lireCommande(ref);
  } catch (err) {
    console.error('[preuve] stockage illisible :', err);
    return erreur('Service indisponible, réessaie dans quelques minutes.', 503);
  }

  if (!commande) return erreur('Commande introuvable.', 404);

  // Un seul envoi par commande : sans ça, la route devient un espace de
  // stockage gratuit pour qui connaît une référence.
  if (commande.statut !== STATUTS.EN_ATTENTE) {
    return erreur(
      commande.preuveUrl
        ? 'Une capture a déjà été envoyée pour cette commande.'
        : 'Cette commande n’attend plus de paiement.',
      409
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return erreur('Envoi illisible.');
  }

  const fichier = form.get('capture');
  if (!fichier || typeof fichier === 'string') {
    return erreur('Aucune capture jointe.');
  }
  if (!TYPES.has(fichier.type)) {
    return erreur('Format non accepté. Utilise une image JPEG, PNG ou WEBP.');
  }
  if (fichier.size === 0) return erreur('Le fichier est vide.');
  if (fichier.size > TAILLE_MAX) {
    return erreur('Image trop lourde : 4 Mo maximum.');
  }

  try {
    // Le nom vient de nous, jamais du client : un nom de fichier fourni
    // par le navigateur peut contenir des séparateurs de chemin.
    const extension = fichier.type.split('/')[1].replace('jpeg', 'jpg');
    const blob = await put(`preuves/${ref}.${extension}`, fichier, {
      access: 'public',
      addRandomSuffix: true,
      contentType: fichier.type,
    });

    await majStatut(ref, STATUTS.A_VERIFIER, { preuveUrl: blob.url });
    return Response.json({ statut: STATUTS.A_VERIFIER });
  } catch (err) {
    console.error('[preuve] envoi impossible :', err);
    return erreur('Envoi impossible. Réessaie dans quelques minutes.', 503);
  }
}
