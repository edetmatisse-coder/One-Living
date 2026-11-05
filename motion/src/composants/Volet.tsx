import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { VOLET } from '../timelines';
import { EASE_IO, lin } from '../lib/temps';

export interface Bande {
  couleur: string;
  largeur: number;
}

/**
 * Volet plein écran : la nouvelle scène entre derrière un bord en biais,
 * précédé de bandes de couleur. Tant qu'il passe, la scène d'avant reste visible.
 */
export const Volet: React.FC<{
  a?: number;
  duree?: number;
  depuis?: 'droite' | 'gauche' | 'bas';
  biais?: number;
  bandes?: Bande[];
  children: React.ReactNode;
}> = ({ a = 0, duree = VOLET, depuis = 'droite', biais = 150, bandes = [], children }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  if (frame < a) return null;
  const p = lin(frame, a, a + duree, 0, 1, EASE_IO);
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const total = bandes.reduce((s, b) => s + b.largeur, 0);

  if (depuis === 'bas') {
    const span = H + 2 * biais + total;
    const Y = H + biais + total - p * span;
    // zone entre y0 et y1 (bord légèrement penché)
    const zone = (y0: number, y1: number) =>
      `polygon(0px ${y0 + biais * 0.5}px, ${W}px ${y0 - biais * 0.5}px, ${W}px ${y1 - biais * 0.5}px, 0px ${y1 + biais * 0.5}px)`;
    let cumul = 0;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ clipPath: zone(Y, H + 4 * biais) }}>{children}</AbsoluteFill>
        {bandes.map((b, i) => {
          const y1 = Y - cumul;
          cumul += b.largeur;
          return <AbsoluteFill key={i} style={{ background: b.couleur, clipPath: zone(y1 - b.largeur, y1 + 1) }} />;
        })}
      </AbsoluteFill>
    );
  }

  const span = W + 2 * biais + total;
  const X = W + biais + total - p * span;
  const miroir = depuis === 'gauche';
  const px = (x: number) => (miroir ? W - x : x);
  // zone entre x0 et x1 à mi-hauteur, bord en biais
  const zone = (x0: number, x1: number) =>
    `polygon(${px(x0 + biais)}px 0px, ${px(x1 + biais)}px 0px, ${px(x1 - biais)}px ${H}px, ${px(x0 - biais)}px ${H}px)`;
  let cumul = 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: zone(X, W + 4 * biais + total) }}>{children}</AbsoluteFill>
      {bandes.map((b, i) => {
        const x1 = X - cumul;
        cumul += b.largeur;
        return <AbsoluteFill key={i} style={{ background: b.couleur, clipPath: zone(x1 - b.largeur, x1 + 1) }} />;
      })}
    </AbsoluteFill>
  );
};
