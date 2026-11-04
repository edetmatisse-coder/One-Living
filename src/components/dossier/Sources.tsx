'use client';

import type { SectionMeta } from '@/data/sections';
import { HYPOTHESES, SOURCES } from '@/data/sources';
import { Section, SectionInner } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { IconExternal } from '@/components/ui/Icons';

/**
 * Le sommet de la voie : toutes les sources, cliquables, et la liste de ce
 * qui relève de l'hypothèse.
 */
export function Sources({ meta }: { meta: SectionMeta }) {
  return (
    <Section
      meta={meta}
      title={['Sources', 'et hypothèses']}
      cardFoot="Top de la voie"
      lead={
        <>
          Chaque chiffre du Dossier renvoie à une source ci-dessous ou porte le badge <Badge kind="hypothese" />. Les valeurs marquées
          Hypothèse sont à confirmer avec One Living et notre sondage terrain.
        </>
      }
    >
      <SectionInner>
        <div data-pres-stack className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <div data-part data-part-title="Les sources">
            <p className="label-mono mb-6 text-route">Sources citées</p>
            <ol data-pres-cols className="divide-y divide-chalk/[0.08] border-y border-chalk/[0.08]">
              {SOURCES.map((s) => (
                <li key={s.id} id={`source-${s.id}`} className="scroll-mt-40 rounded-[4px] transition-colors">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group grid grid-cols-[44px_minmax(0,1fr)_20px] gap-4 py-5 pr-2"
                    data-cursor-label="Ouvrir la source"
                  >
                    <span className="font-mono text-[14px] tabular-nums text-route">[{s.num}]</span>
                    <span>
                      <span className="block text-[13px] font-medium uppercase tracking-[0.08em] text-dust">{s.publisher}</span>
                      <span className="mt-1 block text-[18px] font-semibold leading-snug text-chalk transition-colors group-hover:text-route">
                        {s.title}
                      </span>
                      <span className="mt-2 block text-[14px] leading-relaxed text-chalk-dim">{s.supports.join(' · ')}</span>
                      <span className="mt-2 block truncate font-mono text-[10.5px] text-dust/70">{s.url.replace(/^https?:\/\//, '')}</span>
                    </span>
                    <span className="mt-1 text-dust transition-colors group-hover:text-chalk">
                      <IconExternal size={14} />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div data-part data-part-title="Les hypothèses">
            <p className="label-mono mb-6 text-route">Ce qui relève de l’hypothèse</p>
            <ul data-pres-cols className="space-y-5">
              {HYPOTHESES.map((h) => (
                <li key={h.label} className="rounded-[6px] border border-dashed border-yellow/35 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge kind="hypothese" />
                    <span className="text-[16px] font-semibold text-chalk">{h.label}</span>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-chalk-dim">{h.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[13.5px] leading-relaxed text-dust">
              Les liens s’ouvrent sur le site de chaque source et demandent une connexion. Le reste du Dossier fonctionne hors ligne.
            </p>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
