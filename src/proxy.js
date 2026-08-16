import { NextResponse } from 'next/server';
import { COOKIE_ADMIN, jetonValide } from '@/libs/adminAuth';

// Protège /admin et /api/admin : sans session valide, une page redirige
// vers la connexion, une route API répond 401. Ces deux chemins-ci restent
// publics — c'est par eux qu'une session s'obtient.
const PUBLIQUES = new Set(['/admin/login', '/api/admin/login']);

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (PUBLIQUES.has(pathname)) return NextResponse.next();

  if (jetonValide(request.cookies.get(COOKIE_ADMIN)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return Response.json({ message: 'Authentification requise.' }, { status: 401 });
  }

  const connexion = new URL('/admin/login', request.url);
  connexion.searchParams.set('suite', pathname);
  return NextResponse.redirect(connexion);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
