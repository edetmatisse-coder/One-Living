'use client';

import { TransitionLink } from '@/components/layout/PageTransition';
import { ModeControls } from '@/components/layout/ModeControls';
import { OneLivingMark } from '@/components/layout/DossierHeader';
import { useUI } from '@/store/ui';
import { scrollToElement } from '@/lib/scroll';

const NAV = [
  { id: 'concept', label: 'Le moment' },
  { id: 'gamme', label: 'La gamme' },
  { id: 'salles', label: 'Les salles' },
  { id: 'one-giving', label: 'One Giving' },
  { id: 'faq', label: 'FAQ' },
];

/**
 * En-tête de la maquette publique « Après la voie ». Un bandeau discret
 * rappelle qu'il s'agit d'une maquette et permet de revenir au Dossier.
 */
export function CampagneHeader() {
  const presentation = useUI((s) => s.presentation);
  if (presentation) return null;
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="relative flex h-8 items-center justify-between gap-4 bg-chalk px-[var(--gutter)] text-ply-900">
        <span className="label-mono text-[10px]">
          Maquette<span className="hidden sm:inline"> · aucune donnée réelle n’est collectée</span>
        </span>
        <TransitionLink
          href="/"
          label="Le dossier"
          sub="One Living × Escalade · Dossier interactif"
          color="#F2B705"
          className="label-mono inline-flex items-center gap-2 text-[10px] underline-offset-4 hover:underline"
        >
          Retour au Dossier
        </TransitionLink>
      </div>
      <div className="relative flex h-[var(--header-h)] items-center justify-between gap-6 px-[var(--gutter)]">
        <div aria-hidden className="scrim-top pointer-events-none absolute inset-0 h-[140%]" />
        <div className="relative flex items-center gap-4">
          <OneLivingMark />
          <span className="hidden h-5 w-px bg-chalk/20 sm:block" />
          <span className="font-display hidden text-[20px] leading-none text-chalk sm:block" style={{ fontWeight: 800 }}>
            Après la voie
          </span>
        </div>
        <nav aria-label="Rubriques" className="relative hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => scrollToElement(n.id, { duration: 1.8 })}
                  className="text-[14px] font-medium text-chalk-dim transition-colors hover:text-chalk"
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relative">
          <ModeControls video={false} compact />
        </div>
      </div>
    </header>
  );
}
