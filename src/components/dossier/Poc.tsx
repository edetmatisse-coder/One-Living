'use client';

import { useRef } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { POC_STEPS } from '@/data/poc';
import { WIN_CITIES } from '@/lib/geo';
import { Section, SectionInner } from '@/components/layout/Section';
import { WestMap, type MapPoint } from '@/components/ui/WestMap';
import { useInView } from '@/lib/use-in-view';
import type { HoldKind } from '@/components/ui/Hold';

const KINDS: HoldKind[] = ['sloper', 'jug', 'crimp', 'pinch', 'jug'];
const COLORS = [ROUTE_COLORS.blue, ROUTE_COLORS.orange, ROUTE_COLORS.pink, ROUTE_COLORS.yellow, ROUTE_COLORS.yellow];

/**
 * Le POC : les villes WIN de la R2 Ouest comme les prises d'une voie, puis
 * les étapes du test en frise.
 */
export function Poc({ meta }: { meta: SectionMeta }) {
  const ref = useRef<HTMLOListElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -20% 0px' });
  const points: MapPoint[] = WIN_CITIES.map((c, i) => ({
    id: c.id,
    name: c.name,
    lonlat: c.lonlat,
    color: COLORS[i],
    kind: KINDS[i],
    labelLeft: c.id === 'rennes',
    sub: `Prise ${i + 1}`,
  }));

  return (
    <Section
      meta={meta}
      title={['Le POC', 'en R2 Ouest']}
      cardFoot="Laval · Rennes · Vannes · Tours · Caen"
      lead={<>Un test de trois mois dans trois salles, autour des villes WIN de l’Ouest, avant d’aller plus loin.</>}
    >
      <SectionInner>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="label-mono mb-4 text-route">Les villes WIN, en voie</p>
            <div className="relative rounded-[6px] border border-chalk/10 bg-ply-900/40 p-3 md:p-6">
              <WestMap
                points={points}
                route={points.map((p) => p.id)}
                ariaLabel="Carte de l’Ouest : Vannes, Tours, Laval, Rennes et Caen reliées comme les prises d’une voie"
                className="w-full"
                width={620}
                step={8}
              />
              <p className="label-mono absolute bottom-4 left-5 text-[9.5px] text-dust/70">Carte stylisée</p>
            </div>
            <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-dust">
              On teste là où l’équipe peut passer chaque semaine. Les trois salles test seront choisies parmi ces cinq villes,
              de tailles différentes pour lire l’effet du volume.
            </p>
          </div>

          <div>
            <p className="label-mono mb-6 text-route">Les étapes</p>
            <ol ref={ref} className="relative space-y-8 pl-10">
              <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-px bg-chalk/15" />
              <span
                aria-hidden
                className="absolute left-[11px] top-2 w-[2px] origin-top bg-route transition-transform duration-[2000ms] ease-[cubic-bezier(.45,0,.2,1)]"
                style={{ bottom: 8, transform: `scaleY(${on ? 1 : 0})` }}
              />
              {POC_STEPS.map((s, i) => (
                <li
                  key={s.id}
                  className="relative transition-[opacity,transform] duration-700"
                  style={{ opacity: on ? 1 : 0.25, transform: on ? 'none' : 'translateX(10px)', transitionDelay: `${i * 300}ms` }}
                >
                  <span
                    aria-hidden
                    className="absolute -left-10 top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-route bg-ply-800 font-mono text-[10px] text-chalk"
                  >
                    {i + 1}
                  </span>
                  <p className="label-mono text-dust">{s.when}</p>
                  <h3 className="font-display mt-1 text-[clamp(28px,2.6vw,38px)] text-chalk">{s.title}</h3>
                  <p className="mt-1.5 max-w-[46ch] text-[15.5px] leading-relaxed text-chalk-dim">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
