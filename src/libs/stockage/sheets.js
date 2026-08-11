import { createSign } from 'node:crypto';
import { STATUTS, StockageIndisponible } from '@/libs/stockage/contrat';

// Stockage Google Sheets — une ligne par commande, lisible par le
// trésorier sans outil. On parle directement à l'API REST v4 : les trois
// appels dont on a besoin (append, get, update) ne justifient pas
// d'embarquer le paquet `googleapis`, qui pèse plusieurs mégaoctets.

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
const COMPTE = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Les sauts de ligne de la clé PEM survivent mal aux variables
// d'environnement : ils y sont stockés en « \n » littéraux.
const CLE = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const ONGLET = process.env.GOOGLE_SHEETS_ONGLET || 'Commandes';

export const configure = Boolean(SHEET_ID && COMPTE && CLE);

export const COLONNES = [
  'Référence',
  'Date',
  'Statut',
  'E-mail',
  'Prénom',
  'Nom',
  'Total',
  'Articles',
  'ID paiement',
  'Mise à jour',
  'Jeton',
  'Détail — ne pas modifier',
  'Preuve',
];

const PLAGE = `${ONGLET}!A2:M`;

const base64url = (valeur) =>
  Buffer.from(valeur)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

// Le jeton Google vaut une heure : on le garde en mémoire plutôt que de
// resigner un JWT à chaque commande.
let cache = null;

