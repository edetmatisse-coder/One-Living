'use client';

import { SOURCE_BY_ID, type SourceId } from '@/data/sources';
import { scrollToElement } from '@/lib/scroll';

interface Props {
  id: SourceId;
  /** Affiche l'éditeur en clair à côté du numéro. */
  withLabel?: boolean;
  className?: string;
}

/**
 * Renvoi vers la liste des sources du Dossier. Au clic, on descend jusqu'à
 * la source et elle s'allume un instant.
 */
export function SourceChip({ id, withLabel = false, className = '' }: Props) {
  const s = SOURCE_BY_ID[id];
  const onClick = (e: React.MouseEvent) => {
    const target = document.getElementById(`source-${id}`);
    if (!target) return; // page sans liste de sources : lien externe
    e.preventDefault();
    scrollToElement(target, { offset: -140, duration: 1.6 });
    target.dataset.flash = 'true';
    window.setTimeout(() => delete target.dataset.flash, 2200);
  };
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      data-cursor-label="Voir la source"
      className={`label-mono inline-flex items-center gap-1.5 rounded-[3px] border border-chalk/15 px-1.5 py-[3px] text-[9.5px] leading-none text-dust transition-colors hover:border-chalk/50 hover:text-chalk ${className}`}
      title={`${s.publisher} : ${s.title}`}
    >
      <span className="text-chalk/90">[{s.num}]</span>
      {withLabel && <span className="normal-case tracking-[0.04em]">{s.publisher === 'Union Sport & Cycle' ? s.title.replace(' (version light)', '') : s.publisher}</span>}
    </a>
  );
}
