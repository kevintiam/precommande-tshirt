import LoginForm from '@/components/LoginForm';

export default async function PageConnexionAdmin({ searchParams }) {
  const { suite } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-1 flex-col justify-center px-5">
      <h1 className="font-display text-2xl uppercase text-stone-900">
        Espace organisateurs
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Mot de passe requis pour voir les commandes.
      </p>
      <LoginForm suite={suite} />
    </main>
  );
}
