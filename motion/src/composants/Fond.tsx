import React from 'react';
import { AbsoluteFill, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';
import { C, E, alpha } from '../theme';

/** Grain argentique animé (change toutes les 2 images, façon pellicule). */
export const Grain: React.FC<{ force?: number }> = ({ force = 1 }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 2);
  const o = 0.13 * force * E.grain;
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`textures/grain-${k % 6}.png`)})`,
        backgroundSize: '256px 256px',
        backgroundPosition: `${Math.floor(random(`gx${k}`) * 256)}px ${Math.floor(random(`gy${k}`) * 256)}px`,
        mixBlendMode: 'overlay',
        opacity: o,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Bulles de fermentation qui montent et poussière de magnésie qui flotte. Très discret. */
export const Ambiance: React.FC<{ teinte?: string; force?: number; graine?: string }> = ({
  teinte = C.magnesie,
  force = 1,
  graine = 'amb',
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const k = force * E.particules;
  if (k <= 0) return null;
  const nb = 20;
  const np = 46;
  const P = H + 140;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: k }}>
      {Array.from({ length: nb }, (_, i) => {
        const r = 2.5 + random(`${graine}r${i}`) ** 2 * 10;
        const v = 0.55 + random(`${graine}v${i}`) * 1.5;
        const x0 = random(`${graine}x${i}`) * W;
        const y0 = random(`${graine}y${i}`) * P;
        const y = ((((y0 - frame * v) % P) + P) % P) - 70;
        const x = x0 + Math.sin(frame / (16 + (i % 9) * 2) + i) * (3 + r * 0.7);
        const fade = Math.min(1, y / (H * 0.35));
        return (
          <g key={`b${i}`} opacity={0.2 * Math.max(0, fade)}>
            <circle cx={x} cy={y} r={r} fill="none" stroke={teinte} strokeWidth={1.2} />
            <circle cx={x - r * 0.35} cy={y - r * 0.38} r={Math.max(0.8, r * 0.22)} fill={teinte} />
          </g>
        );
      })}
      {Array.from({ length: np }, (_, i) => {
        const r = 0.7 + random(`${graine}pr${i}`) ** 3 * 2.4;
        const x = ((((random(`${graine}px${i}`) * W + noise2D(`${graine}nx`, i, frame * 0.005) * 70 + frame * 0.22) % W) + W) % W);
        const y = ((((random(`${graine}py${i}`) * H + noise2D(`${graine}ny`, i, frame * 0.005) * 50 - frame * 0.12) % H) + H) % H);
        const o = (0.1 + random(`${graine}po${i}`) * 0.25) * (0.75 + 0.25 * Math.sin(frame / 9 + i));
        return <circle key={`p${i}`} cx={x} cy={y} r={r} fill={teinte} opacity={o} />;
      })}
    </svg>
  );
};

/** Fond plein + vignettage + ambiance. */
export const Fond: React.FC<{
  couleur?: string;
  vignette?: number;
  particules?: number;
  teinte?: string;
  graine?: string;
}> = ({ couleur = C.fond, vignette = 1, particules = 1, teinte, graine }) => (
  <AbsoluteFill style={{ background: couleur }}>
    {vignette > 0 && (
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 78% 72% at 50% 46%, rgba(0,0,0,0) 38%, ${alpha('#000000', 0.4 * vignette)} 100%)`,
        }}
      />
    )}
    {particules > 0 && <Ambiance teinte={teinte} force={particules} graine={graine} />}
  </AbsoluteFill>
);
