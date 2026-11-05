'use client';

import { useRef } from 'react';
import type { SectionMeta } from '@/data/sections';
import { Section, SectionInner } from '@/components/layout/Section';
import { SourceChip } from '@/components/ui/SourceChip';
import { useInView } from '@/lib/use-in-view';

/**
 * L'histoire de la marque, en mise en page éditoriale. Aucune citation :
 * des faits (The Grocer) et notre récit de campagne.
 */
export function Histoire({ meta }: { meta: SectionMeta }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -25% 0px' });

  return (
    <Section meta={meta} solid title={['De No.1', 'à One']} cardFoot="L’histoire" lead={<>Un nom qui a changé de sens, et une idée qui va bien à la grimpe.</>}>
      <SectionInner>
        <div ref={ref} className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          {/* le nom qui change */}
          <div className="relative">
            <div className="sticky top-32">
              <div className="flex items-baseline gap-4">
                <span className="label-mono text-dust">2018</span>
                <span className="h-px flex-1 bg-chalk/15" />
                <span className="label-mono text-route">2024</span>
              </div>
              <div className="font-display relative mt-6 text-[clamp(110px,15vw,240px)] leading-[0.8]">
                <span className="relative block text-dust/60">
                  No.1
                  <span
                    aria-hidden
                    className="absolute left-[-3%] top-[48%] h-[0.06em] w-[106%] origin-left bg-route transition-transform duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)]"
                    style={{ transform: `scaleX(${on ? 1 : 0}) rotate(-5deg)` }}
                  />
                </span>
                <span
                  className="block text-chalk transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.2,.8,.1,1)]"
                  style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(18%)', transitionDelay: '450ms' }}
                >
                  One<span className="text-route">.</span>
                </span>
              </div>
              <p className="mt-8 max-w-[24ch] text-[clamp(26px,2.6vw,38px)] font-medium leading-[1.15] tracking-[-0.01em] text-chalk">
                D’être numéro un à se sentir aligné.
              </p>
            </div>
          </div>

          {/* le récit */}
          <article className="max-w-[60ch] text-[19px] leading-[1.7] text-chalk-dim">
            <p className="first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[96px] first-letter:leading-[0.8] first-letter:text-route">
              Au départ, il y a un rugbyman. Jonny Wilkinson a été champion du monde en 2003. Il a aussi parlé
              ouvertement de l’anxiété qui accompagnait cette quête de perfection, et l’équilibre mental est devenu son combat.
            </p>
            <figure className="relative my-12 rotate-[1.2deg] md:ml-10" data-reveal>
              <span className="tape -top-2.5 right-10 z-10 rotate-[6deg]" aria-hidden />
              <div className="relative aspect-square overflow-hidden rounded-[6px] bg-ply-800 shadow-[0_40px_70px_-30px_rgba(0,0,0,.85)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/produits/fondateur.jpg"
                  alt="Jonny Wilkinson boit un shot One Living dans une salle de sport"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-dust">
                <span>Jonny Wilkinson, fondateur de One Living.</span>
                <span className="label-mono text-[9px] text-dust/70">Photo oneliving.com</span>
              </figcaption>
            </figure>
            <p>
              En 2018, sa marque de boissons naît sous le nom No.1 Living. En 2024, elle devient One Living. Le chiffre devient un
              mot : on ne cherche plus à battre les autres, on cherche à se sentir aligné.
            </p>
            <p className="mt-7">
              Les grimpeurs connaissent cette idée. Sur une voie, personne ne gagne contre personne. On lit, on respire, on avance
              prise après prise, et on redescend content d’avoir trouvé le bon geste. Après la voie, il reste le moment de souffler.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-chalk/10 pt-6 text-[13px] text-dust">
              Faits sur la marque : <SourceChip id="grocer" withLabel />
            </div>
          </article>
        </div>
      </SectionInner>
    </Section>
  );
}
