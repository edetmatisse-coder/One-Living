'use client';

import { useMemo, useRef, type CSSProperties } from 'react';
import { useEco } from '@/store/tools';
import { LayoutGroup, motion } from 'framer-motion';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { ECO_CRITERIA, ECO_NOTES, ECO_WEIGHT_SETS, FINALISTS, NATIONAL, type Finalist } from '@/data/economics';
import { breakEven, bottlesPerYear, contribution, ecoScore, nationalPotential } from '@/lib/economics';
import { fmtEuro, fmtInt, fmtNumber, fmtScore } from '@/lib/format';
import { Section, SectionInner } from '@/components/layout/Section';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Badge } from '@/components/ui/Badge';
import { SourceChip } from '@/components/ui/SourceChip';
import { IconCheck } from '@/components/ui/Icons';
import { useInView } from '@/lib/use-in-view';
import { useCapabilities } from '@/lib/device';

const PINK = ROUTE_COLORS.pink;

/** Couleur de pôle de chaque finaliste (cohérente avec la matrice). */
const FINALIST_COLOR: Record<Finalist['id'], string> = {
  football: ROUTE_COLORS.orange,
  running: ROUTE_COLORS.blue,
  escalade: ROUTE_COLORS.yellow,
  yoga: ROUTE_COLORS.pink,
};

