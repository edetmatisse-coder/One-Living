import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig, type SpringConfig } from 'remotion';
import { TAILLES } from '../tailles';
import { EASE, LOURD, lin, sp } from '../lib/temps';

const borne = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Bouteille ou shot détouré : entrée avec légère inclinaison 3D, puis
 * reflet lumineux qui balaie le verre, ombre au sol, léger flottement.
 */
export const Produit: React.FC<{
  id: string;
  hauteur: number;
  a: number;
  x: number; // centre horizontal
  bas: number; // y du pied
  depuis?: 'bas' | 'gauche' | 'droite' | 'haut';
  inclinaison?: number;
  rot?: number;
  reflet?: number | null;
  ombre?: string | null;
  flotte?: boolean;
  ressort?: Partial<SpringConfig>;
  /** image d'un petit saut sur place */
  saut?: number | null;
}> = ({ id, hauteur, a, x, bas, depuis = 'bas', inclinaison = 32, rot = 0, reflet = null, ombre = null, flotte = true, ressort, saut = null }) => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const [w0, h0] = TAILLES[id];
  const L = (hauteur * w0) / h0;
  const t = frame - a;
  if (t < 0) return null;
  const p = sp(frame, a, ressort ?? LOURD);
  const q = 1 - p;
  const [dx, dy] = { bas: [0, 1], haut: [0, -1], gauche: [-1, 0], droite: [1, 0] }[depuis];
  const tx = dx * q * W * 0.6;
  const ty = dy * q * hauteur * 1.25;
  const rY = q * inclinaison * (dx !== 0 ? dx : 1);
  const rX = q * 14 * (dy !== 0 ? dy : 0.5);
  const rZ = rot + q * -13 * (dx !== 0 ? -dx : 1);
  const ts = saut != null ? frame - saut : -1;
  const hop = ts >= 0 && ts <= 12 ? -Math.sin((ts / 12) * Math.PI) * hauteur * 0.07 : 0;
  const fl = (flotte ? Math.sin(t / 16) * hauteur * 0.007 : 0) + hop;
  const flr = flotte ? Math.sin(t / 29) * 0.7 : 0;
  const r = reflet != null ? lin(frame, reflet, reflet + 17, 0, 1, EASE) : 0;
  const src = staticFile(`produits/${id}.webp`);
  const masque = `url(${src})`;
  return (
    <div style={{ position: 'absolute', left: x - L / 2, top: bas - hauteur, width: L, height: hauteur }}>
      {ombre && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '100%',
            width: L * 1.35,
            height: hauteur * 0.075,
            transform: `translate(-50%, -60%) scaleX(${0.55 + 0.45 * borne(p)})`,
            background: `radial-gradient(closest-side, ${ombre}, rgba(0,0,0,0))`,
            opacity: borne(p),
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${tx}px, ${ty + fl}px) perspective(1700px) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ + flr}deg)`,
          transformOrigin: '50% 85%',
        }}
      >
        <Img src={src} style={{ width: L, height: hauteur, display: 'block' }} />
        {r > 0 && r < 1 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              WebkitMaskImage: masque,
              maskImage: masque,
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              background:
                'linear-gradient(104deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.12) 55%, rgba(255,255,255,0) 62%)',
              backgroundSize: '340% 100%',
              backgroundPosition: `${100 - r * 100}% 0%`,
              mixBlendMode: 'screen',
              opacity: Math.min(1, Math.sin(r * Math.PI) * 1.6),
            }}
          />
        )}
      </div>
    </div>
  );
};
