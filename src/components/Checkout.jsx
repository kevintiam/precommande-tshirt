'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Lock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useCart, FREE_SHIPPING_THRESHOLD } from '@/components/CartProvider';

const eur = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

const methodMeta = {
  card: { label: 'Carte bancaire' },
  applepay: { label: 'Apple Pay' },
  googlepay: { label: 'Google Pay' },
  paypal: { label: 'PayPal' },
};

const emptyForm = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  zip: '',
  city: '',
  country: 'France',
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

// Formatage saisie carte : groupes de 4 chiffres, max 16.
const formatCardNumber = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

// Formatage échéance : MM/AA.
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function Checkout() {
  const { cart, subtotal, shipping, total, checkoutOpen, closeCheckout, clearCart } =
    useCart();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('form'); // 'form' | 'processing' | 'done'
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('card');

  if (!checkoutOpen) return null;

  const set = (key) => (e) => {
    let value = e.target.value;
    if (key === 'cardNumber') value = formatCardNumber(value);
    if (key === 'expiry') value = formatExpiry(value);
    if (key === 'cvc') value = value.replace(/\D/g, '').slice(0, 4);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = 'E-mail invalide';
    if (!form.firstName.trim()) e.firstName = 'Requis';
    if (!form.lastName.trim()) e.lastName = 'Requis';
    if (!form.address.trim()) e.address = 'Requis';
    if (!/^\d{4,5}$/.test(form.zip.trim())) e.zip = 'Code postal invalide';
    if (!form.city.trim()) e.city = 'Requis';
    if (method === 'card') {
      if (!form.cardName.trim()) e.cardName = 'Requis';
      if (form.cardNumber.replace(/\s/g, '').length < 13)
        e.cardNumber = 'Numéro de carte invalide';
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'MM/AA';
      if (form.cvc.length < 3) e.cvc = 'CVC';
    }
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setStatus('processing');
    // Paiement simulé : aucun appel réseau, aucun débit réel.
    setTimeout(() => {
      setOrder({
        ref: `CR-${Date.now().toString().slice(-6)}`,
        email: form.email,
        total,
        method: methodMeta[method].label,
      });
      clearCart();
      setStatus('done');
    }, 1600);
  };

  const handleClose = () => {
    if (status === 'processing') return;
    closeCheckout();
    // Réinitialise pour une éventuelle prochaine commande.
    setStatus('form');
    setForm(emptyForm);
    setErrors({});
    setOrder(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="my-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <h2 className="flex items-center gap-2 font-serif text-xl text-stone-900">
            <Lock className="h-5 w-5" />
            {status === 'done' ? 'Commande confirmée' : 'Paiement sécurisé'}
          </h2>
          <button
            onClick={handleClose}
            disabled={status === 'processing'}
            className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {status === 'done' ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <h3 className="mt-5 font-serif text-2xl text-stone-900">
              Merci pour votre commande !
            </h3>
            <p className="mt-2 max-w-md text-stone-500">
              Un e-mail de confirmation a été envoyé à{' '}
              <span className="font-medium text-stone-700">{order.email}</span>.
            </p>
            <div className="mt-6 rounded-xl bg-stone-50 px-6 py-4 text-sm">
              <p className="text-stone-500">
                Référence :{' '}
                <span className="font-semibold text-stone-900">{order.ref}</span>
              </p>
              <p className="mt-1 text-stone-500">
                Montant réglé :{' '}
                <span className="font-semibold text-stone-900">
                  {eur.format(order.total)}
                </span>
              </p>
              <p className="mt-1 text-stone-500">
                Moyen de paiement :{' '}
                <span className="font-semibold text-stone-900">
                  {order.method}
                </span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-8 rounded-full bg-stone-900 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-amber-500 hover:text-stone-950"
            >
              Continuer
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-8 px-6 py-6 md:grid-cols-[1fr_18rem]"
          >
            {/* Formulaire */}
            <div className="space-y-6">
              <Section title="Coordonnées">
                <Field
                  label="E-mail"
                  value={form.email}
                  onChange={set('email')}
                  error={errors.email}
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Prénom"
                    value={form.firstName}
                    onChange={set('firstName')}
                    error={errors.firstName}
                    autoComplete="given-name"
                  />
                  <Field
                    label="Nom"
                    value={form.lastName}
                    onChange={set('lastName')}
                    error={errors.lastName}
                    autoComplete="family-name"
                  />
                </div>
              </Section>

              <Section title="Adresse de livraison">
                <Field
                  label="Adresse"
                  value={form.address}
                  onChange={set('address')}
                  error={errors.address}
                  autoComplete="street-address"
                />
                <div className="grid grid-cols-[8rem_1fr] gap-3">
                  <Field
                    label="Code postal"
                    value={form.zip}
                    onChange={set('zip')}
                    error={errors.zip}
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                  <Field
                    label="Ville"
                    value={form.city}
                    onChange={set('city')}
                    error={errors.city}
                    autoComplete="address-level2"
                  />
                </div>
                <Field
                  label="Pays"
                  value={form.country}
                  onChange={set('country')}
                  autoComplete="country-name"
                />
              </Section>

              <Section title="Mode de paiement">
                <MethodSelector method={method} setMethod={setMethod} />

                {method === 'card' ? (
                  <div className="space-y-3 pt-1">
                    <Field
                      label="Nom sur la carte"
                      value={form.cardName}
                      onChange={set('cardName')}
                      error={errors.cardName}
                      autoComplete="cc-name"
                    />
                    <Field
                      label="Numéro de carte"
                      value={form.cardNumber}
                      onChange={set('cardNumber')}
                      error={errors.cardNumber}
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      autoComplete="cc-number"
                      icon={<CreditCard className="h-4 w-4 text-stone-400" />}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Expiration"
                        value={form.expiry}
                        onChange={set('expiry')}
                        error={errors.expiry}
                        inputMode="numeric"
                        placeholder="MM/AA"
                        autoComplete="cc-exp"
                      />
                      <Field
                        label="CVC"
                        value={form.cvc}
                        onChange={set('cvc')}
                        error={errors.cvc}
                        inputMode="numeric"
                        placeholder="123"
                        autoComplete="cc-csc"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-500">
                    Vous serez redirigé pour confirmer votre paiement avec{' '}
                    <span className="font-medium text-stone-700">
                      {methodMeta[method].label}
                    </span>
                    .
                  </p>
                )}
              </Section>
            </div>

            {/* Récapitulatif */}
            <aside className="space-y-4 md:border-l md:border-stone-100 md:pl-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Votre commande
              </h3>
              <ul className="space-y-3">
                {cart.map(({ product, size, qty }) => (
                  <li
                    key={`${product.id}::${size}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative h-14 w-12 flex-none overflow-hidden rounded-md bg-stone-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                        {qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-800">
                        {product.name}
                      </p>
                      <p className="text-xs text-stone-400">Taille {size}</p>
                    </div>
                    <span className="text-sm font-medium text-stone-700">
                      {eur.format(product.price * qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-1.5 border-t border-stone-100 pt-4 text-sm">
                <Row label="Sous-total" value={eur.format(subtotal)} />
                <Row
                  label="Livraison"
                  value={shipping === 0 ? 'Offerte' : eur.format(shipping)}
                />
                <div className="flex items-center justify-between pt-2 text-base font-semibold text-stone-900">
                  <span>Total</span>
                  <span>{eur.format(total)}</span>
                </div>
                {shipping > 0 && (
                  <p className="pt-1 text-xs text-stone-400">
                    Livraison offerte dès {eur.format(FREE_SHIPPING_THRESHOLD)}{' '}
                    d’achat.
                  </p>
                )}
              </div>

              <PayButton
                method={method}
                total={total}
                processing={status === 'processing'}
                disabled={status === 'processing' || cart.length === 0}
              />

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Paiement de démonstration — aucun montant n’est débité.
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1 font-serif text-lg text-stone-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, error, icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-500">
        {label}
      </span>
      <span className="relative block">
        <input
          {...props}
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

const methodMarks = {
  card: <CreditCard className="h-5 w-5 text-stone-700" />,
  applepay: <ApplePayMark className="h-5" />,
  googlepay: <GooglePayMark className="h-5" />,
  paypal: <PayPalMark className="h-4" />,
};

function MethodSelector({ method, setMethod }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Object.keys(methodMeta).map((id) => {
        const active = id === method;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            aria-pressed={active}
            className={`flex h-14 items-center justify-center rounded-xl border-2 transition-colors ${
              active
                ? 'border-stone-900 bg-stone-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
            aria-label={methodMeta[id].label}
          >
            {methodMarks[id]}
          </button>
        );
      })}
    </div>
  );
}

function PayButton({ method, total, processing, disabled }) {
  const base =
    'flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60';

  const styles = {
    card: 'bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-950',
    applepay: 'bg-black text-white hover:bg-stone-800',
    googlepay: 'bg-black text-white hover:bg-stone-800',
    paypal: 'bg-[#ffc439] text-[#003087] hover:brightness-95',
  };

  const content = () => {
    if (processing)
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Traitement…
        </>
      );
    switch (method) {
      case 'applepay':
        return (
          <>
            <AppleLogo className="h-5 w-5" /> Pay
          </>
        );
      case 'googlepay':
        return (
          <>
            <GooglePayMark className="h-5" invert /> Pay
          </>
        );
      case 'paypal':
        return <PayPalMark className="h-5" />;
      default:
        return (
          <>
            <Lock className="h-4 w-4" />
            Payer {eur.format(total)}
          </>
        );
    }
  };

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${base} ${styles[method]}`}
    >
      {content()}
    </button>
  );
}

function AppleLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.02-3.77-2.05-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.16-.47 7.84 1.3 10.41.86 1.26 1.89 2.67 3.24 2.62 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.29-1.28 3.15-2.55.99-1.46 1.4-2.87 1.42-2.95-.03-.01-2.72-1.04-2.75-4.13M14.53 4.6c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.55-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.58 3.04-1.45" />
    </svg>
  );
}

function ApplePayMark({ className }) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold text-stone-800 ${className}`}>
      <AppleLogo className="h-4 w-4" />
      Pay
    </span>
  );
}

function GoogleG({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.73z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function GooglePayMark({ className, invert }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        invert ? 'text-white' : 'text-stone-800'
      } ${className}`}
    >
      <GoogleG className="h-4 w-4" />
      Pay
    </span>
  );
}

function PayPalMark({ className }) {
  return (
    <span className={`inline-flex items-center font-bold italic ${className}`}>
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009cde]">Pal</span>
    </span>
  );
}
