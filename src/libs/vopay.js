import { createHash, timingSafeEqual } from 'node:crypto';
import { STATUTS } from '@/libs/commandes';

// Client VoPay — Interac e-Transfer « Request Money ».
// Le flux : on demande les fonds au client, Interac lui envoie une
// notification officielle qu'il approuve dans son application bancaire,
// puis VoPay nous prévient par webhook.
//
// Réf. https://docs.vopay.com/reference/interacmoneyrequestpost

const BASE = process.env.VOPAY_BASE_URL;
const ACCOUNT_ID = process.env.VOPAY_ACCOUNT_ID;
const KEY = process.env.VOPAY_API_KEY;
const SECRET = process.env.VOPAY_SHARED_SECRET;

export const configuree = Boolean(BASE && ACCOUNT_ID && KEY && SECRET);

const sha1 = (valeur) => createHash('sha1').update(valeur).digest('hex');

// sha1(cléAPI + secretPartagé + date du jour). La signature change tous
// les jours : elle est recalculée à chaque appel, jamais mise en cache.
const signature = () =>
  sha1(KEY + SECRET + new Date().toISOString().slice(0, 10));

export async function demanderPaiement({ ref, montant, email, nom, message }) {
  const corps = new URLSearchParams({
    AccountID: ACCOUNT_ID,
    Key: KEY,
    Signature: signature(),
    Amount: montant.toFixed(2),
    Currency: 'CAD',
    EmailAddress: email,
    RecipientName: nom,
    MessageForRecipient: message,
    ClientReferenceNumber: ref,
    // Un rejeu de la même commande ne crée pas une seconde demande.
    IdempotencyKey: ref,
    GenerateURL: 'true',
  });

  const res = await fetch(`${BASE}/api/v2/interac/money-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: corps,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.Success) {
    throw new Error(data.ErrorMessage || `VoPay a répondu ${res.status}`);
  }

  return {
    transactionId: String(data.TransactionID),
    statutPasserelle: data.TransactionStatus ?? null,
    // Présente uniquement si GenerateURL est activé sur le compte ;
    // sinon le client passe par la notification Interac reçue par mail.
    url: data.URL ?? data.EmbedURL ?? null,
  };
}

// ValidationKey = sha1(secretPartagé + ID). Comparaison à temps constant :
// une comparaison naïve laisse fuiter le secret octet par octet.
export function validerWebhook(id, validationKey) {
  if (!SECRET || !validationKey) return false;
  const attendu = Buffer.from(sha1(SECRET + String(id)));
  const recu = Buffer.from(String(validationKey));
  return attendu.length === recu.length && timingSafeEqual(attendu, recu);
}

// VoPay expose une douzaine de statuts. Seuls trois groupes nous
// intéressent ; tout le reste laisse la commande en attente.
const PAYEE = new Set([
  'successful',
  'complete',
  'settled',
  'received',
  'request fulfilled',
]);
const ECHOUEE = new Set(['failed', 'cancelled', 'declined']);

export function statutInterne(statutVoPay) {
  const s = String(statutVoPay ?? '').toLowerCase();
  if (PAYEE.has(s)) return STATUTS.PAYEE;
  if (ECHOUEE.has(s)) return STATUTS.ECHOUEE;
  return null; // toujours en cours
}
