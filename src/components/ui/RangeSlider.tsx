'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** Valeur affichée (déjà formatée). */
  display: ReactNode;
  /** Précision sous l'étiquette (question, unité...). */
  hint?: string;
  /** Texte lu par les lecteurs d'écran. */
  valueText?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Curseur de la DA : rail ponctué d'inserts, poignée en forme de prise.
 * Champ natif <input type="range"> : clavier et lecteurs d'écran inclus.
 */
export function RangeSlider({ label, value, min, max, step, onChange, display, hint, valueText, className = '', compact }: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`group ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className={`font-semibold text-chalk ${compact ? 'text-[14px]' : 'text-[15px]'}`}>
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-[14px] tabular-nums text-chalk">
          {display}
        </output>
      </div>
      {hint && (
        <p data-hide-in-slides className="mt-0.5 text-[12.5px] leading-snug text-dust">
          {hint}
        </p>
      )}
      <input
        id={id}
        type="range"
        className="range mt-2 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${Math.max(0, Math.min(100, pct))}%` } as CSSProperties}
      />
    </div>
  );
}
