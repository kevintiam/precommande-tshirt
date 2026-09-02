'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { lineId } from '@/libs/cart';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { formatPrice } from '@/libs/currency';
import {MOYEN_PAR_DEFAUT, PAIEMENTS, } from '@/libs/stockage/contrat';
import {
  Section,
  Field,
  Row,
  ChoixMoyen,
  ConfirmButton,
  INTERAC_EMAIL,
} from '@/components/PaymentMarks';
import { useOrderSubmission } from '@/hooks/useOrderSubmission';
import { useProofUpload } from '@/hooks/useProofUpload';




const emptyForm = { email: '', firstName: '', lastName: '', moyen: MOYEN_PAR_DEFAUT };

export default function Checkout({
  cart,
  total,
  vue,
  order,
  onClose,
  onConfirmed,
  onTerminer,
  onPreuveEnvoyee,
}) {

  const { status, globalError, submitOrder } = useOrderSubmission();
  const { fichier, envoiPreuve, erreurPreuve, handleFileChange, envoyerPreuve } = useProofUpload(onPreuveEnvoyee);
  const [copie, setCopie] = useState(false);
  const { form, setForm, setField, errors, validateForm, resetForm } = useCheckoutForm();

  const copier = async (texte) => {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      setCopie(false);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    try {
      const data = await submitOrder(form, cart);
      onConfirmed(data);
    } catch {
    }
  };

  const handleClose = () => {
    if (status === 'processing') return;
    resetForm();
    onClose();
  };

  const handleBackdrop = (ev) => {
    if (ev.target === ev.currentTarget) handleClose();
  };

  const confirmation = vue === 'confirmation' && order;
  const paiement = PAIEMENTS[order?.moyen] ?? PAIEMENTS[MOYEN_PAR_DEFAUT];

  const infosVirement = order
    ? [
        `${paiement.nom} — Camp Impact ADN`,
        `Destinataire : ${paiement.destinataire}`,
        `Montant : ${formatPrice(order.total)}`,
        `Message / référence : ${order.ref}`,
      ].join('\n')
    : '';

  const lienMail = order
    ? `mailto:${order.email}?subject=${encodeURIComponent(
        `Commande ${order.ref} — Camp Impact ADN`
      )}&body=${encodeURIComponent(infosVirement)}`
    : '';

  // ════════════════════════════════════════════════
  // 6. RENDU JSX (inchangé, mais utilisant les hooks)
  // ════════════════════════════════════════════════
  if (vue === null) return null;

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-60 overflow-y-auto bg-stone-950/50 px-4 py-8 backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-display text-xl uppercase tracking-wide text-stone-900">
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
              <h3 className="mt-4 font-display text-2xl uppercase leading-tight text-stone-900">
                Merci ! Il reste une étape.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Votre commande est réservée au nom de{' '}
                <span className="font-medium text-stone-700">{order.email}</span>
                . Envoyez maintenant votre paiement pour la confirmer.
              </p>
            </div>

            <a
              href={`/commande/${order.ref}`}
              className="mt-6 block rounded-lg border border-stone-300 py-2.5 text-center text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Suivre ma commande {order.ref}
            </a>

            <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 px-5 py-4">
              <paiement.Marque className="text-base" />
              <div className="mt-3 space-y-1.5 text-sm">
                <Row label="Destinataire" value={paiement.destinataire} />
                <Row label="Montant" value={formatPrice(order.total)} />
                <Row label="Référence" value={order.ref} />
              </div>

              {paiement.lien && (
                <a
                  href={paiement.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  Ouvrir {paiement.nom}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <p className="mt-3 border-t border-stone-200 pt-3 text-xs leading-relaxed text-stone-400">
                {paiement.consigne(order.ref)}
              </p>
            </div>

            {/* Boutons Copier / M'envoyer ça */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => copier(infosVirement)}
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

            {order.preuveEnvoyee ? (
              <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
                Capture reçue. Ta commande sera confirmée dès que nous aurons
                vérifié le paiement de notre côté.
              </p>
            ) : (
              <div className="mt-4 rounded-xl border border-stone-200 p-4">
                <p className="text-sm font-semibold text-stone-900">
                  Une fois le paiement envoyé
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  {paiement.apresPaiement}
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleFileChange}
                  className="mt-3 block w-full cursor-pointer text-xs text-stone-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-stone-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-stone-700 hover:file:bg-stone-50"
                />

                {erreurPreuve && (
                  <p
                    role="alert"
                    className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                  >
                    {erreurPreuve}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => envoyerPreuve(order)}
                  disabled={!fichier || envoiPreuve}
                  className="mt-3 w-full cursor-pointer rounded-lg bg-bordeaux-700 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {envoiPreuve ? 'Envoi…' : 'J’ai envoyé mon paiement'}
                </button>
              </div>
            )}

            <p className="mt-2 text-center text-xs leading-relaxed text-stone-400">
              Un problème avec ta commande ? Écris-nous à{' '}
              <a href={`mailto:${INTERAC_EMAIL}`} className="underline underline-offset-2 hover:text-stone-600">
                {INTERAC_EMAIL}
              </a>{' '}
              en indiquant ta référence {order.ref}.
            </p>

            <button
              type="button"
              onClick={onTerminer}
              className="mt-4 w-full cursor-pointer rounded-lg bg-bordeaux-700 py-3 font-display text-lg uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800"
            >
              Terminer
            </button>
          </div>
        ) : (
          // --- VUE FORMULAIRE ---
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
                        className={`object-cover ${
                          product.imagePosition === 'left' ? 'object-left' : ''
                        }`}
                      />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bordeaux-700 text-xs font-bold text-white">
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

            {/* Coordonnées */}
            <Section title="Coordonnées">
              <Field
                label="E-mail"
                value={form.email}
                onChange={setField('email')}
                error={errors.email}
                type="email"
                placeholder="vous@exemple.com"
                autoComplete="email"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Prénom"
                  value={form.firstName}
                  onChange={setField('firstName')}
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <Field
                  label="Nom"
                  value={form.lastName}
                  onChange={setField('lastName')}
                  error={errors.lastName}
                  autoComplete="family-name"
                />
              </div>
            </Section>

            {/* Paiement */}
            <Section title="Paiement">
              <ChoixMoyen
                valeur={form.moyen}
                onChange={(moyen) => setForm((f) => ({ ...f, moyen }))}
                moyens={Object.entries(PAIEMENTS).map(([cle, p]) => ({
                  cle,
                  Marque: p.Marque,
                  note: p.note,
                }))}
              />
              <p className="text-xs leading-relaxed text-stone-400">
                Les consignes de paiement s’afficheront à l’étape suivante.
              </p>
            </Section>

            {/* Erreur globale + Bouton de confirmation */}
            <div>
              {globalError && (
                <p
                  role="alert"
                  className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {globalError}
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