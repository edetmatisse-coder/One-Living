import { POLES, SPORTS, type PoleId, type Sport } from '@/data/sports';

/**
 * Calculs de la matrice des 16 sports.
 * Score = somme des notes pondérées, les poids étant normalisés à 100 %.
 */

export type Weights = readonly number[];

/** Poids normalisés (somme = 1). Tout à zéro : poids égaux. */
export function normalize(weights: Weights): number[] {
  const clean = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const sum = clean.reduce((a, b) => a + b, 0);
  if (sum <= 0) return clean.map(() => 1 / clean.length);
  return clean.map((w) => w / sum);
}

/** Poids affichés en pourcentage (somme = 100). */
export function toPercent(weights: Weights): number[] {
  return normalize(weights).map((w) => w * 100);
}

/** Score sur 5 d'une série de notes pour des poids donnés. */
export function scoreOf(notes: readonly number[], weights: Weights): number {
  const w = normalize(weights);
  const s = notes.reduce((acc, n, i) => acc + n * (w[i] ?? 0), 0);
  // arrondi à 1e-9 pour neutraliser les erreurs de virgule flottante
  return Math.round(s * 1e9) / 1e9;
}

export interface RankedSport extends Sport {
  score: number;
  rank: number;
  poleRank: number;
  poleWinner: boolean;
}

const collator = new Intl.Collator('fr');

/** Classement complet : score décroissant, puis ordre alphabétique en cas d'égalité. */
export function rankSports(weights: Weights, sports: Sport[] = SPORTS): RankedSport[] {
  const scored = sports.map((s) => ({ ...s, score: scoreOf(s.notes, weights) }));
  scored.sort((a, b) => b.score - a.score || collator.compare(a.name, b.name));
  const poleCount: Record<string, number> = {};
  return scored.map((s, i) => {
    poleCount[s.pole] = (poleCount[s.pole] ?? 0) + 1;
    return { ...s, rank: i + 1, poleRank: poleCount[s.pole], poleWinner: poleCount[s.pole] === 1 };
  });
}

/** Gagnant de chaque pôle (identifiant du sport). */
export function poleWinners(weights: Weights, sports: Sport[] = SPORTS): Record<PoleId, string> {
  const ranked = rankSports(weights, sports);
  const out = {} as Record<PoleId, string>;
  for (const p of POLES) out[p.id] = ranked.find((s) => s.pole === p.id)!.id;
  return out;
}

/** Les gagnants de pôle sont-ils identiques entre deux jeux de poids ? */
export function sameWinners(a: Weights, b: Weights): boolean {
  const wa = poleWinners(a);
  const wb = poleWinners(b);
  return POLES.every((p) => wa[p.id] === wb[p.id]);
}

/** Différences de gagnants entre des poids testés et une référence. */
export function winnerChanges(test: Weights, reference: Weights): { pole: PoleId; from: string; to: string }[] {
  const wt = poleWinners(test);
  const wr = poleWinners(reference);
  return POLES.filter((p) => wt[p.id] !== wr[p.id]).map((p) => ({ pole: p.id, from: wr[p.id], to: wt[p.id] }));
}
