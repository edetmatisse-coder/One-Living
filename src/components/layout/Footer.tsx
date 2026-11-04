'use client';

import { BrandImage } from '@/components/ui/Brand';
import { Hold } from '@/components/ui/Hold';
import { Arrow } from '@/components/ui/Button';
import { scrollToY } from '@/lib/scroll';
import { CoBrand } from '@/components/ui/CoBrand';

/**
 * Pied de page. La mention légale du projet est obligatoire :
 * « Projet étudiant WIN Sport School, non affilié à One Living, présentation locale ».
 */
export function Footer() {
  return (
    <footer className="plywood relative overflow-hidden border-t border-chalk/[0.07]">
      <div className="relative mx-auto max-w-[1320px] px-[var(--gutter)] pb-10 pt-24 md:pt-32">
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="label-mono mb-6 flex items-center gap-3 text-dust">
              <Hold kind="jug" color="#F2B705" size={22} />
              Fin de la séance
            </div>
            <p className="font-display text-[clamp(64px,12vw,200px)] text-chalk">Souffle.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <CoBrand size="md" />
              <span className="label-mono text-[10px] text-dust">Une campagne imaginée · maquette</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollToY(0, { duration: 2 })}
            className="group inline-flex items-center gap-4 self-end rounded-[4px] border border-chalk/20 px-5 py-4 text-[16px] font-semibold text-chalk transition-colors hover:border-chalk/60"
          >
            Remonter au départ
            <span className="transition-transform duration-300 group-hover:-translate-y-1">
              <Arrow dir="up" />
            </span>
          </button>
        </div>

        <div className="hairline my-12" />

        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <BrandImage id="logoWin" alt="WIN Sport School" className="h-10 w-auto" placeholderClassName="h-12 w-36 px-3" />
            <div className="text-[14px] leading-snug text-dust">
              <p className="font-semibold text-chalk-dim">Challenge Bachelor 3 · WIN Sport School</p>
              <p>Problématique 2 : développer One Living dans le sport amateur, hors rugby.</p>
            </div>
          </div>
          <p className="label-mono max-w-[46ch] text-[10.5px] text-dust md:text-right">
            Projet étudiant WIN Sport School, non affilié à One Living, présentation locale
          </p>
        </div>
      </div>
    </footer>
  );
}
