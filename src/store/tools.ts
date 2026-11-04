'use client';

import { create } from 'zustand';
import { SCENARIOS } from '@/data/sports';
import { SIM_PRESETS, type PosInputs } from '@/data/economics';

/**
 * État des deux outils, partagé avec le mode vidéo (qui les manipule tout
 * seul : curseurs qui bougent, simulateur qui passe au scénario prudent).
 */

type Cancel = () => void;

/** Interpolation douce de plusieurs valeurs (curseurs qui glissent). */
function tween(from: number[], to: number[], ms: number, onUpdate: (v: number[]) => void, onDone?: () => void): Cancel {
  const start = performance.now();
  let raf = 0;
  let finished = false;
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    onUpdate([...to]);
    onDone?.();
  };
  const step = (now: number) => {
    if (finished) return;
    const t = Math.min(1, (now - start) / ms);
    if (t >= 1) return finish();
    const k = ease(t);
    onUpdate(from.map((f, i) => f + (to[i] - f) * k));
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  // filet de sécurité : la valeur finale tombe à l'heure même si les images ralentissent
  const safety = window.setTimeout(finish, ms + 60);
  return () => {
    finished = true;
    cancelAnimationFrame(raf);
    window.clearTimeout(safety);
  };
}

/* ---------------------------- Matrice ---------------------------- */

interface MatrixState {
  raw: number[];
  scenario: string | null;
  setWeight: (i: number, v: number) => void;
  applyScenario: (id: string, animateMs?: number) => void;
  animateWeights: (to: number[], ms?: number, scenario?: string | null) => void;
}

let cancelMatrix: Cancel | null = null;

export const useMatrix = create<MatrixState>((set, get) => ({
  raw: [...SCENARIOS[0].weights],
  scenario: SCENARIOS[0].id,
  setWeight: (i, v) => {
    cancelMatrix?.();
    const raw = [...get().raw];
    raw[i] = v;
    const match = SCENARIOS.find((s) => s.weights.every((w, k) => Math.abs(w - raw[k]) < 0.01));
    set({ raw, scenario: match?.id ?? null });
  },
  applyScenario: (id, animateMs = 700) => {
    const sc = SCENARIOS.find((s) => s.id === id);
    if (!sc) return;
    get().animateWeights([...sc.weights], animateMs, sc.id);
  },
  animateWeights: (to, ms = 700, scenario = null) => {
    cancelMatrix?.();
    const from = [...get().raw];
    set({ scenario });
    if (ms <= 0) {
      set({ raw: [...to] });
      return;
    }
    cancelMatrix = tween(from, to, ms, (v) => set({ raw: v }), () => set({ raw: [...to] }));
  },
}));

/* --------------------------- Simulateur --------------------------- */

interface SimState {
  inputs: PosInputs;
  preset: string | null;
  setField: (key: keyof PosInputs, v: number) => void;
  applyPreset: (id: string, animateMs?: number) => void;
}

let cancelSim: Cancel | null = null;
const KEYS: (keyof PosInputs)[] = ['jours', 'passages', 'tauxPct', 'cession', 'revente', 'coutRevient', 'activation'];

export const useSim = create<SimState>((set, get) => ({
  inputs: { ...SIM_PRESETS[0].inputs },
  preset: SIM_PRESETS[0].id,
  setField: (key, v) => {
    cancelSim?.();
    const inputs = { ...get().inputs, [key]: v };
    const match = SIM_PRESETS.find((p) => KEYS.every((k) => Math.abs(p.inputs[k] - inputs[k]) < 1e-6));
    set({ inputs, preset: match?.id ?? null });
  },
  applyPreset: (id, animateMs = 800) => {
    const p = SIM_PRESETS.find((x) => x.id === id);
    if (!p) return;
    cancelSim?.();
    set({ preset: p.id });
    const from = KEYS.map((k) => get().inputs[k]);
    const to = KEYS.map((k) => p.inputs[k]);
    const toInputs = (v: number[]) => Object.fromEntries(KEYS.map((k, i) => [k, v[i]])) as unknown as PosInputs;
    if (animateMs <= 0) {
      set({ inputs: { ...p.inputs } });
      return;
    }
    cancelSim = tween(
      from,
      to,
      animateMs,
      (v) => {
        // valeurs intermédiaires arrondies au pas des curseurs, pour des chiffres propres
        const r = toInputs(v);
        r.jours = Math.round(r.jours);
        r.passages = Math.round(r.passages);
        r.tauxPct = Math.round(r.tauxPct * 2) / 2;
        r.activation = Math.round(r.activation / 10) * 10;
        r.cession = Math.round(r.cession * 20) / 20;
        r.revente = Math.round(r.revente * 10) / 10;
        r.coutRevient = Math.round(r.coutRevient * 20) / 20;
        set({ inputs: r });
      },
      () => set({ inputs: { ...p.inputs } }),
    );
  },
}));
