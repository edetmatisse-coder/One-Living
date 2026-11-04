'use client';

import { useEffect } from 'react';
import { useUI } from '@/store/ui';
import { setSoundEnabled } from '@/lib/sound';

/** Relie le bouton « Son » au moteur WebAudio (désactivé par défaut). */
export function SoundEngine() {
  const soundOn = useUI((s) => s.soundOn);
  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);
  useEffect(() => () => setSoundEnabled(false), []);
  return null;
}
