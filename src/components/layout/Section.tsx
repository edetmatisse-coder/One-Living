'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { KineticTitle } from '@/components/ui/KineticTitle';
import { StartCard } from '@/components/ui/StartCard';

type Line = string | { text: string; className?: string };

interface Props {
  meta: SectionMeta;
  title: Line[];
  /** Phrase d'accroche sous le titre. */
  lead?: ReactNode;
  /** Contenu libre ajouté dans l'en-tête (à droite du titre). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Hauteur de l'en-tête transparent (la paroi reste visible derrière). */
  headClassName?: string;
  cardFoot?: string;
  /** Section sans paroi derrière (Campagne) : en-tête sur fond plein. */
  solid?: boolean;
  /** couleur d'accent imposée (sinon la couleur de voie de la section) */
  color?: string;
}

/**
 * Une section = une prise de la voie. L'en-tête reste transparent pour
 * laisser voir la paroi 3D et la prise qui s'allume ; le corps est un
 * panneau de contreplaqué opaque qui vient recouvrir la paroi.
 */
export function Section({
  meta,
  title,
  lead,
  aside,
  children,
  className = '',
  bodyClassName = '',
  headClassName = '',
  cardFoot,
  solid = false,
  color,
}: Props) {
  const hex = color ?? ROUTE_COLORS[meta.route];
  return (
    <section
      id={meta.id}
      data-section={meta.id}
      data-index={meta.num}
      data-color={hex}
      data-title={meta.short}
      className={`relative ${className}`}
      style={{ '--route': hex } as CSSProperties}
      aria-labelledby={`${meta.id}-title`}
    >
      <header
        data-section-head
        className={`relative flex flex-col justify-end px-[var(--gutter)] ${
          solid
            ? 'plywood pb-4 pt-[calc(var(--header-h)+48px)] md:pb-6 md:pt-[calc(var(--header-h)+64px)]'
            : 'min-h-[64vh] pb-14 pt-[calc(var(--header-h)+56px)] md:min-h-[72vh] md:pb-20'
        } ${headClassName}`}
      >
        {!solid && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-b from-transparent via-ply-900/55 to-ply-800"
          />
        )}
        <div className="relative grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:pr-20">
          <div>
            <div data-start-card>
              <StartCard num={meta.num} name={meta.short} grade={meta.grade} color={hex} foot={cardFoot} className="mb-8 md:mb-10" />
            </div>
            <KineticTitle
              id={`${meta.id}-title`}
              lines={title}
              className="font-display max-w-[16ch] text-[clamp(52px,9.4vw,164px)] text-chalk"
            />
            {lead && (
              <div data-lead className="mt-7 max-w-[58ch] text-[17px] leading-relaxed text-chalk-dim md:text-[19px]">
                {lead}
              </div>
            )}
          </div>
          {aside && <div className="relative">{aside}</div>}
        </div>
      </header>
      <div data-section-body className={`plywood relative ${solid ? '' : 'border-t border-chalk/[0.06]'} ${bodyClassName}`}>
        {!solid && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-black/35" />
        )}
        {children}
      </div>
    </section>
  );
}

/** Conteneur standard du corps de section. */
export function SectionInner({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div data-inner className={`relative mx-auto w-full max-w-[1320px] px-[var(--gutter)] py-20 md:py-28 lg:pr-[calc(var(--gutter)+64px)] ${className}`}>
      {children}
    </div>
  );
}
