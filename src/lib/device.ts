'use client';

import { useSyncExternalStore } from 'react';

/**
 * Capacités de l'appareil, lues côté client uniquement.
 * `?motion=reduce` force le mode mouvement réduit (captures, tests),
 * `?quality=low` force la 3D allégée.
 */
export interface Capabilities {
  ready: boolean;
  reducedMotion: boolean;
  touch: boolean;
  mobile: boolean;
  webgl: boolean;
  /** 'high' : portable récent ; 'low' : mobile ou GPU modeste. */
  tier: 'high' | 'low';
}

const SSR_CAPS: Capabilities = {
  ready: false,
  reducedMotion: false,
  touch: false,
  mobile: false,
  webgl: true,
  tier: 'high',
};

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

let cached: Capabilities | null = null;

function compute(): Capabilities {
  const params = new URLSearchParams(window.location.search);
  const forcedMotion = params.get('motion');
  const forcedQuality = params.get('quality');
  const reducedMotion =
    forcedMotion === 'reduce' ||
    (forcedMotion !== 'full' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const mobile = window.innerWidth < 768;
  const webgl = detectWebGL();
  const lowMemory = typeof navigator !== 'undefined' && 'deviceMemory' in navigator && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 4;
  const tier: Capabilities['tier'] =
    forcedQuality === 'low' ? 'low' : forcedQuality === 'high' ? 'high' : mobile || touch || lowMemory ? 'low' : 'high';
  return { ready: true, reducedMotion, touch, mobile, webgl, tier };
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => {
    cached = compute();
    listeners.forEach((l) => l());
  };
  mq.addEventListener('change', onChange);
  let t: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const next = compute();
      if (!cached || next.mobile !== cached.mobile) {
        cached = next;
        listeners.forEach((l) => l());
      }
    }, 200);
  };
  window.addEventListener('resize', onResize);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener('change', onChange);
    window.removeEventListener('resize', onResize);
  };
}

function getSnapshot(): Capabilities {
  if (!cached) cached = compute();
  return cached;
}

function getServerSnapshot(): Capabilities {
  return SSR_CAPS;
}

/**
 * Pendant l'hydratation, React utilise l'instantané serveur (ready: false),
 * puis rend à nouveau avec les vraies valeurs : pas d'écart d'hydratation.
 */
export function useCapabilities(): Capabilities {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noop = () => () => {};

/** Vrai une fois monté côté client (faux pendant le rendu serveur et l'hydratation). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Lecture ponctuelle hors React (scripts d'animation). */
export function readCapabilities(): Capabilities {
  if (typeof window === 'undefined') return SSR_CAPS;
  return getSnapshot();
}
