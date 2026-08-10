import { lireCommande, majStatut, STATUTS } from '@/libs/commandes';
import { validerWebhook, statutInterne } from '@/libs/vopay';

// Webhook VoPay. C'est la SEULE source de vérité sur un paiement : la
// page de retour du client ne prouve rien, il peut la fabriquer.
//
// VoPay réessaie trois fois tant qu'il n'a pas reçu un 200. On répond
// donc 200 dès que le message est compris, même s'il n'y a rien à faire,
// et on ne réserve les codes d'erreur qu'aux cas où un rejeu a du sens.

export async function POST(request) {
  let evenement;
  try {
    evenement = await request.json();
  } catch {
    return Response.json({ recu: false }, { status: 400 });
  }

  const { TransactionID, ValidationKey, TransactionStatus, Status } = evenement;

  // Authentification avant toute autre chose : sans elle, n'importe qui
  // peut marquer les commandes payées en postant sur cette URL.
  if (!validerWebhook(TransactionID, ValidationKey)) {
    console.warn('[VoPay] webhook rejeté, ValidationKey invalide');
    return Response.json({ recu: false }, { status: 401 });
  }

  const ref = evenement.ClientReferenceNumber;
  const commande = ref ? await lireCommande(ref) : null;
  if (!commande) {
    // Rien à rejouer : la commande n'existe pas chez nous.
    console.warn('[VoPay] webhook pour une commande inconnue : %s', ref);
    return Response.json({ recu: true });
  }

  const nouveau = statutInterne(TransactionStatus ?? Status);
  if (!nouveau) return Response.json({ recu: true }); // encore en cours

  // Contrôle du montant : une commande ne passe payée que si la somme
  // reçue correspond exactement à ce qui était dû.
  if (nouveau === STATUTS.PAYEE) {
    const recu = Number(evenement.Amount);
    if (Number.isFinite(recu) && Math.abs(recu - commande.total) > 0.009) {
      console.error(
        '[VoPay] montant divergent sur %s : reçu %s, attendu %s',
        ref,
        recu,
        commande.total
      );
      return Response.json({ recu: true });
    }
  }

  // majStatut ignore les commandes déjà traitées : les rejeux de VoPay
  // sont donc sans effet.
  await majStatut(ref, nouveau, {
    paiementId: String(TransactionID),
    statutPasserelle: TransactionStatus ?? Status ?? null,
  });

  return Response.json({ recu: true });
}
