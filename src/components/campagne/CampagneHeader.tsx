'use client';

import { CoBrand } from '@/components/ui/CoBrand';
import { IconSound } from '@/components/ui/Icons';
import { useUI } from '@/store/ui';
import { scrollToElement } from '@/lib/scroll';

const NAV = [
  { id: 'concept', label: 'Le moment' },
  { id: 'gamme', label: 'La gamme' },
  { id: 'salles', label: 'Les salles' },
  { id: 'pour-les-salles', label: 'Pour les salles' },
  { id: 'faq', label: 'FAQ' },
];

/**
 * En-tête du site « Après la voie », signé One Living × B'Wall. Un bandeau
 * discret rappelle qu'il s'agit d'une maquette et d'un partenariat imaginé.
 */
export function CampagneHeader() {
  const soundOn = useUI((s) => s.soundOn);
  const toggleSound = useUI((s) => s.toggleSound);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="relative flex h-8 items-center justify-between gap-4 bg-chalk px-[var(--gutter)] text-ply-900">
        <span className="label-mono text-[10px]">
          Maquette<span className="hidden sm:inline"> · partenariat One Living × B’Wall imaginé pour un projet étudiant</span>
        </span>
        <span className="label-mono hidden text-[10px] md:inline">Aucune donnée réelle n’est collectée</span>
      </div>
      <div className="relative flex h-[var(--header-h)] items-center justify-between gap-6 px-[var(--gutter)]">
        <div aria-hidden className="scrim-top pointer-events-none absolute inset-0 h-[140%]" />
        <button
          type="button"
          onClick={() => scrollToElement('apres-la-voie', { duration: 1.6 })}
          className="relative flex items-center gap-4"
          aria-label="Revenir en haut de la page"
        >
          <CoBrand size="sm" />
          <span className="hidden h-5 w-px bg-chalk/20 xl:block" />
          <span className="font-display hidden text-[20px] leading-none text-chalk xl:block" style={{ fontWeight: 800 }}>
            Après la voie
          </span>
        </button>
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
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Couper le son' : 'Activer le son'}
          data-cursor-label={soundOn ? 'Couper le son' : 'Activer le son'}
          className="relative inline-flex h-9 items-center gap-2 rounded-[4px] border border-chalk/15 bg-ply-900/50 px-3 text-[13px] font-medium text-chalk-dim transition-colors hover:border-chalk/50 hover:text-chalk"
        >
          <IconSound on={soundOn} />
          <span className="hidden xl:inline">{soundOn ? 'Son' : 'Son coupé'}</span>
        </button>
      </div>
    </header>
  );
}
