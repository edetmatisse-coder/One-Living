import * as THREE from 'three';

/**
 * Grimpeur stylisé : quatre membres à deux segments résolus par cinématique
 * inverse analytique. Les mains et les pieds suivent des cibles (les prises),
 * le buste et le bassin s'en déduisent avec un léger retard.
 */
export const BODY = {
  shoulder: 0.19,
  hip: 0.12,
  torso: 0.5,
  upperArm: 0.3,
  foreArm: 0.28,
  thigh: 0.43,
  shin: 0.43,
  head: 0.105,
  /** distance du buste à la paroi */
  wallGap: 0.3,
};

const _d = new THREE.Vector3();
const _b = new THREE.Vector3();

/**
 * IK à deux os : renvoie la position de l'articulation (coude, genou) et de
 * l'extrémité, en pliant vers `pole`.
 */
export function solveTwoBone(
  root: THREE.Vector3,
  target: THREE.Vector3,
  l1: number,
  l2: number,
  pole: THREE.Vector3,
  outJoint: THREE.Vector3,
  outEnd: THREE.Vector3,
) {
  _d.subVectors(target, root);
  let dist = _d.length();
  const max = l1 + l2 - 1e-4;
  const min = Math.abs(l1 - l2) + 1e-4;
  dist = Math.min(max, Math.max(min, dist));
  _d.normalize();
  const cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  const a = Math.acos(Math.min(1, Math.max(-1, cosA)));
  _b.copy(pole).addScaledVector(_d, -pole.dot(_d));
  if (_b.lengthSq() < 1e-8) _b.set(0, 0, 1);
  _b.normalize();
  outJoint.copy(root).addScaledVector(_d, Math.cos(a) * l1).addScaledVector(_b, Math.sin(a) * l1);
  outEnd.copy(root).addScaledVector(_d, dist);
}

export interface Pose {
  pelvis: THREE.Vector3;
  chest: THREE.Vector3;
  head: THREE.Vector3;
  shoulderL: THREE.Vector3;
  shoulderR: THREE.Vector3;
  elbowL: THREE.Vector3;
  elbowR: THREE.Vector3;
  handL: THREE.Vector3;
  handR: THREE.Vector3;
  hipL: THREE.Vector3;
  hipR: THREE.Vector3;
  kneeL: THREE.Vector3;
  kneeR: THREE.Vector3;
  footL: THREE.Vector3;
  footR: THREE.Vector3;
}

export function createPose(): Pose {
  const v = () => new THREE.Vector3();
  return {
    pelvis: v(), chest: v(), head: v(),
    shoulderL: v(), shoulderR: v(), elbowL: v(), elbowR: v(), handL: v(), handR: v(),
    hipL: v(), hipR: v(), kneeL: v(), kneeR: v(), footL: v(), footR: v(),
  };
}

export interface Targets {
  handL: THREE.Vector3;
  handR: THREE.Vector3;
  footL: THREE.Vector3;
  footR: THREE.Vector3;
}

const _mid = new THREE.Vector3();
const _feet = new THREE.Vector3();
const _pole = new THREE.Vector3();

/** Position idéale du buste et du bassin pour des cibles données. */
export function bodyFor(t: Targets, outChest: THREE.Vector3, outPelvis: THREE.Vector3, breathe = 0) {
  _mid.addVectors(t.handL, t.handR).multiplyScalar(0.5);
  _feet.addVectors(t.footL, t.footR).multiplyScalar(0.5);
  // le buste pend sous les mains, bras légèrement fléchis
  outChest.set(_mid.x * 0.75 + _feet.x * 0.25, _mid.y - 0.46, BODY.wallGap);
  // si une main est trop loin, le buste se rapproche
  for (const h of [t.handL, t.handR]) {
    const reach = BODY.upperArm + BODY.foreArm - 0.04;
    const d = outChest.distanceTo(h);
    if (d > reach) outChest.lerp(h, (d - reach) / d);
  }
  outPelvis.set(outChest.x * 0.6 + _feet.x * 0.4, outChest.y - BODY.torso + breathe, BODY.wallGap - 0.04);
  // les jambes doivent atteindre les pieds
  const leg = BODY.thigh + BODY.shin - 0.03;
  for (const f of [t.footL, t.footR]) {
    const d = outPelvis.distanceTo(f);
    if (d > leg) outPelvis.lerp(f, (d - leg) / d);
  }
  outChest.y = Math.max(outChest.y, outPelvis.y + BODY.torso * 0.82);
}

/** Pose complète (articulations) à partir du buste, du bassin et des cibles. */
export function solvePose(t: Targets, chest: THREE.Vector3, pelvis: THREE.Vector3, out: Pose, lookUp = 0.4) {
  out.chest.copy(chest);
  out.pelvis.copy(pelvis);
  out.shoulderL.set(chest.x - BODY.shoulder, chest.y + 0.04, chest.z);
  out.shoulderR.set(chest.x + BODY.shoulder, chest.y + 0.04, chest.z);
  out.hipL.set(pelvis.x - BODY.hip, pelvis.y, pelvis.z);
  out.hipR.set(pelvis.x + BODY.hip, pelvis.y, pelvis.z);
  // coudes vers l'extérieur et vers l'arrière, genoux vers l'extérieur
  solveTwoBone(out.shoulderL, t.handL, BODY.upperArm, BODY.foreArm, _pole.set(-1, -0.4, 0.8), out.elbowL, out.handL);
  solveTwoBone(out.shoulderR, t.handR, BODY.upperArm, BODY.foreArm, _pole.set(1, -0.4, 0.8), out.elbowR, out.handR);
  solveTwoBone(out.hipL, t.footL, BODY.thigh, BODY.shin, _pole.set(-1, 0.3, 0.7), out.kneeL, out.footL);
  solveTwoBone(out.hipR, t.footR, BODY.thigh, BODY.shin, _pole.set(1, 0.3, 0.7), out.kneeR, out.footR);
  out.head.set(chest.x, chest.y + 0.2 + BODY.head, chest.z - 0.05 * lookUp);
}

/** Point sur un arc entre deux positions (la main décolle de la paroi). */
export function arc(from: THREE.Vector3, to: THREE.Vector3, t: number, lift: number, out: THREE.Vector3) {
  const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  out.lerpVectors(from, to, e);
  out.z += Math.sin(Math.PI * t) * lift;
  return out;
}
