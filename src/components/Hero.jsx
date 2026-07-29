import Image from 'next/image';
import { ArrowDown, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.pexels.com/photos/34328505/pexels-photo-34328505.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
          alt="Assemblée en louange lors du Camp de Réveille"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-stone-950/80 via-stone-900/70 to-stone-950/90" />
      </div>

      <div className="mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-sm font-medium tracking-wide text-amber-200 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          Édition 2026 — Inscriptions ouvertes
        </span>

        <h1 className="font-serif text-5xl leading-[1.05] text-white sm:text-7xl">
          Camp de Réveille
        </h1>
        <p className="mt-2 font-serif text-2xl italic text-amber-200/90 sm:text-3xl">
          « Réveille-toi, toi qui dors »
        </p>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-stone-200">
          Porte l&apos;esprit du camp au-delà des sessions. Découvrez notre collection
          de t-shirts officiels, conçus pour célébrer et partager le message de
          l&apos;événement.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#collection"
            className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-base font-semibold text-stone-950 transition-all hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-stone-950"
          >
            Voir la collection
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
          <a
            href="#apropos"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            En savoir plus
          </a>
        </div>
      </div>
    </section>
  );
}
