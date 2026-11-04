'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapabilities } from '@/lib/device';
import { scrollToY, setLenis } from '@/lib/scroll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger.
 * Désactivé en mouvement réduit.
 */
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
    });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [caps.ready, caps.reducedMotion]);

  return null;
}
