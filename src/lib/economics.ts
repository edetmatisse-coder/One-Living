import { ECO_CRITERIA, NATIONAL, type PosInputs } from '@/data/economics';

/**
 * Modèle économique par point de vente, sur un an.
 *   bouteilles   = jours × passages × taux
 *   contribution = bouteilles × (cession − coût de revient) − activation
 *   seuil        = arrondi supérieur de activation ÷ (cession − coût de revient)
 * Les montants sont calculés en centimes pour éviter les erreurs d'arrondi.
 */

const cents = (euros: number) => Math.round(euros * 100);

export function bottlesPerYear(i: PosInputs): number {
  // taux en % : on garde des entiers aussi longtemps que possible
  return Math.round((i.jours * i.passages * Math.round(i.tauxPct * 1000)) / 100000);
}

/** Marge unitaire de One Living (cession − coût de revient), en centimes. */
export function unitMarginCents(i: PosInputs): number {
  return cents(i.cession) - cents(i.coutRevient);
}

/** Chiffre d'affaires de cession (ce que la salle paie à One Living). */
export function revenueCession(i: PosInputs): number {
  return (bottlesPerYear(i) * cents(i.cession)) / 100;
}

/** Marge de la salle : revente − cession, sur toutes les bouteilles. */
export function margeSalle(i: PosInputs): number {
  return (bottlesPerYear(i) * (cents(i.revente) - cents(i.cession))) / 100;
}

/** Marge de la salle par bouteille. */
export function margeSalleUnitaire(i: PosInputs): number {
  return (cents(i.revente) - cents(i.cession)) / 100;
}

/** Contribution de One Living après coût d'activation. */
export function contribution(i: PosInputs): number {
  return (bottlesPerYear(i) * unitMarginCents(i) - cents(i.activation)) / 100;
}

/** Nombre de bouteilles pour couvrir l'activation (Infinity si la marge est nulle ou négative). */
export function breakEven(i: PosInputs): number {
  const m = unitMarginCents(i);
  if (m <= 0) return Infinity;
  return Math.ceil(cents(i.activation) / m);
}

export interface Simulation {
  bottles: number;
  revenue: number;
  margeSalle: number;
  contribution: number;
  breakEven: number;
  /** bouteilles vendues ÷ seuil (≥ 1 : rentable) */
  ratio: number;
}

export function simulate(i: PosInputs): Simulation {
  const bottles = bottlesPerYear(i);
  const be = breakEven(i);
  return {
    bottles,
    revenue: revenueCession(i),
    margeSalle: margeSalle(i),
    contribution: contribution(i),
    breakEven: be,
    ratio: be === 0 ? Infinity : bottles / be,
  };
}

/**
 * Position de la jauge, de 0 (rouge) à 1 (vert), 0,5 au seuil.
 * Échelle logarithmique : ÷ 4 du seuil = 0, × 4 du seuil = 1.
 */
export function gaugePosition(sim: Simulation): number {
  if (!Number.isFinite(sim.breakEven)) return 0;
  if (sim.breakEven === 0) return 1;
  if (sim.bottles <= 0) return 0;
  const t = 0.5 + 0.5 * (Math.log(sim.ratio) / Math.log(4));
  return Math.min(1, Math.max(0, t));
}

/* ------------------------------------------------------------------ */
/* Note économique                                                      */
/* ------------------------------------------------------------------ */

export function ecoScore(notes: readonly number[], weights: readonly number[] = ECO_CRITERIA.map((c) => c.weight)): number {
  const sum = weights.reduce((a, b) => a + b, 0);
  const s = notes.reduce((acc, n, k) => acc + n * (weights[k] / sum), 0);
  return Math.round(s * 1e9) / 1e9;
}

/* ------------------------------------------------------------------ */
/* Potentiel national                                                   */
/* ------------------------------------------------------------------ */

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function nationalPotential(i: PosInputs, salles = NATIONAL.sallesPrivees) {
  const bottles = salles * bottlesPerYear(i);
  const revenue = (salles * bottlesPerYear(i) * cents(i.cession)) / 100;
  const contrib = (salles * (bottlesPerYear(i) * unitMarginCents(i) - cents(i.activation))) / 100;
  return {
    salles,
    bottles,
    revenue,
    contribution: contrib,
    /** valeurs arrondies telles qu'affichées (environ) */
    rounded: {
      bottles: roundTo(bottles, 1000),
      revenue: roundTo(revenue, 10000),
      contribution: roundTo(contrib, 10000),
    },
  };
}
