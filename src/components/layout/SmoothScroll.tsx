'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useCapabilities } from '@/lib/device';
import { scrollToY, setLenis } from '@/lib/scroll';

/** Défilement fluide (Lenis), désactivé en mouvement réduit. */
export function SmoothScroll() {
  const caps = useCapabilities();

  useEffect(() => {
    if (!caps.ready) return;
    const root = document.documentElement;
    // Accroche pour les captures de contrôle (scripts/screenshots.mjs)
    (window as unknown as { __olScrollTo?: (y: number) => void }).__olScrollTo = (y: number) =>
      scrollToY(y, { immediate: true });
    root.dataset.motion = caps.reducedMotion ? 'reduce' : 'full';
    if (caps.reducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      syncTouch: false,
      anchors: false,
      autoRaf: true,
    });
    setLenis(lenis);

    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, [caps.ready, caps.reducedMotion]);

  return null;
}
