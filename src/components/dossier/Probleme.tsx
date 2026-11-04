'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { SectionMeta } from '@/data/sections';
import { Section, SectionInner } from '@/components/layout/Section';
import { Hold } from '@/components/ui/Hold';
import { useCapabilities } from '@/lib/device';
import { useUI } from '@/store/ui';
import { ROUTE_COLORS } from '@/data/routes';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATEMENT: { t: string; k?: 1 | 2 | 3 }[] = [
  { t: 'One Living doit trouver hors rugby des sports où' },
  { t: 'son récit (le mental, l’équilibre) est légitime,', k: 1 },
  { t: 'où ses produits ont' },
  { t: 'un vrai moment de consommation,', k: 2 },
  { t: 'et où' },
  { t: 'une gamme fraîche à environ 3 € peut être distribuée.', k: 3 },
];

const APPUIS = [
  {
    n: 1,
    name: 'Le récit',
    text: 'Parler de mental et d’équilibre doit sonner juste pour les pratiquants, sans forcer le trait.',
    kind: 'jug' as const,
  },
  {
    n: 2,
    name: 'Le moment',
    text: 'Un instant où l’on boit déjà quelque chose, juste avant ou juste après l’effort.',
    kind: 'sloper' as const,
  },
  {
    n: 3,
    name: 'La distribution',
    text: 'Un lieu qui garde une gamme fraîche au froid et la vend autour de 3 €.',
    kind: 'crimp' as const,
  },
];

/**
 * Le problème posé par la marque, lu comme une règle d'escalade :
 * trois appuis à tenir en même temps.
 */
export function Probleme({ meta }: { meta: SectionMeta }) {
  const root = useRef<HTMLDivElement>(null);
  const caps = useCapabilities();
  const presentation = useUI((s) => s.presentation);
  const hex = ROUTE_COLORS[meta.route];

  useGSAP(
    () => {
      if (!caps.ready || caps.reducedMotion || presentation) return;
      const words = gsap.utils.toArray<HTMLElement>('[data-word]', root.current);
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: { trigger: '[data-statement]', start: 'top 78%', end: 'bottom 42%', scrub: 0.6 },
        },
      );
      gsap.fromTo(
        '[data-appui-line]',
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: '[data-appuis]', start: 'top 80%', end: 'top 30%', scrub: 0.6 },
        },
      );
      gsap.from('[data-appui]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: '[data-appuis]', start: 'top 75%' },
      });
    },
    { scope: root, dependencies: [caps.ready, caps.reducedMotion, presentation] },
  );

  return (
    <Section meta={meta} title={['Hors du rugby,', 'trois prises', 'à tenir']} cardFoot="Problématique 2">
      <div ref={root}>
        <SectionInner className="grid gap-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="label-mono mb-6 text-route">La question posée par One Living</p>
            <p data-statement className="text-[clamp(28px,3.1vw,46px)] font-medium leading-[1.18] tracking-[-0.018em] text-chalk">
              {STATEMENT.map((chunk, ci) => (
                <span key={ci} className={chunk.k ? 'relative' : ''}>
                  {chunk.t.split(' ').map((w, wi) => (
                    <span
                      key={wi}
                      data-word
                      className={chunk.k ? 'text-chalk underline decoration-route decoration-[3px] underline-offset-[0.18em]' : ''}
                    >
                      {w}{' '}
                    </span>
                  ))}
                  {chunk.k && (
                    <sup className="label-mono -ml-1 mr-2 align-super text-[12px] text-route">{chunk.k}</sup>
                  )}
                </span>
              ))}
            </p>
          </div>

          <div data-appuis className="relative">
            <p className="label-mono mb-6 text-dust">La règle des trois appuis</p>
            <div className="relative">
              <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
                <path
                  data-appui-line
                  d="M 12 8 L 12 50 L 12 92"
                  pathLength={1}
                  fill="none"
                  stroke="var(--route)"
                  strokeOpacity="0.5"
                  strokeWidth="0.6"
                  strokeDasharray="1"
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: 2 }}
                />
              </svg>
              <ol className="relative space-y-10">
                {APPUIS.map((a, i) => (
                  <li data-appui key={a.n} className={`relative grid grid-cols-[64px_1fr] items-start gap-5 ${i === 1 ? 'md:ml-10' : i === 2 ? 'md:ml-4' : ''}`}>
                    <div className="relative grid h-16 w-16 place-items-center">
                      <Hold kind={a.kind} color={hex} size={58} style={{ transform: `rotate(${[-12, 18, -4][i]}deg)`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.5))' }} />
                      <span className="label-mono absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-chalk text-[10px] text-ply-900">
                        {a.n}
                      </span>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-display text-[34px] text-chalk" style={{ fontWeight: 800 }}>
                        {a.name}
                      </h3>
                      <p className="mt-2 max-w-[36ch] text-[16px] leading-relaxed text-chalk-dim">{a.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-12 max-w-[44ch] border-t border-chalk/10 pt-6 text-[15px] leading-relaxed text-dust">
              En escalade, on garde trois appuis pour ne pas tomber. Notre grille fait pareil : un sport qui n’en tient que deux ne
              passe pas.
            </p>
          </div>
        </SectionInner>
      </div>
    </Section>
  );
}
