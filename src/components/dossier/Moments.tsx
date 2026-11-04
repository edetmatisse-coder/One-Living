'use client';

import { useRef, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { AVOID, CAN_SAY, MOMENTS } from '@/data/moments';
import { Section, SectionInner } from '@/components/layout/Section';
import { Hold, type HoldKind } from '@/components/ui/Hold';
import { SourceChip } from '@/components/ui/SourceChip';
import { Badge } from '@/components/ui/Badge';
import { IconCheck, IconCross } from '@/components/ui/Icons';
import { useInView } from '@/lib/use-in-view';

const KINDS: HoldKind[] = ['crimp', 'jug', 'sloper'];

/**
 * Les 3 moments de consommation qui existent déjà en salle, puis ce que la
 * marque peut dire et ce qu'elle évite.
 */
export function Moments({ meta }: { meta: SectionMeta }) {
  const hex = ROUTE_COLORS[meta.route];
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -25% 0px' });

  return (
    <Section
      meta={meta}
      title={['Trois moments', 'déjà là']}
      cardFoot="Une séance type"
      lead={<>On ne crée pas d’habitude : le kombucha s’installe dans des moments qui existent déjà en salle.</>}
    >
      <SectionInner>
        <div ref={ref} className="relative" data-part data-part-title="Les 3 moments">
          <div className="mb-8 flex items-center gap-3">
            <p className="label-mono text-route">Une soirée en salle</p>
            <Badge kind="exemple">Horaires indicatifs</Badge>
          </div>
          {/* la séance comme une voie horizontale */}
          <div aria-hidden className="relative mb-10 hidden h-10 md:block">
            <div className="absolute inset-x-0 top-1/2 h-px bg-chalk/15" />
            <div
              className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-route transition-[width] duration-[2200ms] ease-[cubic-bezier(.45,0,.2,1)]"
              style={{ width: on ? '100%' : '0%', boxShadow: `0 0 12px ${hex}` }}
            />
            {['18 h 30 · arrivée', 'échauffement', 'séance', 'dernière voie', '21 h 15 · départ'].map((t, i, arr) => (
              <span
                key={t}
                className={`label-mono absolute top-0 whitespace-nowrap text-[9.5px] text-dust ${
                  i === 0 ? '' : i === arr.length - 1 ? '-translate-x-full' : '-translate-x-1/2'
                }`}
                style={{ left: `${i * 25}%` }}
              >
                {t}
              </span>
            ))}
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            {MOMENTS.map((m, i) => {
              const key = m.id === 'apres';
              return (
                <li
                  key={m.id}
                  className={`relative rounded-[6px] p-6 transition-[opacity,transform] duration-700 md:p-7 ${
                    key ? 'bg-route text-ply-900 md:-mt-4 md:mb-4' : 'border border-chalk/10 bg-ply-900/40'
                  }`}
                  style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(24px)', transitionDelay: `${300 + i * 250}ms` } as CSSProperties}
                >
                  <div className="flex items-start justify-between">
                    <span className={`font-display text-[64px] leading-[0.8] ${key ? 'text-ply-900' : 'text-route'}`}>{i + 1}</span>
                    <Hold kind={KINDS[i]} color={key ? '#141210' : hex} size={44} style={{ transform: `rotate(${[-10, 14, -4][i]}deg)` }} />
                  </div>
                  <p className={`label-mono mt-5 ${key ? 'text-ply-900/70' : 'text-dust'}`}>
                    {m.clock} · {m.when}
                  </p>
                  <h3 className="font-display mt-2 text-[clamp(32px,3vw,44px)]">{m.title}</h3>
                  <p className={`mt-1 text-[13px] font-semibold ${key ? 'text-ply-900/80' : 'text-chalk-dim'}`}>{m.product}</p>
                  <p className={`mt-4 text-[16px] leading-relaxed ${key ? 'text-ply-900' : 'text-chalk-dim'}`}>{m.text}</p>
                  {m.source && (
                    <div className="mt-4">
                      <SourceChip id={m.source} withLabel className={key ? '!border-ply-900/30 !text-ply-900' : ''} />
                    </div>
                  )}
                  {key && <span className="label-mono absolute -top-3 right-5 rounded-[3px] bg-ply-900 px-2 py-1 text-[9.5px] text-route">Le moment clé</span>}
                </li>
              );
            })}
          </ol>
        </div>

        {/* On peut dire / On évite */}
        <div className="mt-24" data-part data-part-title="On peut dire, on évite">
          <p className="label-mono mb-4 text-route">Les mots de la campagne</p>
          <h3 className="font-display max-w-[18ch] text-[clamp(40px,4.6vw,72px)] text-chalk">Moments, goût, bio. Jamais de promesse santé.</h3>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[6px] border border-gain/30 bg-gain/[0.04] p-6 md:p-8">
              <p className="mb-5 flex items-center gap-2 text-[15px] font-semibold text-gain">
                <IconCheck /> On peut dire
              </p>
              <ul className="space-y-4">
                {CAN_SAY.map((c) => (
                  <li key={c.say} className="grid grid-cols-[18px_1fr] gap-3">
                    <span className="mt-1.5 text-gain">
                      <IconCheck size={13} />
                    </span>
                    <span>
                      <span className="block text-[17px] font-semibold text-chalk">{c.say}</span>
                      <span className="block text-[14px] text-dust">{c.why}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[6px] border border-loss/30 bg-loss/[0.04] p-6 md:p-8">
              <p className="mb-5 flex items-center gap-2 text-[15px] font-semibold text-loss">
                <IconCross /> On évite
              </p>
              <ul className="space-y-4">
                {AVOID.map((c) => (
                  <li key={c.say} className="grid grid-cols-[18px_1fr] gap-3">
                    <span className="mt-1.5 text-loss">
                      <IconCross size={13} />
                    </span>
                    <span>
                      <span className="block text-[17px] font-semibold text-chalk line-through decoration-loss/70 decoration-2">{c.say}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[14px] text-dust">
                        {c.why}
                        {c.source && <SourceChip id={c.source} withLabel />}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
