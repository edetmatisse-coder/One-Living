'use client';

import { Hold, type HoldKind } from '@/components/ui/Hold';

/**
 * Paroi fixe dessinée en SVG : fond de remplacement quand la 3D est coupée
 * (mouvement réduit, WebGL absent) ou pendant son chargement.
 */
const HOLDS: { k: HoldKind; x: number; y: number; s: number; r: number; c: string; o?: number }[] = [
  { k: 'jug', x: 64, y: 22, s: 120, r: -14, c: '#F2B705' },
  { k: 'crimp', x: 82, y: 36, s: 92, r: 18, c: '#E64980' },
  { k: 'sloper', x: 72, y: 58, s: 150, r: 6, c: '#5C7CFA' },
  { k: 'pinch', x: 90, y: 72, s: 86, r: 34, c: '#FD7E14' },
  { k: 'pocket', x: 56, y: 44, s: 70, r: -20, c: '#F2B705', o: 0.8 },
  { k: 'jug', x: 46, y: 14, s: 64, r: 150, c: '#E64980', o: 0.55 },
  { k: 'crimp', x: 38, y: 64, s: 70, r: -32, c: '#5C7CFA', o: 0.45 },
  { k: 'sloper', x: 20, y: 30, s: 84, r: 12, c: '#FD7E14', o: 0.4 },
  { k: 'pinch', x: 12, y: 80, s: 60, r: -8, c: '#F2B705', o: 0.35 },
  { k: 'jug', x: 94, y: 12, s: 74, r: 40, c: '#5C7CFA', o: 0.7 },
];

export function WallFallback({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`plywood pointer-events-none overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_30%,rgba(255,236,200,.10),transparent_70%)]" />
      {HOLDS.map((h, i) => (
        <Hold
          key={i}
          kind={h.k}
          color={h.c}
          size={h.s}
          className="absolute"
          style={{
            left: `${h.x}%`,
            top: `${h.y}%`,
            opacity: h.o ?? 1,
            transform: `translate(-50%,-50%) rotate(${h.r}deg)`,
            filter: 'drop-shadow(-10px 18px 14px rgba(0,0,0,.55))',
          }}
        />
      ))}
      <div className="absolute inset-0 shadow-[inset_0_0_220px_rgba(0,0,0,.7)]" />
    </div>
  );
}
