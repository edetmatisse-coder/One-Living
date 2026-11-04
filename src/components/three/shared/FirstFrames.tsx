'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/** Prévient une fois que la scène a peint ses premières images (fondu depuis le visuel fixe). */
export function FirstFrames({ onReady, frames = 3 }: { onReady?: () => void; frames?: number }) {
  const n = useRef(0);
  useFrame(() => {
    n.current++;
    if (n.current === frames) onReady?.();
  });
  return null;
}
