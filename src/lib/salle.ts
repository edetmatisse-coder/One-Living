/**
 * Marge hors taxes d'une salle partenaire sur le kombucha vendu au bar.
 * Le prix de revente est TTC (ce que paie le grimpeur) : on en retire la TVA
 * (10 % pour une boisson sans alcool consommée sur place) pour obtenir le prix
 * HT, puis on soustrait le prix de cession, déjà HT.
 * Calcul en centimes pour éviter les erreurs d'arrondi :
 * 3,50 € TTC / 1,10 = 3,18 € HT ; 3,18 − 1,80 = 1,38 € HT.
 */
export interface SalleInputs {
  /** jours d'ouverture par an */
  jours: number;
  /** passages par jour */
  passages: number;
  /** taux de prise, en % des passages */
  tauxPct: number;
  /** prix de cession de One Living à la salle (€ HT) */
  cession: number;
  /** prix de revente au grimpeur (€ TTC) */
  revente: number;
  /** TVA sur la revente (%) : 10 % sur place */
  tvaPct: number;
}

const cents = (euros: number) => Math.round(euros * 100);

/** Prix de revente HT, en centimes, arrondi au centime. */
const reventeHTCents = (s: SalleInputs) => Math.round((cents(s.revente) * 100) / (100 + s.tvaPct));

export function bouteillesParAn(s: SalleInputs): number {
  return Math.round((s.jours * s.passages * s.tauxPct) / 100);
}

/** Prix de revente au bar, hors taxes (€). */
export function reventeHT(s: SalleInputs): number {
  return reventeHTCents(s) / 100;
}

/** Marge HT de la salle par bouteille (€). */
export function margeUnitaire(s: SalleInputs): number {
  return (reventeHTCents(s) - cents(s.cession)) / 100;
}

/** Marge HT de la salle sur l'année (€). */
export function margeAnnuelle(s: SalleInputs): number {
  return (bouteillesParAn(s) * (reventeHTCents(s) - cents(s.cession))) / 100;
}