function Finalists() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -20% 0px' });
  return (
    <div ref={ref} data-part data-part-title="Les 4 finalistes">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="label-mono text-route">Les 4 finalistes, un point de vente sur un an</p>
        <Badge kind="hypothese" />
      </div>
      <div
        className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 pt-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pt-0"
        data-lenis-prevent
      >
        {FINALISTS.map((f, i) => {
          const b = bottlesPerYear(f);
          const c = contribution(f);
          const s = breakEven(f);
          const ratio = b / s;
          const star = f.id === 'escalade';
          const color = FINALIST_COLOR[f.id];
          return (
            <article
              key={f.id}
              className={`relative flex w-[78vw] max-w-[320px] shrink-0 snap-start flex-col rounded-[6px] p-5 transition-transform duration-500 md:w-auto md:max-w-none md:p-6 ${
                star ? 'bg-chalk text-ply-900 md:-translate-y-3 md:shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]' : 'border border-chalk/10 bg-ply-900/40'
              }`}
              style={{ '--route': color } as CSSProperties}
            >
              {star && <span className="tape -top-2 left-6 rotate-[-4deg]" aria-hidden />}
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[34px]" style={{ fontWeight: 900 }}>
                  {f.sport}
                </h3>
                <span className="h-3 w-3 rounded-full" style={{ background: color }} />
              </div>
              <p className={`text-[14px] ${star ? 'text-ply-500' : 'text-dust'}`}>{f.lieu}</p>
              <p className={`mt-3 font-mono text-[11px] leading-relaxed ${star ? 'text-ply-500' : 'text-dust/80'}`}>
                {fmtInt(f.jours)} j × {fmtInt(f.passages)} passages × {fmtNumber(f.tauxPct, 0)}&nbsp;%
                <br />
                cession {fmtNumber(f.cession, 2)}&nbsp;€ · activation {fmtInt(f.activation)}&nbsp;€
              </p>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className={`text-[12.5px] ${star ? 'text-ply-500' : 'text-dust'}`}>Bouteilles par an</dt>
                  <dd className="font-display text-[44px] leading-none">
                    <RollingNumber value={fmtInt(b)} play={on} delayMs={i * 150} />
                  </dd>
                </div>
                <div>
                  <dt className={`text-[12.5px] ${star ? 'text-ply-500' : 'text-dust'}`}>Contribution</dt>
                  <dd
                    className="font-display text-[44px] leading-none"
                    style={{ color: c >= 0 ? (star ? '#1f8a52' : '#3CCB7F') : '#E5533D' }}
                  >
                    <RollingNumber value={fmtEuro(c, { signed: true })} play={on} delayMs={i * 150 + 200} />
                  </dd>
                </div>
                <div>
                  <dt className={`text-[12.5px] ${star ? 'text-ply-500' : 'text-dust'}`}>Seuil de rentabilité</dt>
                  <dd className="font-mono text-[18px] tabular-nums">{fmtInt(s)} bouteilles</dd>
                  {/* progression vers le seuil */}
                  <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${star ? 'bg-ply-900/10' : 'bg-chalk/10'}`}>
                    <div
                      className="h-full rounded-full transition-[width] duration-[1400ms] ease-[cubic-bezier(.2,.8,.1,1)]"
                      style={{ width: on ? `${Math.min(100, ratio * 100)}%` : '0%', background: ratio >= 1 ? '#3CCB7F' : '#E5533D', transitionDelay: `${i * 150}ms` }}
                    />
                  </div>
                  <p className={`mt-1.5 font-mono text-[10.5px] ${star ? 'text-ply-500' : 'text-dust/80'}`}>
                    {ratio >= 1 ? `seuil dépassé ×${fmtNumber(ratio, 1)}` : `${fmtNumber(ratio * 100, 0)} % du seuil`}
                  </p>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
      <p className="mt-6 max-w-[70ch] text-[15px] leading-relaxed text-dust">
        Le running a le volume, 13,2 millions de pratiquants <SourceChip id="obs-running" />, mais pas de point de vente régulier :
        dans notre modèle, un événement ne couvre pas son coût d’activation. Seules l’escalade et le yoga sont rentables dès la
        première année.
      </p>
    </div>
  );
}

/** Une note de 1 à 5 dessinée en inserts remplis. */
function Dots({ n, color }: { n: number; color: string }) {
  return (
    <span className="inline-flex gap-[3px]" aria-label={`${n} sur 5`}>
      {Array.from({ length: 5 }, (_, k) => (
        <span
          key={k}
          className="h-[9px] w-[9px] rounded-full"
          style={{ background: k < n ? color : 'transparent', boxShadow: `inset 0 0 0 1.5px ${k < n ? color : 'rgba(169,163,154,.35)'}` }}
        />
      ))}
    </span>
  );
}

function EcoNote() {
  const setId = useEco((s) => s.setId);
  const setSetId = useEco((s) => s.setSetId);
  const caps = useCapabilities();
  const set = ECO_WEIGHT_SETS.find((s) => s.id === setId)!;
  const total = set.weights.reduce((a, b) => a + b, 0);
  const ranked = useMemo(
    () =>
      FINALISTS.map((f) => ({ f, score: ecoScore(ECO_NOTES[f.id], set.weights) })).sort((a, b) => b.score - a.score),
    [set],
  );
  return (
    <div className="mt-24" data-part data-part-title="La note économique">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="label-mono mb-4 text-route">Note économique, sur 7 critères</p>
          <h3 className="font-display text-[clamp(40px,4.6vw,72px)] text-chalk">L’escalade devant, quels que soient les poids</h3>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Jeux de pondérations">
            {ECO_WEIGHT_SETS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSetId(s.id)}
                aria-pressed={s.id === setId}
                className={`rounded-[4px] px-3.5 py-2 text-[14px] font-semibold transition-colors ${
                  s.id === setId ? 'bg-route text-ply-900' : 'border border-chalk/15 text-chalk-dim hover:border-chalk/50 hover:text-chalk'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <LayoutGroup>
            <ol className="mt-8 space-y-3" aria-label="Classement économique">
              {ranked.map(({ f, score }, i) => (
                <motion.li
                  layout={!caps.reducedMotion}
                  key={f.id}
                  transition={{ type: 'spring', stiffness: 480, damping: 40 }}
                  className="grid grid-cols-[96px_minmax(0,1fr)_56px] items-center gap-4"
                >
                  <span className={`text-[16px] ${i === 0 ? 'font-semibold text-chalk' : 'text-chalk-dim'}`}>{f.sport}</span>
                  <span className="relative h-7 overflow-hidden rounded-[3px] bg-chalk/[0.06]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-[3px] transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.1,1)]"
                      style={{ width: `${(score / 5) * 100}%`, background: i === 0 ? PINK : `color-mix(in srgb, ${FINALIST_COLOR[f.id]} 40%, #25221e)` }}
                    />
                  </span>
                  <span className={`text-right font-mono text-[18px] tabular-nums ${i === 0 ? 'text-chalk' : 'text-dust'}`}>{fmtScore(score)}</span>
                </motion.li>
              ))}
            </ol>
          </LayoutGroup>
          <p className="mt-8 flex items-start gap-3 text-[19px] font-semibold leading-snug text-chalk">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-route text-ply-900">
              <IconCheck size={13} />
            </span>
            L’escalade est première dans les 5 jeux de pondérations testés.
          </p>
          <p className="mt-3 text-[13.5px] text-dust">
            Notes de 1 à 5 attribuées par l’équipe à partir du modèle par point de vente. Les 4 jeux de contrôle sont définis par
            l’équipe. <Badge kind="hypothese" />
          </p>
        </div>

        <div className="overflow-x-auto rounded-[6px] border border-chalk/10 bg-ply-900/40 p-5 md:p-7" data-lenis-prevent>
          <table className="w-full min-w-[480px] border-collapse text-left">
            <caption className="sr-only">Notes économiques par critère</caption>
            <thead>
              <tr className="label-mono text-[10px] text-dust">
                <th className="pb-4 font-medium">Critère</th>
                <th className="pb-4 text-right font-medium">Poids</th>
                {FINALISTS.map((f) => (
                  <th key={f.id} className="pb-4 pl-4 font-medium">
                    {f.sport}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ECO_CRITERIA.map((c, k) => (
                <tr key={c.id} className="border-t border-chalk/[0.07]">
                  <td className="py-3 text-[14px] text-chalk-dim">{c.label}</td>
                  <td className="py-3 text-right font-mono text-[13px] tabular-nums text-chalk">
                    {fmtNumber((set.weights[k] / total) * 100, set.id === 'egal' ? 1 : 0)}&nbsp;%
                  </td>
                  {FINALISTS.map((f) => (
                    <td key={f.id} className="py-3 pl-4">
                      <Dots n={ECO_NOTES[f.id][k]} color={f.id === 'escalade' ? PINK : FINALIST_COLOR[f.id]} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-chalk/20">
                <td className="pt-4 text-[14px] font-semibold text-chalk">Note</td>
                <td />
                {FINALISTS.map((f) => (
                  <td key={f.id} className="pl-4 pt-4 font-mono text-[16px] tabular-nums text-chalk">
                    {fmtScore(ecoScore(ECO_NOTES[f.id], set.weights))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function National() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -20% 0px' });
  const salleType = FINALISTS.find((f) => f.id === 'escalade')!;
  const pot = nationalPotential(salleType);
  const dots = NATIONAL.sallesPrivees + NATIONAL.structuresFFME;
  return (
    <div ref={ref} data-part data-part-title="Le potentiel national" className="mt-24 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
      <div>
        <p className="label-mono mb-4 text-route">Le potentiel national</p>
        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
          <div>
            <p className="font-display text-[clamp(72px,8vw,128px)] leading-[0.85] text-chalk">
              <RollingNumber value={fmtInt(NATIONAL.sallesPrivees)} play={on} />
            </p>
            <p className="mt-2 text-[15px] text-chalk-dim">salles privées en {NATIONAL.anneeSalles}</p>
          </div>
          <div>
            <p className="font-display text-[clamp(72px,8vw,128px)] leading-[0.85] text-dust">
              <RollingNumber value={fmtInt(NATIONAL.structuresFFME)} play={on} delayMs={300} />
            </p>
            <p className="mt-2 text-[15px] text-chalk-dim">structures FFME ensuite</p>
          </div>
        </div>
        <div className="mt-3">
          <SourceChip id="obs-escalade" withLabel />
        </div>
        <div className="mt-10 rounded-[6px] border border-dashed border-yellow/40 p-6">
          <div className="mb-4 flex items-center gap-3">
            <p className="text-[15px] font-semibold text-chalk">Si les 291 salles sont équipées comme la salle type</p>
            <Badge kind="hypothese" />
          </div>
          <dl className="grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-[12.5px] text-dust">Bouteilles par an</dt>
              <dd className="font-display mt-1 text-[38px] leading-none text-chalk">
                <span className="text-[0.5em] text-dust">env. </span>
                <RollingNumber value={fmtInt(pot.rounded.bottles)} play={on} delayMs={500} />
              </dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-dust">CA de cession</dt>
              <dd className="font-display mt-1 text-[38px] leading-none text-chalk">
                <span className="text-[0.5em] text-dust">env. </span>
                <RollingNumber value={fmtEuro(pot.rounded.revenue)} play={on} delayMs={650} />
              </dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-dust">Contribution</dt>
              <dd className="font-display mt-1 text-[38px] leading-none text-gain">
                <span className="text-[0.5em] text-dust">env. </span>
                <RollingNumber value={fmtEuro(pot.rounded.contribution)} play={on} delayMs={800} />
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div aria-hidden className="flex flex-wrap content-start gap-[5px] self-center">
        {Array.from({ length: dots }, (_, i) => {
          const salle = i < NATIONAL.sallesPrivees;
          return (
            <span
              key={i}
              className="h-[7px] w-[7px] rounded-full transition-[background-color,box-shadow,opacity] duration-500"
              style={{
                background: on && salle ? PINK : 'transparent',
                boxShadow: `inset 0 0 0 1.4px ${salle ? (on ? PINK : 'rgba(169,163,154,.4)') : 'rgba(169,163,154,.28)'}`,
                transitionDelay: on && salle ? `${(i % 97) * 9 + Math.floor(i / 97) * 120}ms` : '0ms',
              }}
            />
          );
        })}
        <p className="label-mono mt-4 w-full text-[10px] text-dust/80">
          1 point = 1 lieu · en rose les salles privées, en creux les structures FFME
        </p>
      </div>
    </div>
  );
}

export function Escalade({ meta }: { meta: SectionMeta }) {
  return (
    <Section
      meta={meta}
      title={['Un seul sport :', 'l’escalade']}
      cardFoot="Modèle par point de vente"
      lead={
        <>
          Les quatre gagnants de pôle passent au modèle économique : un point de vente type, sur un an, avec un coût de revient de
          1,00 € par bouteille.
        </>
      }
    >
      <SectionInner>
        <Finalists />
        <EcoNote />
        <National />
      </SectionInner>
    </Section>
  );
}
