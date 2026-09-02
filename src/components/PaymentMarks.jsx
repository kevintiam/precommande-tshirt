import { Loader2 } from 'lucide-react';
import { formatPrice } from '@/libs/currency';

// Adresse recevant les virements Interac. À remplacer par celle de l'organisation.
export const INTERAC_EMAIL = 'ImpactcampADN26@gmail.com';

export const PAYPAL_EMAIL = 'ImpactcampADN26@gmail.com';

export const PAYPAL_ME = null;

function Section({ title, children }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, error, icon, ...props }) {
  const handleChange = (event) => {
    const value = event?.target?.value ?? event;
    if (typeof props.onChange === 'function') {
      props.onChange(value);
    }
  };

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-500">
        {label}
      </span>
      <span className="relative block">
        <input
          {...props}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 ${
            icon ? 'pr-9' : ''
          } ${error ? 'border-red-400' : 'border-stone-200'}`}
        />
        {icon && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
      </span>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-stone-500">
      <span>{label}</span>
      <span className="text-stone-700">{value}</span>
    </div>
  );
}

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

// Le bleu et l'italique du logo PayPal, sans reproduire la marque
// déposée : on nomme le service, on ne prétend pas être lui.
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

// Choix du moyen de paiement. Deux boutons plutôt qu'une liste
// déroulante : à deux options, le déroulant cache la moitié du choix.
function ChoixMoyen({ moyens, valeur, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Moyen de paiement"
      className="grid grid-cols-2 gap-2"
    >
      {moyens.map(({ cle, Marque, note }) => {
        const actif = cle === valeur;
        return (
          <button
            key={cle}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(cle)}
            className={`cursor-pointer rounded-lg border px-3 py-3 text-left transition-colors ${
              actif
                ? 'border-bordeaux-700 bg-bordeaux-50 ring-1 ring-bordeaux-700'
                : 'border-stone-200 hover:border-bordeaux-300'
            }`}
          >
            <Marque className="text-sm" />
            <span className="mt-1 block text-xs text-stone-400">{note}</span>
          </button>
        );
      })}
    </div>
  );
}

function ConfirmButton({ total, processing, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-bordeaux-700 py-3 font-display text-lg uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
    >
      {processing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Traitement…
        </>
      ) : (
        <>Confirmer la commande · {formatPrice(total)}</>
      )}
    </button>
  );
}

export {
  Section,
  Field,
  Row,
  InteracMark,
  PaypalMark,
  ChoixMoyen,
  ConfirmButton,
};
