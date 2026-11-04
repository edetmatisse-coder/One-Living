'use client';

import { useEffect } from 'react';
import { useUI } from '@/store/ui';
import { currentScroll } from '@/lib/scroll';

/**
 * Suit la section au centre de l'écran (prise courante) et calcule une
 * progression continue sur la voie : `climb` vaut i quand l'en-tête de la
 * section i est centré à l'écran.
 */
export function useSectionTracking(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    if (!sections.length) return;
    useUI.getState().resetClimb();

    let anchors: number[] = [];
    const measure = () => {
      const y = currentScroll();
      const vh = window.innerHeight;
      anchors = sections.map((s, i) => {
        const r = s.getBoundingClientRect();
        const top = r.top + y;
        if (i === 0) return vh / 2; // départ : haut de page
        const head = s.querySelector<HTMLElement>('[data-section-head]');
        const hh = head ? head.getBoundingClientRect().height : vh * 0.6;
        return top + Math.min(hh, vh) * 0.55;
      });
    };

    let raf = 0;
    let lastIndex = -1;
    const update = () => {
      raf = 0;
      const probe = currentScroll() + window.innerHeight / 2;
      let climb = 0;
      const n = anchors.length;
      if (probe <= anchors[0]) climb = 0;
      else if (probe >= anchors[n - 1]) climb = n - 1;
      else {
        for (let i = 0; i < n - 1; i++) {
          if (probe >= anchors[i] && probe < anchors[i + 1]) {
            climb = i + (probe - anchors[i]) / (anchors[i + 1] - anchors[i]);
            break;
          }
        }
      }
      const state = useUI.getState();
      state.setClimb(climb);
      // Section active : celle dont l'ancre est passée (avec une marge).
      const idx = Math.min(n - 1, Math.floor(climb + 0.35));
      if (idx !== lastIndex) {
        lastIndex = idx;
        const el = sections[idx];
        state.setActive(el.dataset.section!, idx, el.dataset.color || '#F2B705');
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    window.addEventListener('resize', measure);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [enabled]);
}
