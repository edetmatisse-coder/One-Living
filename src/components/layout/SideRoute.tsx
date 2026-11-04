'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { useUI } from '@/store/ui';
import { Hold, type HoldKind } from '@/components/ui/Hold';
import { scrollToElement } from '@/lib/scroll';

const KINDS: HoldKind[] = ['jug', 'crimp', 'pinch', 'sloper', 'pocket'];

/**
 * Motif signature : une voie verticale le long de la page. On grimpe de bas
 * en haut pendant qu'on descend dans le Dossier ; chaque prise s'allume
 * quand sa section est atteinte. Cliquer sur une prise y emmène.
 */
export function SideRoute({ sections }: { sections: SectionMeta[] }) {
  const reached = useUI((s) => s.reachedIndex);
  const active = useUI((s) => s.activeIndex);
  const presentation = useUI((s) => s.presentation);
  const fillRef = useRef<HTMLDivElement>(null);
  const n = sections.length;

  useEffect(() => {
    return useUI.subscribe((s) => {
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${Math.min(1, s.climb / (n - 1))})`;
        fillRef.current.style.background = s.activeColor;
      }
    });
  }, [n]);

  if (presentation) return null;

  return (
    <nav
      aria-label="Progression dans le Dossier"
      className="pointer-events-none fixed right-4 top-1/2 z-40 hidden h-[min(74vh,640px)] w-10 -translate-y-1/2 lg:block xl:right-6"
    >
      {/* Voie : rangée d'inserts */}
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 top-0 w-[6px] -translate-x-1/2"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(169,163,154,.35) 0 1.2px, transparent 1.6px)',
          backgroundSize: '6px 14px',
        }}
      />
      <div
        ref={fillRef}
        aria-hidden
        className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 origin-bottom rounded-full opacity-80 shadow-[0_0_12px_currentColor] transition-[background] duration-500"
        style={{ transform: 'scaleY(0)' }}
      />
      <ol className="absolute inset-0">
        {sections.map((s, i) => {
          const hex = ROUTE_COLORS[s.route];
          const lit = i <= reached;
          const isActive = i === active;
          const bottom = (i / (n - 1)) * 100;
          return (
            <li
              key={s.id}
              className="pointer-events-auto absolute left-1/2 -translate-x-1/2 translate-y-1/2"
              style={{ bottom: `${bottom}%`, '--route': hex } as CSSProperties}
            >
              <button
                type="button"
                onClick={() => scrollToElement(s.id, { offset: s.num === 0 ? 0 : 0, duration: 1.8 })}
                className="group relative grid h-9 w-9 place-items-center"
                aria-label={`Prise ${String(s.num).padStart(2, '0')} : ${s.short}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full opacity-30"
                    style={{ background: hex, animationDuration: '2.4s' }}
                  />
                )}
                <Hold
                  kind={KINDS[i % KINDS.length]}
                  color={hex}
                  lit={lit}
                  size={isActive ? 26 : 19}
                  className="transition-[width,height,filter] duration-500"
                  style={{
                    filter: lit ? `drop-shadow(0 0 ${isActive ? 10 : 5}px ${hex}aa)` : 'none',
                    transform: `rotate(${(i * 47) % 50 - 25}deg)`,
                  }}
                />
                <span className="label-mono pointer-events-none absolute right-11 top-1/2 flex -translate-y-1/2 translate-x-2 items-center gap-2 whitespace-nowrap rounded-[3px] bg-chalk px-2 py-1.5 text-ply-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                  <span className="h-3 w-1.5" style={{ background: hex }} />
                  {String(s.num).padStart(2, '0')} · {s.short}
                  <span className="text-ply-400">{s.grade}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <span className="label-mono absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] text-dust/70">Départ</span>
      <span className="label-mono absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] text-dust/70">Top</span>
    </nav>
  );
}
