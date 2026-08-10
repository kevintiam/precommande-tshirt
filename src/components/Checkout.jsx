'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ShieldCheck, CheckCircle2, Copy, Check, Mail } from 'lucide-react';
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

// Jeton d'idempotence : identifie une tentative de commande, pas une
// commande. Tant que le navigateur n'a pas vu de réponse réussie, il
// renvoie le même — le serveur reconnaît alors le rejeu au lieu de créer
// un doublon. randomUUID exige un contexte sécurisé, d'où le repli.
const nouveauJeton = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function Checkout({
  cart,
  total,
  vue,
  order,
  onClose,
  onConfirmed,
  onTerminer,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('form'); // 'form' | 'processing'
  const [copie, setCopie] = useState(false);
  const [jeton, setJeton] = useState(nouveauJeton);

  const set = createSet(setForm);

  if (vue === null) return null;

  const confirmation = vue === 'confirmation' && order;
  // La passerelle envoie elle-même la demande Interac au client : les
  // instructions de virement manuel n'ont alors plus lieu d'être.
  const parPasserelle = order?.mode === 'passerelle';

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setStatus('processing');

    let data;
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          clientToken: jeton,
          lignes: cart.map((i) => ({
            productId: i.product.id,
            size: i.size,
            qty: i.qty,
          })),
        }),
      });

      // Une erreur serveur renvoie souvent une page HTML, pas du JSON :
      // on lit le texte brut pour pouvoir le tracer, et on retombe sur
      // le code HTTP quand aucun message exploitable n'est fourni.
      const brut = await res.text();
      try {
        data = brut ? JSON.parse(brut) : {};
      } catch {
        console.error('Réponse non JSON de /api/commandes :', brut.slice(0, 500));
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.message || `Le serveur a répondu ${res.status}.`);
      }
    } catch (err) {
      console.error('Commande refusée :', err);
      setStatus('form');
      setErrors({
        global:
          err.message ||
          'Connexion interrompue. Réessayez : votre commande ne sera pas créée en double.',
      });
      return;
    }

    // Hors du try, délibérément. Une erreur d'affichage après cette ligne
    // ne doit jamais faire croire que la commande a échoué : elle est
    // enregistrée côté serveur, et l'utilisateur recliquerait pour rien.
    setStatus('form');
    setJeton(nouveauJeton()); // la commande suivante sera bien distincte
    onConfirmed(data);

    // Formulaire hébergé par la passerelle : on y envoie le client. Sans
    // URL, il approuve depuis la notification Interac reçue par courriel
    // et reste sur l'écran de confirmation.
    if (data.url) window.location.href = data.url;
  };

  const handleClose = () => {
    if (status === 'processing') return;
    onClose();
    setForm(emptyForm);
    setErrors({});
  };

  const handleBackdrop = (ev) => {
    if (ev.target === ev.currentTarget) handleClose();
  };

  // Les trois informations que le client doit reporter dans son
  // application bancaire, sous une forme copiable d'un geste.
  const infosVirement = order
    ? [
        'Virement Interac — Camp Impact ADN',
        `Destinataire : ${INTERAC_EMAIL}`,
        `Montant : ${formatPrice(order.total)}`,
        `Message / référence : ${order.ref}`,
      ].join('\n')
    : '';

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(infosVirement);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) :
      // les informations restent lisibles et sélectionnables à l'écran.
      setCopie(false);
    }
  };

  const lienMail = order
    ? `mailto:${order.email}?subject=${encodeURIComponent(
        `Commande ${order.ref} — Camp Impact ADN`
      )}&body=${encodeURIComponent(infosVirement)}`
    : '';

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[60] overflow-y-auto bg-stone-950/50 px-4 py-8 backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-serif text-lg text-stone-900">
            {confirmation ? 'Commande enregistrée' : 'Finaliser la commande'}
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

        {confirmation ? (
          <div className="px-5 py-8">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 font-serif text-xl text-stone-900">
                Merci ! Il reste une étape.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                {parPasserelle ? (
                  <>
                    Une demande de paiement Interac a été envoyée à{' '}
                    <span className="font-medium text-stone-700">
                      {order.email}
                    </span>
                    . Approuvez-la dans votre application bancaire pour
                    confirmer la commande.
                  </>
                ) : (
                  <>
                    Votre commande est réservée au nom de{' '}
                    <span className="font-medium text-stone-700">
                      {order.email}
                    </span>
                    . Envoyez maintenant votre virement pour la confirmer.
                  </>
                )}
              </p>
            </div>

            <a
              href={`/commande/${order.ref}`}
              className="mt-6 block rounded-lg border border-stone-300 py-2.5 text-center text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Suivre ma commande {order.ref}
            </a>

            {!parPasserelle && (
            <>
            <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 px-5 py-4">
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

            {/* Aucun e-mail n'étant envoyé, ces deux boutons sont les seuls
                moyens pour le client d'emporter la référence avec lui. */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copier}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                {copie ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier les infos
                  </>
                )}
              </button>
              <a
                href={lienMail}
                className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                <Mail className="h-4 w-4" />
                M’envoyer ça
              </a>
            </div>

            <p className="mt-4 text-center text-xs leading-relaxed text-amber-700">
              Notez cette référence avant de fermer : aucun e-mail de
              confirmation n’est envoyé automatiquement.
            </p>
            </>
            )}

            <button
              type="button"
              onClick={onTerminer}
              className="mt-4 w-full cursor-pointer rounded-lg bg-stone-900 py-3 text-base font-semibold text-white transition-colors hover:bg-stone-800"
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
              {errors.global && (
                <p
                  role="alert"
                  className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errors.global}
                </p>
              )}
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
