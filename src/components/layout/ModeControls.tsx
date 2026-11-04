'use client';

import { useUI } from '@/store/ui';
import { IconRec, IconSlides, IconSound } from '@/components/ui/Icons';

/**
 * Commandes globales : son (désactivé par défaut), mode présentation (P),
 * mode vidéo (V, Dossier seulement).
 */
export function ModeControls({ video = true, compact = false }: { video?: boolean; compact?: boolean }) {
  const soundOn = useUI((s) => s.soundOn);
  const toggleSound = useUI((s) => s.toggleSound);
  const setPresentation = useUI((s) => s.setPresentation);
  const setVideo = useUI((s) => s.setVideo);

  const btn =
    'h-9 items-center gap-2 rounded-[4px] border border-chalk/15 bg-ply-900/50 px-3 text-[13px] font-medium text-chalk-dim transition-colors hover:border-chalk/50 hover:text-chalk';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleSound}
        className={`${btn} inline-flex`}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Couper le son' : 'Activer le son'}
        data-cursor-label={soundOn ? 'Couper le son' : 'Activer le son'}
      >
        <IconSound on={soundOn} />
        {!compact && <span className="hidden xl:inline">{soundOn ? 'Son' : 'Son coupé'}</span>}
      </button>
      <button
        type="button"
        onClick={() => setPresentation(true)}
        className={`${btn} hidden md:flex`}
        aria-keyshortcuts="P"
        aria-label="Mode présentation"
      >
        <IconSlides />
        {!compact && <span className="hidden lg:inline">Présentation</span>}
        <kbd className="label-mono rounded-[3px] bg-chalk/10 px-1.5 py-0.5 text-[10px] text-dust">P</kbd>
      </button>
      {video && (
        <button
          type="button"
          onClick={() => setVideo({ videoActive: true, videoPlaying: true, videoTime: 0 })}
          className={`${btn} hidden md:flex`}
          aria-keyshortcuts="V"
          aria-label="Mode vidéo"
        >
          <IconRec />
          {!compact && <span className="hidden lg:inline">Vidéo</span>}
          <kbd className="label-mono rounded-[3px] bg-chalk/10 px-1.5 py-0.5 text-[10px] text-dust">V</kbd>
        </button>
      )}
    </div>
  );
}
