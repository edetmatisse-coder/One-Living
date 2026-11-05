import { noise2D } from '@remotion/noise';
import { E } from '../theme';

export interface Impact {
  /** image de l'impact */
  f: number;
  /** 1 = impact normal */
  force?: number;
}

/** Secousse de caméra : somme des impacts récents, amortie en ~10 images. */
export const secousse = (frame: number, impacts: Impact[], graine = 'cam') => {
  let x = 0;
  let y = 0;
  let r = 0;
  let s = 0;
  for (const im of impacts) {
    const t = frame - im.f;
    if (t < 0 || t > 22) continue;
    const k = (im.force ?? 1) * E.secousse;
    const a = Math.exp(-t / 3.4) * k;
    x += noise2D(`${graine}x`, t * 0.62, im.f * 0.37) * 24 * a;
    y += noise2D(`${graine}y`, t * 0.62, im.f * 0.37 + 5) * 17 * a;
    r += noise2D(`${graine}r`, t * 0.5, im.f * 0.37 + 11) * 0.9 * a;
    s += 0.03 * Math.exp(-t / 2.4) * k;
  }
  return { x, y, r, s };
};
