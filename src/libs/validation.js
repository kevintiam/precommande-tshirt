// Retrait sur place et paiement par virement Interac hors du site :
// ni adresse de livraison ni donnée bancaire ne sont saisies ici.
export const validate = (form) => {
  const e = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'E-mail invalide';
  if (!form.firstName.trim()) e.firstName = 'Requis';
  if (!form.lastName.trim()) e.lastName = 'Requis';
  return e;
};

// Fabrique le gestionnaire onChange lié à l'état du composant.
// À instancier dans le composant : const set = createSet(setForm);
export const createSet = (setForm) => (key) => (e) => {
  const { value } = e.target;
  setForm((f) => ({ ...f, [key]: value }));
};
