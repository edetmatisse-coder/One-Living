'use client';

import { useRef, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { MARKET, MARKET_SCALE_MAX, type MarketFigure } from '@/data/market';
import { Section, SectionInner } from '@/components/layout/Section';
import { SourceChip } from '@/components/ui/SourceChip';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { useInView } from '@/lib/use-in-view';

const TUBE_H = 420;

function Wave({ color, opacity, dur, offset = 0 }: { color: string; opacity: number; dur: string; offset?: number }) {
  return (
    <svg
      aria-hidden
      className="liquid-wave absolute -top-[13px] left-0 h-[14px] w-[200%]"
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      style={{ '--wave-dur': dur, marginLeft: `${offset}%` } as CSSProperties}
    >
      <path
        d="M0 8 C 12.5 2, 25 2, 37.5 8 S 62.5 14, 75 8 S 87.5 2, 100 8 S 125 14, 137.5 8 S 162.5 2, 175 8 S 187.5 14, 200 8 V 14 H 0 Z"
        fill={color}
        fillOpacity={opacity}
      />
    </svg>
  );
}

function Tube({ f, index, on }: { f: MarketFigure; index: number; on: boolean }) {
  const ratio = f.value / MARKET_SCALE_MAX;
  const h = Math.round(TUBE_H * ratio);
  const bubbles = Array.from({ length: 7 }, (_, i) => ({
    left: 12 + ((i * 37) % 76),
    size: 3 + ((i * 5) % 6),
    dur: 3 + ((i * 7) % 5) * 0.6,
    delay: (i * 0.83) % 4,
  }));
  return (
    <figure className="flex flex-col items-center">
      <div className="relative w-[min(26vw,128px)]" style={{ height: TUBE_H }} aria-hidden>
        {/* verre */}
        <div className="absolute inset-0 rounded-b-[64px] rounded-t-[10px] border border-chalk/20 bg-gradient-to-r from-chalk/[0.07] via-transparent to-chalk/[0.05] shadow-[inset_0_0_30px_rgba(0,0,0,.45)]" />
        {/* liquide */}
        <div className="absolute inset-[5px] top-auto overflow-hidden rounded-b-[60px]" style={{ height: h }}>
          <div
            className="absolute inset-x-0 bottom-0 transition-transform duration-[1800ms] ease-[cubic-bezier(.2,.8,.1,1)]"
            style={{ height: h, transform: on ? 'translateY(0)' : `translateY(${h + 20}px)`, transitionDelay: `${index * 220}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#f0a23a] via-[#d9781a] to-[#9c4a0c]" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/25" />
            <Wave color="#f6b14a" opacity={0.95} dur={`${5 + index}s`} />
            <Wave color="#ffd48a" opacity={0.35} dur={`${8 + index}s`} offset={-20} />
            {bubbles.map((b, i) => (
              <span
                key={i}
                className="liquid-bubble absolute bottom-2 rounded-full border border-white/60 bg-white/10"
                style={
                  {
                    left: `${b.left}%`,
                    width: b.size,
                    height: b.size,
                    '--dur': `${b.dur}s`,
                    '--delay': `${b.delay}s`,
                    '--rise': `${Math.max(40, h - 20)}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
        {/* reflet */}
        <div className="pointer-events-none absolute bottom-10 left-[18%] top-6 w-[10%] rounded-full bg-gradient-to-b from-white/25 to-transparent" />
        {/* graduation */}
        <div className="absolute -right-3 top-0 h-full w-2">
          {Array.from({ length: 6 }, (_, k) => (
            <span key={k} className="absolute right-0 h-px w-2 bg-chalk/30" style={{ bottom: `${(k / 5) * 100}%` }} />
          ))}
        </div>
      </div>
      <figcaption className="mt-7 w-full max-w-[260px] text-center">
        <div className="font-display text-[clamp(30px,5vw,72px)] text-chalk">
          <RollingNumber value={f.display} play={on} delayMs={index * 220 + 400} />
        </div>
        <p className="mt-2 text-[14px] font-semibold leading-snug text-chalk sm:text-[16px]">{f.label}</p>
        <p className="mt-3 inline-block rounded-[3px] border border-dashed border-route/60 px-2 py-1.5 font-mono text-[9px] uppercase leading-snug tracking-[0.08em] text-route sm:px-2.5 sm:text-[10.5px] sm:tracking-[0.1em]">
          {f.perimeter}
          {f.year ? ` · ${f.year}` : ''}
        </p>
        <div className="mt-3 flex justify-center">
          <SourceChip id={f.source} withLabel />
        </div>
      </figcaption>
    </figure>
  );
}

/**
 * Le marché, en trois éprouvettes de kombucha remplies à l'échelle.
 */
export function Marche({ meta }: { meta: SectionMeta }) {
  const ref = useRef<HTMLDivElement>(null);
  const growthRef = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -20% 0px' });
  const growthOn = useInView(growthRef, { rootMargin: '0px 0px -15% 0px' });
  const growth = MARKET.find((m) => m.growth);

  return (
    <Section
      meta={meta}
      title={['Un marché', 'en fermentation']}
      cardFoot="IntoTheMinds · L’Essentiel de l’Éco"
    >
      <SectionInner>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-20">
          <div className="lg:pt-8">
            <p className="label-mono mb-5 text-route">Trois chiffres, trois périmètres</p>
            <p className="max-w-[40ch] text-[20px] leading-relaxed text-chalk-dim">
              On les pose côte à côte pour donner l’ordre de grandeur. Ils ne mesurent pas la même chose : ni les mêmes produits, ni
              les mêmes canaux, ni la même année. Ils ne s’additionnent donc pas.
            </p>
            {growth && (
              <div ref={growthRef} className="mt-12 border-l-2 border-route pl-6">
                <div className="font-display flex items-baseline gap-3 text-[clamp(64px,8vw,128px)] leading-[0.85] text-chalk">
                  <span className="whitespace-nowrap text-[0.3em] text-dust">près de</span>
                  <RollingNumber value="+160 %" play={growthOn} delayMs={300} durationMs={2200} />
                </div>
                <p className="mt-4 max-w-[30ch] text-[17px] text-chalk-dim">
                  de croissance pour les boissons fermentées en GMS en 2025.
                </p>
                <div className="mt-3">
                  <SourceChip id={growth.source} withLabel />
                </div>
              </div>
            )}
          </div>

          <div ref={ref} className="relative">
            <div className="label-mono mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-dust">
              <span>Échelle commune, en millions d’euros</span>
              <span className="hidden sm:inline">0 à {MARKET_SCALE_MAX} M€</span>
            </div>
            <div className="relative grid grid-cols-3 gap-4 md:gap-10">
              {/* repères horizontaux */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 hidden sm:block" style={{ height: TUBE_H }}>
                {[0, 5, 10, 15, 20, 25].map((v) => (
                  <div key={v} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(v / MARKET_SCALE_MAX) * 100}%` }}>
                    <span className="label-mono w-6 -translate-x-8 text-right text-[9px] text-dust/60">{v}</span>
                    <span className="h-px flex-1 -translate-x-8 border-t border-dashed border-chalk/[0.08]" />
                  </div>
                ))}
              </div>
              {MARKET.map((f, i) => (
                <Tube key={f.id} f={f} index={i} on={on} />
              ))}
            </div>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
