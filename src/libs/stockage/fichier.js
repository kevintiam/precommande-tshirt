import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { STATUTS, StockageIndisponible } from '@/libs/stockage/contrat';

// Stockage de DÉVELOPPEMENT — fichier JSON local.
// Ne survit pas à un déploiement et échoue en serverless, où le disque
// est en lecture seule. Utilisé automatiquement quand Google Sheets n'est
// pas configuré, pour que `next dev` fonctionne sans identifiants.

const FICHIER = join(process.cwd(), '.data', 'commandes.json');

const lireTout = async () => {
  try {
    return JSON.parse(await readFile(FICHIER, 'utf8'));
  } catch {
    return {}; // fichier absent au premier lancement
  }
};

const ecrireTout = async (tout) => {
  try {
    await mkdir(dirname(FICHIER), { recursive: true });
    await writeFile(FICHIER, JSON.stringify(tout, null, 2), 'utf8');
  } catch (err) {
    throw new StockageIndisponible(
      `Écriture impossible dans ${FICHIER} (${err.code ?? err.message}). ` +
        'Le stockage fichier ne fonctionne qu’en développement : ' +
        'configurez Google Sheets pour la production.'
    );
  }
};

export const creerCommande = async (commande) => {
  const tout = await lireTout();
  tout[commande.ref] = commande;
  await ecrireTout(tout);
  return commande;
};

export const lireCommande = async (ref) => (await lireTout())[ref] ?? null;

export const listerCommandes = async () => Object.values(await lireTout());

export const lireParJeton = async (jeton) =>
  Object.values(await lireTout()).find((c) => c.clientToken === jeton) ?? null;

export const majStatut = async (ref, statut, meta = {}) => {
  const tout = await lireTout();
  const commande = tout[ref];
  if (!commande) return null;
  // Mêmes états terminaux que l'implémentation Sheets.
  if ([STATUTS.PAYEE, STATUTS.ECHOUEE].includes(commande.statut))
    return commande;

  tout[ref] = { ...commande, statut, ...meta, majLe: new Date().toISOString() };
  await ecrireTout(tout);
  return tout[ref];
};
