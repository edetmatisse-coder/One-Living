'use client';

import { useRef, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { FORMAT_BY_ID, PRODUCT_BY_ID, TEMPS } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { Hold, type HoldKind } from '@/components/ui/Hold';
import { useInView } from '@/lib/use-in-view';
import { Packshot } from './Gamme';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { SourceChip } from '@/components/ui/SourceChip';

const KINDS: HoldKind[] = ['crimp', 'jug', 'sloper'];
const COLORS = [ROUTE_COLORS.yellow, ROUTE_COLORS.pink, ROUTE_COLORS.blue];
const TILT = [-1.6, 1.2, -0.8];

function Temps({ t, i }: { t: (typeof TEMPS)[number]; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -25% 0px' });
  const c = COLORS[i];
  const key = t.id === 'apres';
  const product = PRODUCT_BY_ID[t.product];
  const flip = i % 2 === 1;
  return (
    <li
      ref={ref}
      data-reveal
      className="relative grid gap-8 border-t border-chalk/10 py-14 md:grid-cols-2 md:items-center md:gap-14 md:py-20"
      style={{ '--route': c } as CSSProperties}
    >
      <div className={flip ? 'md:order-2' : ''}>
        <div className="flex items-center gap-5">
          <span
            className={`font-display text-[110px] leading-[0.75] transition-colors duration-700 md:text-[140px] ${on ? 'text-route' : 'text-outline text-chalk/30'}`}
          >
            {i + 1}
          </span>
          <Hold
            kind={KINDS[i]}
            color={c}
            lit={on}
            size={50}
            style={{ transition: 'filter .6s', filter: on ? `drop-shadow(0 0 14px ${c}99)` : 'none', transform: `rotate(${[-14, 10, -6][i]}deg)` }}
          />
        </div>
        <p className="label-mono mt-6 text-route">{t.label}</p>
        <h3 className={`font-display mt-3 text-[clamp(44px,5.4vw,92px)] ${key ? 'text-chalk' : 'text-chalk-dim'}`}>{t.title}</h3>
        <p className="mt-5 max-w-[42ch] text-[18px] leading-relaxed text-chalk-dim md:text-[20px]">{t.text}</p>
        <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-chalk/12 px-3 py-1.5 text-[13.5px] text-chalk-dim">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROUTE_COLORS[product.route] }} />
          {FORMAT_BY_ID[product.format].label} {FORMAT_BY_ID[product.format].volume} · {product.name.toLowerCase()}
        </p>
      </div>

      <figure
        className={`relative ${flip ? 'md:order-1' : ''}`}
        style={{ transform: `rotate(${TILT[i]}deg)` }}
      >
        <span
          className={`tape -top-2.5 left-10 z-10 rotate-[-5deg] transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: on ? '700ms' : '0ms' }}
          aria-hidden
        />
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-ply-800 shadow-[0_40px_70px_-30px_rgba(0,0,0,.85)] transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(.2,.8,.1,1)]"
          style={{ clipPath: on ? 'inset(0 0 0 0 round 6px)' : 'inset(0 0 100% 0 round 6px)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.photo}
            alt={t.photoAlt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={`h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(.2,.8,.1,1)] ${on ? 'scale-100' : 'scale-110'}`}
          />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(16,14,12,.65))]" />
          <figcaption className="label-mono absolute bottom-3 left-4 text-[9px] text-chalk/75">Photo b-wall.fr</figcaption>
        </div>
        {/* la boisson du moment, posée sur la photo */}
        <div
          className={`absolute -bottom-6 ${flip ? 'left-3 md:-left-6' : 'right-3 md:-right-6'} w-[26%] max-w-[140px] rotate-[4deg] rounded-[6px] bg-chalk p-2 shadow-[0_24px_40px_-16px_rgba(0,0,0,.8)] transition-all duration-700 ${
            on ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ transitionDelay: on ? '450ms' : '0ms' }}
        >
          <Packshot product={product} className="aspect-[3/4] w-full object-cover" />
        </div>
      </figure>
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
      cardFoot="Avant · après · entre grimpeurs"
      lead={<>Une séance, trois moments où le kombucha a sa place. Le plus important arrive juste après la voie.</>}
    >
      <SectionInner>
        {/* le chiffre qui fonde la campagne */}
        <div className="mb-6 grid gap-6 rounded-[8px] border border-chalk/10 bg-ply-900/40 p-7 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10 md:p-10">
          <p className="font-display flex items-start text-[clamp(96px,11vw,170px)] leading-[0.8] text-chalk">
            <RollingNumber value="69" />
            <span className="ml-2 mt-[0.08em] text-[0.42em] text-route">%</span>
          </p>
          <div>
            <p className="max-w-[30ch] text-[clamp(22px,2.2vw,32px)] font-medium leading-[1.2] text-chalk">
              des grimpeurs boivent un verre après leur séance.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-dust">
              Le moment existe déjà : la campagne s’y installe. <SourceChip id="obs-escalade" withLabel />
            </p>
          </div>
        </div>
        <ol>
          {TEMPS.map((t, i) => (
            <Temps key={t.id} t={t} i={i} />
          ))}
        </ol>
      </SectionInner>
    </Section>
  );
}
