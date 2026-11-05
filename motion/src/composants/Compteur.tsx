import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { DISPLAY } from '../theme';
import { CLAMP } from '../lib/temps';
import { largeur } from '../lib/mise-en-page';

/** Flous de bougé verticaux (SVG), choisis selon la vitesse des chiffres. */
export const NIVEAUX = [2, 4, 7, 11, 16, 23, 32];
export const FlouDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      {NIVEAUX.map((n) => (
        <filter key={n} id={`fy${n}`} x="-5%" y="-30%" width="110%" height="160%">
          <feGaussianBlur stdDeviation={`0 ${n}`} />
        </filter>
      ))}
    </defs>
  </svg>
);
export const flouY = (px: number) => {
  if (px < 1.4) return undefined;
  let best = NIVEAUX[0];
  for (const n of NIVEAUX) if (Math.abs(n - px) < Math.abs(best - px)) best = n;
  return `url(#fy${best})`;
};

/** Position d'une roue de compteur (rang k) : elle ne tourne que quand la roue d'en dessous passe de 9 à 0. */
const roue = (v: number, k: number) => {
  if (k === 0) return v;
  const p = 10 ** k;
  const base = Math.floor(v / p);
  return base + Math.max(0, Math.min(1, v - base * p - (p - 1)));
};

const BANDE = [9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1];

/** Compteur à rouleaux (façon compteur mécanique), avec flou de bougé et petit rebond à l'arrêt. */
export const Compteur: React.FC<{
  de: number;
  vers: number;
  debut: number;
  pose: number;
  chiffres: number;
  taille: number;
  couleur: string;
  zeroPale?: boolean;
  courbe?: (t: number) => number;
}> = ({ de, vers, debut, pose, chiffres, taille, couleur, zeroPale = false, courbe = Easing.bezier(0.18, 0.55, 0.2, 1) }) => {
  const frame = useCurrentFrame();
  const val = (f: number) => de + (vers - de) * interpolate(f, [debut, pose], [0, 1], { ...CLAMP, easing: courbe });
  const v = val(frame);
  const v1 = val(frame - 1);
  const H = taille;
  const colW = Math.max(...'0123456789'.split('').map((c) => largeur(c, taille, { poids: 900 })));
  const t = frame - pose;
  const rebond = t >= 0 ? -Math.sin(t * 0.95) * Math.exp(-t / 3.2) * 0.08 : 0;
  const masque = 'linear-gradient(transparent 0%, #000 13%, #000 87%, transparent 100%)';
  return (
    <div style={{ display: 'flex', fontFamily: DISPLAY, fontWeight: 900, fontSize: taille, lineHeight: 1, color: couleur }}>
      {Array.from({ length: chiffres }, (_, idx) => {
        const k = chiffres - 1 - idx;
        const pos = roue(v, k);
        const vit = Math.abs(pos - roue(v1, k)) * H;
        const m = ((pos % 10) + 10) % 10;
        const pale = zeroPale && k > 0 && Math.floor(v / 10 ** k) === 0 && m < 0.5;
        return (
          <div
            key={idx}
            style={{
              width: colW,
              height: H,
              overflow: 'hidden',
              position: 'relative',
              opacity: pale ? 0.2 : 1,
              WebkitMaskImage: masque,
              maskImage: masque,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                transform: `translateY(${-(m + 1 + rebond) * H}px)`,
                filter: flouY(Math.min(34, vit * 0.3)),
              }}
            >
              {BANDE.map((c, i) => (
                <div key={i} style={{ height: H, textAlign: 'center' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
