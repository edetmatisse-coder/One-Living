'use client';

import type { CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { KineticTitle } from '@/components/ui/KineticTitle';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { SourceChip } from '@/components/ui/SourceChip';
import { StartCard } from '@/components/ui/StartCard';
import { Arrow, Button } from '@/components/ui/Button';
import { scrollToElement } from '@/lib/scroll';

/**
 * Départ de la voie : titre, chiffre clé, accès directs aux deux outils.
 * La paroi 3D (fixe, derrière toute la page) remplit le fond.
 */
export function Hero({ meta }: { meta: SectionMeta }) {
  const hex = ROUTE_COLORS[meta.route];
  return (
    <section
      id={meta.id}
      data-section={meta.id}
      data-index={0}
      data-color={hex}
      data-title={meta.short}
      className="relative min-h-[100svh]"
      style={{ '--route': hex } as CSSProperties}
      aria-labelledby="hero-title"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_100%,rgba(20,18,16,.92)_0%,rgba(20,18,16,.55)_45%,rgba(20,18,16,0)_75%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ply-800/70" />

      <div className="relative flex min-h-[100svh] flex-col justify-end px-[var(--gutter)] pb-[clamp(28px,6vh,72px)] pt-[calc(var(--header-h)+28px)]">
        <div className="relative lg:pr-20">
          <StartCard
            num={0}
            name="Départ"
            grade={meta.grade}
            color={hex}
            foot="Ouvreur : équipe WIN · Nov. 2026"
            className="mb-8"
            size="sm"
            rotate={-3}
          />
          <p className="label-mono mb-5 max-w-[34ch] text-dust md:max-w-none">
            Dossier interactif · Challenge Bachelor 3 · Problématique 2
          </p>
          <KineticTitle
            as="h1"
            id="hero-title"
            lines={['Le kombucha', 'a trouvé', { text: 'sa paroi.', className: 'text-route' }]}
            className="font-display text-[clamp(64px,min(10.6vw,17.5vh),188px)] text-chalk"
            play
            delayMs={250}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => scrollToElement('matrice', { duration: 2.2 })} data-cursor-label="Outil 1">
              Bouger la matrice
              <Arrow dir="down" />
            </Button>
            <Button variant="ghost" onClick={() => scrollToElement('simulateur', { duration: 2.6 })} data-cursor-label="Outil 2">
              Simuler une salle
              <Arrow dir="down" />
            </Button>
          </div>

          <div className="mt-12 lg:absolute lg:bottom-1 lg:right-24 lg:mt-0 xl:right-28">
            <div className="max-w-[400px] border-l-2 border-route/80 pl-6">
              <div className="font-display flex items-start text-[clamp(96px,min(12vw,20vh),190px)] leading-[0.8] text-chalk">
                <RollingNumber value="69" play delayMs={700} durationMs={2200} />
                <span className="ml-2 mt-[0.08em] text-[0.42em] text-route">%</span>
              </div>
              <p className="mt-4 text-[18px] leading-snug text-chalk-dim md:text-[20px]">
                des grimpeurs boivent un verre après leur séance.
              </p>
              <div className="mt-4">
                <SourceChip id="obs-escalade" withLabel />
              </div>
            </div>
          </div>
        </div>

        <div className="label-mono pointer-events-none absolute bottom-6 right-[var(--gutter)] hidden items-center gap-3 text-dust md:flex lg:right-20">
          <span>Défiler pour grimper</span>
          <span className="relative block h-10 w-px overflow-hidden bg-chalk/15">
            <span className="absolute inset-x-0 top-0 h-4 animate-[climbHint_2.2s_cubic-bezier(.6,0,.2,1)_infinite] bg-route" />
          </span>
        </div>
      </div>
    </section>
  );
}
