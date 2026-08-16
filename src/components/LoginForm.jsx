'use client';

import { useState } from 'react';

export default function LoginForm({ suite }) {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (ev) => {
    ev.preventDefault();
    setEnvoi(true);
    setErreur('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motDePasse }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Le serveur a répondu ${res.status}.`);
      }

      // Redirection dure, pas router.push : on veut que la page admin se
      // recharge depuis le serveur avec le cookie qui vient d'être posé.
      window.location.href = suite?.startsWith('/admin') ? suite : '/admin';
    } catch (err) {
      setErreur(err.message || 'Connexion impossible.');
      setEnvoi(false);
    }
  };

  return (
    <form onSubmit={soumettre} className="mt-6 space-y-3">
      <input
        type="password"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
        placeholder="Mot de passe"
        autoFocus
        autoComplete="current-password"
        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-colors focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
      />

      {erreur && (
        <p role="alert" className="text-sm text-red-600">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi || !motDePasse}
        className="w-full cursor-pointer rounded-lg bg-bordeaux-700 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-bordeaux-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
      >
        {envoi ? 'Connexion…' : 'Entrer'}
      </button>
    </form>
  );
}
