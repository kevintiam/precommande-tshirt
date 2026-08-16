import { createHmac, timingSafeEqual } from 'node:crypto';

// Authentification admin : un seul mot de passe partagé (ADMIN_PASSWORD),
// pas de compte par organisateur — inutile vu l'échelle du projet.
//
// La session est un jeton signé, pas un identifiant de session en base :
// `expiration.signature`, où la signature est un HMAC de l'expiration avec
// le mot de passe comme clé. Un serveur qui reçoit ce jeton peut donc le
// valider sans rien stocker nulle part, et personne ne peut le fabriquer
// sans connaître le mot de passe.

export const COOKIE_ADMIN = 'admin_session';
const DUREE_SECONDES = 60 * 60 * 24 * 7; // 7 jours

const signataire = () => {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return (expire) => createHmac('sha256', secret).update(String(expire)).digest('hex');
};

// Comparaison à temps constant : évite qu'un attaquant déduise le mot de
// passe (ou une signature) octet par octet à partir du temps de réponse.
const egaux = (a, b) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

export const motDePasseValide = (motDePasse) => {
  const secret = process.env.ADMIN_PASSWORD;
  return Boolean(secret) && typeof motDePasse === 'string' && egaux(motDePasse, secret);
};

export const creerJeton = () => {
  const signer = signataire();
  if (!signer) return null;
  const expire = Date.now() + DUREE_SECONDES * 1000;
  return { valeur: `${expire}.${signer(expire)}`, maxAge: DUREE_SECONDES };
};

export const jetonValide = (valeur) => {
  const signer = signataire();
  if (!signer || typeof valeur !== 'string') return false;

  const [expire, signature] = valeur.split('.');
  const expireNombre = Number(expire);
  if (!signature || !Number.isFinite(expireNombre) || Date.now() > expireNombre) {
    return false;
  }

  return egaux(signature, signer(expireNombre));
};
