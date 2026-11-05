import React from 'react';
import { random, useCurrentFrame } from 'remotion';
import { C } from '../theme';

/** Nuage de magnésie qui gicle à un impact (freiné, puis qui retombe en flottant). */
export const Poudre: React.FC<{
  a: number;
  x: number;
  y: number;
  n?: number;
  couleur?: string;
  vitesse?: number;
  direction?: 'cotes' | 'haut' | 'tout';
  graine: string;
  vie?: number;
}> = ({ a, x, y, n = 26, couleur = C.magnesie, vitesse = 1, direction = 'tout', graine, vie = 22 }) => {
  const frame = useCurrentFrame();
  const t = frame - a;
  if (t < 0 || t > vie) return null;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} width={1} height={1}>
      {Array.from({ length: n }, (_, i) => {
        const u = random(`${graine}a${i}`);
        let ang: number;
        if (direction === 'cotes') ang = (u < 0.5 ? Math.PI : 0) + (random(`${graine}b${i}`) - 0.65) * 0.9 * (u < 0.5 ? -1 : 1);
        else if (direction === 'haut') ang = -Math.PI / 2 + (u - 0.5) * 2.2;
        else ang = u * Math.PI * 2;
        const v0 = (6 + random(`${graine}v${i}`) * 22) * vitesse;
        const d = (v0 * (1 - Math.pow(0.82, t))) / 0.18;
        const r = 1.2 + random(`${graine}r${i}`) ** 2 * 6;
        const o = Math.pow(1 - t / vie, 1.4) * (0.45 + random(`${graine}o${i}`) * 0.5);
        return <circle key={i} cx={x + Math.cos(ang) * d} cy={y + Math.sin(ang) * d - t * 0.6} r={r * (1 + t / vie)} fill={couleur} opacity={o} />;
      })}
    </svg>
  );
};
