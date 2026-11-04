/**
 * Formatage des nombres à la française : espace fine insécable pour les
 * milliers, virgule décimale, vrai signe moins.
 */
const NNBSP = ' '; // espace fine insécable (milliers)
const NBSP = ' '; // espace insécable (avant €, %)
const MINUS = '−';

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
}

/** Nombre avec `decimals` décimales, séparateurs français. */
export function fmtNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '∞';
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const out = groupThousands(int) + (dec ? ',' + dec : '');
  return (negative && Number(fixed) !== 0 ? MINUS : '') + out;
}

export function fmtInt(value: number): string {
  return fmtNumber(Math.round(value), 0);
}

/** Montant en euros. `signed` ajoute + devant les valeurs positives. */
export function fmtEuro(value: number, { decimals = 0, signed = false }: { decimals?: number; signed?: boolean } = {}): string {
  const base = fmtNumber(value, decimals);
  const plus = signed && Math.round(value * 10 ** decimals) > 0 ? '+' : '';
  return `${plus}${base}${NBSP}€`;
}

export function fmtPct(value: number, decimals = 0): string {
  return `${fmtNumber(value, decimals)}${NBSP}%`;
}

/** Note sur 5 avec deux décimales : 4,15. */
export function fmtScore(value: number): string {
  return fmtNumber(value, 2);
}

/** Prix unitaire : 1,80 €. */
export function fmtPrice(value: number): string {
  return fmtEuro(value, { decimals: 2 });
}

export const TYPO = { NNBSP, NBSP, MINUS };