async function jetonAcces() {
  if (cache && cache.expire > Date.now() + 60_000) return cache.valeur;

  const maintenant = Math.floor(Date.now() / 1000);
  const entete = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const charge = base64url(
    JSON.stringify({
      iss: COMPTE,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: maintenant,
      exp: maintenant + 3600,
    })
  );

  const signeur = createSign('RSA-SHA256');
  signeur.update(`${entete}.${charge}`);
  const assertion = `${entete}.${charge}.${base64url(signeur.sign(CLE))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new StockageIndisponible(
      `Google a refusé le jeton : ${data.error_description ?? res.status}`
    );
  }

  cache = {
    valeur: data.access_token,
    expire: Date.now() + data.expires_in * 1000,
  };
  return cache.valeur;
}

async function api(chemin, options = {}) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${chemin}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${await jetonAcces()}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new StockageIndisponible(
      `Google Sheets a répondu ${res.status} : ${data.error?.message ?? 'sans détail'}`
    );
  }
  return data;
}

const versLigne = (c) => [
  c.ref,
  c.date,
  c.statut,
  c.email,
  c.firstName,
  c.lastName,
  c.total,
  // Colonne lisible par un humain ; le détail exploitable est en L.
  c.lignes.map((l) => `${l.qty} × ${l.nom} (${l.size})`).join(' ; '),
  c.paiementId ?? '',
  c.majLe ?? '',
  c.clientToken ?? '',
  JSON.stringify(c.lignes),
  c.preuveUrl ?? '',
];

// La colonne « Statut » est saisie à la main par le trésorier, une fois
// le virement reçu. On tolère donc la casse, les accents
// et les espaces : sans ça, un « Payée » tapé au clavier ne correspondrait
// à rien et le client verrait « en attente » alors qu'il a déjà réglé.
// Toute valeur non reconnue retombe sur « en attente » — ne jamais
// annoncer un paiement reçu sur la foi d'une cellule ambiguë.
const normaliserStatut = (valeur) => {
  const v = String(valeur ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  if (['payee', 'paye', 'paid', 'recu', 'oui'].includes(v)) return STATUTS.PAYEE;
  if (['echouee', 'echoue', 'annulee', 'annule', 'non'].includes(v))
    return STATUTS.ECHOUEE;
  if (['a_verifier', 'a verifier', 'verifier', 'declare'].includes(v))
    return STATUTS.A_VERIFIER;
  return STATUTS.EN_ATTENTE;
};

const depuisLigne = (r) => {
  let lignes = [];
  try {
    lignes = JSON.parse(r[11] || '[]');
  } catch {
    // Colonne L abîmée par une saisie manuelle : la commande reste
    // exploitable pour le paiement, seul le détail est perdu.
    console.error('[sheets] détail illisible pour la commande %s', r[0]);
  }

  return {
    ref: r[0],
    date: r[1],
    statut: normaliserStatut(r[2]),
    email: r[3],
    firstName: r[4],
    lastName: r[5],
    total: Number(r[6]),
    paiementId: r[8] || null,
    majLe: r[9] || null,
    clientToken: r[10] || null,
    lignes,
    preuveUrl: r[12] || null,
  };
};

// Crée l'onglet et sa ligne d'en-têtes s'ils manquent. Vérifié une fois
// par démarrage : sans ça, chaque appel paierait un aller-retour de plus.
// N'ajoute jamais rien si l'onglet existe déjà avec ses en-têtes.
let ongletVerifie = false;

async function assurerOnglet() {
  if (ongletVerifie) return;

  const meta = await api('?fields=sheets.properties.title');
  const existe = (meta.sheets ?? []).some(
    (f) => f.properties?.title === ONGLET
  );

  if (!existe) {
    console.warn('[sheets] onglet « %s » absent, création', ONGLET);
    await api(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: ONGLET } } }],
      }),
    });
  }

  const entetes = await api(
    `/values/${encodeURIComponent(`${ONGLET}!A1:M1`)}`
  );
  if (!entetes.values?.[0]?.length) {
    await api(
      `/values/${encodeURIComponent(`${ONGLET}!A1:M1`)}?valueInputOption=RAW`,
      { method: 'PUT', body: JSON.stringify({ values: [COLONNES] }) }
    );
  }

  ongletVerifie = true;
}

const lireLignes = async () => {
  await assurerOnglet();
  const data = await api(`/values/${encodeURIComponent(PLAGE)}`);
  return data.values ?? [];
};

export const creerCommande = async (commande) => {
  await assurerOnglet();
  await api(
    `/values/${encodeURIComponent(PLAGE)}:append` +
      '?valueInputOption=RAW&insertDataOption=INSERT_ROWS',
    { method: 'POST', body: JSON.stringify({ values: [versLigne(commande)] }) }
  );
  return commande;
};

// Une seule requête pour tout le catalogue : le calcul du stock a besoin
// de l'ensemble des commandes, pas d'une recherche ligne par ligne.
export const listerCommandes = async () =>
  (await lireLignes()).map(depuisLigne);

export const lireCommande = async (ref) => {
  const ligne = (await lireLignes()).find((r) => r[0] === ref);
  return ligne ? depuisLigne(ligne) : null;
};

export const lireParJeton = async (jeton) => {
  const ligne = (await lireLignes()).find((r) => r[10] === jeton);
  return ligne ? depuisLigne(ligne) : null;
};

const ecrireLigne = async (numero, commande) =>
  api(
    `/values/${encodeURIComponent(`${ONGLET}!A${numero}:M${numero}`)}` +
      '?valueInputOption=RAW',
    { method: 'PUT', body: JSON.stringify({ values: [versLigne(commande)] }) }
  );

export const majStatut = async (ref, statut, meta = {}) => {
  const lignes = await lireLignes();
  const index = lignes.findIndex((r) => r[0] === ref);
  if (index < 0) return null;

  const commande = depuisLigne(lignes[index]);
  // « payee » et « echouee » sont des états terminaux : une fois la
  // décision prise au vu du relevé bancaire, rien venant du client ne
  // peut la défaire. En attente et à vérifier restent modifiables.
  const terminal = [STATUTS.PAYEE, STATUTS.ECHOUEE].includes(commande.statut);
  if (terminal) return commande;

  const maj = { ...commande, statut, ...meta, majLe: new Date().toISOString() };
  await ecrireLigne(index + 2, maj); // +2 : ligne 1 = en-têtes, index 0-based
  return maj;
};
