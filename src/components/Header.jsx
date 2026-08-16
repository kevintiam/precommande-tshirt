import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-stone-200 bg-white">
      {/* Vers /admin : pas d'indication visuelle particulière — la page
          reste protégée par mot de passe, ce lien n'est qu'un raccourci
          pour les organisateurs qui connaissent déjà son existence. */}
      <Link
        href="/admin"
        className="mx-auto flex max-w-2xl items-center gap-2.5 px-5 py-4"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bordeaux-700 text-white">
          <Heart className="h-4 w-4" />
        </span>
        <span className="font-display text-lg tracking-wide text-stone-900">
          CAMP IMPACT ADN
        </span>
      </Link>
    </header>
  );
}
