import React, { type CSSProperties } from 'react';
import { random, staticFile, useCurrentFrame } from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import { DISPLAY, TEXTE } from '../theme';
import { EASE, POP, lin, sp } from '../lib/temps';

// ---------------------------------------------------------------------------
// Tracés à main levée : on fabrique un chemin SVG lisse à partir de points.
// ---------------------------------------------------------------------------
type Pt = [number, number];

/** Chemin lisse (Catmull-Rom -> Bézier) passant par les points. */
export const lisse = (pts: Pt[]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

/** Progression d'un tracé : 0 -> 1 entre a et a + duree. */
const trace = (frame: number, a: number, duree: number) => lin(frame, a, a + duree, 0, 1, EASE);

// ---------------------------------------------------------------------------
/** Souligné au feutre (légère vague, petit coup de poignet à la fin). */
export const Trait: React.FC<{
  a: number;
  duree?: number;
  largeur: number;
  couleur: string;
  epaisseur?: number;
  graine?: string;
  /** false : le trait continue sur le mot suivant (pas de coup de poignet) */
  fin?: boolean;
  style?: CSSProperties;
}> = ({ a, duree = 7, largeur: L, couleur, epaisseur = 12, graine = 't', fin = true, style }) => {
  const frame = useCurrentFrame();
  if (frame < a || L <= 0) return null;
  const amp = epaisseur * 0.28;
  const n = Math.max(3, Math.round(L / 140));
  const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => {
    const x = (i / n) * L;
    const bord = i === 0 || (i === n && !fin);
    return [x, bord ? 0 : (random(`${graine}${i}`) - 0.5) * 2 * amp];
  });
  if (fin) pts[n] = [L, -epaisseur * 0.7];
  const d = lisse(pts);
  const p = trace(frame, a, duree);
  const ev = evolvePath(p, d);
  const m = epaisseur * 1.6;
  return (
    <svg
      width={L + m * 2}
      height={epaisseur * 4}
      viewBox={`${-m} ${-epaisseur * 2} ${L + m * 2} ${epaisseur * 4}`}
      style={{ overflow: 'visible', pointerEvents: 'none', ...style, marginLeft: -m }}
    >
      <path d={d} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" strokeLinejoin="round" {...ev} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
/** Cercle à main levée autour d'une zone (w × h), qui se referme en débordant. */
export const Cercle: React.FC<{
  a: number;
  duree?: number;
  w: number;
  h: number;
  couleur: string;
  epaisseur?: number;
  graine?: string;
  style?: CSSProperties;
}> = ({ a, duree = 10, w, h, couleur, epaisseur = 9, graine = 'c', style }) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const n = 18;
  const tours = 1.12;
  const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => {
    const t = (i / n) * tours * Math.PI * 2 - Math.PI * 0.62;
    const k = 1 + (random(`${graine}${i}`) - 0.5) * 0.07 + (i / n) * 0.06;
    return [Math.cos(t) * (w / 2) * k, Math.sin(t) * (h / 2) * k];
  });
  const d = lisse(pts);
  const ev = evolvePath(trace(frame, a, duree), d);
  const m = epaisseur * 2 + Math.max(w, h) * 0.08;
  return (
    <svg
      width={w + m * 2}
      height={h + m * 2}
      viewBox={`${-w / 2 - m} ${-h / 2 - m} ${w + m * 2} ${h + m * 2}`}
      style={{ position: 'absolute', overflow: 'visible', pointerEvents: 'none', transform: 'translate(-50%, -50%) rotate(-4deg)', ...style }}
    >
      <path d={d} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" {...ev} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
/** Petits traits d'impact (« ça claque »), dessinés puis effacés. */
export const Eclats: React.FC<{
  a: number;
  x: number;
  y: number;
  angle: number; // direction moyenne (degrés, 0 = droite, -90 = haut)
  couleur: string;
  longueur?: number;
  epaisseur?: number;
}> = ({ a, x, y, angle, couleur, longueur = 70, epaisseur = 9 }) => {
  const frame = useCurrentFrame();
  if (frame < a || frame > a + 18) return null;
  const p = trace(frame, a, 5);
  const o = lin(frame, a + 9, a + 18, 1, 0);
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} width={1} height={1}>
      {[-28, 0, 28].map((da, i) => {
        const r = ((angle + da) * Math.PI) / 180;
        const l = longueur * (i === 1 ? 1.15 : 0.85);
        const r0 = 18;
        const x0 = x + Math.cos(r) * r0;
        const y0 = y + Math.sin(r) * r0;
        const x1 = x + Math.cos(r) * (r0 + l * p);
        const y1 = y + Math.sin(r) * (r0 + l * p);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" opacity={o} />;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
/** Flèche dessinée à la main, de (x0, y0) vers (x1, y1). */
export const Fleche: React.FC<{
  a: number;
  duree?: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  courbure?: number;
  couleur: string;
  epaisseur?: number;
}> = ({ a, duree = 9, x0, y0, x1, y1, courbure = 0.25, couleur, epaisseur = 9 }) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const mx = (x0 + x1) / 2 - (y1 - y0) * courbure;
  const my = (y0 + y1) / 2 + (x1 - x0) * courbure;
  const d = `M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`;
  const p = trace(frame, a, duree);
  const tige = evolvePath(Math.min(1, p / 0.75), d);
  const q = lin(p, 0.72, 1, 0, 1);
  const ang = Math.atan2(y1 - my, x1 - mx);
  const L = epaisseur * 4.2;
  const tete = (s: number) => `M ${x1 - Math.cos(ang + s) * L} ${y1 - Math.sin(ang + s) * L} L ${x1} ${y1}`;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} width={1} height={1}>
      <path d={d} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" {...tige} />
      {q > 0 &&
        [0.5, -0.5].map((s) => (
          <path key={s} d={tete(s)} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" {...evolvePath(q, tete(s))} />
        ))}
    </svg>
  );
};

// ---------------------------------------------------------------------------
/** Cœur dessiné d'un trait. */
export const Coeur: React.FC<{ a: number; x: number; y: number; taille: number; couleur: string; epaisseur?: number; rot?: number }> = ({
  a,
  x,
  y,
  taille: s,
  couleur,
  epaisseur = 9,
  rot = 8,
}) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const d = `M 0 ${s * 0.32} C ${-s * 0.05} ${s * 0.18}, ${-s * 0.55} ${s * 0.02}, ${-s * 0.5} ${-s * 0.25} C ${-s * 0.45} ${-s * 0.52}, ${-s * 0.08} ${-s * 0.5}, 0 ${-s * 0.2} C ${s * 0.08} ${-s * 0.52}, ${s * 0.47} ${-s * 0.55}, ${s * 0.52} ${-s * 0.26} C ${s * 0.57} ${s * 0.02}, ${s * 0.1} ${s * 0.2}, ${-s * 0.02} ${s * 0.36}`;
  const p = sp(frame, a, POP);
  return (
    <svg
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', pointerEvents: 'none', transform: `rotate(${rot}deg) scale(${0.6 + 0.4 * p})` }}
      width={1}
      height={1}
    >
      <path d={d} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" strokeLinejoin="round" {...evolvePath(trace(frame, a, 9), d)} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
/** Trait de magnésie : brosse poudreuse, bords irréguliers, poussière qui s'envole. */
export const TraitCraie: React.FC<{
  a: number;
  duree?: number;
  x: number;
  y: number;
  largeur: number;
  epaisseur: number;
  couleur: string;
  graine?: string;
}> = ({ a, duree = 13, x, y, largeur: L, epaisseur, couleur, graine = 'craie' }) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const pts: Pt[] = [
    [0, epaisseur * 0.25],
    [L * 0.22, -epaisseur * 0.05],
    [L * 0.5, epaisseur * 0.12],
    [L * 0.78, -epaisseur * 0.08],
    [L, -epaisseur * 0.45],
  ];
  const d = lisse(pts);
  const p = trace(frame, a, duree);
  const total = getLength(d);
  const tete = getPointAtLength(d, Math.max(0.01, total * p)) ?? { x: 0, y: 0 };
  const id = `craie-${graine}`;
  const m = epaisseur * 2;
  const poussiere = Array.from({ length: 26 }, (_, i) => {
    const ne = a + (i / 26) * duree; // chaque grain naît au passage de la brosse
    const t = frame - ne;
    if (t < 0 || t > 22) return null;
    const q = getPointAtLength(d, total * Math.min(1, i / 26)) ?? { x: 0, y: 0 };
    const ang = -Math.PI / 2 + (random(`${graine}a${i}`) - 0.5) * 2.2;
    const v = 1.2 + random(`${graine}v${i}`) * 3.2;
    const dist = v * (1 - Math.pow(0.86, t)) / 0.14;
    return (
      <circle
        key={i}
        cx={q.x + Math.cos(ang) * dist}
        cy={q.y + Math.sin(ang) * dist + (random(`${graine}y${i}`) - 0.5) * epaisseur}
        r={1 + random(`${graine}r${i}`) * 3.2}
        fill={couleur}
        opacity={(1 - t / 22) * 0.75}
      />
    );
  });
  return (
    <svg
      width={L + m * 2}
      height={epaisseur * 4}
      viewBox={`${-m} ${-epaisseur * 2} ${L + m * 2} ${epaisseur * 4}`}
      style={{ position: 'absolute', left: x - m, top: y - epaisseur * 2, overflow: 'visible', pointerEvents: 'none' }}
    >
      <defs>
        <filter id={id} x="-5%" y="-60%" width="110%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={2} seed={7} result="bruit" />
          <feDisplacementMap in="SourceGraphic" in2="bruit" scale={epaisseur * 0.55} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id={`${id}-p`} patternUnits="userSpaceOnUse" width={512} height={512}>
          <image href={staticFile('textures/craie.png')} width={512} height={512} />
        </pattern>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-m} y={-epaisseur * 2} width={L + m * 2} height={epaisseur * 4}>
          <rect x={-m} y={-epaisseur * 2} width={L + m * 2} height={epaisseur * 4} fill={`url(#${id}-p)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`} filter={`url(#${id})`}>
        <path d={d} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" {...evolvePath(p, d)} />
        <path d={d} fill="none" stroke={couleur} strokeWidth={epaisseur * 0.55} strokeLinecap="round" opacity={0.9} transform={`translate(0 ${epaisseur * 0.32})`} {...evolvePath(p, d)} />
      </g>
      {p < 1 && <circle cx={tete.x} cy={tete.y} r={epaisseur * 0.5} fill={couleur} opacity={0.35} />}
      {poussiere}
    </svg>
  );
};

// ---------------------------------------------------------------------------
/** Pastille façon sticker : pop avec dépassement, puis petit balancement. */
export const Pastille: React.FC<{
  a: number;
  fond: string;
  couleur: string;
  taille: number;
  rot?: number;
  rond?: number; // diamètre si pastille ronde
  police?: 'display' | 'texte';
  poids?: number;
  bord?: string | null; // liseré blanc de sticker
  ombre?: boolean;
  style?: CSSProperties;
  children: React.ReactNode;
}> = ({ a, fond, couleur, taille, rot = 0, rond, police = 'display', poids, bord = null, ombre = true, style, children }) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const p = sp(frame, a, POP);
  const t = frame - a;
  const r = rot + (1 - p) * -26 + Math.sin(t / 11) * 1.1;
  const ombres = [bord ? `0 0 0 ${Math.round(taille * 0.13)}px ${bord}` : '', ombre ? `${taille * 0.09}px ${taille * 0.13}px 0 rgba(0,0,0,0.3)` : '']
    .filter(Boolean)
    .join(', ');
  return (
    <div style={{ position: 'absolute', ...style }}>
      <div
        style={{
          transform: `translate(-50%, -50%) rotate(${r}deg) scale(${Math.max(0, p)})`,
          background: fond,
          color: couleur,
          fontFamily: police === 'display' ? DISPLAY : TEXTE,
          fontWeight: poids ?? (police === 'display' ? 800 : 700),
          fontSize: taille,
          lineHeight: 1,
          width: rond,
          height: rond,
          padding: rond ? 0 : '0.26em 0.62em 0.24em',
          borderRadius: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: ombres || undefined,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};
