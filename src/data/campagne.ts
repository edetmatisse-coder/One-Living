import type { RouteColor } from './routes';

/**
 * Contenus de la maquette « Après la voie ». Les salles, les profils et les
 * compteurs sont des exemples fictifs, étiquetés comme tels dans le site.
 */

export type FormatId = 'bouteille' | 'canette' | 'shot';

export interface Format {
  id: FormatId;
  label: string;
  volume: string;
  /** gamme telle que vendue par One Living */
  range: string;
  /** mentions factuelles, reprises des étiquettes (aucune promesse santé) */
  mentions: string[];
  /** le moment de la campagne auquel ce format répond */
  moment: string;
}

export const FORMATS: Format[] = [
  { id: 'bouteille', label: 'Bouteille', volume: '33 cl', range: 'Kombucha bio', mentions: ['Bio', 'Vivant', 'Non pasteurisé', '33 cl'], moment: 'Après la voie' },
  { id: 'canette', label: 'Canette', volume: '25 cl', range: 'Kombucha sans sucres', mentions: ['Sans sucres', 'Vivant', '25 cl'], moment: 'Entre grimpeurs' },
  { id: 'shot', label: 'Shot', volume: '10 cl', range: 'Shots', mentions: ['Petit format', '10 cl'], moment: 'Avant de grimper' },
];

export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map((f) => [f.id, f])) as Record<FormatId, Format>;

/**
 * La gamme réelle de One Living (oneliving.com). Les visuels sont dans
 * public/brand/produits/<id>.jpg et <id>-etiquette.webp. Les shots sont
 * présentés par leur parfum uniquement.
 */
export interface Product {
  id: string;
  format: FormatId;
  /** parfum, en français */
  name: string;
  short: string;
  /** ce qui est écrit sur l'étiquette */
  printed: string;
  route: RouteColor;
  /** notes de goût (descriptions, aucune promesse) */
  notes: string[];
}

