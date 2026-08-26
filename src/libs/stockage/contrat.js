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

// Moyens de paiement proposés à la caisse.
//
// Les deux fonctionnent EXACTEMENT pareil du point de vue du site : le
// client paie hors d'ici depuis son application, joint une capture, et
// le trésorier confirme au vu du compte. Aucun paiement n'est encaissé
// par ce serveur, ni par Interac ni par PayPal.
//
// Le moyen n'est donc retenu que pour une raison : dire au trésorier OÙ
// vérifier. Chercher au relevé bancaire un paiement arrivé sur PayPal
// est la façon la plus sûre de déclarer un virement manquant.
export const MOYENS = {
  INTERAC: 'interac',
  PAYPAL: 'paypal',
};

export const MOYEN_PAR_DEFAUT = MOYENS.INTERAC;

// Levée quand le stockage refuse d'écrire : disque en lecture seule,
// feuille non partagée, quota Google atteint. Distinguer ce cas d'un vrai
// bug permet de répondre 503 avec un message lisible plutôt qu'un 500.
export class StockageIndisponible extends Error {}
