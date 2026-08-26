import * as sheets from '@/libs/stockage/sheets';
import * as fichier from '@/libs/stockage/fichier';

// Les commandes vivent dans Google Sheets : c'est la vue que le trésorier
// sait lire et où il coche les paiements. Le stock, lui, est dans MongoDB
// (voir src/libs/catalogue.js) — chaque système a un seul rôle.
//
// Le stockage fichier ne sert qu'au développement sans identifiants.
const impl = sheets.configure ? sheets : fichier;

export {
  STATUTS,
  MOYENS,
  MOYEN_PAR_DEFAUT,
  StockageIndisponible,
} from '@/libs/stockage/contrat';

export const creerCommande = (commande) => impl.creerCommande(commande);
export const lireCommande = (ref) => impl.lireCommande(ref);
export const lireParJeton = (jeton) => impl.lireParJeton(jeton);
export const listerCommandes = () => impl.listerCommandes();
export const majStatut = (ref, statut, meta) => impl.majStatut(ref, statut, meta);
