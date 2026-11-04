import type { RouteColor } from './routes';
import type { BrandAssetId } from './brand-assets';

/**
 * Contenus de la maquette « Après la voie ». Les salles, les profils et les
 * compteurs sont des exemples fictifs, étiquetés comme tels dans le site.
 */

export interface Flavor {
  id: 'gingembre-curcuma' | 'framboise-grenade' | 'passion-goji' | 'mangue-citron-vert';
  name: string;
  short: string;
  route: RouteColor;
  /** couleurs du liquide (teinte réaliste du parfum) */
  liquid: string;
  deep: string;
  foam: string;
  /** notes de goût (descriptions, aucune promesse) */
  notes: string[];
  bottleAsset: BrandAssetId;
  labelAsset: BrandAssetId;
}

export const FLAVORS: Flavor[] = [
  {
    id: 'gingembre-curcuma',
    name: 'Gingembre-curcuma',
    short: 'Gingembre',
    route: 'yellow',
    liquid: '#D9930F',
    deep: '#7A4304',
    foam: '#F6D88C',
    notes: ['Gingembre vif', 'Curcuma doux', 'Finale épicée'],
    bottleAsset: 'bouteilleGingembre',
    labelAsset: 'etiquetteGingembre',
  },
  {
    id: 'framboise-grenade',
    name: 'Framboise-grenade',
    short: 'Framboise',
    route: 'pink',
    liquid: '#B81E4F',
    deep: '#4E0A21',
    foam: '#F4A5BF',
    notes: ['Framboise acidulée', 'Grenade profonde', 'Finale fruitée'],
    bottleAsset: 'bouteilleFramboise',
    labelAsset: 'etiquetteFramboise',
  },
  {
    id: 'passion-goji',
    name: 'Passion-goji',
    short: 'Passion',
    route: 'blue',
    liquid: '#E2552B',
    deep: '#7C2109',
    foam: '#FFC4A0',
    notes: ['Fruit de la passion tonique', 'Goji tout en rondeur'],
    bottleAsset: 'bouteillePassion',
    labelAsset: 'etiquettePassion',
  },
  {
    id: 'mangue-citron-vert',
    name: 'Mangue-citron vert',
    short: 'Mangue',
    route: 'orange',
    liquid: '#E7BE34',
    deep: '#8A6A08',
    foam: '#FFF1B5',
    notes: ['Mangue ronde', 'Citron vert qui pique', 'Finale fraîche'],
    bottleAsset: 'bouteilleMangue',
    labelAsset: 'etiquetteMangue',
  },
];

export const PRODUCT_MENTIONS = ['Bio', 'Vivant', 'Non pasteurisé', '33 cl'];

/** Les 3 shots : présentés par leurs parfums uniquement (à renseigner). */
export const SHOTS: { id: string; flavor: string | null; color: string }[] = [
  { id: 'shot-1', flavor: null, color: '#F2B705' },
  { id: 'shot-2', flavor: null, color: '#E64980' },
  { id: 'shot-3', flavor: null, color: '#5C7CFA' },
];

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
    text: 'Une alternative à la bière, avec du goût, pour finir la séance ensemble.',
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
  flavors: Flavor['id'][];
  voieDuMois: string;
}

export const GYMS: Gym[] = [
  { id: 'g1', name: 'Bloc Mansarde', city: 'Rennes', lonlat: [-1.66, 48.12], route: 'yellow', hours: 'Lun-dim · 10 h-23 h', flavors: ['gingembre-curcuma', 'framboise-grenade', 'mangue-citron-vert'], voieDuMois: 'Jaune · 6a+' },
  { id: 'g2', name: 'La Réglette du Port', city: 'Vannes', lonlat: [-2.74, 47.66], route: 'blue', hours: 'Lun-sam · 12 h-22 h', flavors: ['passion-goji', 'gingembre-curcuma'], voieDuMois: 'Bleue · 5c' },
  { id: 'g3', name: 'Dièdre Mayenne', city: 'Laval', lonlat: [-0.76, 48.08], route: 'pink', hours: 'Mar-dim · 11 h-22 h', flavors: ['framboise-grenade', 'passion-goji'], voieDuMois: 'Rose · 6b' },
  { id: 'g4', name: 'Halle aux Arêtes', city: 'Tours', lonlat: [0.7, 47.39], route: 'orange', hours: 'Lun-dim · 9 h-23 h', flavors: ['mangue-citron-vert', 'gingembre-curcuma', 'framboise-grenade'], voieDuMois: 'Orange · 6a' },
  { id: 'g5', name: 'Le Pan Normand', city: 'Caen', lonlat: [-0.36, 49.18], route: 'yellow', hours: 'Lun-ven · 12 h-23 h', flavors: ['gingembre-curcuma', 'passion-goji', 'mangue-citron-vert'], voieDuMois: 'Jaune · 6c' },
  { id: 'g6', name: 'Bloc des Remparts', city: 'Saint-Malo', lonlat: [-2.0, 48.64], route: 'pink', hours: 'Lun-dim · 10 h-21 h', flavors: ['framboise-grenade', 'mangue-citron-vert'], voieDuMois: 'Rose · 5b' },
  { id: 'g7', name: 'Prise Atlantique', city: 'Nantes', lonlat: [-1.55, 47.22], route: 'blue', hours: 'Lun-dim · 10 h-23 h', flavors: ['passion-goji', 'gingembre-curcuma', 'framboise-grenade', 'mangue-citron-vert'], voieDuMois: 'Bleue · 6b+' },
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
    flavor: 'mangue-citron-vert' as const,
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
    flavor: 'gingembre-curcuma' as const,
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
    flavor: 'framboise-grenade' as const,
    moment: 'Avant de grimper',
    text: 'Elle passe entre midi et deux : un shot à l’accueil, quarante minutes de bloc, retour au bureau.',
  },
];

export const FAQ = [
  {
    q: 'C’est quoi, le kombucha ?',
    a: 'Une boisson fermentée à base de thé infusé et sucré. Une culture de levures et de bactéries transforme le sucre pendant la fermentation, ce qui donne une boisson légèrement pétillante et acidulée.',
  },
  {
    q: 'Il y a de l’alcool dedans ?',
    a: 'La fermentation produit naturellement des traces d’alcool, en très faible quantité. C’est pour ça qu’on parle d’alternative à la bière plutôt que de boisson « sans alcool ».',
  },
  {
    q: 'Et de la caféine ?',
    a: 'Oui. Le kombucha est fait à partir de thé : il en garde un peu de caféine, en quantité variable selon le thé utilisé et la fermentation.',
  },
  {
    q: 'Pourquoi le garder au frais ?',
    a: 'C’est un produit vivant et non pasteurisé. Le froid ralentit la fermentation et garde le goût stable jusqu’à l’ouverture.',
  },
  {
    q: 'Où le trouver ?',
    a: 'Au bar des salles partenaires, et en France chez Carrefour, Leclerc et Decathlon Pro.',
  },
];