export const PRODUCTS: Product[] = [
  { id: 'bouteille-gingembre', format: 'bouteille', name: 'Gingembre-curcuma', short: 'Gingembre', printed: 'Ginger & Turmeric', route: 'yellow', notes: ['Net', 'Vif', 'Chaleureux'] },
  { id: 'bouteille-framboise', format: 'bouteille', name: 'Framboise-grenade', short: 'Framboise', printed: 'Raspberry & Pomegranate', route: 'pink', notes: ['Doux', 'Acidulé', 'Rafraîchissant'] },
  { id: 'bouteille-passion', format: 'bouteille', name: 'Passion-goji', short: 'Passion', printed: 'Passion Fruit & Goji', route: 'blue', notes: ['Floral', 'Doux', 'Acidulé'] },
  { id: 'bouteille-mangue', format: 'bouteille', name: 'Mangue-citron vert', short: 'Mangue', printed: 'Mango & Lime', route: 'orange', notes: ['Gourmand', 'Zesté', 'Tropical'] },
  { id: 'canette-gingembre', format: 'canette', name: 'Gingembre-curcuma', short: 'Gingembre', printed: 'Ginger Kombucha with Turmeric', route: 'yellow', notes: ['Gingembre qui réchauffe', 'Pointe de curcuma', 'Légèrement pétillant'] },
  { id: 'canette-framboise', format: 'canette', name: 'Framboise-grenade', short: 'Framboise', printed: 'Raspberry Kombucha with Pomegranate', route: 'pink', notes: ['Framboise fruitée', 'Grenade', 'Hibiscus'] },
  { id: 'canette-passion', format: 'canette', name: 'Passion-goji', short: 'Passion', printed: 'Passion Fruit Kombucha with Goji', route: 'blue', notes: ['Fruit de la passion', 'Baie de goji', 'Tropical'] },
  { id: 'shot-tropical', format: 'shot', name: 'Tropical', short: 'Tropical', printed: 'Tropical Boost', route: 'orange', notes: ['Ananas', 'Banane', 'Mangue', 'Passion'] },
  { id: 'shot-fraise-citron', format: 'shot', name: 'Fraise-citron', short: 'Fraise', printed: 'Strawberry Lemon', route: 'pink', notes: ['Fraise', 'Citron', 'Vinaigre de cidre'] },
  { id: 'shot-agrumes-gingembre', format: 'shot', name: 'Agrumes-gingembre', short: 'Agrumes', printed: 'Citrus Ginger', route: 'yellow', notes: ['Cinq agrumes', 'Gingembre', 'Curcuma'] },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;

export const productImage = (id: string) => `/brand/produits/${id}.jpg`;
export const productLabel = (id: string) => `/brand/produits/${id}-etiquette.webp`;

/** Salle type des exemples (hypothèses de travail, à confirmer avec One Living). */
export const SALLE_TYPE = { jours: 330, passages: 150, tauxPct: 3, cession: 1.8, revente: 3.5 };

/** Le concept en 3 temps (ton de la campagne : tutoiement). */
export const TEMPS = [
  {
    id: 'avant',
    label: 'Avant de grimper',
    title: 'Un shot, et tu chausses.',
    text: 'Le petit format à prendre à l’accueil, le temps de lacer tes chaussons.',
  },
  {
    id: 'apres',
    label: 'Après la voie',
    title: 'Tu souffles. Tu trinques.',
    text: 'La voie est finie, les avant-bras brûlent encore. Une bouteille bien fraîche au bar B’Wall, et tu refais la voie dans ta tête.',
  },
  {
    id: 'entre',
    label: 'Entre grimpeurs',
    title: 'Le verre de la cordée.',
    text: 'Une canette à partager, l’alternative à la bière avec du goût, pour finir la séance ensemble.',
  },
];

/**
 * Les salles B'Wall (Bretagne sud), partenaire de la campagne : partenariat
 * imaginé pour le projet, B'Wall n'est pas engagé. Adresses, horaires et
 * chiffres repris de b-wall.fr. Le frigo, les boissons proposées et la voie
 * du mois sont des exemples.
 */
export interface Gym {
  id: 'quimper' | 'lanester' | 'vannes';
  name: string;
  city: string;
  address: string;
  lonlat: [number, number];
  /** photo de b-wall.fr */
  photo: string;
  photoLabel: string;
  /** chiffres clés de la salle (b-wall.fr) */
  facts: string[];
  url: string;
  /** boissons proposées au frigo (identifiants de PRODUCTS), exemple */
  flavors: string[];
  /** exemple */
  voieDuMois: string;
}

/** Horaires communs aux trois salles (b-wall.fr, page contact). */
export const GYM_HOURS = 'Du lundi au vendredi 10 h-23 h, le week-end et les jours fériés 9 h-20 h';

export const GYMS: Gym[] = [
  {
    id: 'lanester',
    name: 'B’Wall Lorient',
    city: 'Lanester, près de Lorient',
    address: '482 route de Kerviec, 56600 Lanester',
    lonlat: [-3.32, 47.775],
    photo: '/brand/bwall/lorient.jpg',
    photoLabel: 'L’espace détente de B’Wall Lorient',
    facts: ['2 300 m² au sol', '175 m de bloc', '41 lignes de corde', '130 voies jusqu’à 9 m'],
    url: 'https://www.b-wall.fr/salle-escalade/lorient/',
    flavors: ['bouteille-gingembre', 'bouteille-framboise', 'canette-passion', 'shot-agrumes-gingembre'],
    voieDuMois: 'Jaune · 6a+',
  },
  {
    id: 'vannes',
    name: 'B’Wall Vannes',
    city: 'Vannes, face au golfe du Morbihan',
    address: '15 rue Daniel Gilard, 56000 Vannes',
    lonlat: [-2.75, 47.643],
    photo: '/brand/bwall/vannes.jpg',
    photoLabel: 'Le bar de B’Wall Vannes',
    facts: ['1 900 m² sur 3 niveaux', '170 m de bloc', '42 lignes de corde', 'Voies jusqu’à 15 m'],
    url: 'https://www.b-wall.fr/salle-escalade/vannes/',
    flavors: ['bouteille-mangue', 'canette-framboise', 'canette-gingembre', 'shot-tropical'],
    voieDuMois: 'Rose · 6b',
  },
  {
    id: 'quimper',
    name: 'B’Wall Quimper',
    city: 'Quimper',
    address: '52 avenue de Kéradennec, 29000 Quimper',
    lonlat: [-4.12, 48.01],
    photo: '/brand/bwall/quimper.jpg',
    photoLabel: 'Ouverture de B’Wall Quimper, le 3 octobre 2026',
    facts: ['1 700 m² au sol', '130 m de bloc', '40 lignes de corde', 'Voies jusqu’à 13 m'],
    url: 'https://www.b-wall.fr/salle-escalade/quimper/',
    flavors: ['bouteille-passion', 'bouteille-gingembre', 'canette-framboise', 'shot-fraise-citron'],
    voieDuMois: 'Bleue · 5c',
  },
];

export const GYM_BY_ID = Object.fromEntries(GYMS.map((g) => [g.id, g])) as Record<Gym['id'], Gym>;

/**
 * Trois buveurs de kombucha, profils fictifs (exemples), tous dans la cible
 * des 35 ans et plus. Pas forcément grimpeurs : la salle est aussi un lieu
 * où l'on accompagne, où l'on attend, où l'on se retrouve.
 */
export const DRINKERS = [
  {
    id: 'claire',
    name: 'Claire',
    age: 52,
    gym: 'vannes' as const,
    profile: 'Grimpe en bloc le mardi soir',
    since: 'Kombucha depuis 2019',
    drink: 'canette-framboise',
    moment: 'Entre grimpeurs',
    text: 'Elle grimpe avec sa fille, puis elles partagent une canette au bar. Sans sucres, avec du goût : c’est devenu leur rituel de fin de séance.',
  },
  {
    id: 'malik',
    name: 'Malik',
    age: 44,
    gym: 'lanester' as const,
    profile: 'Ne grimpe pas',
    since: 'Kombucha depuis 2022',
    drink: 'bouteille-gingembre',
    moment: 'Après la voie',
    text: 'Le mercredi, il accompagne ses deux enfants au cours d’escalade. L’entrée est gratuite pour les accompagnants : une heure au bar à les regarder grimper, une bouteille gingembre bien fraîche à la main.',
  },
  {
    id: 'ines',
    name: 'Inès',
    age: 37,
    gym: 'quimper' as const,
    profile: 'Bloc à la pause déjeuner',
    since: 'Kombucha depuis 2021',
    drink: 'shot-agrumes-gingembre',
    moment: 'Avant de grimper',
    text: 'Elle passe entre midi et deux : un shot agrumes-gingembre à l’accueil, quarante minutes de bloc, retour au bureau.',
  },
];

export const FAQ = [
  {
    q: 'C’est quoi, le kombucha ?',
    a: 'Une boisson fermentée à base de thé infusé et sucré. Une culture de levures et de bactéries transforme le sucre pendant la fermentation, ce qui donne une boisson légèrement pétillante et acidulée.',
  },
  {
    q: 'Il y a de l’alcool dedans ?',
    a: 'La fermentation produit naturellement des traces d’alcool, en très faible quantité. C’est pour ça qu’on parle d’alternative à la bière plutôt que de boisson « sans alcool ».',
  },
  {
    q: 'Et de la caféine ?',
    a: 'Oui. Le kombucha est fait à partir de thé : il en garde un peu de caféine, en quantité variable selon le thé utilisé et la fermentation.',
  },
  {
    q: 'Pourquoi le garder au frais ?',
    a: 'C’est un produit vivant et non pasteurisé. Le froid ralentit la fermentation et garde le goût stable jusqu’à l’ouverture.',
  },
  {
    q: 'Où le trouver ?',
    a: 'Dans l’idée de la campagne, au bar des salles B’Wall. En France, One Living est vendu chez Carrefour, Leclerc et Decathlon Pro.',
  },
];
