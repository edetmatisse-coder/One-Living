'use client';

import { useState } from 'react';
import type { SectionMeta } from '@/data/sections';
import { FAQ } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';

/** Questions fréquentes : réponses factuelles, en accordéon accessible. */
export function Faq({ meta }: { meta: SectionMeta }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section meta={meta} solid title={['Questions', 'fréquentes']} cardFoot="Kombucha · alcool · caféine" lead={<>Ce qu’on nous demande le plus au bar.</>}>
      <SectionInner>
        <ul className="divide-y divide-chalk/10 border-y border-chalk/10">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span className={`font-display text-[clamp(30px,3.2vw,48px)] transition-colors ${isOpen ? 'text-route' : 'text-chalk'}`}>
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                        isOpen ? 'rotate-45 border-route bg-route text-ply-900' : 'border-chalk/25 text-chalk'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.8,.1,1)]"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[70ch] pb-8 text-[18px] leading-relaxed text-chalk-dim">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionInner>
    </Section>
  );
}
