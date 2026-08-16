import { cookies } from 'next/headers';
import { COOKIE_ADMIN, creerJeton, motDePasseValide } from '@/libs/adminAuth';

const erreur = (message, status = 400) => Response.json({ message }, { status });

export async function POST(request) {
  if (!process.env.ADMIN_PASSWORD) {
    console.error('[admin] ADMIN_PASSWORD absente : connexion impossible.');
    return erreur('Espace admin non configuré.', 503);
  }

  let corps;
  try {
    corps = await request.json();
  } catch {
    return erreur('Requête illisible.');
  }

  if (!motDePasseValide(corps?.motDePasse)) {
    return erreur('Mot de passe incorrect.', 401);
  }

  const jeton = creerJeton();

  (await cookies()).set(COOKIE_ADMIN, jeton.valeur, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: jeton.maxAge,
  });

  return Response.json({ ok: true });
}
