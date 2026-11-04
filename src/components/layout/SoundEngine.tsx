'use client';

import { useEffect } from 'react';
import { useUI } from '@/store/ui';
import { playSfx, setSoundEnabled } from '@/lib/sound';

/** Relie le bouton « Son » au moteur WebAudio et sonorise les transitions. */
export function SoundEngine() {
  const soundOn = useUI((s) => s.soundOn);
  const phase = useUI((s) => s.transition.phase);
  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);
  useEffect(() => {
    if (phase === 'cover' || phase === 'reveal') playSfx('whoosh');
  }, [phase]);
  useEffect(() => () => setSoundEnabled(false), []);
  return null;
}
