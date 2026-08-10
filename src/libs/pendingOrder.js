// Une commande confirmée attend un virement Interac que le client envoie
// depuis son application bancaire. Sur mobile, ce changement d'application
// fait souvent purger l'onglet : sans persistance, la référence est perdue
// au moment précis où le client en a besoin.
//
// Petit store externe consommé via useSyncExternalStore. La source de
// vérité est en mémoire, doublée dans localStorage pour survivre à un
// rechargement — si le stockage est indisponible (navigation privée,
// cookies refusés, quota plein), la mémoire suffit tant que l'onglet vit.

const CLE = 'camp-adn:commande-en-attente';

let commande = null;
let relu = false; // le stockage a-t-il déjà été consulté ?
const listeners = new Set();

const notifier = () => listeners.forEach((l) => l());

export const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// Doit renvoyer une référence stable entre deux notifications, sinon
// useSyncExternalStore boucle : d'où la lecture unique et le cache.
export const getSnapshot = () => {
  if (!relu) {
    relu = true;
    try {
      const brut = window.localStorage.getItem(CLE);
      if (brut) commande = JSON.parse(brut);
    } catch {
      /* stockage indisponible */
    }
  }
  return commande;
};

// Utilisé au rendu serveur et pendant l'hydratation : rien à restaurer,
// c'est ce qui évite toute divergence avec le HTML prérendu.
export const getServerSnapshot = () => null;

export const ecrireCommande = (nouvelle) => {
  commande = nouvelle;
  relu = true;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(nouvelle));
  } catch {
    /* stockage indisponible */
  }
  notifier();
};

export const effacerCommande = () => {
  commande = null;
  relu = true;
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* stockage indisponible */
  }
  notifier();
};
