'use client';

import { useId, useMemo, useRef, type ReactNode } from 'react';
import { COAST, dotGrid, ISLANDS, mapHeight, project, type LonLat } from '@/lib/geo';
import { HOLD_PATHS, type HoldKind } from './Hold';
import { useInView } from '@/lib/use-in-view';

export interface MapPoint {
  id: string;
  name: string;
  lonlat: LonLat;
  color: string;
  kind?: HoldKind;
  /** libellé placé à gauche plutôt qu'à droite */
  labelLeft?: boolean;
  sub?: string;
}

interface Props {
  points: MapPoint[];
  /** ordre des points reliés par une voie (identifiants) */
  route?: string[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  width?: number;
  step?: number;
  className?: string;
  /** nombre de points allumés (révélation progressive) */
  litCount?: number;
  children?: ReactNode;
  ariaLabel: string;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Chemin lissé (Catmull-Rom vers Bézier) passant par les points. */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${r1(pts[0].x)} ${r1(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${r1(c1.x)} ${r1(c1.y)}, ${r1(c2.x)} ${r1(c2.y)}, ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return d;
}

/**
 * Carte du sud de la Bretagne en trame de points : la terre est une grille
 * d'inserts, les lieux sont des prises.
 */
export function DotMap({ points, route, activeId, onSelect, width = 640, step = 12, className = '', litCount, children, ariaLabel }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const maskId = `route-${useId().replace(/:/g, '')}`;
  const seen = useInView(ref, { rootMargin: '0px 0px -15% 0px' });
  const height = r1(mapHeight(width));
  const dots = useMemo(() => dotGrid(width, step).map((d) => ({ x: r1(d.x), y: r1(d.y), o: Math.round((0.18 + d.fade * 0.5) * 100) / 100 })), [width, step]);
  const placed = useMemo(
    () => points.map((p) => ({ ...p, ...(() => { const q = project(p.lonlat, width); return { x: r1(q.x), y: r1(q.y) }; })() })),
    [points, width],
  );
  const coast = useMemo(() => {
    const line = (pts: LonLat[], close = false) =>
      pts
        .map((ll, i) => {
          const p = project(ll, width);
          return `${i ? 'L' : 'M'} ${r1(p.x)} ${r1(p.y)}`;
        })
        .join(' ') + (close ? ' Z' : '');
    return [line(COAST), ...ISLANDS.map((isl) => line(isl, true))].join(' ');
  }, [width]);
  const sea = useMemo(() => project([-4.62, 47.47], width), [width]);
  const routePts = route ? route.map((id) => placed.find((p) => p.id === id)!).filter(Boolean) : [];
  const d = smoothPath(routePts);
  const lit = litCount ?? (seen ? placed.length : 0);

  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={className} role="img" aria-label={ariaLabel}>
      <defs>
        <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* littoral */}
      <path d={coast} fill="none" stroke="#A9A39A" strokeOpacity="0.38" strokeWidth="1" strokeLinejoin="round" aria-hidden />
      <text x={r1(sea.x)} y={r1(sea.y)} aria-hidden style={{ fontSize: 10, fill: '#7D776F', fontFamily: 'var(--font-mono)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
        Océan Atlantique
      </text>
      {/* terre : trame d'inserts */}
      <g aria-hidden>
        {dots.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={step * 0.17} fill="#A9A39A" opacity={p.o} />
        ))}
      </g>
      {/* voie */}
      {d && (
        <>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <path
              d={d}
              fill="none"
              stroke="#fff"
              strokeWidth="10"
              pathLength={1}
              strokeDasharray="1 1"
              style={{ strokeDashoffset: seen ? 0 : 1, transition: 'stroke-dashoffset 2.6s cubic-bezier(.45,0,.2,1) .3s' }}
            />
          </mask>
          <path d={d} fill="none" stroke="#F3EFE8" strokeOpacity="0.6" strokeWidth="2.2" strokeDasharray="1.5 7" strokeLinecap="round" mask={`url(#${maskId})`} />
        </>
      )}
      {/* prises */}
      {placed.map((p, i) => {
        const on = i < lit;
        const active = activeId === p.id;
        const size = active ? 34 : 26;
        const interactive = !!onSelect;
        return (
          <g
            key={p.id}
            transform={`translate(${p.x} ${p.y})`}
            className={interactive ? 'cursor-pointer' : undefined}
            onClick={interactive ? () => onSelect?.(p.id) : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `${p.name}${p.sub ? ', ' + p.sub : ''}` : undefined}
            onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(p.id) : undefined}
            style={{ opacity: on ? 1 : 0.2, transition: `opacity .6s ${i * 180}ms` }}
          >
            {on && <circle r={active ? 30 : 22} fill={p.color} opacity={active ? 0.32 : 0.18} />}
            <g transform={`translate(${-size / 2} ${-size / 2}) scale(${size / 40})`}>
              <path d={HOLD_PATHS[p.kind ?? 'jug']} fill={on ? p.color : '#3B3630'} stroke="rgba(0,0,0,.5)" strokeWidth="1.2" />
              <circle cx="20" cy="16" r="2.6" fill="#141210" />
            </g>
            <text
              x={p.labelLeft ? -size / 2 - 8 : size / 2 + 8}
              y={4}
              textAnchor={p.labelLeft ? 'end' : 'start'}
              className="font-display"
              style={{ fontSize: active ? 22 : 18, fontWeight: 800, fill: '#F3EFE8', textTransform: 'uppercase', letterSpacing: '0.01em' }}
            >
              {p.name}
            </text>
            {p.sub && (
              <text
                x={p.labelLeft ? -size / 2 - 8 : size / 2 + 8}
                y={20}
                textAnchor={p.labelLeft ? 'end' : 'start'}
                style={{ fontSize: 10, fill: '#A9A39A', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                {p.sub}
              </text>
            )}
          </g>
        );
      })}
      {children}
    </svg>
  );
}
