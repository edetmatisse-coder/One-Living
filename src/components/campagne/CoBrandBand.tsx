'use client';

import { Fragment } from 'react';
import { ROUTE_COLORS } from '@/data/routes';
import { Marquee } from '@/components/ui/Marquee';
import { Hold, type HoldKind } from '@/components/ui/Hold';

const ITEMS: { text: string; kind: HoldKind; color: string }[] = [
  { text: 'Après la voie', kind: 'jug', color: ROUTE_COLORS.yellow },
  { text: 'One Living × B’Wall', kind: 'crimp', color: '#149ca4' },
  { text: 'Quimper', kind: 'sloper', color: ROUTE_COLORS.pink },
  { text: 'Lorient', kind: 'pinch', color: ROUTE_COLORS.blue },
  { text: 'Vannes', kind: 'pocket', color: ROUTE_COLORS.orange },
  { text: 'Bio · vivant · non pasteurisé', kind: 'jug', color: ROUTE_COLORS.yellow },
];

/** Bandeau cobrandé entre le haut de page et le concept. */
export function CoBrandBand() {
  return (
    <div className="relative z-10 border-y border-chalk/[0.07] bg-ply-900 py-5" aria-label="One Living × B’Wall, dans les salles de Quimper, Lorient et Vannes">
      <Marquee duration={42}>
        {ITEMS.map((it, i) => (
          <Fragment key={i}>
            <span className="font-display whitespace-nowrap px-7 text-[clamp(30px,3.6vw,52px)] uppercase leading-none text-chalk" style={{ fontWeight: 800 }}>
              {it.text}
            </span>
            <Hold kind={it.kind} color={it.color} size={30} style={{ transform: `rotate(${i * 47}deg)` }} />
          </Fragment>
        ))}
      </Marquee>
    </div>
  );
}
