import * as sheets from '@/libs/stockage/sheets';
import * as fichier from '@/libs/stockage/fichier';

// Point d'entrée unique du stockage : rien d'autre dans le projet ne sait
// où vont les commandes. Google Sheets dès que ses variables sont
// présentes, sinon le fichier local pour que `next dev` tourne sans
// identifiants.
const impl = sheets.configure ? sheets : fichier;

if (!sheets.configure && process.env.NODE_ENV === 'production') {
  console.warn(
    '[commandes] Google Sheets non configuré — le stockage fichier ' +
      'échouera en serverless. Renseignez GOOGLE_SHEETS_ID, ' +
      'GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_PRIVATE_KEY.'
  );
}

export { STATUTS, StockageIndisponible } from '@/libs/stockage/contrat';

export const creerCommande = (commande) => impl.creerCommande(commande);
export const lireCommande = (ref) => impl.lireCommande(ref);
export const lireParJeton = (jeton) => impl.lireParJeton(jeton);
export const majStatut = (ref, statut, meta) => impl.majStatut(ref, statut, meta);
export const listerCommandes = () => impl.listerCommandes();
