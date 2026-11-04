'use client';

import { useRef } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { SIM_PRESETS } from '@/data/economics';
import { bottlesPerYear, breakEven } from '@/lib/economics';
import { fmtInt, fmtNumber } from '@/lib/format';
import { Section, SectionInner } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { Hold } from '@/components/ui/Hold';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { useInView } from '@/lib/use-in-view';

const SALLE = SIM_PRESETS[0].inputs;
const PER_MONTH = Math.round(bottlesPerYear(SALLE) / 12); // 124
const SEUIL_MONTH = Math.ceil(breakEven(SALLE) / 12); // 16
const PASSAGES = SALLE.jours * SALLE.passages; // 49 500
const COST_PER_PASSAGE_CT = (SALLE.activation / PASSAGES) * 100; // 0,30 centime

/**
 * Les 4 indicateurs de décision du POC, avec leur définition et la façon
 * de les mesurer.
 */
export function Indicateurs({ meta }: { meta: SectionMeta }) {
  const hex = ROUTE_COLORS[meta.route];
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -20% 0px' });

  return (
    <Section
      meta={meta}
      title={['Quatre chiffres', 'pour décider']}
      cardFoot="Tableau de bord du POC"
      lead={<>Ce qu’on mesure pendant les trois mois du test, et comment on le lit pour décider de la suite.</>}
    >
      <SectionInner>
        <div ref={ref} className="grid gap-5 md:grid-cols-2">
          {/* 1. Salles activées */}
          <article className="relative overflow-hidden rounded-[6px] border border-chalk/10 bg-ply-900/40 p-7 md:p-9">
            <p className="label-mono text-dust">01 · Salles activées</p>
            <div className="mt-5 flex items-end gap-6">
              <p className="font-display text-[80px] leading-[0.8] text-chalk md:text-[96px]">
                <RollingNumber value="3" play={on} />
                <span className="text-[0.4em] text-dust"> / 3</span>
              </p>
              <div className="mb-2 flex gap-2">
                {[0, 1, 2].map((k) => (
                  <Hold key={k} kind={(['jug', 'sloper', 'crimp'] as const)[k]} color={hex} lit={on} size={34} style={{ transition: `filter .5s ${k * 250}ms`, filter: on ? `drop-shadow(0 0 8px ${hex})` : 'none' }} />
                ))}
              </div>
            </div>
            <p className="mt-6 text-[16px] leading-relaxed text-chalk-dim">
              Objectif du POC : les 3 salles test, frigo installé, approvisionné et visible au bar.
            </p>
            <p className="mt-2 text-[13.5px] text-dust">Mesure : relevé à l’installation puis chaque semaine.</p>
          </article>

          {/* 2. Bouteilles par salle */}
          <article className="relative overflow-hidden rounded-[6px] bg-route p-7 text-ply-900 md:p-9">
            <div className="flex items-center justify-between">
              <p className="label-mono text-ply-900/70">02 · Bouteilles par salle</p>
              <Badge kind="neutral" className="!border-ply-900/30 !text-ply-900">Hypothèse</Badge>
            </div>
            <p className="font-display mt-5 whitespace-nowrap text-[68px] leading-[0.8] md:text-[96px]">
              <span className="text-[0.38em]">env. </span>
              <RollingNumber value={fmtInt(PER_MONTH)} play={on} />
              <span className="text-[0.38em]"> / mois</span>
            </p>
            <div className="mt-6">
              <div className="relative h-3 overflow-hidden rounded-full bg-ply-900/15">
                <div className="absolute inset-y-0 left-0 rounded-full bg-ply-900 transition-[width] duration-[1600ms]" style={{ width: on ? '100%' : '0%' }} />
                <div className="absolute inset-y-[-4px] w-[3px] bg-chalk" style={{ left: `${(SEUIL_MONTH / PER_MONTH) * 100}%` }} />
              </div>
              <p className="mt-2 font-mono text-[11px]">seuil : environ {SEUIL_MONTH} bouteilles par mois</p>
            </div>
            <p className="mt-5 text-[16px] leading-relaxed">
              Salle type : {fmtInt(bottlesPerYear(SALLE))} bouteilles par an, pour un seuil de {fmtInt(breakEven(SALLE))}.
            </p>
            <p className="mt-2 text-[13.5px] text-ply-900/75">Mesure : réassorts du frigo, ventes du bar.</p>
          </article>

          {/* 3. Taux de réachat */}
          <article className="relative overflow-hidden rounded-[6px] border border-chalk/10 bg-ply-900/40 p-7 md:p-9">
            <p className="label-mono text-dust">03 · Taux de réachat</p>
            <p className="font-display mt-5 text-[64px] leading-[0.85] text-chalk">À mesurer</p>
            <p className="mt-6 text-[16px] leading-relaxed text-chalk-dim">
              Part des acheteurs qui reprennent une bouteille lors d’une séance suivante.
            </p>
            <p className="mt-2 text-[13.5px] text-dust">
              Mesure : scans du QR code de la voie du mois et sondage au bar. Pas d’objectif chiffré avant le test.
            </p>
          </article>

          {/* 4. Coût par pratiquant touché */}
          <article className="relative overflow-hidden rounded-[6px] border border-chalk/10 bg-ply-900/40 p-7 md:p-9">
            <div className="flex items-center justify-between">
              <p className="label-mono text-dust">04 · Coût par pratiquant touché</p>
              <Badge kind="hypothese" />
            </div>
            <p className="mt-6 font-mono text-[15px] text-chalk">coût d’activation ÷ pratiquants uniques exposés</p>
            <p className="font-display mt-5 text-[64px] leading-[0.85] text-chalk">
              <RollingNumber value={fmtNumber(COST_PER_PASSAGE_CT, 1)} play={on} />
              <span className="text-[0.45em] text-dust"> centime par passage</span>
            </p>
            <p className="mt-5 text-[16px] leading-relaxed text-chalk-dim">
              Ordre de grandeur avec la salle type : {fmtInt(SALLE.activation)} € pour {fmtInt(PASSAGES)} passages par an. Le chiffre
              par pratiquant sera plus élevé, puisqu’un grimpeur vient plusieurs fois.
            </p>
          </article>
        </div>
      </SectionInner>
    </Section>
  );
}
