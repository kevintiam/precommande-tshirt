'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { lineId } from '@/libs/cart';
import { validate, createSet } from '@/libs/validation';
import { formatPrice } from '@/libs/currency';
import {
  Section,
  Field,
  Row,
  InteracMark,
  ConfirmButton,
  INTERAC_EMAIL,
} from '@/components/PaymentMarks';

const emptyForm = {
  email: '',
  firstName: '',
  lastName: '',
};

export default function Checkout({ cart, total, open, onClose, onDone }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('form'); // 'form' | 'processing' | 'done'
  const [order, setOrder] = useState(null);

  const set = createSet(setForm);

  if (!open) return null;

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setStatus('processing');
    // Enregistrement simulé : aucun appel réseau. Le paiement lui-même se
    // fait hors du site, par virement Interac vers INTERAC_EMAIL.
    setTimeout(() => {
      setOrder({
        ref: `CR-${Date.now().toString().slice(-6)}`,
        email: form.email,
        total,
      });
      onDone();
      setStatus('done');
    }, 1200);
  };

  const handleClose = () => {
    if (status === 'processing') return;
    onClose();
    setStatus('form');
    setForm(emptyForm);
    setErrors({});
    setOrder(null);
  };

  // Ferme au clic sur le fond, jamais au clic dans le panneau.
  const handleBackdrop = (ev) => {
    if (ev.target === ev.currentTarget) handleClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[60] overflow-y-auto bg-stone-950/50 px-4 py-8 backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-serif text-lg text-stone-900">
            {status === 'done' ? 'Commande enregistrée' : 'Finaliser la commande'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={status === 'processing'}
            className="cursor-pointer rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {status === 'done' ? (
          <div className="px-5 py-8">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 font-serif text-xl text-stone-900">
                Merci ! Il reste une étape.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Votre commande est réservée. Envoyez maintenant votre virement
                pour la confirmer. Un récapitulatif est parti à{' '}
                <span className="font-medium text-stone-700">{order.email}</span>.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-5 py-4">
              <InteracMark className="text-base" />
              <div className="mt-3 space-y-1.5 text-sm">
                <Row label="Destinataire" value={INTERAC_EMAIL} />
                <Row label="Montant" value={formatPrice(order.total)} />
                <Row label="Référence" value={order.ref} />
              </div>
              <p className="mt-3 border-t border-stone-200 pt-3 text-xs leading-relaxed text-stone-400">
                Indiquez la référence {order.ref} dans le message du virement :
                c’est elle qui permet d’associer votre paiement à votre commande.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full cursor-pointer rounded-lg bg-stone-900 py-3 text-base font-semibold text-white transition-colors hover:bg-stone-800"
            >
              Terminer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-7 px-5 py-6">
            {/* Récapitulatif */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Votre commande
              </h3>
              <ul className="mt-3 space-y-3">
                {cart.map(({ product, size, qty }) => (
                  <li
                    key={lineId(product.id, size)}
                    className="flex items-center gap-3"
                  >
                    <div className="relative h-12 w-10 flex-none overflow-hidden rounded-md bg-stone-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="40px"
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
                      {formatPrice(product.price * qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 text-base font-semibold text-stone-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </section>

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

            <Section title="Paiement">
              <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
                <InteracMark className="text-base" />
                <span className="text-xs text-stone-400">Seul moyen accepté</span>
              </div>
            </Section>

            <div>
              <ConfirmButton
                total={total}
                processing={status === 'processing'}
                disabled={status === 'processing' || cart.length === 0}
              />
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
                <ShieldCheck className="h-3.5 w-3.5 flex-none" />
                Aucun paiement n’est prélevé sur ce site.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
