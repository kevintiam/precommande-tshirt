import { creerCommande, lireParJeton, STATUTS } from '@/libs/commandes';
import {
  lireCatalogue,
  reserver,
  restituer,
  StockInsuffisant,
} from '@/libs/catalogue';
import {
  isValidEmail,
  isValidName,
  validateLignes,
} from '@/libs/validation';


// Alphabet sans O/0/I/1/L : la référence est recopiée à la main dans le
// message du virement Interac, une ambiguïté visuelle coûte un
// rapprochement raté.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

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

const resume = (commande) => ({
  ref: commande.ref,
  total: commande.total,
  email: commande.email,
});

export async function POST(request) {
  let corps;
  try {
    corps = await request.json();
  } catch {
    return erreur('Requête illisible.');
  }

  const { email, firstName, lastName, lignes, clientToken } = corps ?? {};

  // Le navigateur peut envoyer n'importe quoi : la validation du
  // formulaire tourne côté client et se contourne trivialement. Tout est
  // revalidé ici, et le prix est relu depuis le catalogue.
  if (!isValidEmail(email)) return erreur('E-mail invalide.');
  if (!isValidName(firstName)) return erreur('Prénom requis.');
  if (!isValidName(lastName)) return erreur('Nom requis.');

  // Un rejeu du même jeton reprend la commande existante au lieu d'en
  // créer une seconde — et surtout, sans redécrémenter le stock.
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
    // Sans catalogue, impossible de connaître ni les prix ni le stock.
    console.error('[commandes] catalogue illisible :', err);
    return erreur(indisponible, 503);
  }

  const refus = validateLignes(lignes, catalogue);
  if (refus) return erreur(refus);

  // Le panier est valide : on le recopie depuis le CATALOGUE, jamais
  // depuis la requête. Le nom et le prix enregistrés sont donc les nôtres,
  // quoi qu'ait envoyé le navigateur.
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

  // Réservation du stock AVANT l'enregistrement : c'est l'opération
  // atomique, donc le seul point où la survente peut être empêchée.
  try {
    await reserver(detail);
  } catch (err) {
    if (err instanceof StockInsuffisant) {
      const { nom, size } = err.ligne;
      return erreur(
        err.dispo <= 0
          ? `« ${nom} » est épuisé en taille ${size}.`
          : `Il ne reste que ${err.dispo} « ${nom} » en taille ${size}.`,
        409
      );
    }
    console.error('[commandes] réservation impossible :', err);
    return erreur(indisponible, 503);
  }

  const commande = {
    ref: genererReference(),
    clientToken: clientToken ?? null,
    date: new Date().toISOString(),
    email: email.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    lignes: detail,
    total,
    statut: STATUTS.EN_ATTENTE,
  };

  try {
    await creerCommande(commande);
  } catch (err) {
    // Le stock est déjà décrémenté mais la commande n'existe pas : sans
    // cette restitution, les articles resteraient bloqués pour toujours.
    console.error('[commandes] enregistrement impossible :', err);
    try {
      await restituer(detail);
    } catch (err2) {
      console.error('[commandes] restitution du stock impossible :', err2);
    }
    return erreur(indisponible, 503);
  }

  return Response.json(resume(commande));
}
