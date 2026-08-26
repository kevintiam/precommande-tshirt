// Visuels : public/images/*.PNG
//
// Le stock est par taille : `stock: { M: 15, L: 20, XL: 15 }`.
// Les tailles proposées sont déduites des clés de `stock`, il n'y a donc
// qu'un seul endroit à modifier pour ouvrir ou fermer une taille.
//
// T-SHIRTS : quantités réelles du bon de commande « Commande T-Shirts
// 2026 » — 250 pièces (S 27, M 74, L 86, XL 48, XXL 8, XXXL 7), plus un
// XXL CHRIST Noir ajouté hors bon (voir plus bas), soit 251. Ce sont des
// pièces commandées à l'imprimeur, pas des estimations : on ne peut pas
// en vendre une de plus.
//
// Changer une quantité ICI ne suffit pas : `restant`, ce que la boutique
// vend réellement, n'est jamais réécrit par le fichier. Il faut ensuite
// `npm run stock:realigner`.
//
// XXXXL : absent du bon de commande, donc à 0 sur tous les t-shirts. La
// taille reste ouverte dans le catalogue (barrée en boutique) — il suffit
// d'y mettre une quantité si un tirage la couvre un jour.
//
// ⚠️ HOODIES et TOTE BAG : stocks encore indicatifs (100), en attente de
// leur propre bon de commande.

