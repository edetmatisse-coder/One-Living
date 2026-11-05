import React, { type CSSProperties } from 'react';
import { random, useCurrentFrame } from 'remotion';
import { POP, RESSORT, SEC, lin, sp } from '../lib/temps';
import { largeur } from '../lib/mise-en-page';
import { Trait } from './Stickers';

export interface Jeton {
  t: string;
  couleur?: string;
  souligne?: boolean;
}
type Entree = string | Jeton;

/**
 * Texte mot par mot : chaque mot monte derrière un masque, avec un léger
 * rebond (spring avec dépassement). Les mots marqués `souligne` reçoivent
 * ensuite un trait de feutre continu.
 */
export const Mots: React.FC<{
  mots: Entree[];
  a: number;
  ecart?: number;
  taille: number;
  famille: string;
  poids: number;
  couleur?: string;
  interligne?: number;
  justifier?: CSSProperties['justifyContent'];
  espaceMots?: number; // em
  inclinaison?: number;
  souligne?: { a: number; couleur: string; epaisseur?: number; duree?: number };
  style?: CSSProperties;
}> = ({
  mots,
  a,
  ecart = 4,
  taille,
  famille,
  poids,
  couleur,
  interligne = 1,
  justifier = 'center',
  espaceMots = 0.24,
  inclinaison = 6,
  souligne,
  style,
}) => {
  const frame = useCurrentFrame();
  const jetons: Jeton[] = mots.map((m) => (typeof m === 'string' ? { t: m } : m));
  const gap = espaceMots * taille;
  const soulignes = jetons.map((j, i) => (j.souligne ? i : -1)).filter((i) => i >= 0);
  const dureeTrait = souligne?.duree ?? 5;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: justifier,
        columnGap: gap,
        rowGap: 0,
        fontFamily: famille,
        fontWeight: poids,
        fontSize: taille,
        lineHeight: interligne,
        color: couleur,
        ...style,
      }}
    >
      {jetons.map((j, i) => {
        const d = a + i * ecart;
        const p = sp(frame, d, RESSORT);
        const k = soulignes.indexOf(i);
        const continue_ = k >= 0 && k < soulignes.length - 1 && soulignes[k + 1] === i + 1;
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
            <span
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                padding: '0.28em 0.1em 0.14em',
                margin: '-0.28em -0.1em -0.14em',
                verticalAlign: 'bottom',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: `translateY(${(1 - p) * 125}%) rotate(${(1 - p) * inclinaison}deg)`,
                  transformOrigin: '0% 100%',
                  opacity: frame >= d ? 1 : 0,
                  color: j.couleur,
                }}
              >
                {j.t}
              </span>
            </span>
            {j.souligne && souligne && (
              <Trait
                a={souligne.a + k * dureeTrait}
                duree={dureeTrait}
                largeur={largeur(j.t, taille, { famille, poids }) + (continue_ ? gap : 0)}
                couleur={souligne.couleur}
                epaisseur={souligne.epaisseur ?? taille * 0.12}
                fin={!continue_}
                graine={`s${i}`}
                style={{ position: 'absolute', left: 0, top: '100%', marginTop: -taille * 0.08 }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Texte lettre par lettre.
 *  - claque : la lettre arrive de grand et claque sur la ligne (flou de bougé)
 *  - tombe  : la lettre tombe d'en haut et rebondit
 *  - ecrit  : la lettre se dévoile de gauche à droite, comme écrite
 */
export const Lettres: React.FC<{
  texte: string;
  a: number;
  ecart?: number; // images entre deux lettres (peut être fractionnaire)
  mode?: 'claque' | 'tombe' | 'ecrit';
  style?: CSSProperties;
  couleur?: (i: number, c: string) => string | undefined;
  graine?: string;
}> = ({ texte, a, ecart = 2, mode = 'claque', style, couleur, graine = 'l' }) => {
  const frame = useCurrentFrame();
  let k = 0;
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre', ...style }}>
      {[...texte].map((c, i) => {
        if (c === ' ' || c === ' ') return <span key={i}>{c}</span>;
        const d = a + Math.round(k * ecart);
        const n = k++;
        const t = frame - d;
        const col = couleur?.(n, c);
        if (t < 0) return <span key={i} style={{ opacity: 0, color: col }}>{c}</span>;
        let transform = '';
        let filter: string | undefined;
        let clipPath: string | undefined;
        if (mode === 'claque') {
          const p = sp(frame, d, SEC);
          const s = 2.3 - 1.3 * p;
          const flou = Math.max(0, 1 - p) * 16;
          transform = `translateY(${(1 - p) * -0.12}em) scale(${s})`;
          if (flou > 0.6) filter = `blur(${flou.toFixed(1)}px)`;
        } else if (mode === 'tombe') {
          const p = sp(frame, d, POP);
          const r = (random(`${graine}${n}`) - 0.5) * 34;
          transform = `translateY(${(1 - p) * -1.15}em) rotate(${(1 - p) * r}deg)`;
          const flou = Math.max(0, 1 - p) * 10;
          if (flou > 0.6) filter = `blur(${flou.toFixed(1)}px)`;
        } else {
          const q = lin(t, 0, 3);
          const p = sp(frame, d, RESSORT);
          clipPath = `inset(-20% ${(1 - q) * 100}% -20% 0)`;
          transform = `translateY(${(1 - p) * 0.14}em) scale(${1 + (1 - p) * 0.06})`;
        }
        return (
          <span key={i} style={{ display: 'inline-block', transform, filter, clipPath, transformOrigin: '50% 80%', color: col }}>
            {c}
          </span>
        );
      })}
    </span>
  );
};
