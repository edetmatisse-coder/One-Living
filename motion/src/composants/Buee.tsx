import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { alpha } from '../theme';
import { EASE, lin } from '../lib/temps';

/** L'écran se couvre de buée, comme une bouteille qui sort du frigo, et des gouttes perlent. */
export const Buee: React.FC<{ a: number; graine?: string }> = ({ a, graine = 'buee' }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  if (frame < a) return null;
  const c = lin(frame, a, a + 16, 0, 1, EASE);
  const n = Math.round(120 * Math.sqrt((W * H) / (1920 * 1080)));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          backdropFilter: `blur(${(15 * c).toFixed(1)}px) brightness(${(1 + 0.07 * c).toFixed(3)}) saturate(${(1 - 0.25 * c).toFixed(3)})`,
          WebkitBackdropFilter: `blur(${(15 * c).toFixed(1)}px) brightness(${(1 + 0.07 * c).toFixed(3)}) saturate(${(1 - 0.25 * c).toFixed(3)})`,
          background: `radial-gradient(ellipse 62% 58% at 50% 50%, ${alpha('#C9D8EA', 0.03 * c)} 0%, ${alpha('#C9D8EA', 0.16 * c)} 100%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`${graine}-g`} cx="42%" cy="36%" r="62%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.04} />
            <stop offset="72%" stopColor="#FFFFFF" stopOpacity={0.12} />
            <stop offset="93%" stopColor="#FFFFFF" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
        </defs>
        {Array.from({ length: n }, (_, i) => {
          const ne = a + 3 + Math.floor(random(`${graine}n${i}`) * 18);
          if (frame < ne) return null;
          const grosse = random(`${graine}g${i}`) > 0.9;
          const r = grosse ? 16 + random(`${graine}r${i}`) * 12 : 3 + random(`${graine}r${i}`) ** 1.5 * 12;
          const x = random(`${graine}x${i}`) * W;
          const y = random(`${graine}y${i}`) * H + (grosse ? Math.max(0, frame - ne - 8) ** 1.35 * 0.45 : 0);
          const s = lin(frame, ne, ne + 4, 0, 1, EASE);
          return (
            <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`}>
              <ellipse rx={r} ry={r * 1.08} fill={`url(#${graine}-g)`} />
              <ellipse cx={-r * 0.32} cy={-r * 0.38} rx={r * 0.24} ry={r * 0.17} fill="#FFFFFF" opacity={0.85} />
              <path
                d={`M ${-r * 0.72} ${r * 0.5} A ${r} ${r} 0 0 0 ${r * 0.72} ${r * 0.5}`}
                stroke="rgba(0,0,0,0.22)"
                strokeWidth={Math.max(1, r * 0.13)}
                fill="none"
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
