'use client';

import type Lenis from 'lenis';

/**
 * Accès global à l'instance Lenis (défilement fluide). Absente en mouvement
 * réduit : on retombe alors sur le défilement natif.
 */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function currentScroll(): number {
  return lenis ? lenis.scroll : window.scrollY;
}

export function scrollToY(
  y: number,
  opts: { immediate?: boolean; duration?: number; force?: boolean; onComplete?: () => void } = {},
) {
  if (lenis) {
    lenis.scrollTo(y, {
      immediate: opts.immediate,
      duration: opts.duration ?? 1.4,
      force: opts.force ?? true,
      onComplete: opts.onComplete,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  } else {
    window.scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' });
    opts.onComplete?.();
  }
}

/** Fait défiler jusqu'à un élément (id ou nœud), avec un décalage d'en-tête. */
export function scrollToElement(
  target: string | HTMLElement,
  opts: { offset?: number; immediate?: boolean; duration?: number; onComplete?: () => void } = {},
) {
  const el = typeof target === 'string' ? document.getElementById(target.replace(/^#/, '')) : target;
  if (!el) return;
  const y = el.getBoundingClientRect().top + currentScroll() + (opts.offset ?? 0);
  scrollToY(Math.max(0, y), opts);
}

export function stopScroll() {
  lenis?.stop();
}

export function startScroll() {
  lenis?.start();
}
