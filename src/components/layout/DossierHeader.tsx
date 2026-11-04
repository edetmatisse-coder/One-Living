'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '@/store/ui';
import { TransitionLink } from './PageTransition';
import { ModeControls } from './ModeControls';
import { BrandImage } from '@/components/ui/Brand';
import { scrollToY } from '@/lib/scroll';

/** Logo One Living, ou mot-symbole typographique s'il manque. */
export function OneLivingMark({ className = '' }: { className?: string }) {
  return (
    <BrandImage
      id="logoOneLiving"
      alt="One Living"
      className={`h-7 w-auto ${className}`}
      placeholderClassName="!border-0 !inline-flex !flex-row !gap-0"
      placeholder={
        <span className="font-display text-[22px] leading-none tracking-[0.01em] text-chalk" style={{ fontWeight: 900 }}>
          One<span className="text-route">.</span>Living
        </span>
      }
    />
  );
}

/**
 * En-tête du Dossier : marque, bascule Dossier / Campagne, modes.
 * Une fine barre de progression (couleur de la voie courante) court dessous.
 */
export function DossierHeader() {
  const barRef = useRef<HTMLDivElement>(null);
  const presentation = useUI((s) => s.presentation);
  const videoActive = useUI((s) => s.videoActive);

  useEffect(() => {
    return useUI.subscribe((s) => {
      if (!barRef.current) return;
      const n = 10;
      barRef.current.style.transform = `scaleX(${Math.min(1, s.climb / n)})`;
      barRef.current.style.background = s.activeColor;
    });
  }, []);

  if (presentation || videoActive) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)]">
      <div aria-hidden className="scrim-top pointer-events-none absolute inset-x-0 top-0 h-[150%]" />
      <div className="relative flex h-full items-center justify-between gap-4 px-[var(--gutter)]">
        <button
          type="button"
          onClick={() => scrollToY(0, { duration: 1.8 })}
          className="flex items-center gap-3"
          aria-label="Revenir au départ du Dossier"
        >
          <OneLivingMark />
          <span className="font-display text-[22px] leading-none text-dust" style={{ fontWeight: 800 }}>
            ×
          </span>
          <span className="font-display text-[22px] leading-none text-chalk" style={{ fontWeight: 800 }}>
            Escalade
          </span>
        </button>

        <nav aria-label="Parties du site" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <ul className="flex items-center rounded-[5px] border border-chalk/12 bg-ply-900/60 p-1">
            <li>
              <span
                aria-current="page"
                className="flex items-center gap-2 rounded-[3px] bg-chalk px-3.5 py-1.5 text-[13px] font-semibold text-ply-900"
              >
                <span className="label-mono text-[10px] text-ply-400">01</span> Dossier
              </span>
            </li>
            <li>
              <TransitionLink
                href="/campagne/"
                label="Après la voie"
                sub="Maquette du site public · Campagne"
                color="#E64980"
                className="flex items-center gap-2 rounded-[3px] px-3.5 py-1.5 text-[13px] font-semibold text-chalk-dim transition-colors hover:text-chalk"
              >
                <span className="label-mono text-[10px] text-dust">02</span> Campagne
              </TransitionLink>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <TransitionLink
            href="/campagne/"
            label="Après la voie"
            sub="Maquette du site public · Campagne"
            color="#E64980"
            className="inline-flex h-9 items-center rounded-[4px] border border-chalk/15 bg-ply-900/50 px-3 text-[13px] font-semibold text-chalk md:hidden"
          >
            Campagne
          </TransitionLink>
          <ModeControls />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-chalk/[0.07]">
        <div ref={barRef} className="h-full origin-left" style={{ transform: 'scaleX(0)', background: '#F2B705' }} />
      </div>
    </header>
  );
}
