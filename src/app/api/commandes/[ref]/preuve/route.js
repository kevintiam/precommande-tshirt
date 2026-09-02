import { put } from '@vercel/blob';
import { lireCommande, majStatut, STATUTS } from '@/libs/commandes';
import {
  reserver,
  restituer,
  marquerPreleve,
  oublierPreleve,
  StockInsuffisant,
} from '@/libs/catalogue';

export const TAILLE_MAX = 2 * 1024 * 1024; 
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

  // Prélèvement AVANT l'envoi du fichier : c'est l'opération atomique,
  // donc le seul point où la survente peut être empêchée. La faire en
  // premier évite aussi de laisser un blob orphelin derrière un refus.
  const lignes = commande.lignes ?? [];
  const aPrelever = await marquerPreleve(ref).catch((err) => {
    console.error('[preuve] registre illisible :', err);
    return null; // ni vrai ni faux : on ne touchera pas au stock
  });

  if (aPrelever === null) {
    return erreur('Service indisponible, réessaie dans quelques minutes.', 503);
  }

  if (aPrelever) {
    try {
      await reserver(lignes);
    } catch (err) {
      // La marque est retirée : sinon la commande passerait pour servie
      // alors que son stock n'a jamais bougé, et un échec ultérieur
      // rendrait des articles qui n'ont jamais été pris.
      await oublierPreleve(ref).catch(() => {});

      if (err instanceof StockInsuffisant) {
        const { nom, size } = err.ligne;
        console.warn('[preuve] stock manquant sur %s : %s (%s)', ref, nom, size);
        return erreur(
          `« ${nom} » n’est plus disponible en taille ${size}. ` +
            'Si tu as déjà fait le virement, écris-nous avec ta référence ' +
            `${ref} : on te rembourse ou on te trouve une autre taille.`,
          409
        );
      }

      console.error('[preuve] prélèvement impossible :', err);
      return erreur('Service indisponible, réessaie dans quelques minutes.', 503);
    }
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
    // Le stock est parti mais la commande est restée « en attente » :
    // sans cette compensation, les articles resteraient bloqués et le
    // client, qui verra une erreur, réessaierait sur un stock amputé.
    console.error('[preuve] envoi impossible :', err);
    if (aPrelever) {
      try {
        await restituer(lignes);
        await oublierPreleve(ref);
      } catch (err2) {
        console.error('[preuve] restitution du stock impossible :', err2);
      }
    }
    return erreur('Envoi impossible. Réessaie dans quelques minutes.', 503);
  }
}
