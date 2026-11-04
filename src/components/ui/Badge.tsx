import type { ReactNode } from 'react';

type Kind = 'hypothese' | 'exemple' | 'demo' | 'neutral';

const LABEL: Record<Kind, string> = {
  hypothese: 'Hypothèse',
  exemple: 'Exemple',
  demo: 'Démo',
  neutral: '',
};

const TITLE: Record<Kind, string> = {
  hypothese: 'Valeur à confirmer avec One Living et notre sondage terrain',
  exemple: 'Contenu fictif, pour illustrer la campagne',
  demo: 'Démonstration : aucune donnée réelle',
  neutral: '',
};

/**
 * Étiquettes de statut : tout chiffre non sourcé porte « Hypothèse »,
 * tout contenu fictif porte « Exemple ».
 */
export function Badge({ kind = 'hypothese', children, className = '' }: { kind?: Kind; children?: ReactNode; className?: string }) {
  const base =
    'label-mono inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] px-1.5 py-[3px] text-[9.5px] leading-none align-middle';
  const styles: Record<Kind, string> = {
    hypothese: 'border border-dashed border-yellow/70 text-yellow',
    exemple: 'border border-dashed border-dust/60 text-dust',
    demo: 'border border-dashed border-chalk/50 text-chalk/80',
    neutral: 'border border-chalk/20 text-dust',
  };
  return (
    <span className={`${base} ${styles[kind]} ${className}`} title={TITLE[kind] || undefined}>
      {kind === 'hypothese' && (
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
          <circle cx="4" cy="4" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.4" />
        </svg>
      )}
      {children ?? LABEL[kind]}
    </span>
  );
}
