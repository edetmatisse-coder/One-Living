'use client';

import { useMemo, type CSSProperties } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { BASE_WEIGHTS, CRITERIA, POLES, POLE_BY_ID, SCENARIOS, SPORTS } from '@/data/sports';
import { rankSports, toPercent, winnerChanges } from '@/lib/matrix';
import { fmtNumber, fmtScore } from '@/lib/format';
import { useMatrix } from '@/store/tools';
import { Section, SectionInner } from '@/components/layout/Section';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { SourceChip } from '@/components/ui/SourceChip';
import { Hold } from '@/components/ui/Hold';
import { IconCheck } from '@/components/ui/Icons';
import { useCapabilities } from '@/lib/device';

const SPORT_NAME = Object.fromEntries(SPORTS.map((s) => [s.id, s.name]));

function Verdict({ raw }: { raw: number[] }) {
  const changes = winnerChanges(raw, BASE_WEIGHTS);
  const custom = !SCENARIOS.some((s) => s.weights.every((w, k) => Math.abs(w - raw[k]) < 0.01));
  return (
    <div className="mt-10 border-t border-chalk/10 pt-7">
      <p className="flex items-start gap-3 text-[19px] font-semibold leading-snug text-chalk md:text-[21px]">
        <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-route text-ply-900">
          <IconCheck size={13} />
        </span>
        Les 4 gagnants de pôle ne changent dans aucun des 5 scénarios.
      </p>
      <p className="mt-4 text-[14.5px] leading-relaxed text-dust" aria-live="polite">
        {changes.length === 0 ? (
          <>
            {custom ? 'Avec vos réglages aussi' : 'Avec ce scénario'} : football, running, escalade et yoga restent en tête de leur pôle.
          </>
        ) : (
          <>
            Avec vos réglages,{' '}
            {changes.map((c, i) => (
              <span key={c.pole}>
                {i > 0 && ', '}
                <strong className="font-semibold text-chalk">{SPORT_NAME[c.to]}</strong> passe devant {SPORT_NAME[c.from].toLowerCase()} (
                {POLE_BY_ID[c.pole].label.toLowerCase()})
              </span>
            ))}
            . Il faut s’éloigner nettement de nos poids pour en arriver là.
          </>
        )}
      </p>
    </div>
  );
}

/**
 * Outil 1 : la matrice des 16 sports. Six curseurs (normalisés à 100 %),
 * seize barres qui se réordonnent en direct.
 */
export function Matrice({ meta }: { meta: SectionMeta }) {
  const raw = useMatrix((s) => s.raw);
  const scenario = useMatrix((s) => s.scenario);
  const setWeight = useMatrix((s) => s.setWeight);
  const applyScenario = useMatrix((s) => s.applyScenario);
  const caps = useCapabilities();
  const ranked = useMemo(() => rankSports(raw), [raw]);
  const pct = toPercent(raw);
  const top = ranked[0]?.score ?? 5;

  return (
    <Section
      meta={meta}
      title={['16 sports,', '4 gagnants']}
      cardFoot="Outil 1 · à manipuler"
      lead={
        <>
          Seize sports, quatre pôles, six critères notés de 1 à 5 par l’équipe. Bougez les curseurs : les poids restent normalisés
          à 100 % et les barres se réordonnent en direct.
        </>
      }
    >
      <SectionInner>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.35fr)] lg:gap-16">
          {/* Réglages */}
          <div>
            <p className="label-mono mb-4 text-route">Scénarios</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Scénarios de pondération">
              {SCENARIOS.map((s) => {
                const on = scenario === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applyScenario(s.id)}
                    aria-pressed={on}
                    className={`rounded-[4px] px-3.5 py-2 text-[14px] font-semibold transition-colors ${
                      on ? 'bg-route text-ply-900' : 'border border-chalk/15 text-chalk-dim hover:border-chalk/50 hover:text-chalk'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-9 flex items-baseline justify-between">
              <p className="label-mono text-dust">Pondérations</p>
              <p className="label-mono text-dust">Total 100 %</p>
            </div>
            <div className="mt-4 space-y-5">
              {CRITERIA.map((c, i) => (
                <RangeSlider
                  key={c.id}
                  label={c.label}
                  hint={c.question}
                  value={raw[i]}
                  min={0}
                  max={60}
                  step={1}
                  onChange={(v) => setWeight(i, v)}
                  display={`${fmtNumber(pct[i], pct[i] % 1 === 0 ? 0 : 1)} %`}
                  valueText={`${c.label} : ${fmtNumber(pct[i], 1)} %`}
                />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[12.5px] text-dust">
              Volume appuyé sur les licences 2025 <SourceChip id="insee" withLabel /> et l’Observatoire de l’escalade
              <SourceChip id="obs-escalade" />
            </div>
            <Verdict raw={raw} />
          </div>

          {/* Classement */}
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {POLES.map((p) => (
                <span key={p.id} className="flex items-center gap-2 text-[13px] text-chalk-dim">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: ROUTE_COLORS[p.route] }} />
                  {p.label}
                </span>
              ))}
            </div>
            <LayoutGroup>
              <ol className="relative" aria-label="Classement des 16 sports">
                {ranked.map((s) => {
                  const color = ROUTE_COLORS[POLE_BY_ID[s.pole].route];
                  const w = (s.score / 5) * 100;
                  return (
                    <motion.li
                      layout={!caps.reducedMotion}
                      key={s.id}
                      transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.9 }}
                      className={`grid grid-cols-[30px_minmax(0,128px)_minmax(0,1fr)_52px] items-center gap-3 py-[7px] md:grid-cols-[34px_150px_minmax(0,1fr)_58px] ${
                        s.poleWinner ? '' : 'opacity-70'
                      }`}
                      style={{ '--route': color } as CSSProperties}
                    >
                      <span className="font-mono text-[12px] tabular-nums text-dust">{String(s.rank).padStart(2, '0')}</span>
                      <span className={`flex items-center gap-2 truncate text-[15px] ${s.poleWinner ? 'font-semibold text-chalk' : 'text-chalk-dim'}`}>
                        {s.name}
                      </span>
                      <span className="relative h-[18px] overflow-hidden rounded-[3px] bg-chalk/[0.06]">
                        <span
                          className="absolute inset-y-0 left-0 rounded-[3px] transition-[width] duration-500 ease-[cubic-bezier(.2,.8,.1,1)]"
                          style={{
                            width: `${w}%`,
                            background: s.poleWinner ? color : `color-mix(in srgb, ${color} 42%, #25221e)`,
                            boxShadow: s.poleWinner ? `0 0 18px -4px ${color}` : 'none',
                          }}
                        />
                        {s.poleWinner && (
                          <span
                            className="label-mono absolute inset-y-0 flex items-center gap-1.5 whitespace-nowrap pl-2 text-[9px] text-ply-900"
                            style={{ left: 0 }}
                          >
                            <Hold kind="jug" color="#141210" size={11} lit />
                            1er du pôle
                          </span>
                        )}
                        {/* repère : meilleur score */}
                        <span className="absolute inset-y-0 w-px bg-chalk/20" style={{ left: `${(top / 5) * 100}%` }} />
                      </span>
                      <span className={`text-right font-mono text-[15px] tabular-nums ${s.poleWinner ? 'text-chalk' : 'text-dust'}`}>
                        {fmtScore(s.score)}
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
            </LayoutGroup>
            <p className="label-mono mt-5 flex justify-between text-[10px] text-dust/70">
              <span>Score pondéré sur 5</span>
              <span>Notes : notation de l’équipe</span>
            </p>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
