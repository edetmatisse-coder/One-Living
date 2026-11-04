'use client';

import { create } from 'zustand';

export type TransitionPhase = 'idle' | 'cover' | 'hold' | 'reveal';

interface UIState {
  /** Section au centre de l'écran. */
  activeId: string | null;
  activeIndex: number;
  activeColor: string;
  /** Index de la prise la plus haute atteinte sur la voie (−1 = aucune). */
  reachedIndex: number;
  /** Progression continue sur la voie (0 → nombre de sections − 1). */
  climb: number;

  soundOn: boolean;

  presentation: boolean;
  notesOpen: boolean;
  slideIndex: number;

  videoActive: boolean;
  videoPlaying: boolean;
  videoTime: number;
  videoEnded: boolean;

  transition: { phase: TransitionPhase; to: string | null; label: string; sub: string; color: string };

  setActive: (id: string, index: number, color: string) => void;
  setClimb: (v: number) => void;
  resetClimb: () => void;
  toggleSound: () => void;
  setPresentation: (on: boolean) => void;
  toggleNotes: () => void;
  setSlide: (i: number) => void;
  setVideo: (patch: Partial<Pick<UIState, 'videoActive' | 'videoPlaying' | 'videoTime' | 'videoEnded'>>) => void;
  setTransition: (patch: Partial<UIState['transition']>) => void;
}

export const useUI = create<UIState>((set) => ({
  activeId: null,
  activeIndex: 0,
  activeColor: '#F2B705',
  reachedIndex: -1,
  climb: 0,

  soundOn: false,

  presentation: false,
  notesOpen: false,
  slideIndex: 0,

  videoActive: false,
  videoPlaying: false,
  videoTime: 0,
  videoEnded: false,

  transition: { phase: 'idle', to: null, label: '', sub: '', color: '#F2B705' },

  setActive: (id, index, color) =>
    set((s) => ({
      activeId: id,
      activeIndex: index,
      activeColor: color,
      reachedIndex: Math.max(s.reachedIndex, index),
    })),
  setClimb: (v) => set({ climb: v }),
  resetClimb: () => set({ climb: 0, reachedIndex: -1, activeIndex: 0, activeId: null }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setPresentation: (on) => set({ presentation: on, notesOpen: false }),
  toggleNotes: () => set((s) => ({ notesOpen: !s.notesOpen })),
  setSlide: (i) => set({ slideIndex: i }),
  // relancer le mode vidéo remet l'état « terminé » à zéro
  setVideo: (patch) => set(patch.videoActive ? { videoEnded: false, ...patch } : patch),
  setTransition: (patch) => set((s) => ({ transition: { ...s.transition, ...patch } })),
}));