export const products = [
  {
    id: 'tee-bordeaux-degrade',
    name: 'T-shirt IMPACT — Bordeaux, logo dégradé',
    description:
      'Coupe oversize, col rond côtelé. Logo IMPACT en arche dégradée rouge à bleu, surmontant l’ovale « CAMP ADN ».',
    price: 25,
    image: '/images/01.PNG',
    stock: { S: 8, M: 10, L: 14, XL: 10, XXL: 1, XXXL: 2, XXXXL: 0 },
  },
  {
    id: 'tee-bordeaux-blanc',
    name: 'T-shirt IMPACT — Bordeaux, logo blanc',
    description:
      'La version sobre du t-shirt bordeaux : logo IMPACT et ovale « CAMP ADN » imprimés en blanc.',
    price: 25,
    image: '/images/03.PNG',
    images: ['/images/03.PNG', '/images/02.PNG'],
    stock: { S: 2, M: 15, L: 20, XL: 10, XXL: 2, XXXL: 1, XXXXL: 0 },
  },
  {
    id: 'tee-blanc-degrade',
    name: 'T-shirt IMPACT — Blanc, logo dégradé',
    description:
      'T-shirt blanc coupe oversize. Le dégradé rouge à bleu du logo ressort pleinement sur le fond clair.',
    price: 25,
    image: '/images/05.PNG',
    stock: { S: 0, M: 2, L: 3, XL: 1, XXL: 0, XXXL: 0, XXXXL: 0 },
  },
  {
    id: 'hoodie-bordeaux-degrade',
    name: 'Hoodie IMPACT — Bordeaux, logo dégradé',
    description:
      'Sweat à capuche molletonné, poche kangourou et bords côtelés. Logo IMPACT en dégradé rouge à bleu.',
    price: 45,
    image: '/images/04.PNG',
    stock: { S: 100, M: 100, L: 100, XL: 100, XXL: 100, XXXL: 100, XXXXL: 100 },
  },
  {
    id: 'hoodie-bordeaux-blanc',
    name: 'Hoodie IMPACT — Bordeaux, logo blanc',
    description:
      'Le hoodie bordeaux avec le logo IMPACT imprimé en blanc. Capuche doublée et poche kangourou.',
    price: 45,
    image: '/images/07.PNG',
    stock: { S: 100, M: 100, L: 100, XL: 100, XXL: 100, XXXL: 100, XXXXL: 100 },
  },
  {
    id: 'hoodie-bleu-blanc',
    name: 'Hoodie IMPACT — Bleu roi, logo blanc',
    description:
      'Sweat à capuche bleu roi, logo IMPACT et ovale « CAMP ADN » en blanc. Coupe ample.',
    price: 45,
    image: '/images/06.PNG',
    stock: { S: 100, M: 100, L: 100, XL: 100, XXL: 100, XXXL: 100, XXXXL: 100 },
  },
  {
    id: 'hoodie-blanc-degrade',
    name: 'Hoodie IMPACT — Blanc, logo dégradé',
    description:
      'Sweat à capuche blanc, molletonné, avec le logo IMPACT en dégradé rouge à bleu.',
    price: 45,
    image: '/images/08.PNG',
    stock: { S: 100, M: 100, L: 100, XL: 100, XXL: 100, XXXL: 100, XXXXL: 100 },
  },
  {
    id: 'tee-disciple-noir-degrade',
    name: 'T-shirt DISCIPLE — Noir, dégradé',
    description:
      'Impression recto-verso. « DISCIPLE » et sa flamme sur le devant, « à l’image de Christ » en lettres gothiques au dos, dégradé rouge à bleu.',
    price: 25,
    image: '/images/09.PNG',
    imagePosition: 'left',
    stock: { S: 3, M: 7, L: 11, XL: 5, XXL: 2, XXXL: 2, XXXXL: 0 },
  },
  {
    id: 'tee-disciple-blanc-degrade',
    name: 'T-shirt DISCIPLE — Blanc, dégradé',
    description:
      'La même impression recto-verso sur fond blanc, avec « à l’image de Dieu » au dos. Le dégradé rouge à bleu ressort pleinement.',
    price: 25,
    // image: '/images/10.PNG',
    images: ['/images/10-1.PNG', '/images/10-2.PNG'],
    imagePosition: 'left',
    stock: { S: 4, M: 13, L: 14, XL: 7, XXL: 1, XXXL: 1, XXXXL: 0 },
  },
  {
    id: 'tee-disciple-noir-blanc',
    name: 'T-shirt DISCIPLE — Noir, logo blanc',
    description:
      'La version sobre : « DISCIPLE » en blanc sur le devant, « à l’image de Dieu » en gothique blanc au dos.',
    price: 25,
    image: '/images/11.PNG',
    imagePosition: 'left',
    stock: { S: 3, M: 11, L: 7, XL: 8, XXL: 1, XXXL: 0, XXXXL: 0 },
  },

  // Hoodies DISCIPLE. Deux vues chacun : devant puis dos. Ce sont des
  // photos d'un seul vêtement, donc pas d'`imagePosition` — le recadrage
  // centré convient.
  {
    id: 'hoodie-disciple-blanc',
    name: 'Hoodie DISCIPLE — Blanc',
    description:
      'Sweat à capuche blanc, molletonné, poche kangourou. « DISCIPLE » et sa flamme sur le devant, « à l’image de Dieu » en lettres gothiques au dos, dégradé rouge à bleu.',
    price: 45,
    images: ['/images/12-1.jpeg', '/images/12-2.jpeg'],
    stock: { S: 100, M: 100, L: 100, XL: 100, XXL: 100, XXXL: 100, XXXXL: 100 },
  },
  {
    id: 'hoodie-disciple-gris',
    name: 'Hoodie DISCIPLE — Gris chiné',
    description:
      'La même pièce en gris chiné. Le dégradé rouge à bleu ressort avec plus de contraste sur ce fond clair.',
    price: 45,
    // Le fichier 13-1 montre le dos : on place le devant en premier pour
    // que la vignette de la boutique reste cohérente avec les autres.
    images: ['/images/13-2.jpeg', '/images/13-1.jpeg'],
    stock: { S: 100, M: 100, L: 100, XL: 100, XXL: 100, XXXL: 100, XXXXL: 100 },
  },
  {
    id: 'hoodie-disciple-noir',
    name: 'Hoodie DISCIPLE — Noir',
    description:
      'Sweat à capuche noir. « DISCIPLE » sur le devant et « à l’image de Dieu » au dos, où le dégradé rouge à bleu éclate sur le fond sombre.',
    price: 45,
    images: ['/images/14-1.jpeg', '/images/14-2.jpeg'],
    stock: { S: 100, M: 100, L: 100, XL: 100, XXL: 100, XXXL: 100, XXXXL: 100 },
  },

  // T-shirts « Made to be like Christ » : flamme brodée à la poitrine
  // devant, lettrage calligraphié au dos. Même remarque que les hoodies
  // ci-dessus — deux vues d'un même vêtement, recadrage centré.
  {
    id: 'tee-christ-blanc',
    name: 'T-shirt CHRIST — Blanc',
    description:
      'T-shirt blanc coupe oversize, col rond côtelé. Flamme rouge à bleu sur la poitrine, « Made to be like Christ » calligraphié en grand au dos.',
    price: 25,
    images: ['/images/15-1.jpeg', '/images/15-2.jpeg'],
    stock: { S: 5, M: 14, L: 10, XL: 5, XXL: 1, XXXL: 0, XXXXL: 0 },
  },
  {
    id: 'tee-christ-bleu',
    name: 'T-shirt CHRIST — Bleu roi',
    description:
      'La même pièce en bleu roi. Le lettrage « Made to be like Christ » ressort en orange vif sur le fond profond.',
    price: 25,
    images: ['/images/16-1.jpeg', '/images/16-2.jpeg'],
    stock: { S: 2, M: 1, L: 4, XL: 1, XXL: 0, XXXL: 0, XXXXL: 0 },
  },
  {
    id: 'tee-christ-noir',
    name: 'T-shirt CHRIST — Noir',
    description:
      'La même pièce en noir. La flamme et le lettrage « Made to be like Christ » ressortent en dégradé rouge à orange sur le fond sombre.',
    price: 25,
    // Le fichier 17-1 montre le dos : on place le devant en premier,
    // comme pour les hoodies DISCIPLE ci-dessus.
    images: ['/images/17-2.PNG', '/images/17-1.PNG'],
    // XXL à 1 et non 0 comme au bon : une pièce est déjà partie dans une
    // commande payée. Le bon passe donc à 251 — l'imprimeur est prévenu.
    stock: { S: 0, M: 1, L: 3, XL: 1, XXL: 1, XXXL: 1, XXXXL: 0 },
  },

  {
    id: 'tote-disciple',
    name: 'Tote bag DISCIPLE',
    description:
      'Sac fourre-tout en toile blanche, anses longues. « DISCIPLE » imprimé en grand, dégradé rouge à bleu.',
    price: 10,
    image: '/images/tote-bag.jpeg',
    stock: { Unique: 100 },
  },
];
