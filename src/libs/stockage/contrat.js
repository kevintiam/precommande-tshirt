const INTERAC_EMAIL = 'ImpactcampADN26@gmail.com';
const PAYPAL_EMAIL = 'ImpactcampADN26@gmail.com';
const PAYPAL_ME = null;

function InteracMark({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#FFB92E] text-xs font-bold text-stone-950">
        e
      </span>
      <span className="font-bold text-stone-900">Interac</span>
    </span>
  );
}

function PaypalMark({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#003087] text-xs font-bold italic text-white">
        P
      </span>
      <span className="font-bold italic text-[#003087]">PayPal</span>
    </span>
  );
}

export const STATUTS = {
  EN_ATTENTE: 'en_attente_paiement',
  A_VERIFIER: 'a_verifier',
  PAYEE: 'payee', 
  ECHOUEE: 'echouee', 
};

export const MOYENS = {
  INTERAC: 'interac',
  PAYPAL: 'paypal',
};
export const PAIEMENTS = {
  [MOYENS.INTERAC]: {
    Marque: InteracMark,
    note: 'Virement bancaire',
    nom: 'Virement Interac',
    destinataire: INTERAC_EMAIL,
    lien: null,
    consigne: (ref) =>
      `Indiquez la référence ${ref} dans le message du virement : c’est elle qui permet d’associer votre paiement à votre commande.`,
    apresPaiement:
      'Joins la capture d’écran de ta confirmation Interac. Elle nous permet de retrouver ton paiement et d’accélérer la validation.',
  },
  [MOYENS.PAYPAL]: {
    Marque: PaypalMark,
    note: 'Depuis ton compte',
    nom: 'PayPal',
    destinataire: PAYPAL_EMAIL,
    lien: PAYPAL_ME,
    consigne: (ref) =>
      `Indiquez la référence ${ref} dans la note du paiement. Si PayPal vous le propose, choisissez « Entre proches » : le camp reçoit alors la totalité du montant.`,
    apresPaiement:
      'Joins la capture d’écran de ta confirmation PayPal. Elle nous permet de retrouver ton paiement et d’accélérer la validation.',
  },
};

export const MOYEN_PAR_DEFAUT = MOYENS.INTERAC;

export class StockageIndisponible extends Error {}
