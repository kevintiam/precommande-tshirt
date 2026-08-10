import { Heart } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bordeaux-700 text-white">
          <Heart className="h-4 w-4" />
        </span>
        <span className="font-display text-lg tracking-wide text-stone-900">
          CAMP IMPACT ADN
        </span>
      </div>
    </header>
  );
}
