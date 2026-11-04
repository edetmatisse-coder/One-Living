'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { FLAVORS, PRODUCT_MENTIONS, SHOTS, type Flavor } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { BrandImage, useBrandAsset } from '@/components/ui/Brand';
import { Badge } from '@/components/ui/Badge';
import { useCapabilities } from '@/lib/device';
import { useInView } from '@/lib/use-in-view';
import { playSfx } from '@/lib/sound';

const BottleCanvas = dynamic(() => import('@/components/three/bottle/BottleCanvas'), { ssr: false });

/** Bouteille dessinée (mouvement réduit, WebGL absent). */
export function BottleSketch({ flavor, className = '' }: { flavor: Flavor; className?: string }) {
  const route = ROUTE_COLORS[flavor.route];
  return (
    <svg viewBox="0 0 120 400" className={className} role="img" aria-label={`Bouteille ${flavor.name}`}>
      <defs>
        <linearGradient id={`liq-${flavor.id}`} x1="0" x2="1">
          <stop offset="0" stopColor={flavor.deep} />
          <stop offset=".45" stopColor={flavor.liquid} />
          <stop offset="1" stopColor={flavor.deep} />
        </linearGradient>
      </defs>
      <path d="M34 8h52v34c0 18 22 40 22 78v260c0 10-6 14-14 14H26c-8 0-14-4-14-14V120c0-38 22-60 22-78Z" fill="rgba(243,239,232,.06)" stroke="rgba(243,239,232,.4)" strokeWidth="2" />
      <path d="M16 140c0-30 20-52 22-70h44c2 18 22 40 22 70v240c0 8-5 10-10 10H26c-5 0-10-2-10-10Z" fill={`url(#liq-${flavor.id})`} opacity=".92" />
      <rect x="12" y="200" width="96" height="120" fill="#F3EFE8" />
      <rect x="12" y="200" width="8" height="120" fill={route} />
      <rect x="100" y="200" width="8" height="120" fill={route} />
      <text x="60" y="250" textAnchor="middle" style={{ font: '900 17px var(--font-display)', textTransform: 'uppercase' }} fill="#141210">
        One Living
      </text>
      <text x="60" y="285" textAnchor="middle" style={{ font: '800 13px var(--font-display)' }} fill="#141210">
        {flavor.short.toUpperCase()}
      </text>
      <rect x="32" y="0" width="56" height="16" rx="3" fill={route} />
    </svg>
  );
}

