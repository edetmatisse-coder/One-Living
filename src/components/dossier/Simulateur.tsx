'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SectionMeta } from '@/data/sections';
import { SIM_FIELDS, SIM_PRESETS, type PosInputs } from '@/data/economics';
import { gaugePosition, simulate, type Simulation } from '@/lib/economics';
import { fmtEuro, fmtInt, fmtNumber, fmtPrice } from '@/lib/format';
import { useSim } from '@/store/tools';
import { Section, SectionInner } from '@/components/layout/Section';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Badge } from '@/components/ui/Badge';
import { useCapabilities } from '@/lib/device';
import { useInView } from '@/lib/use-in-view';
import { BOTTLES_PER_MESH, GYM_CAPACITY } from '@/components/three/gym/constants';

const GymScene = dynamic(() => import('@/components/three/gym/GymScene'), { ssr: false });

const MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

function fieldDisplay(key: keyof PosInputs, v: number): string {
  switch (key) {
    case 'jours':
      return `${fmtInt(v)} j`;
    case 'passages':
      return `${fmtInt(v)} / jour`;
    case 'tauxPct':
      return `${fmtNumber(v, v % 1 === 0 ? 0 : 1)} %`;
    case 'activation':
      return fmtEuro(v);
    default:
      return fmtPrice(v);
  }
}

function lerpColor(a: string, b: string, t: number) {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `rgb(${pa.map((x, i) => Math.round(x + (pb[i] - x) * t)).join(',')})`;
}

export function gaugeColor(t: number) {
  return t < 0.5 ? lerpColor('E5533D', 'F2B705', t / 0.5) : lerpColor('F2B705', '3CCB7F', (t - 0.5) / 0.5);
}

/** Arrondi à 2 décimales : mêmes attributs SVG côté serveur et client. */
const r2d = (v: number) => Math.round(v * 100) / 100;

/** Jauge semi-circulaire : rouge sous le seuil, verte au-dessus. */
function Gauge({ sim }: { sim: Simulation }) {
  const t = gaugePosition(sim);
  const angle = -90 + t * 180;
  const color = gaugeColor(t);
  const ratio = Number.isFinite(sim.ratio) ? sim.ratio : 0;
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 240 138" className="w-full" role="img" aria-label={`Jauge : ${ratio >= 1 ? 'rentable' : 'sous le seuil'}`}>
        <defs>
          <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#E5533D" />
            <stop offset="0.5" stopColor="#F2B705" />
            <stop offset="1" stopColor="#3CCB7F" />
          </linearGradient>
        </defs>
        <path d="M 24 120 A 96 96 0 0 1 216 120" fill="none" stroke="rgba(243,239,232,.08)" strokeWidth="16" strokeLinecap="round" />
        <path d="M 24 120 A 96 96 0 0 1 216 120" fill="none" stroke="url(#gauge-grad)" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
        {Array.from({ length: 13 }, (_, i) => {
          const a = Math.PI * (1 - i / 12);
          const r1 = 76;
          const r2 = i % 6 === 0 ? 66 : 71;
          return (
            <line
              key={i}
              x1={r2d(120 + Math.cos(a) * r1)}
              y1={r2d(120 - Math.sin(a) * r1)}
              x2={r2d(120 + Math.cos(a) * r2)}
              y2={r2d(120 - Math.sin(a) * r2)}
              stroke="rgba(243,239,232,.35)"
              strokeWidth={i % 6 === 0 ? 1.6 : 1}
            />
          );
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '120px 120px', transition: 'transform .7s cubic-bezier(.2,.8,.1,1)' }}>
          <path d="M 117 120 L 120 36 L 123 120 Z" fill={color} style={{ transition: 'fill .5s' }} />
        </g>
        <circle cx="120" cy="120" r="8" fill="#141210" stroke={color} strokeWidth="2.5" />
        <text x="24" y="136" textAnchor="middle" className="fill-dust font-mono text-[8px] uppercase tracking-widest">
          Perte
        </text>
        <text x="120" y="12" textAnchor="middle" className="fill-dust font-mono text-[8px] uppercase tracking-widest">
          Seuil
        </text>
        <text x="216" y="136" textAnchor="middle" className="fill-dust font-mono text-[8px] uppercase tracking-widest">
          Rentable
        </text>
      </svg>
      <p className="mt-2 text-center text-[14px] text-chalk-dim">
        {Number.isFinite(sim.breakEven) ? (
          <>
            Seuil à <strong className="font-semibold text-chalk">{fmtInt(sim.breakEven)} bouteilles</strong>
            {' · '}
            <span style={{ color }}>×{fmtNumber(ratio, ratio >= 10 ? 0 : 1)}</span>
          </>
        ) : (
          <span className="text-loss">La cession ne couvre pas le coût de revient.</span>
        )}
      </p>
    </div>
  );
}

function Output({ label, value, formula, tone }: { label: string; value: string; formula: string; tone?: 'gain' | 'loss' }) {
  return (
    <div className="border-t border-chalk/10 pt-4">
      <p className="text-[13px] font-medium text-dust">{label}</p>
      <p
        className={`font-display mt-1 text-[clamp(34px,3.4vw,52px)] leading-none ${
          tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-chalk'
        }`}
      >
        <RollingNumber value={value} durationMs={900} spins={1} />
      </p>
      <p className="mt-2 font-mono text-[10.5px] leading-snug text-dust/80">{formula}</p>
    </div>
  );
}

/**
 * Outil 2 : le simulateur « Ma salle ».
 */
