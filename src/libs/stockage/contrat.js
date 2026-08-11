// Contrat commun à toutes les implémentations de stockage.

// Cycle de vie d'une commande, du panier au t-shirt remis.
export const STATUTS = {
  EN_ATTENTE: 'en_attente_paiement', // créée, virement pas encore reçu
  // Le client déclare avoir payé et a joint une capture. Ce n'est PAS une
  // preuve : une capture se falsifie et se réutilise. C'est un signal qui
  // dit « regarde ce virement », rien de plus. Seule une vérification au
  // relevé bancaire fait passer à PAYEE.
  A_VERIFIER: 'a_verifier',
  PAYEE: 'payee', // virement reçu, confirmé à la main dans la feuille
  ECHOUEE: 'echouee', // refus, annulation, expiration
};

// Levée quand le stockage refuse d'écrire : disque en lecture seule,
// feuille non partagée, quota Google atteint. Distinguer ce cas d'un vrai
// bug permet de répondre 503 avec un message lisible plutôt qu'un 500.
export class StockageIndisponible extends Error {}
