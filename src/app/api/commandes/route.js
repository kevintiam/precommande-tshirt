import {
  creerCommande,
  lireParJeton,
  STATUTS,
  MOYEN_PAR_DEFAUT,
} from '@/libs/commandes';
import { lireCatalogue } from '@/libs/catalogue';
import {
  ALPHABET_REFERENCE as ALPHABET,
  isValidEmail,
  isValidName,
  moyenValide,
  validateLignes,
} from '@/libs/validation';


const genererReference = () =>
  'CR-' +
  Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (b) => ALPHABET[b % ALPHABET.length]
  ).join('');

const erreur = (message, status = 400) => Response.json({ message }, { status });

const indisponible =
  'Les commandes ne peuvent pas être enregistrées pour le moment. ' +
  'Réessaie dans quelques minutes ou écris-nous.';

// `moyen` en fait partie : sur un rejeu, c'est la commande DÉJÀ
// enregistrée qui décide des consignes affichées, pas l'écran du client.
const resume = (commande) => ({
  ref: commande.ref,
  total: commande.total,
  email: commande.email,
  moyen: commande.moyen ?? MOYEN_PAR_DEFAUT,
});

export async function POST(request) {
  let corps;
  try {
    corps = await request.json();
  } catch {
    return erreur('Requête illisible.');
  }

  const { email, firstName, lastName, lignes, clientToken, moyen } = corps ?? {};

  if (!isValidEmail(email)) return erreur('E-mail invalide.');
  if (!isValidName(firstName)) return erreur('Prénom requis.');
  if (!isValidName(lastName)) return erreur('Nom requis.');

  const moyenRetenu = moyen === undefined ? MOYEN_PAR_DEFAUT : moyen;
  if (!moyenValide(moyenRetenu)) return erreur('Moyen de paiement inconnu.');

  if (typeof clientToken === 'string' && clientToken) {
    try {
      const dejaVue = await lireParJeton(clientToken);
      if (dejaVue) {
        console.warn('[commandes] rejeu du jeton %s → %s', clientToken, dejaVue.ref);
        return Response.json(resume(dejaVue));
      }
    } catch (err) {
      console.error('[commandes] stockage illisible :', err);
      return erreur(indisponible, 503);
    }
  }

  let catalogue;
  try {
    catalogue = await lireCatalogue();
  } catch (err) {
    console.error('[commandes] catalogue illisible :', err);
    return erreur(indisponible, 503);
  }

  const refus = validateLignes(lignes, catalogue);
  if (refus) return erreur(refus);

  const detail = lignes.map((l) => {
    const produit = catalogue.find((p) => p.id === l.productId);
    return {
      productId: produit.id,
      nom: produit.name,
      size: l.size,
      qty: l.qty,
      prixUnitaire: produit.price,
    };
  });

  const total = detail.reduce((s, l) => s + l.prixUnitaire * l.qty, 0);
  const commande = {
    ref: genererReference(),
    clientToken: clientToken ?? null,
    date: new Date().toISOString(),
    email: email.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    lignes: detail,
    total,
    moyen: moyenRetenu,
    statut: STATUTS.EN_ATTENTE,
  };

  try {
    await creerCommande(commande);
  } catch (err) {
    console.error('[commandes] enregistrement impossible :', err);
    return erreur(indisponible, 503);
  }

  return Response.json(resume(commande));
}
