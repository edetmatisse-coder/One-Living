import type { CSSProperties } from 'react';

interface Props {
  num: number | string;
  name: string;
  grade: string;
  color: string;
  /** Petite ligne du bas (ouvreur, parfum, date...). */
  foot?: string;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
  size?: 'sm' | 'md';
}

/**
 * Carte de départ scotchée au pied d'une voie : couleur, nom, cotation.
 */
export function StartCard({ num, name, grade, color, foot, rotate = -2.2, className = '', style, size = 'md' }: Props) {
  const label = typeof num === 'number' ? String(num).padStart(2, '0') : num;
  const sm = size === 'sm';
  return (
    <div
      className={`relative w-fit select-none ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <span className="tape -top-2 left-3 rotate-[-6deg]" aria-hidden />
      <span className="tape -top-2 right-3 rotate-[5deg]" aria-hidden />
      <div
        className={`relative flex items-stretch overflow-hidden rounded-[3px] bg-chalk text-ply-900 shadow-[0_10px_30px_-12px_rgba(0,0,0,.7),0_2px_0_rgba(0,0,0,.25)] ${
          sm ? 'min-w-[170px]' : 'min-w-[220px]'
        }`}
      >
        <div className={sm ? 'w-2.5' : 'w-3.5'} style={{ background: color }} aria-hidden />
        <div className={sm ? 'px-3 py-2' : 'px-4 py-3'}>
          <div className="flex items-baseline justify-between gap-6 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ply-500">
            <span>Voie {label}</span>
            <span className="normal-case tracking-[0.06em] text-ply-900">{grade}</span>
          </div>
          <div
            className={`font-display leading-[0.9] text-ply-900 ${sm ? 'mt-1 text-[22px]' : 'mt-1.5 text-[30px]'}`}
            style={{ fontWeight: 800 }}
          >
            {name}
          </div>
          {foot && <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ply-400">{foot}</div>}
        </div>
      </div>
    </div>
  );
}
