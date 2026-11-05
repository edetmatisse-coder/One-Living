'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { PRODUCTS } from '@/data/campagne';
import { KineticTitle } from '@/components/ui/KineticTitle';
import { StartCard } from '@/components/ui/StartCard';
import { Arrow, Button } from '@/components/ui/Button';
import { useBrandAsset } from '@/components/ui/Brand';
import { useCapabilities } from '@/lib/device';
import { useInView } from '@/lib/use-in-view';
import { scrollToElement } from '@/lib/scroll';
import { Packshot } from './Gamme';
import { asset } from '@/lib/asset';

const ProductCanvas = dynamic(() => import('@/components/three/product/ProductCanvas'), { ssr: false });

/** Les quatre bouteilles bio : quatre parfums, quatre couleurs de voie. */
const BOTTLES = PRODUCTS.filter((p) => p.format === 'bouteille');
const CYCLE_MS = 5200;

/**
 * Haut de page. Avec la photo de l'équipe (public/brand/photo-salle) : la photo
 * en plein cadre. Sans elle : la bouteille 3D posée devant la paroi de B'Wall
 * Lorient, et les quatre parfums qui défilent, la couleur du titre avec eux.
 */
export function CampagneHero({ meta }: { meta: SectionMeta }) {
  const caps = useCapabilities();
  const photo = useBrandAsset('photoSalle');
  const show3D = caps.ready && caps.webgl && !caps.reducedMotion;
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { rootMargin: '0px', once: false });
  const product = BOTTLES[index];
  const hex = photo ? ROUTE_COLORS[meta.route] : ROUTE_COLORS[product.route];

  // défilement des parfums, seulement quand le haut de page est visible
  useEffect(() => {
    if (photo || !show3D || !auto || !visible) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % BOTTLES.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [photo, show3D, auto, visible]);

  const pick = (i: number) => {
    setAuto(false);
    setIndex(i);
  };

  return (
    <section
      ref={ref}
      id={meta.id}
      data-section={meta.id}
      data-color={hex}
      data-title={meta.short}
      className="relative min-h-[100svh] overflow-hidden"
      style={{ '--route': hex } as CSSProperties}
      aria-labelledby="campagne-title"
    >
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,14,12,.9)_0%,rgba(16,14,12,.55)_42%,rgba(16,14,12,.05)_75%)] max-md:bg-[linear-gradient(0deg,rgba(16,14,12,.95)_0%,rgba(16,14,12,.6)_45%,rgba(16,14,12,.1)_80%)]"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-ply-900">
          {/* la paroi de B'Wall Lorient, floue : la bouteille est en salle */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset('/brand/bwall/hero-paroi.jpg')}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-[60%_45%]"
            draggable={false}
            fetchPriority="high"
          />
          <div
            aria-hidden
            className="absolute inset-0 transition-[background] duration-700"
            style={{ background: `radial-gradient(42% 55% at 72% 55%, ${hex}2e, transparent 70%)` }}
          />
          <div className="absolute inset-x-0 top-[calc(var(--header-h)+28px)] h-[44%] md:inset-x-auto md:inset-y-0 md:right-0 md:top-0 md:h-auto md:w-[58%]">
            {show3D ? (
              <ProductCanvas
                product={product}
                variant="floating"
                idle={0.28}
                className="absolute inset-0"
                label={`Bouteille One Living ${product.name.toLowerCase()}, 33 cl`}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center max-md:items-start max-md:pt-[calc(var(--header-h)+56px)]">
                <div className="relative w-[min(58%,360px)] rotate-[2.5deg] rounded-[6px] bg-chalk p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)] max-md:w-[46%]">
                  <span className="tape -top-2 left-1/2 -translate-x-1/2 -rotate-[3deg]" aria-hidden />
                  <Packshot product={BOTTLES[0]} className="aspect-[4/5] w-full object-contain" priority />
                </div>
              </div>
            )}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(20,18,16,.97)_0%,rgba(20,18,16,.9)_34%,rgba(20,18,16,.35)_56%,rgba(20,18,16,0)_72%)] max-md:bg-[linear-gradient(0deg,rgba(20,18,16,1)_0%,rgba(20,18,16,.97)_44%,rgba(20,18,16,.25)_58%,rgba(20,18,16,0)_70%)]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#141210,transparent)]" />
          <p className="label-mono pointer-events-none absolute bottom-4 right-[var(--gutter)] hidden text-[9px] text-chalk/45 md:block">
            Paroi de B’Wall Lorient · photo b-wall.fr
          </p>
        </div>
      )}

      <div className="pointer-events-none relative flex min-h-[100svh] flex-col justify-end px-[var(--gutter)] pb-[clamp(28px,7vh,80px)] pt-[calc(var(--header-h)+60px)] md:justify-center">
        <div className="pointer-events-auto max-w-[620px]">
          <StartCard
            num={0}
            name="Après la voie"
            grade={meta.grade}
            color={hex}
            foot="One Living × B’Wall · Bretagne sud"
            size="sm"
            className="mb-8 hidden md:block"
          />
          <KineticTitle
            as="h1"
            id="campagne-title"
            lines={['Après', { text: 'la voie.', className: 'text-route transition-colors duration-700' }]}
            className="font-display text-[clamp(76px,13vw,220px)] text-chalk"
            play
            delayMs={200}
          />
          <p className="mt-6 max-w-[30ch] text-[20px] leading-snug text-chalk-dim md:text-[24px]">
            Le moment pour souffler, juste après ta séance.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-dust md:text-[15px]">
            <span className="label-mono text-[10px] text-route transition-colors duration-700">Au bar</span>
            Le kombucha One Living, dans les salles B’Wall de Quimper, Lorient et Vannes.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button onClick={() => scrollToElement('gamme', { duration: 1.8 })}>
              Découvrir la gamme <Arrow dir="down" />
            </Button>
            <Button variant="ghost" onClick={() => scrollToElement('salles', { duration: 2 })}>
              Trouver une salle B’Wall
            </Button>
          </div>
          {!photo && show3D && (
            <div className="mt-8 hidden flex-wrap items-center gap-2 md:flex" role="group" aria-label="Parfum de la bouteille">
              {BOTTLES.map((b, i) => {
                const on = i === index;
                const c = ROUTE_COLORS[b.route];
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => pick(i)}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                      on ? 'border-transparent bg-chalk text-ply-900' : 'border-chalk/15 text-chalk-dim hover:border-chalk/50 hover:text-chalk'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                    {b.short}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
