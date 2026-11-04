/**
 * Marge d'une salle partenaire sur le kombucha vendu au bar.
 * Calcul en centimes pour éviter les erreurs d'arrondi (3,50 − 1,80 = 1,70).
 */
export interface SalleInputs {
  /** jours d'ouverture par an */
  jours: number;
  /** passages par jour */
  passages: number;
  /** taux de prise, en % des passages */
  tauxPct: number;
  /** prix de cession de One Living à la salle (€) */
  cession: number;
  /** prix de revente au grimpeur (€) */
  revente: number;
}

const cents = (euros: number) => Math.round(euros * 100);

export function bouteillesParAn(s: SalleInputs): number {
  return Math.round((s.jours * s.passages * s.tauxPct) / 100);
}

/** Marge de la salle par bouteille (€). */
export function margeUnitaire(s: SalleInputs): number {
  return (cents(s.revente) - cents(s.cession)) / 100;
}

/** Marge de la salle sur l'année (€). */
export function margeAnnuelle(s: SalleInputs): number {
  return (bouteillesParAn(s) * (cents(s.revente) - cents(s.cession))) / 100;
}
