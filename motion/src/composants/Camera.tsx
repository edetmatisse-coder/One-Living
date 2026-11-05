import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';
import { secousse, type Impact } from '../lib/camera';
import { lin } from '../lib/temps';

/**
 * Caméra : lent zoom avant (rien ne reste immobile), légère dérive,
 * et secousse à chaque impact.
 */
export const Camera: React.FC<{
  impacts?: Impact[];
  zoom?: [number, number];
  duree: number;
  derive?: number;
  graine?: string;
  children: React.ReactNode;
}> = ({ impacts = [], zoom = [1, 1.04], duree, derive = 1, graine = 'cam', children }) => {
  const frame = useCurrentFrame();
  const z = lin(frame, 0, duree, zoom[0], zoom[1]);
  const s = secousse(frame, impacts, graine);
  const dx = noise2D(`${graine}dx`, frame * 0.012, 0) * 7 * derive;
  const dy = noise2D(`${graine}dy`, frame * 0.012, 3) * 5 * derive;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${s.x + dx}px, ${s.y + dy}px) rotate(${s.r}deg) scale(${z * (1 + s.s)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
