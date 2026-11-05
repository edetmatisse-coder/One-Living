import { useVideoConfig } from 'remotion';
import { fitText, measureText } from '@remotion/layout-utils';
import { DISPLAY } from '../theme';

/** Format courant : horizontal 1920×1080 ou vertical 1080×1920. */
export const useFormat = () => {
  const { width: W, height: H } = useVideoConfig();
  return { W, H, v: H > W };
};

interface Police {
  famille?: string;
  poids?: number;
  espacement?: number; // em
}

/** Corps (px) pour que le texte tienne sur une ligne de `largeur` px, plafonné à `max`. */
export const ajuste = (texte: string, largeur: number, max: number, p: Police = {}) => {
  const { fontSize } = fitText({
    text: texte,
    withinWidth: largeur,
    fontFamily: p.famille ?? DISPLAY,
    fontWeight: p.poids ?? 900,
    letterSpacing: p.espacement ? `${p.espacement}em` : undefined,
  });
  return Math.min(max, fontSize);
};

/** Largeur (px) d'un texte sur une ligne. */
export const largeur = (texte: string, taille: number, p: Police = {}) =>
  measureText({
    text: texte,
    fontFamily: p.famille ?? DISPLAY,
    fontWeight: p.poids ?? 900,
    fontSize: taille,
    letterSpacing: p.espacement ? `${p.espacement}em` : undefined,
  }).width;

/** Coupe un texte en lignes qui tiennent dans `max` px. */
export const lignes = (texte: string, taille: number, max: number, p: Police = {}) => {
  const out: string[] = [];
  let ligne = '';
  for (const mot of texte.split(' ')) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ligne && largeur(essai, taille, p) > max) {
      out.push(ligne);
      ligne = mot;
    } else ligne = essai;
  }
  if (ligne) out.push(ligne);
  return out;
};

/** Comme `lignes`, mais équilibrées : la plus petite largeur qui garde le même nombre de lignes. */
export const lignesEquilibrees = (texte: string, taille: number, max: number, p: Police = {}) => {
  const n = lignes(texte, taille, max, p).length;
  if (n <= 1) return [texte];
  let lo = 0;
  let hi = max;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (lignes(texte, taille, mid, p).length > n) lo = mid;
    else hi = mid;
  }
  return lignes(texte, taille, hi + 1, p);
};
