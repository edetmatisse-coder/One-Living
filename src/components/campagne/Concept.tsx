'use client';

import { useRef, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { TEMPS } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { Hold, type HoldKind } from '@/components/ui/Hold';
import { useInView } from '@/lib/use-in-view';

const KINDS: HoldKind[] = ['crimp', 'jug', 'sloper'];
const COLORS = [ROUTE_COLORS.yellow, ROUTE_COLORS.pink, ROUTE_COLORS.blue];

function Temps({ t, i }: { t: (typeof TEMPS)[number]; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -30% 0px' });
  const c = COLORS[i];
  const key = t.id === 'apres';
  return (
    <li
      ref={ref}
      className="relative grid gap-6 border-t border-chalk/10 py-12 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,0.9fr)] md:items-center md:gap-12 md:py-16"
      style={{ '--route': c } as CSSProperties}
    >
      <div className="flex items-center gap-5">
        <span
          className={`font-display text-[120px] leading-[0.75] transition-colors duration-700 md:text-[150px] ${on ? 'text-route' : 'text-outline text-chalk/30'}`}
        >
          {i + 1}
        </span>
        <Hold
          kind={KINDS[i]}
          color={c}
          lit={on}
          size={52}
          style={{ transition: 'filter .6s', filter: on ? `drop-shadow(0 0 14px ${c}99)` : 'none', transform: `rotate(${[-14, 10, -6][i]}deg)` }}
        />
      </div>
      <div>
        <p className="label-mono text-route">{t.label}</p>
        <h3 className={`font-display mt-3 text-[clamp(44px,5.4vw,92px)] ${key ? 'text-chalk' : 'text-chalk-dim'}`}>{t.title}</h3>
      </div>
      <p className="max-w-[42ch] text-[18px] leading-relaxed text-chalk-dim md:text-[20px]">{t.text}</p>
    </li>
  );
}

/** Le concept en 3 temps : avant de grimper, après la voie, entre grimpeurs. */
export function Concept({ meta }: { meta: SectionMeta }) {
  return (
    <Section
      meta={meta}
      solid
      title={['Trois temps,', 'un rituel']}
      cardFoot="Le concept"
      lead={<>Une séance, trois moments où le kombucha a sa place. Le plus important arrive juste après la voie.</>}
    >
      <SectionInner>
        <ol>
          {TEMPS.map((t, i) => (
            <Temps key={t.id} t={t} i={i} />
          ))}
        </ol>
      </SectionInner>
    </Section>
  );
}
