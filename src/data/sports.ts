import type { RouteColor } from './routes';

/**
 * Matrice des 16 sports : 4 pôles, 6 critères notés de 1 à 5.
 * Notes : notation de l'équipe (voir src/data/sources.ts, HYPOTHESES).
 */
export type PoleId = 'collectifs' | 'individuel' | 'glisse' | 'bienetre';

export interface Pole {
  id: PoleId;
  label: string;
  route: RouteColor;
}

export const POLES: Pole[] = [
  { id: 'collectifs', label: 'Collectifs', route: 'orange' },
  { id: 'individuel', label: 'Individuel / athlétique', route: 'blue' },
  { id: 'glisse', label: 'Glisse / nature', route: 'yellow' },
  { id: 'bienetre', label: 'Bien-être / artistique', route: 'pink' },
];

export const POLE_BY_ID = Object.fromEntries(POLES.map((p) => [p.id, p])) as Record<PoleId, Pole>;

export interface Criterion {
  id: 'volume' | 'affinite' | 'moments' | 'acces' | 'cible' | 'fraiche';
  label: string;
  question: string;
}

/** Ordre des notes : [volume, affinité, moments, accès, 35+, fraîche]. */
export const CRITERIA: Criterion[] = [
  { id: 'volume', label: 'Volume', question: 'Combien de pratiquants et de licenciés ? (licences Insee 2025)' },
  { id: 'affinite', label: 'Affinité', question: 'Le récit de la marque, le mental et l’équilibre, y est-il légitime ?' },
  { id: 'moments', label: 'Moments', question: 'Existe-t-il un vrai moment de consommation ?' },
  { id: 'acces', label: 'Accès terrain', question: 'Peut-on installer un point de vente là où l’on pratique ?' },
  { id: 'cible', label: 'Cible 35+', question: 'Les 35 ans et plus y sont-ils nombreux ?' },
  { id: 'fraiche', label: 'Gamme fraîche', question: 'Peut-on y garder et vendre un produit frais ?' },
];

export interface Sport {
  id: string;
  name: string;
  pole: PoleId;
  /** Notes de 1 à 5 dans l'ordre de CRITERIA. */
  notes: [number, number, number, number, number, number];
}

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football', pole: 'collectifs', notes: [4, 2, 4, 5, 2, 4] },
  { id: 'volley', name: 'Volley', pole: 'collectifs', notes: [2, 3, 4, 3, 3, 3] },
  { id: 'basket', name: 'Basket', pole: 'collectifs', notes: [3, 2, 3, 4, 2, 3] },
  { id: 'handball', name: 'Handball', pole: 'collectifs', notes: [3, 2, 3, 4, 2, 3] },

  { id: 'running', name: 'Running / trail', pole: 'individuel', notes: [5, 5, 5, 3, 5, 3] },
  { id: 'triathlon', name: 'Triathlon', pole: 'individuel', notes: [2, 5, 5, 4, 5, 3] },
  { id: 'cyclisme', name: 'Cyclisme', pole: 'individuel', notes: [5, 3, 4, 3, 5, 2] },
  { id: 'natation', name: 'Natation', pole: 'individuel', notes: [5, 3, 2, 3, 3, 2] },

  { id: 'escalade', name: 'Escalade', pole: 'glisse', notes: [3, 5, 5, 4, 3, 5] },
  { id: 'voile', name: 'Voile', pole: 'glisse', notes: [4, 3, 3, 4, 4, 4] },
  { id: 'randonnee', name: 'Randonnée', pole: 'glisse', notes: [5, 4, 2, 3, 5, 1] },
  { id: 'surf', name: 'Surf', pole: 'glisse', notes: [3, 4, 4, 2, 3, 3] },

  { id: 'yoga', name: 'Yoga', pole: 'bienetre', notes: [5, 5, 4, 2, 5, 3] },
  { id: 'pilates', name: 'Pilates', pole: 'bienetre', notes: [3, 4, 4, 3, 4, 4] },
  { id: 'danse', name: 'Danse', pole: 'bienetre', notes: [3, 3, 2, 3, 2, 2] },
  { id: 'gymnastique', name: 'Gymnastique', pole: 'bienetre', notes: [3, 2, 2, 4, 1, 3] },
];

export interface Scenario {
  id: string;
  label: string;
  /** Poids bruts, normalisés à 100 % au calcul. */
  weights: [number, number, number, number, number, number];
}

const SIXTH = 100 / 6;

export const SCENARIOS: Scenario[] = [
  { id: 'nos-poids', label: 'Nos poids', weights: [25, 20, 20, 15, 10, 10] },
  { id: 'egal', label: 'Poids égaux', weights: [SIXTH, SIXTH, SIXTH, SIXTH, SIXTH, SIXTH] },
  { id: 'volume', label: 'Volume +', weights: [40, 15, 15, 10, 10, 10] },
  { id: 'recit', label: 'Récit +', weights: [15, 35, 20, 10, 10, 10] },
  { id: 'acces', label: 'Accès terrain +', weights: [15, 15, 20, 30, 5, 15] },
];

export const BASE_WEIGHTS = SCENARIOS[0].weights;