export function Gamme({ meta }: { meta: SectionMeta }) {
  const [index, setIndex] = useState(0);
  const flavor = FLAVORS[index];
  const route = ROUTE_COLORS[flavor.route];
  const caps = useCapabilities();
  const show3D = caps.ready && caps.webgl && !caps.reducedMotion;
  const stageRef = useRef<HTMLDivElement>(null);
  const opened = useInView(stageRef, { rootMargin: '0px 0px -30% 0px' });
  const shotsVisual = useBrandAsset('shots');

  // « pschitt » à l'ouverture de la gamme
  useEffect(() => {
    if (opened) playSfx('pschitt');
  }, [opened]);

  const choose = (i: number) => {
    if (i === index) return;
    setIndex(i);
    playSfx('fizz');
  };

  return (
    <div style={{ '--route': route } as CSSProperties}>
      <Section
        meta={{ ...meta, route: flavor.route }}
        title={['La gamme']}
        solid
        cardFoot={`${FLAVORS.length} parfums · ${PRODUCT_MENTIONS.join(' · ')}`}
        lead={<>Quatre kombuchas, quatre couleurs de voie. Choisis ton parfum, fais tourner la bouteille.</>}
      >
        <SectionInner>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
            <div className="order-2 lg:order-1">
              <div role="tablist" aria-label="Parfums" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                {FLAVORS.map((f, i) => {
                  const c = ROUTE_COLORS[f.route];
                  const on = i === index;
                  return (
                    <button
                      key={f.id}
                      role="tab"
                      aria-selected={on}
                      onClick={() => choose(i)}
                      className={`group flex items-center gap-3 rounded-[5px] px-4 py-3.5 text-left transition-colors ${
                        on ? 'bg-chalk text-ply-900' : 'border border-chalk/12 text-chalk-dim hover:border-chalk/40 hover:text-chalk'
                      }`}
                      style={{ '--route': c } as CSSProperties}
                    >
                      <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: c, boxShadow: on ? `0 0 0 3px ${c}40` : 'none' }} />
                      <span className="text-[14.5px] font-semibold leading-tight">{f.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10" aria-live="polite">
                <p className="label-mono text-route">Kombucha · voie {flavor.short.toLowerCase()}</p>
                <h3 key={flavor.id} className="font-display mt-3 text-[clamp(52px,6vw,96px)] text-chalk">
                  {flavor.name}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {flavor.notes.map((n) => (
                    <li key={n} className="rounded-full border border-chalk/15 px-3 py-1.5 text-[14px] text-chalk-dim">
                      {n}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] uppercase tracking-[0.12em] text-chalk">
                  {PRODUCT_MENTIONS.map((m, i) => (
                    <span key={m} className="flex items-center gap-3">
                      {i > 0 && <span className="text-route">·</span>}
                      {m}
                    </span>
                  ))}
                </p>
                <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-dust">
                  Un produit vivant : il se garde au frais, et se boit bien frais, juste après la séance.
                </p>
              </div>
            </div>

            <div ref={stageRef} className="relative order-1 lg:order-2">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700"
                style={{ background: `radial-gradient(60% 55% at 50% 60%, ${route}33, transparent 70%)` }}
              />
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[8px] border border-chalk/10">
                {show3D ? (
                  <BottleCanvas flavor={flavor} className="absolute inset-0" />
                ) : (
                  <div className="plywood absolute inset-0 grid place-items-center">
                    <BottleSketch flavor={flavor} className="h-[78%]" />
                  </div>
                )}
                <p className="label-mono pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-[3px] bg-ply-900/70 px-2.5 py-1.5 text-[9.5px] text-dust">
                  {show3D ? 'Glisse pour faire tourner' : 'Bouteille 33 cl'}
                </p>
              </div>
            </div>
          </div>

          {/* Visuel produit fourni par la marque */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {FLAVORS.map((f) => (
              <BrandImage
                key={f.id}
                id={f.bottleAsset}
                alt={`Kombucha One Living ${f.name}`}
                className="aspect-[3/4] w-full rounded-[6px] object-contain"
                placeholderClassName="aspect-[3/4] w-full bg-ply-900/30"
                placeholder={
                  <>
                    <BottleSketch flavor={f} className="h-[58%] opacity-40" />
                    <span className="mt-3 font-display text-[16px] leading-none text-chalk/70" style={{ fontWeight: 800 }}>
                      Visuel {f.short.toLowerCase()}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-dust/70">brand/{f.bottleAsset === 'bouteilleGingembre' ? 'bouteille-gingembre-curcuma' : f.bottleAsset === 'bouteilleFramboise' ? 'bouteille-framboise-grenade' : f.bottleAsset === 'bouteillePassion' ? 'bouteille-passion-goji' : 'bouteille-mangue-citron-vert'}</span>
                  </>
                }
              />
            ))}
          </div>

          {/* Les shots */}
          <div className="mt-24 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div>
              <p className="label-mono mb-4 text-route">Les shots</p>
              <h3 className="font-display text-[clamp(44px,5vw,80px)] text-chalk">Trois petits formats, avant de grimper</h3>
              <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-chalk-dim">
                On les présente par leurs parfums, rien d’autre. Les parfums exacts sont à confirmer avec One Living.
              </p>
            </div>
            {shotsVisual ? (
              <BrandImage id="shots" alt="Les shots One Living" className="w-full rounded-[6px] object-contain" />
            ) : (
              <ul className="grid grid-cols-3 gap-4">
                {SHOTS.map((s, i) => (
                  <li key={s.id} className="flex flex-col items-center rounded-[6px] border border-chalk/10 bg-ply-900/40 px-3 pb-5 pt-7">
                    <svg viewBox="0 0 60 120" className="h-28 w-auto" aria-hidden>
                      <rect x="20" y="2" width="20" height="12" rx="2" fill={s.color} />
                      <path d="M22 14h16v8c0 6 10 10 10 20v68c0 4-3 6-6 6H18c-3 0-6-2-6-6V42c0-10 10-14 10-20Z" fill="rgba(243,239,232,.08)" stroke="rgba(243,239,232,.45)" strokeWidth="1.5" />
                      <path d="M14 56h32v52c0 3-2 4-4 4H18c-2 0-4-1-4-4Z" fill="#c98a2a" opacity=".55" />
                      <rect x="12" y="62" width="36" height="26" fill="#F3EFE8" />
                      <rect x="12" y="62" width="4" height="26" fill={s.color} />
                    </svg>
                    <p className="font-display mt-4 text-[22px] text-chalk" style={{ fontWeight: 800 }}>
                      Shot {i + 1}
                    </p>
                    <p className="mt-1 text-center text-[13px] text-dust">{s.flavor ?? 'Parfum à confirmer'}</p>
                    {!s.flavor && (
                      <span className="mt-3">
                        <Badge kind="hypothese">À compléter</Badge>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionInner>
      </Section>
    </div>
  );
}
