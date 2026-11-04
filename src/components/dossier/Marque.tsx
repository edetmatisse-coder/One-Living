'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { BRAND_TIMELINE, type Milestone } from '@/data/brand';
import { Section } from '@/components/layout/Section';
import { SourceChip } from '@/components/ui/SourceChip';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Hold } from '@/components/ui/Hold';
import { useCapabilities } from '@/lib/device';
import { useUI } from '@/store/ui';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function NoToOne({ on }: { on: boolean }) {
  return (
    <div className="font-display relative inline-flex items-end gap-5 text-[clamp(56px,7vw,112px)] leading-none" aria-hidden>
      <span className="relative text-dust/70">
        No.1
        <span
          className="absolute left-[-4%] top-[52%] h-[0.07em] w-[108%] origin-left bg-route transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]"
          style={{ transform: `scaleX(${on ? 1 : 0}) rotate(-6deg)` }}
        />
      </span>
      <span
        className="text-chalk transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.8,.1,1)]"
        style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(30%)', transitionDelay: on ? '350ms' : '0ms' }}
      >
        One
      </span>
    </div>
  );
}

function Panel({ m, index, active }: { m: Milestone; index: number; active: boolean }) {
  return (
    <article
      data-panel
      className="relative flex min-h-[64vh] w-full shrink-0 flex-col justify-between md:w-[min(64vw,880px)] md:pr-16"
      aria-label={`${m.year} : ${m.title}`}
    >
      <div
        aria-hidden
        className={`font-display pointer-events-none select-none text-[clamp(120px,19vw,300px)] leading-[0.8] transition-colors duration-700 ${
          active ? 'text-route' : 'text-outline text-chalk/25'
        }`}
      >
        {m.year}
      </div>
      <div className="relative mt-8 max-w-[560px]">
        <div className="label-mono mb-4 flex items-center gap-3 text-dust">
          <span>Relais {String(index + 1).padStart(2, '0')}</span>
          <span className="h-px w-10 bg-chalk/20" />
          {m.sources.map((s) => (
            <SourceChip key={s} id={s} />
          ))}
        </div>
        {m.id === 'rebranding' ? <NoToOne on={active} /> : (
          <h3 className="font-display text-[clamp(44px,5vw,84px)] text-chalk">{m.title}</h3>
        )}
        <p className="mt-5 text-[18px] leading-relaxed text-chalk-dim md:text-[20px]">{m.text}</p>
        {m.idea && (
          <p className="mt-6 border-l-2 border-route pl-5 text-[22px] font-medium leading-snug text-chalk md:text-[26px]">{m.idea}</p>
        )}
        {m.stats && (
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-chalk/10 pt-6">
            {m.stats.map((s) => (
              <div key={s.label}>
                <dt className="label-mono order-2 mt-2 block text-dust">{s.label}</dt>
                <dd className="font-display order-1 text-[clamp(36px,4vw,64px)] normal-case text-chalk">
                  <RollingNumber value={s.value} play={active} durationMs={1500} />
                  {s.suffix && <sup className="ml-0.5 align-super text-[0.45em]">{s.suffix}</sup>}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {m.tags && (
          <ul className="mt-8 flex flex-wrap gap-3">
            {m.tags.map((t, i) => (
              <li
                key={t.label}
                className={`relative rounded-[3px] px-4 py-3 ${t.note ? 'bg-chalk text-ply-900' : 'border border-chalk/20 text-chalk'}`}
                style={{ transform: `rotate(${[-1.5, 1, -0.5][i]}deg)` }}
              >
                {t.note && <span className="tape -top-2 left-1/2 -translate-x-1/2 rotate-[3deg]" aria-hidden />}
                <span className="font-display text-[26px] leading-none" style={{ fontWeight: 800 }}>
                  {t.label}
                </span>
                {t.note && <span className="label-mono mt-1 block text-[10px] text-ply-500">{t.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/**
 * La marque, en frise : on la parcourt à l'horizontale pendant que la page
 * défile (épinglage GSAP sur ordinateur, liste verticale sur mobile).
 */
export function Marque({ meta }: { meta: SectionMeta }) {
  const hex = ROUTE_COLORS[meta.route];
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const caps = useCapabilities();
  const presentation = useUI((s) => s.presentation);
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const horizontal = caps.ready && !caps.mobile && !caps.reducedMotion && !presentation;

  useGSAP(
    () => {
      if (!horizontal || !trackRef.current || !pinRef.current) return;
      const track = trackRef.current;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            const n = BRAND_TIMELINE.length;
            setActive(Math.min(n - 1, Math.floor(self.progress * n * 0.999 + 0.25)));
          },
        },
      });
    },
    { dependencies: [horizontal], revertOnUpdate: true },
  );

  return (
    <Section meta={meta} title={['De No.1', 'à One']} cardFoot="The Grocer · Decathlon Pro">
      <div ref={pinRef} className={`relative ${horizontal ? 'h-[100svh] overflow-hidden' : ''}`}>
        <div className={`flex h-full flex-col ${horizontal ? 'justify-center' : ''}`}>
          <div
            ref={trackRef}
            className={`flex gap-16 px-[var(--gutter)] ${horizontal ? 'flex-row items-end will-change-transform' : 'flex-col py-20'}`}
          >
            <div className={`shrink-0 ${horizontal ? 'w-[min(34vw,460px)] self-center' : ''}`}>
              <p className="label-mono mb-5 text-route">La marque en quatre relais</p>
              <p className="max-w-[34ch] text-[20px] leading-relaxed text-chalk-dim">
                Un kombucha déjà installé au Royaume-Uni, un nom qui change de sens, puis une arrivée en France par la grande surface
                et par les clubs.
              </p>
            </div>
            {BRAND_TIMELINE.map((m, i) => (
              <Panel key={m.id} m={m} index={i} active={horizontal ? i <= active : true} />
            ))}
          </div>
        </div>

        {horizontal && (
          <div className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-10 lg:right-[calc(var(--gutter)+64px)]">
            <div className="relative h-px bg-chalk/15">
              <div ref={barRef} className="absolute inset-0 origin-left bg-route" style={{ transform: 'scaleX(0)', boxShadow: `0 0 12px ${hex}` }} />
              {BRAND_TIMELINE.map((m, i) => {
                const pos = (i + 0.5) / BRAND_TIMELINE.length;
                const lit = i <= active;
                return (
                  <div key={m.id} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos * 100}%` } as CSSProperties}>
                    <Hold kind={(['jug', 'crimp', 'sloper', 'pinch'] as const)[i]} color={hex} lit={lit} size={lit ? 26 : 18} style={{ filter: lit ? `drop-shadow(0 0 8px ${hex})` : 'none' }} />
                    <span className={`label-mono absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap ${lit ? 'text-chalk' : 'text-dust/60'}`}>{m.year}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
