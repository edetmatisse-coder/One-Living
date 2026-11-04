'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUI } from '@/store/ui';

/**
 * Raccourcis globaux : P bascule le mode présentation, V lance ou arrête le
 * mode vidéo (Dossier seulement). Ignorés pendant la saisie d'un champ.
 */
export function ModeKeys() {
  const pathname = usePathname();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      const ui = useUI.getState();
      if (ui.transition.phase !== 'idle') return;
      if (e.key === 'p' || e.key === 'P') {
        if (ui.videoActive) return;
        e.preventDefault();
        ui.setPresentation(!ui.presentation);
      } else if ((e.key === 'v' || e.key === 'V') && !pathname?.startsWith('/campagne')) {
        if (ui.presentation) return;
        e.preventDefault();
        if (ui.videoActive) ui.setVideo({ videoActive: false, videoPlaying: false });
        else ui.setVideo({ videoActive: true, videoPlaying: true, videoTime: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pathname]);
  return null;
}
