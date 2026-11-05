import { COULEURS, EFFETS, type NomCouleur } from '../config';

export const C = COULEURS;
export const E = EFFETS;

/** Titres : très condensée, 800 à 900. */
export const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
/** Textes courts. */
export const TEXTE = '"Instrument Sans", "Helvetica Neue", Arial, sans-serif';

/** Couleur nommée de la palette (« jaune », « rose »…). */
export const coul = (n: NomCouleur) => COULEURS[n];

/** Couleur avec transparence : alpha('#F3EFE8', 0.5). */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** Typographie française : espaces insécables avant ? ! : ; % °C, apostrophe courbe. */
export const fr = (s: string) =>
  s
    .replace(/ ([?!:;%])/g, ' $1')
    .replace(/ °/g, ' °')
    .replace(/'/g, '’')
    .replace(/\b(one) (living)\b/gi, '$1\u00A0$2');
