'use client';

import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useInView } from '@/lib/use-in-view';

type Line = string | { text: string; className?: string };

interface Props {
  lines: Line[];
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  /** Forcer l'apparition (sinon : à l'entrée dans la fenêtre). */
  play?: boolean;
  delayMs?: number;
  style?: CSSProperties;
  id?: string;
}

/**
 * Grand titre cinétique : chaque lettre monte dans le masque de sa ligne,
 * ligne par ligne. Le texte complet reste lisible par les lecteurs d'écran.
 */
export function KineticTitle({ lines, as = 'h2', className = '', play, delayMs = 0, style, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { rootMargin: '0px 0px -8% 0px' });
  const visible = play ?? seen;
  const full = lines.map((l) => (typeof l === 'string' ? l : l.text)).join(' ');

  let charIndex = 0;
  const content: ReactNode[] = lines.map((line, li) => {
    const text = typeof line === 'string' ? line : line.text;
    const lineClass = typeof line === 'string' ? '' : line.className ?? '';
    const words = text.split(' ');
    return (
      <span key={li} className={`kt-line ${lineClass}`} style={{ '--l': li } as CSSProperties}>
        {words.map((word, wi) => {
          const chars = Array.from(word).map((ch) => {
            const i = charIndex++;
            return (
              <span key={i} className="kt-char" style={{ '--i': i } as CSSProperties}>
                {ch}
              </span>
            );
          });
          return (
            <span key={wi} className="kt-word">
              {chars}
              {wi < words.length - 1 ? ' ' : null}
            </span>
          );
        })}
      </span>
    );
  });

  const Tag = as as ElementType;
  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      data-kt-in={visible ? 'true' : 'false'}
      style={{ ...style, '--kt-delay': `${delayMs}ms` } as CSSProperties}
    >
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">{content}</span>
    </Tag>
  );
}
