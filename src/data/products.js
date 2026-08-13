// Visuels : public/images/*.PNG
// ⚠️ Prix et STOCKS indicatifs — à ajuster avant la mise en ligne.
// Le stock est par taille : `stock: { M: 15, L: 20, XL: 15 }`.
// Les tailles proposées sont déduites des clés de `stock`, il n'y a donc
// qu'un seul endroit à modifier pour ouvrir ou fermer une taille.

export const products = [
  {
    id: 'tee-bordeaux-degrade',
    name: 'T-shirt IMPACT — Bordeaux, logo dégradé',
    description:
      'Coupe oversize, col rond côtelé. Logo IMPACT en arche dégradée rouge à bleu, surmontant l’ovale « CAMP ADN ».',
    price: 30,
    image: '/images/01.PNG',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'tee-bordeaux-blanc',
    name: 'T-shirt IMPACT — Bordeaux, logo blanc',
    description:
      'La version sobre du t-shirt bordeaux : logo IMPACT et ovale « CAMP ADN » imprimés en blanc.',
    price: 30,
    image: '/images/03.PNG',
    // `image` sert de vignette, `images` alimente la visionneuse.
    // Facultatif : sans lui, la visionneuse n'affiche que `image`.
    images: ['/images/03.PNG', '/images/02.PNG'],
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'tee-blanc-degrade',
    name: 'T-shirt IMPACT — Blanc, logo dégradé',
    description:
      'T-shirt blanc coupe oversize. Le dégradé rouge à bleu du logo ressort pleinement sur le fond clair.',
    price: 30,
    image: '/images/05.PNG',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'hoodie-bordeaux-degrade',
    name: 'Hoodie IMPACT — Bordeaux, logo dégradé',
    description:
      'Sweat à capuche molletonné, poche kangourou et bords côtelés. Logo IMPACT en dégradé rouge à bleu.',
    price: 50,
    image: '/images/04.PNG',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'hoodie-bordeaux-blanc',
    name: 'Hoodie IMPACT — Bordeaux, logo blanc',
    description:
      'Le hoodie bordeaux avec le logo IMPACT imprimé en blanc. Capuche doublée et poche kangourou.',
    price: 50,
    image: '/images/07.PNG',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'hoodie-bleu-blanc',
    name: 'Hoodie IMPACT — Bleu roi, logo blanc',
    description:
      'Sweat à capuche bleu roi, logo IMPACT et ovale « CAMP ADN » en blanc. Coupe ample.',
    price: 50,
    image: '/images/06.PNG',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'hoodie-blanc-degrade',
    name: 'Hoodie IMPACT — Blanc, logo dégradé',
    description:
      'Sweat à capuche blanc, molletonné, avec le logo IMPACT en dégradé rouge à bleu.',
    price: 50,
    image: '/images/08.PNG',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'tee-disciple-noir-degrade',
    name: 'T-shirt DISCIPLE — Noir, dégradé',
    description:
      'Impression recto-verso. « DISCIPLE » et sa flamme sur le devant, « à l’image de Christ » en lettres gothiques au dos, dégradé rouge à bleu.',
    price: 30,
    image: '/images/09.PNG',
    imagePosition: 'left',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'tee-disciple-blanc-degrade',
    name: 'T-shirt DISCIPLE — Blanc, dégradé',
    description:
      'La même impression recto-verso sur fond blanc, avec « à l’image de Dieu » au dos. Le dégradé rouge à bleu ressort pleinement.',
    price: 30,
    // image: '/images/10.PNG',
    images: ['/images/10-1.PNG', '/images/10-2.PNG'],
    imagePosition: 'left',
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'tee-disciple-noir-blanc',
    name: 'T-shirt DISCIPLE — Noir, logo blanc',
    description:
      'La version sobre : « DISCIPLE » en blanc sur le devant, « à l’image de Dieu » en gothique blanc au dos.',
    price: 30,
    image: '/images/11.PNG',
    imagePosition: 'left',
    stock: { M: 15, L: 20, XL: 15 },
  },

  // Hoodies DISCIPLE. Deux vues chacun : devant puis dos. Ce sont des
  // photos d'un seul vêtement, donc pas d'`imagePosition` — le recadrage
  // centré convient.
  {
    id: 'hoodie-disciple-blanc',
    name: 'Hoodie DISCIPLE — Blanc',
    description:
      'Sweat à capuche blanc, molletonné, poche kangourou. « DISCIPLE » et sa flamme sur le devant, « à l’image de Dieu » en lettres gothiques au dos, dégradé rouge à bleu.',
    price: 50,
    images: ['/images/12-1.jpeg', '/images/12-2.jpeg'],
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'hoodie-disciple-gris',
    name: 'Hoodie DISCIPLE — Gris chiné',
    description:
      'La même pièce en gris chiné. Le dégradé rouge à bleu ressort avec plus de contraste sur ce fond clair.',
    price: 50,
    // Le fichier 13-1 montre le dos : on place le devant en premier pour
    // que la vignette de la boutique reste cohérente avec les autres.
    images: ['/images/13-2.jpeg', '/images/13-1.jpeg'],
    stock: { M: 15, L: 20, XL: 15 },
  },
  {
    id: 'hoodie-disciple-noir',
    name: 'Hoodie DISCIPLE — Noir',
    description:
      'Sweat à capuche noir. « DISCIPLE » sur le devant et « à l’image de Dieu » au dos, où le dégradé rouge à bleu éclate sur le fond sombre.',
    price: 50,
    images: ['/images/14-1.jpeg', '/images/14-2.jpeg'],
    stock: { M: 15, L: 20, XL: 15 },
  },

  {
    id: 'tote-disciple',
    name: 'Tote bag DISCIPLE',
    description:
      'Sac fourre-tout en toile blanche, anses longues. « DISCIPLE » imprimé en grand, dégradé rouge à bleu.',
    price: 12,
    image: '/images/tote-bag.jpeg',
    stock: { Unique: 30 },
  },
];
