'use client';

import { useEffect, useRef, useState } from 'react';
import type { SectionMeta } from '@/data/sections';
import { Section, SectionInner } from '@/components/layout/Section';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Badge } from '@/components/ui/Badge';
import { fmtEuro, fmtInt } from '@/lib/format';
import { useInView } from '@/lib/use-in-view';
import { useCapabilities } from '@/lib/device';

/** Valeurs de départ des compteurs : chiffres de démonstration. */
const DEMO_BOTTLES = 18240;
const DEMO_EUROS = 1824;

/**
 * One Giving : chaque achat finance des associations de santé mentale.
 * Les compteurs sont des chiffres de démonstration, qui avancent pour
 * montrer le principe d'un compteur en direct.
 */
export function OneGiving({ meta }: { meta: SectionMeta }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -20% 0px' });
  const caps = useCapabilities();
  const [bottles, setBottles] = useState(DEMO_BOTTLES);

  useEffect(() => {
    if (!on || caps.reducedMotion) return;
    const id = window.setInterval(() => setBottles((b) => b + 1 + Math.floor(Math.random() * 3)), 1800);
    return () => window.clearInterval(id);
  }, [on, caps.reducedMotion]);

  const euros = DEMO_EUROS + Math.floor((bottles - DEMO_BOTTLES) / 10);

  return (
    <Section
      meta={meta}
      solid
      title={['One Giving']}
      cardFoot="L’engagement santé mentale"
      lead={<>Chaque achat finance des associations de santé mentale. Une bouteille au bar, c’est aussi un coup de main.</>}
    >
      <SectionInner>
        <div ref={ref} className="relative overflow-hidden rounded-[10px] border border-chalk/10 bg-ply-900/50 p-8 md:p-14">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-route/20 blur-3xl" />
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="label-mono text-route">Compteur One Giving</p>
            <Badge kind="demo">Chiffres de démonstration</Badge>
          </div>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="font-display text-[clamp(72px,10vw,160px)] leading-[0.8] text-chalk">
                <RollingNumber value={fmtInt(bottles)} play={on} durationMs={1400} spins={1} />
              </p>
              <p className="mt-4 text-[18px] text-chalk-dim">bouteilles partagées après la voie</p>
            </div>
            <div>
              <p className="font-display text-[clamp(72px,10vw,160px)] leading-[0.8] text-route">
                <RollingNumber value={fmtEuro(euros)} play={on} durationMs={1400} spins={1} />
              </p>
              <p className="mt-4 text-[18px] text-chalk-dim">reversés aux associations</p>
            </div>
          </div>
          <p className="mt-12 max-w-[64ch] border-t border-chalk/10 pt-6 text-[14.5px] leading-relaxed text-dust">
            Les montants affichés sont fictifs : ils montrent ce que verrait un grimpeur sur le site de la campagne. Les
            associations soutenues et le mode de calcul sont à confirmer avec One Living.
          </p>
        </div>
      </SectionInner>
    </Section>
  );
}
