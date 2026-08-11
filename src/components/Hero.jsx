import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';

const VENUE = 'Centre COHERE';
// ⬇️ Renseignez ici l'adresse postale complète du lieu.
// Ex. : '9440 boulevard du Golf, Anjou, QC H1J 3A1'
// Laissée vide, la carte cherche simplement le nom du lieu.
const ADDRESS = '';

// Lien universel Google Maps : ouvre l'application sur mobile,
// le site sur ordinateur. encodeURIComponent gère espaces et accents.
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  [VENUE, ADDRESS].filter(Boolean).join(', ')
)}`;

export default function Hero() {
  return (
    <section>
      <div className="relative isolate overflow-hidden rounded-2xl">
        <Image
          src="/images/accueil.jpeg"
          alt="Assemblée en louange lors du Camp Impact ADN"
          fill
          priority
          sizes="(min-width: 768px) 672px, 100vw"
          className="-z-10 object-cover"
        />
        {/* Voile bordeaux : il teinte la photo aux couleurs de la marque
            et garantit le contraste du texte blanc, quelle que soit la
            zone claire de l'image en dessous. */}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-bordeaux-950/95 via-bordeaux-800/85 to-bordeaux-700/75" />

        <div className="px-6 py-12 text-white sm:px-10 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bordeaux-200">
            Précommande · Édition 2026
          </p>

          <h1 className="mt-4 font-display text-4xl uppercase leading-[0.92] drop-shadow-sm sm:text-5xl">
            Boutique officielle
            <span className="block text-bordeaux-200">Camp Impact ADN</span>
          </h1>

          {/* Reprise du dégradé rouge → bleu imprimé sur les vêtements. */}
          <div className="degrade-impact mt-6 h-1 w-28 rounded-full" />

          <div className="mt-6 space-y-2 text-sm text-bordeaux-100">
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-none" />8 au 11 août 2026
            </p>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Ouvrir dans Google Maps"
              className="flex items-start gap-2 underline-offset-4 hover:text-white hover:underline"
            >
              <MapPin className="mt-0.5 h-4 w-4 flex-none" />
              <span>
                {VENUE}
                {ADDRESS && (
                  <span className="block text-bordeaux-200">{ADDRESS}</span>
                )}
              </span>
            </a>
          </div>
        </div>
      </div>

      <p className="mt-6 leading-relaxed text-stone-600">
        Précommandez dès maintenant votre t-shirt ou votre hoodie du Camp
        Impact ADN. Paiement par virement Interac, retrait sur place pendant
        le camp.
      </p>
    </section>
  );
}
