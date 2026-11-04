/**
 * Modèle économique par point de vente, sur un an.
 * Toutes les valeurs sont des hypothèses de travail, à confirmer avec
 * One Living et notre sondage terrain.
 */
export interface PosInputs {
  /** jours d'ouverture ou de vente par an */
  jours: number;
  /** passages (pratiquants) par jour */
  passages: number;
  /** taux de prise, en % des passages */
  tauxPct: number;
  /** prix de cession de One Living au point de vente (€) */
  cession: number;
  /** prix de revente au pratiquant (€) */
  revente: number;
  /** coût de revient d'une bouteille pour One Living (€) */
  coutRevient: number;
  /** coût d'activation du point de vente sur l'année : froid, PLV, dotation (€) */
  activation: number;
}

export const COUT_REVIENT = 1.0;

export interface Finalist extends PosInputs {
  id: 'football' | 'running' | 'escalade' | 'yoga';
  sport: string;
  lieu: string;
  activationLabel: string;
}

export const FINALISTS: Finalist[] = [
  {
    id: 'football',
    sport: 'Football',
    lieu: 'Buvette de club',
    jours: 30,
    passages: 120,
    tauxPct: 10,
    cession: 1.5,
    revente: 2.5,
    coutRevient: COUT_REVIENT,
    activation: 510,
    activationLabel: 'activation et froid',
  },
  {
    id: 'running',
    sport: 'Running',
    lieu: 'Un événement',
    jours: 1,
    passages: 1000,
    tauxPct: 20,
    cession: 1.8,
    revente: 3.0,
    coutRevient: COUT_REVIENT,
    activation: 650,
    activationLabel: 'activation et froid',
  },
  {
    id: 'escalade',
    sport: 'Escalade',
    lieu: 'Salle, au bar',
    jours: 330,
    passages: 150,
    tauxPct: 3,
    cession: 1.8,
    revente: 3.5,
    coutRevient: COUT_REVIENT,
    activation: 150,
    activationLabel: 'activation et froid',
  },
  {
    id: 'yoga',
    sport: 'Yoga',
    lieu: 'Studio',
    jours: 300,
    passages: 60,
    tauxPct: 4,
    cession: 1.8,
    revente: 3.5,
    coutRevient: COUT_REVIENT,
    activation: 440,
    activationLabel: 'activation et froid',
  },
];

/* ------------------------------------------------------------------ */
/* Note économique sur 7 critères                                       */
/* ------------------------------------------------------------------ */

export const ECO_CRITERIA = [
  { id: 'volume', label: 'Volume', weight: 25 },
  { id: 'marge', label: 'Marge', weight: 20 },
  { id: 'activation', label: 'Coût d’activation', weight: 15 },
  { id: 'seuil', label: 'Seuil', weight: 15 },
  { id: 'regularite', label: 'Régularité', weight: 10 },
  { id: 'moment', label: 'Moment prouvé', weight: 10 },
  { id: 'national', label: 'Potentiel national', weight: 5 },
] as const;

export type EcoNotes = [number, number, number, number, number, number, number];

export const ECO_NOTES: Record<Finalist['id'], EcoNotes> = {
  escalade: [5, 5, 5, 5, 5, 5, 3],
  yoga: [3, 5, 3, 3, 4, 3, 3],
  football: [2, 2, 3, 1, 3, 4, 5],
  running: [1, 4, 2, 2, 1, 3, 5],
};

export interface EcoWeightSet {
  id: string;
  label: string;
  weights: EcoNotes;
}

/**
 * Les 5 jeux de pondérations testés. Le premier est celui du dossier ;
 * les quatre autres sont des tests de robustesse définis par l'équipe.
 */
export const ECO_WEIGHT_SETS: EcoWeightSet[] = [
  { id: 'nos-poids', label: 'Nos poids', weights: [25, 20, 15, 15, 10, 10, 5] },
  { id: 'egal', label: 'Poids égaux', weights: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'volume', label: 'Volume +', weights: [40, 15, 10, 10, 10, 10, 5] },
  { id: 'rentabilite', label: 'Rentabilité +', weights: [15, 30, 10, 25, 10, 5, 5] },
  { id: 'national', label: 'National +', weights: [20, 15, 10, 10, 10, 10, 25] },
];

/* ------------------------------------------------------------------ */
/* Potentiel national et simulateur                                     */
/* ------------------------------------------------------------------ */

export const NATIONAL = {
  sallesPrivees: 291,
  anneeSalles: 2025,
  structuresFFME: 1070,
};

export interface SimPreset {
  id: 'salle-type' | 'prudent' | 'grande';
  label: string;
  inputs: PosInputs;
}

const SALLE_TYPE: PosInputs = {
  jours: 330,
  passages: 150,
  tauxPct: 3,
  cession: 1.8,
  revente: 3.5,
  coutRevient: COUT_REVIENT,
  activation: 150,
};

export const SIM_PRESETS: SimPreset[] = [
  { id: 'salle-type', label: 'Salle type', inputs: SALLE_TYPE },
  { id: 'prudent', label: 'Scénario prudent (taux ÷ 2)', inputs: { ...SALLE_TYPE, tauxPct: SALLE_TYPE.tauxPct / 2 } },
  { id: 'grande', label: 'Grande salle', inputs: { ...SALLE_TYPE, jours: 350, passages: 400, activation: 300 } },
];

/** Bornes des curseurs du simulateur. */
export const SIM_FIELDS: {
  key: keyof PosInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: 'jours' | 'passages' | '%' | '€';
  decimals: number;
}[] = [
  { key: 'jours', label: 'Jours d’ouverture', min: 30, max: 365, step: 1, unit: 'jours', decimals: 0 },
  { key: 'passages', label: 'Passages par jour', min: 20, max: 800, step: 5, unit: 'passages', decimals: 0 },
  { key: 'tauxPct', label: 'Taux de prise', min: 0.5, max: 12, step: 0.5, unit: '%', decimals: 1 },
  { key: 'cession', label: 'Prix de cession', min: 1, max: 3, step: 0.05, unit: '€', decimals: 2 },
  { key: 'revente', label: 'Prix de revente', min: 1.5, max: 5, step: 0.1, unit: '€', decimals: 2 },
  { key: 'coutRevient', label: 'Coût de revient', min: 0.5, max: 2, step: 0.05, unit: '€', decimals: 2 },
  { key: 'activation', label: 'Coût d’activation', min: 0, max: 1500, step: 10, unit: '€', decimals: 0 },
];
