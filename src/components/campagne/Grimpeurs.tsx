'use client';

import type { CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { DRINKERS, FORMAT_BY_ID, GYM_BY_ID, PRODUCT_BY_ID } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { Hold, type HoldKind } from '@/components/ui/Hold';

const KINDS: HoldKind[] = ['sloper', 'jug', 'pinch'];

/** Portrait abstrait : des prises qui dessinent une silhouette, sans photo. */
function Avatar({ color, seed }: { color: string; seed: number }) {
  return (
    <div className="relative grid aspect-square w-24 place-items-center overflow-hidden rounded-full bg-ply-800">
      <div className="inserts absolute inset-0 opacity-70" style={{ ['--insert-gap' as string]: '14px' }} />
      <Hold kind={KINDS[seed % 3]} color={color} size={58} style={{ transform: `rotate(${seed * 37 - 20}deg)` }} />
    </div>
  );
}

/** Trois buveurs de kombucha, profils fictifs, tous dans la cible des 35 ans et plus. */
export function Grimpeurs({ meta }: { meta: SectionMeta }) {
  return (
    <Section
      meta={meta}
      solid
      title={['Ils en boivent']}
      cardFoot="Profils · exemples"
      lead={<>Trois habitués des salles B’Wall, grimpeurs ou non, trois façons de boire leur kombucha.</>}
    >
      <SectionInner>
        <div className="grid gap-6 md:grid-cols-3 md:items-start">
          {DRINKERS.map((c, i) => {
            const f = PRODUCT_BY_ID[c.drink];
            const color = ROUTE_COLORS[f.route];
            return (
              <article
                key={c.id}
                className={`relative rounded-[8px] p-7 ${i === 1 ? 'bg-chalk text-ply-900 md:mt-16' : 'border border-chalk/10 bg-ply-900/40 text-chalk'} ${i === 2 ? 'md:mt-8' : ''}`}
                style={{ '--route': color, transform: `rotate(${[-1.2, 0.8, -0.4][i]}deg)` } as CSSProperties}
              >
                <span className="tape -top-2 left-1/2 -translate-x-1/2 rotate-[2deg]" aria-hidden />
                <div className="flex items-start justify-between gap-4">
                  <Avatar color={color} seed={i} />
                  <Badge kind="exemple" className={i === 1 ? '!border-ply-900/30 !text-ply-500' : ''}>
                    Exemple de profil
                  </Badge>
                </div>
                <h3 className="font-display mt-6 text-[48px] leading-[0.9]">
                  {c.name}, {c.age} ans
                </h3>
                <p className={`mt-1 text-[14px] font-medium ${i === 1 ? 'text-ply-500' : 'text-dust'}`}>
                  {GYM_BY_ID[c.gym].name} · {c.profile} · {c.since}
                </p>
                <p className={`mt-5 text-[16px] leading-relaxed ${i === 1 ? 'text-ply-800' : 'text-chalk-dim'}`}>{c.text}</p>
                <dl className={`mt-6 grid gap-3 border-t pt-5 text-[14px] ${i === 1 ? 'border-ply-900/10' : 'border-chalk/10'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <dt className={i === 1 ? 'text-ply-500' : 'text-dust'}>Sa boisson</dt>
                    <dd className="flex items-center gap-2 font-semibold">
                      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
                      {f.name}
                      <span className="font-normal opacity-60">· {FORMAT_BY_ID[f.format].label.toLowerCase()}</span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className={i === 1 ? 'text-ply-500' : 'text-dust'}>Moment préféré</dt>
                    <dd className="font-semibold">{c.moment}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </SectionInner>
    </Section>
  );
}
