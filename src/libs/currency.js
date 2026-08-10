// Formateur monétaire unique du site : dollar canadien, convention
// française du Canada (virgule décimale, symbole après le montant).
// Ex. : 25 -> « 25,00 $ »
export const money = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
});

// Raccourci pour l'affichage d'un prix.
export const formatPrice = (value) => money.format(value);
