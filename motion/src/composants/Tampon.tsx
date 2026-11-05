import React from 'react';
import { random, staticFile, useCurrentFrame } from 'remotion';
import { DISPLAY } from '../theme';
import { APPROCHE } from '../timelines';
import { SEC, sp } from '../lib/temps';

/**
 * Tampon encreur : le mot descend de très près (flou), claque sur l'écran
 * à l'image `a`, s'écrase un peu et garde une encre usée (double cadre).
 */
export const Tampon: React.FC<{
  texte: string;
  a: number;
  couleur: string;
  rot: number;
  taille: number;
  x: number;
  y: number;
  graine: string;
}> = ({ texte, a, couleur, rot, taille, x, y, graine }) => {
  const frame = useCurrentFrame();
  const t = frame - a;
  if (t < -APPROCHE) return null;
  let s: number;
  let r = rot;
  let flou = 0;
  let o = 1;
  if (t < 0) {
    const q = (t + APPROCHE) / APPROCHE;
    const e = q * q * q;
    s = 2.6 - 1.6 * e;
    r = rot + 16 * (1 - e);
    flou = (1 - e) * 12;
    o = Math.min(1, q * 3);
  } else {
    s = 0.9 + 0.1 * sp(frame, a, SEC);
  }
  const mx = Math.floor(random(`${graine}mx`) * 400);
  const my = Math.floor(random(`${graine}my`) * 400);
  const masque = `url(${staticFile('textures/encre.png')})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${r}deg) scale(${s})`,
        opacity: o,
        filter: flou > 0.5 ? `blur(${flou.toFixed(1)}px)` : undefined,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: taille,
          lineHeight: 0.92,
          color: couleur,
          padding: '0.1em 0.26em 0.05em',
          border: `${Math.round(taille * 0.07)}px solid ${couleur}`,
          borderRadius: taille * 0.08,
          outline: `${Math.round(taille * 0.022)}px solid ${couleur}`,
          outlineOffset: -Math.round(taille * 0.15),
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
          WebkitMaskImage: masque,
          maskImage: masque,
          WebkitMaskSize: '440px 440px',
          maskSize: '440px 440px',
          WebkitMaskPosition: `${mx}px ${my}px`,
          maskPosition: `${mx}px ${my}px`,
        }}
      >
        {texte}
      </div>
    </div>
  );
};
