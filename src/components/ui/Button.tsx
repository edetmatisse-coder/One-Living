'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'quiet';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  kbd?: string;
  children: ReactNode;
}

/**
 * Bouton de la DA : bloc net, coins presque droits, couleur de la voie
 * courante (--route) pour l'action principale.
 */
export function Button({ variant = 'primary', icon, kbd, className = '', children, ...rest }: Props) {
  const base =
    'group relative inline-flex items-center gap-3 rounded-[4px] px-5 py-3.5 text-[15px] font-semibold leading-none transition-[transform,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(.2,.8,.1,1)] active:translate-y-[1px] disabled:opacity-40';
  const styles: Record<Variant, string> = {
    primary:
      'bg-route text-ply-900 shadow-[0_1px_0_rgba(255,255,255,.35)_inset,0_-2px_0_rgba(0,0,0,.25)_inset,0_14px_30px_-14px_var(--route)] hover:-translate-y-0.5',
    ghost: 'border border-chalk/25 bg-ply-900/40 text-chalk hover:border-chalk/70 hover:bg-ply-900/70',
    quiet: 'px-3 py-2 text-dust hover:text-chalk',
  };
  return (
    <button type="button" className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {icon && <span className="-ml-1 grid place-items-center">{icon}</span>}
      <span className="inline-flex items-center gap-2.5">{children}</span>
      {kbd && (
        <kbd
          className={`label-mono rounded-[3px] px-1.5 py-1 text-[10px] ${
            variant === 'primary' ? 'bg-ply-900/15 text-ply-900/70' : 'bg-chalk/10 text-dust'
          }`}
        >
          {kbd}
        </kbd>
      )}
    </button>
  );
}

/** Flèche dessinée (les polices embarquées n'ont pas les glyphes de flèches). */
export function Arrow({ dir = 'right', size = 14 }: { dir?: 'right' | 'down' | 'up' | 'left' | 'up-right'; size?: number }) {
  const rot = { right: 0, down: 90, left: 180, up: -90, 'up-right': -45 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}
