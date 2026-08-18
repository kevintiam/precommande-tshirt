import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_ADMIN, jetonValide } from '@/libs/adminAuth';
import { listerCommandes, STATUTS } from '@/libs/commandes';
import AdminCommandes from '@/components/AdminCommandes';
import StatsProduits from '@/components/StatsProduits';

// Dépend du cookie de session à chaque requête : jamais mis en cache.
export const dynamic = 'force-dynamic';

export default async function PageAdmin() {
  // Deuxième contrôle, en plus du proxy : la doc Next.js recommande de ne
  // jamais compter uniquement sur lui pour l'authentification, au cas où
  // son filtre changerait un jour sans que cette page suive.
  if (!jetonValide((await cookies()).get(COOKIE_ADMIN)?.value)) {
    redirect('/admin/login?suite=/admin');
  }

  const commandes = await listerCommandes();
  commandes.sort((a, b) => new Date(b.date) - new Date(a.date));

  // La liste garde sa largeur de lecture ; la synthèse par article prend la
  // colonne qui reste, et repasse dessous quand l'écran est trop étroit.
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <AdminCommandes commandes={commandes} statuts={STATUTS} />
        <StatsProduits commandes={commandes} statuts={STATUTS} />
      </div>
    </main>
  );
}