export function Simulateur({ meta }: { meta: SectionMeta }) {
  const inputs = useSim((s) => s.inputs);
  const preset = useSim((s) => s.preset);
  const setField = useSim((s) => s.setField);
  const applyPreset = useSim((s) => s.applyPreset);
  const sim = useMemo(() => simulate(inputs), [inputs]);
  const caps = useCapabilities();
  const stageRef = useRef<HTMLDivElement>(null);
  const stageOn = useInView(stageRef, { rootMargin: '0px 0px -15% 0px' });

  // L'année défile : la salle se remplit mois après mois
  const [month, setMonth] = useState(0);
  const timer = useRef<number | null>(null);
  const playYear = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    let m = 0;
    setMonth(0);
    timer.current = window.setInterval(() => {
      m += 1;
      setMonth(m);
      if (m >= 12 && timer.current) {
        window.clearInterval(timer.current);
        timer.current = null;
      }
    }, 420);
  }, []);
  useEffect(() => {
    if (!stageOn) return;
    if (caps.reducedMotion) {
      const id = window.setTimeout(() => setMonth(12), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(playYear, 0);
    return () => window.clearTimeout(id);
  }, [stageOn, caps.reducedMotion, playYear]);
  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const meshes = Math.round(sim.bottles / BOTTLES_PER_MESH);
  const shown = Math.round((meshes * month) / 12);
  const soldSoFar = Math.round((sim.bottles * month) / 12);
  const show3D = caps.ready && caps.webgl && !caps.reducedMotion;

  return (
    <Section
      meta={meta}
      title={['Combien rapporte', 'une salle ?']}
      cardFoot="Outil 2 · à manipuler"
      lead={<>Réglez une salle d’escalade et lisez ce qu’elle rapporte en un an, à One Living comme à la salle.</>}
    >
      <SectionInner>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)] lg:gap-14">
          {/* Réglages */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <p className="label-mono text-route">Préréglages</p>
              <Badge kind="hypothese" />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Préréglages">
              {SIM_PRESETS.map((p) => {
                const on = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    aria-pressed={on}
                    className={`rounded-[4px] px-3.5 py-2 text-[14px] font-semibold transition-colors ${
                      on ? 'bg-route text-ply-900' : 'border border-chalk/15 text-chalk-dim hover:border-chalk/50 hover:text-chalk'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 space-y-5">
              {SIM_FIELDS.map((f) => (
                <RangeSlider
                  key={f.key}
                  label={f.label}
                  value={inputs[f.key]}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(v) => setField(f.key, v)}
                  display={fieldDisplay(f.key, inputs[f.key])}
                  valueText={fieldDisplay(f.key, inputs[f.key]).replace(/ /g, ' ')}
                  compact
                />
              ))}
            </div>
            <p data-hide-in-slides className="mt-6 text-[13px] leading-relaxed text-dust">
              Activation : frigo prêté, PLV et dotation de lancement, sur l’année. Le prix de revente fixe la marge de la salle, pas
              la contribution de One Living.
            </p>
          </div>

          {/* Résultats */}
          <div>
            <div
              ref={stageRef}
              className="relative aspect-[4/3] overflow-hidden rounded-[6px] border border-chalk/10 bg-ply-900/60 md:aspect-[16/10]"
            >
              {show3D ? (
                <GymScene count={Math.min(shown, GYM_CAPACITY)} className="absolute inset-0" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-center text-dust">
                  <p className="font-display text-[64px] text-chalk">{fmtInt(sim.bottles)}</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5 md:p-4">
                <div className="rounded-[3px] bg-ply-900/80 px-2.5 py-1.5 md:px-3 md:py-2">
                  <p className="label-mono text-[9px] text-dust md:text-[9.5px]">Ventes cumulées</p>
                  <p className="font-mono text-[15px] tabular-nums text-chalk md:text-[18px]">
                    {fmtInt(soldSoFar)} <span className="text-[11px] text-dust md:text-[12px]">bouteilles</span>
                  </p>
                </div>
                <div className="rounded-[3px] bg-ply-900/80 px-2.5 py-1.5 text-right md:px-3 md:py-2">
                  <p className="label-mono text-[9px] text-dust md:text-[9.5px]">Mois</p>
                  <p className="font-mono text-[15px] text-chalk md:text-[18px]">{MONTHS[Math.max(0, month - 1)]}</p>
                </div>
              </div>
              <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-2.5 md:p-4">
                <p className="label-mono rounded-[3px] bg-ply-900/80 px-2 py-1.5 text-[8.5px] text-dust md:text-[9.5px]">
                  1 bouteille dessinée = {BOTTLES_PER_MESH} vendues
                  {meshes > GYM_CAPACITY ? ' · salle pleine' : ''}
                </p>
                <button
                  type="button"
                  onClick={playYear}
                  className="label-mono shrink-0 whitespace-nowrap rounded-[3px] border border-chalk/20 bg-ply-900/80 px-2.5 py-1.5 text-[9px] text-chalk-dim hover:text-chalk md:text-[9.5px]"
                >
                  Rejouer l’année
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_240px] md:items-start">
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <Output label="Bouteilles par an" value={fmtInt(sim.bottles)} formula="jours × passages × taux" />
                <Output label="Chiffre d’affaires de cession" value={fmtEuro(sim.revenue)} formula="bouteilles × prix de cession" />
                <Output label="Marge de la salle" value={fmtEuro(sim.margeSalle)} formula="bouteilles × (revente − cession)" />
                <Output
                  label="Contribution One Living"
                  value={fmtEuro(sim.contribution, { signed: true })}
                  formula="bouteilles × (cession − coût) − activation"
                  tone={sim.contribution >= 0 ? 'gain' : 'loss'}
                />
              </div>
              <div>
                <p className="label-mono mb-2 text-center text-dust">Seuil de rentabilité</p>
                <Gauge sim={sim} />
                <p className="mt-3 text-center font-mono text-[10.5px] text-dust/80">activation ÷ (cession − coût)</p>
              </div>
            </div>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
