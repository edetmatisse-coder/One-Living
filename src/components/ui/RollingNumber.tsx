'use client';

import { useRef, type CSSProperties } from 'react';
import { useInView } from '@/lib/use-in-view';

interface Props {
  /** Texte déjà formaté (ex. « 1 485 », « +1 038 € », « 4,90 »). */
  value: string;
  className?: string;
  /** Démarrer à l'entrée dans la fenêtre (par défaut) ou piloté. */
  play?: boolean;
  durationMs?: number;
  /** Nombre de tours complets avant d'arriver au chiffre. */
  spins?: number;
  delayMs?: number;
}

const DIGITS = '0123456789';

/**
 * Compteur mécanique : chaque chiffre est une bande 0-9 qui défile jusqu'à
 * sa valeur, de droite à gauche, comme un totalisateur.
 */
export function RollingNumber({ value, className = '', play, durationMs = 1700, spins = 2, delayMs = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { rootMargin: '0px 0px -6% 0px' });
  const on = play ?? seen;
  const chars = Array.from(value);
  const cycles = spins + 1;

  return (
    <span ref={ref} className={`roll ${className}`}>
      <span className="sr-only">{value}</span>
      {chars.map((ch, i) => {
        const fromRight = chars.length - 1 - i;
        if (!DIGITS.includes(ch)) {
          // les espaces seuls disparaîtraient dans un conteneur flex : espace insécable
          const glyph = /\s/.test(ch) ? '\u00A0' : ch;
          return (
            <span key={`s${fromRight}`} aria-hidden="true" className={/\s/.test(ch) ? 'inline-block w-[0.18em]' : undefined}>
              {glyph}
            </span>
          );
        }
        const d = Number(ch);
        const index = on ? spins * 10 + d : 0;
        return (
          <span key={`d${fromRight}`} className="roll-digit" aria-hidden="true">
            <span
              className="roll-strip"
              style={
                {
                  transform: `translate3d(0, calc(${-index} * var(--h)), 0)`,
                  '--roll-dur': `${durationMs + fromRight * 120}ms`,
                  '--roll-delay': `${delayMs + fromRight * 40}ms`,
                } as CSSProperties
              }
            >
              {Array.from({ length: cycles * 10 }, (_, k) => (
                <span key={k}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
