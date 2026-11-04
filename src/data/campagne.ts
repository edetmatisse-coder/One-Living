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
    text: 'La voie est finie, les avant-bras brûlent encore. Une bouteille bien fraîche au bar, et tu refais la voie dans ta tête.',
  },
  {
    id: 'entre',
    label: 'Entre grimpeurs',
    title: 'Le verre de la cordée.',
    text: 'Une canette à partager, l’alternative à la bière avec du goût, pour finir la séance ensemble.',
  },
];

/** Salles partenaires fictives (exemples) sur la carte de l'Ouest. */
export interface Gym {
  id: string;
  name: string;
  city: string;
  lonlat: [number, number];
  route: RouteColor;
  hours: string;
  /** produits du frigo (identifiants de PRODUCTS) */
  flavors: string[];
  voieDuMois: string;
}

export const GYMS: Gym[] = [
  { id: 'g1', name: 'Bloc Mansarde', city: 'Rennes', lonlat: [-1.66, 48.12], route: 'yellow', hours: 'Lun-dim · 10 h-23 h', flavors: ['bouteille-gingembre', 'bouteille-framboise', 'bouteille-mangue'], voieDuMois: 'Jaune · 6a+' },
  { id: 'g2', name: 'La Réglette du Port', city: 'Vannes', lonlat: [-2.74, 47.66], route: 'blue', hours: 'Lun-sam · 12 h-22 h', flavors: ['bouteille-passion', 'bouteille-gingembre'], voieDuMois: 'Bleue · 5c' },
  { id: 'g3', name: 'Dièdre Mayenne', city: 'Laval', lonlat: [-0.76, 48.08], route: 'pink', hours: 'Mar-dim · 11 h-22 h', flavors: ['bouteille-framboise', 'bouteille-passion'], voieDuMois: 'Rose · 6b' },
  { id: 'g4', name: 'Halle aux Arêtes', city: 'Tours', lonlat: [0.7, 47.39], route: 'orange', hours: 'Lun-dim · 9 h-23 h', flavors: ['bouteille-mangue', 'bouteille-gingembre', 'bouteille-framboise'], voieDuMois: 'Orange · 6a' },
  { id: 'g5', name: 'Le Pan Normand', city: 'Caen', lonlat: [-0.36, 49.18], route: 'yellow', hours: 'Lun-ven · 12 h-23 h', flavors: ['bouteille-gingembre', 'bouteille-passion', 'bouteille-mangue'], voieDuMois: 'Jaune · 6c' },
  { id: 'g6', name: 'Bloc des Remparts', city: 'Saint-Malo', lonlat: [-2.0, 48.64], route: 'pink', hours: 'Lun-dim · 10 h-21 h', flavors: ['bouteille-framboise', 'bouteille-mangue'], voieDuMois: 'Rose · 5b' },
  { id: 'g7', name: 'Prise Atlantique', city: 'Nantes', lonlat: [-1.55, 47.22], route: 'blue', hours: 'Lun-dim · 10 h-23 h', flavors: ['bouteille-passion', 'bouteille-gingembre', 'bouteille-framboise', 'bouteille-mangue'], voieDuMois: 'Bleue · 6b+' },
];

/** Profils fictifs (exemples), tous dans la cible des 35 ans et plus. */
export const CLIMBERS = [
  {
    id: 'claire',
    name: 'Claire',
    age: 52,
    city: 'Caen',
    level: '5c',
    since: 'Reprise il y a deux ans',
    flavor: 'bouteille-mangue',
    moment: 'Entre grimpeurs',
    text: 'Elle grimpe le mardi soir avec sa fille et garde la fin de séance pour le bar.',
  },
  {
    id: 'malik',
    name: 'Malik',
    age: 41,
    city: 'Rennes',
    level: '6c+',
    since: 'Grimpe depuis 15 ans',
    flavor: 'bouteille-gingembre',
    moment: 'Après la voie',
    text: 'Trois séances par semaine, en voie. Il refait le mouvement clé une bouteille à la main.',
  },
  {
    id: 'ines',
    name: 'Inès',
    age: 36,
    city: 'Nantes',
    level: '6b',
    since: 'Bloc à la pause déjeuner',
    flavor: 'shot-fraise-citron',
    moment: 'Avant de grimper',
    text: 'Elle passe entre midi et deux : un shot à l’accueil, quarante minutes de bloc, retour au bureau.',
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
    a: 'Au bar des salles partenaires, et en France chez Carrefour, Leclerc et Decathlon Pro.',
  },
];
