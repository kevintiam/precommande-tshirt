import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// ⚠️ IMPLÉMENTATION DE DÉVELOPPEMENT — fichier JSON local.
// Elle ne survit pas à un déploiement et ne fonctionne pas en serverless
// (système de fichiers éphémère, écritures concurrentes non protégées).
// Seules les quatre fonctions exportées en bas sont à réimplémenter pour
// passer à Postgres, Supabase ou Google Sheets : rien d'autre dans le
// projet ne connaît le détail du stockage.

const FICHIER = join(process.cwd(), '.data', 'commandes.json');

// Cycle de vie d'une commande, du panier au t-shirt remis.
export const STATUTS = {
  EN_ATTENTE: 'en_attente_paiement', // créée, client pas encore redirigé
  PAYEE: 'payee', // webhook de la passerelle confirmé
  ECHOUEE: 'echouee', // refus, annulation, expiration
};

const lireTout = async () => {
  try {
    return JSON.parse(await readFile(FICHIER, 'utf8'));
  } catch {
    return {}; // fichier absent au premier lancement
  }
};

const ecrireTout = async (tout) => {
  await mkdir(dirname(FICHIER), { recursive: true });
  await writeFile(FICHIER, JSON.stringify(tout, null, 2), 'utf8');
};

export const creerCommande = async (commande) => {
  const tout = await lireTout();
  tout[commande.ref] = commande;
  await ecrireTout(tout);
  return commande;
};

export const lireCommande = async (ref) => (await lireTout())[ref] ?? null;

// Renvoie null si la commande est introuvable, et la commande inchangée
// si elle a déjà quitté l'état d'attente — c'est ce qui rend le webhook
// idempotent, condition indispensable puisque les passerelles rejouent
// leurs notifications jusqu'à recevoir un 200.
export const majStatut = async (ref, statut, meta = {}) => {
  const tout = await lireTout();
  const commande = tout[ref];
  if (!commande) return null;
  if (commande.statut !== STATUTS.EN_ATTENTE) return commande;

  tout[ref] = {
    ...commande,
    statut,
    ...meta,
    majLe: new Date().toISOString(),
  };
  await ecrireTout(tout);
  return tout[ref];
};

export const attacherPaiement = async (ref, paiementId) => {
  const tout = await lireTout();
  if (!tout[ref]) return null;
  tout[ref] = { ...tout[ref], paiementId };
  await ecrireTout(tout);
  return tout[ref];
};
