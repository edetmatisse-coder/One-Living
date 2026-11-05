import { Easing, interpolate, spring, type SpringConfig } from 'remotion';
import { IMAGES_PAR_SECONDE as FPS } from '../../config';

export const FPS_VIDEO = FPS;

/** Ressorts (spring) : tous ont un léger dépassement, sauf DOUX. */
export const RESSORT: Partial<SpringConfig> = { damping: 12, stiffness: 190, mass: 0.6 }; // mots qui montent
export const POP: Partial<SpringConfig> = { damping: 9, stiffness: 240, mass: 0.65 }; // pastilles, chiffres
export const SEC: Partial<SpringConfig> = { damping: 14, stiffness: 320, mass: 0.5 }; // claque nette
export const LOURD: Partial<SpringConfig> = { damping: 11, stiffness: 150, mass: 0.95 }; // bouteilles
export const DOUX: Partial<SpringConfig> = { damping: 20, stiffness: 150, mass: 0.8 }; // déplacements

export const sp = (frame: number, a: number, config: Partial<SpringConfig> = RESSORT) =>
  spring({ frame: frame - a, fps: FPS, config });

export const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Interpolation bornée de a à b (en images). */
export const lin = (frame: number, a: number, b: number, de = 0, vers = 1, easing?: (t: number) => number) =>
  interpolate(frame, [a, b], [de, vers], { ...CLAMP, easing });

export const EASE = Easing.bezier(0.22, 1, 0.36, 1); // sortie rapide, arrivée douce
export const EASE_IO = Easing.bezier(0.76, 0, 0.24, 1); // volets
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);

/** Petit « coup » qui retombe : 1 à l'instant a, puis amorti. */
export const coup = (frame: number, a: number, duree = 3) => (frame < a ? 0 : Math.exp(-(frame - a) / duree));
