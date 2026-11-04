'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { PRODUCTS } from '@/data/campagne';
import { KineticTitle } from '@/components/ui/KineticTitle';
import { StartCard } from '@/components/ui/StartCard';
import { Arrow, Button } from '@/components/ui/Button';
import { useBrandAsset } from '@/components/ui/Brand';
import { useCapabilities } from '@/lib/device';
import { scrollToElement } from '@/lib/scroll';
import { Packshot } from './Gamme';

const ProductCanvas = dynamic(() => import('@/components/three/product/ProductCanvas'), { ssr: false });

const HERO_PRODUCT = PRODUCTS[0];

/**
 * Haut de page : la photo de la bouteille en salle (public/brand/photo-salle)
 * en plein cadre. Tant qu'elle manque, la vraie bouteille en 3D prend la place.
 */
export function CampagneHero({ meta }: { meta: SectionMeta }) {
  const hex = ROUTE_COLORS[meta.route];
  const caps = useCapabilities();
  const photo = useBrandAsset('photoSalle');
  const show3D = caps.ready && caps.webgl && !caps.reducedMotion;

  return (
    <section
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
        <div className="plywood absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[60%] md:inset-x-auto md:inset-y-0 md:right-0 md:h-auto md:w-[58%]">
            {show3D ? (
              <ProductCanvas product={HERO_PRODUCT} idle={0.28} className="absolute inset-0" label="Bouteille One Living gingembre-curcuma, 33 cl" />
            ) : (
              <div className="absolute inset-0 grid place-items-center max-md:items-start max-md:pt-[calc(var(--header-h)+56px)]">
                <div className="relative w-[min(58%,360px)] rotate-[2.5deg] rounded-[6px] bg-chalk p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)] max-md:w-[46%]">
                  <span className="tape -top-2 left-1/2 -translate-x-1/2 -rotate-[3deg]" aria-hidden />
                  <Packshot product={HERO_PRODUCT} className="aspect-[4/5] w-full object-contain" priority />
                </div>
              </div>
            )}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(20,18,16,1)_0%,rgba(20,18,16,1)_43%,rgba(20,18,16,.6)_52%,rgba(20,18,16,0)_64%)] max-md:bg-[linear-gradient(0deg,rgba(20,18,16,1)_0%,rgba(20,18,16,1)_40%,rgba(20,18,16,0)_58%)]"
          />
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
            lines={['Après', { text: 'la voie.', className: 'text-route' }]}
            className="font-display text-[clamp(76px,13vw,220px)] text-chalk"
            play
            delayMs={200}
          />
          <p className="mt-6 max-w-[30ch] text-[20px] leading-snug text-chalk-dim md:text-[24px]">
            Le moment pour souffler, juste après ta séance.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] text-dust">
            <span className="label-mono text-[10px] text-route">Au bar</span>
            Le kombucha One Living, dans les salles B’Wall de Quimper, Lorient et Vannes.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button onClick={() => scrollToElement('gamme', { duration: 1.8 })}>
              Découvrir la gamme <Arrow dir="down" />
            </Button>
            <Button variant="ghost" onClick={() => scrollToElement('salles', { duration: 2 })}>
              Trouver une salle B’Wall
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
