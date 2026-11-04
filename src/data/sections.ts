import type { RouteColor } from './routes';

/**
 * Chaque section est une prise de la voie : une couleur et une cotation,
 * de plus en plus dure au fil de la page.
 */
export interface SectionMeta {
  id: string;
  /** Numéro de prise affiché (01, 02...). */
  num: number;
  title: string;
  /** Titre court (cartes de départ, navigation). */
  short: string;
  route: RouteColor;
  /** Cotation française, de plus en plus dure au fil de la page. */
  grade: string;
}

export const CAMPAGNE_SECTIONS: SectionMeta[] = [
  {
    id: 'apres-la-voie',
    num: 0,
    title: 'Après la voie',
    short: 'Accueil',
    route: 'yellow',
    grade: '3c',
  },
  {
    id: 'concept',
    num: 1,
    title: 'Le concept en 3 temps',
    short: 'Le concept',
    route: 'pink',
    grade: '4b',
  },
  {
    id: 'gamme',
    num: 2,
    title: 'La gamme',
    short: 'La gamme',
    route: 'blue',
    grade: '5a',
  },
  {
    id: 'histoire',
    num: 3,
    title: 'L’histoire',
    short: 'L’histoire',
    route: 'orange',
    grade: '5c',
  },
  {
    id: 'salles',
    num: 4,
    title: 'Trouver une salle',
    short: 'Les salles',
    route: 'yellow',
    grade: '6a',
  },
  {
    id: 'voie-du-mois',
    num: 5,
    title: 'La voie du mois',
    short: 'Voie du mois',
    route: 'pink',
    grade: '6a+',
  },
  {
    id: 'grimpeurs',
    num: 6,
    title: 'Ils en boivent',
    short: 'Ils en boivent',
    route: 'blue',
    grade: '6b',
  },
  {
    id: 'pour-les-salles',
    num: 7,
    title: 'Pour les salles',
    short: 'Pour les salles',
    route: 'orange',
    grade: '6b+',
  },
  {
    id: 'faq',
    num: 8,
    title: 'Questions fréquentes',
    short: 'FAQ',
    route: 'yellow',
    grade: '6c',
  },
];
