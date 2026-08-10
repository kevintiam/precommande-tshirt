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
      <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-stone-100">
        <Image
          src="https://images.pexels.com/photos/34328505/pexels-photo-34328505.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
          alt="Assemblée en louange lors du Camp Impact ADN"
          fill
          priority
          sizes="(min-width: 768px) 672px, 100vw"
          className="object-cover"
        />
      </div>

      <h1 className="mt-6 font-serif text-3xl leading-tight text-stone-900">
        Boutique officielle — Camp Impact ADN
      </h1>

      <div className="mt-3 space-y-1.5 text-sm text-stone-500">
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 flex-none" />
          08-11 Août 2026
        </p>
        <a
          href={MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Ouvrir dans Google Maps"
          className="flex items-start gap-2 underline-offset-2 hover:text-stone-900 hover:underline"
        >
          <MapPin className="mt-0.5 h-4 w-4 flex-none" />
          <span>
            {VENUE}
            {ADDRESS && <span className="block text-stone-400">{ADDRESS}</span>}
          </span>
        </a>
      </div>

      <p className="mt-4 leading-relaxed text-stone-600">
        Précommandez dès maintenant votre t-shirt ou votre hoodie du Camp
        Impact ADN. Paiement par virement Interac, retrait sur place pendant
        le camp.
      </p>
    </section>
  );
}
