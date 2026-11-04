'use client';

import { create } from 'zustand';

interface UIState {
  /** Section au centre de l'écran. */
  activeId: string | null;
  activeIndex: number;
  activeColor: string;
  /** Index de la section la plus basse atteinte (−1 = aucune). */
  reachedIndex: number;
  /** Progression continue dans la page (0 → nombre de sections − 1). */
  climb: number;

  soundOn: boolean;

  setActive: (id: string, index: number, color: string) => void;
  setClimb: (v: number) => void;
  resetClimb: () => void;
  toggleSound: () => void;
}

export const useUI = create<UIState>((set) => ({
  activeId: null,
  activeIndex: 0,
  activeColor: '#F2B705',
  reachedIndex: -1,
  climb: 0,

  soundOn: false,

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
}));
