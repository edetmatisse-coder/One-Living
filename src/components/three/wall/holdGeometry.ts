import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createNoise3D, smoothstep } from '@/lib/three/noise';

/**
 * Prises en résine générées par bruit : une sphère déformée, aplatie au dos
 * contre la paroi, avec un bord creusé (bac), une magnésie qui se dépose sur
 * les faces tournées vers le haut, et la position de la vis.
 */
export type HoldShape = 'jug' | 'crimp' | 'sloper' | 'pinch' | 'pocket' | 'edge';

interface ShapeParams {
  sx: number;
  sy: number;
  sz: number;
  lip: number;
  noise: number;
  dent?: number;
}

const SHAPES: Record<HoldShape, ShapeParams> = {
  jug: { sx: 1.0, sy: 0.8, sz: 0.66, lip: 0.6, noise: 0.16 },
  crimp: { sx: 1.25, sy: 0.38, sz: 0.36, lip: 0.28, noise: 0.1 },
  sloper: { sx: 1.0, sy: 0.86, sz: 0.44, lip: 0, noise: 0.08 },
  pinch: { sx: 0.46, sy: 1.05, sz: 0.56, lip: 0.08, noise: 0.14 },
  pocket: { sx: 0.95, sy: 0.9, sz: 0.52, lip: 0, noise: 0.12, dent: 0.55 },
  edge: { sx: 1.45, sy: 0.52, sz: 0.4, lip: 0.42, noise: 0.12 },
};

export const HOLD_SHAPES = Object.keys(SHAPES) as HoldShape[];

export interface HoldGeometryInfo {
  /** Point de la vis (repère local, avant mise à l'échelle). */
  bolt: THREE.Vector3;
}

export function makeHoldGeometry(shape: HoldShape, seed: number, detail = 4): THREE.BufferGeometry {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const noise = createNoise3D(seed * 7 + 3);
  const s = SHAPES[shape];
  const v = new THREE.Vector3();
  const boltX = 0;
  const boltY = shape === 'jug' || shape === 'edge' || shape === 'crimp' ? -0.18 * s.sy : 0.02;
  let boltZ = 0;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n1 = noise(v.x * 1.25 + seed, v.y * 1.25, v.z * 1.25);
    const n2 = noise(v.x * 4.3, v.y * 4.3 + seed, v.z * 4.3);
    const r = 1 + s.noise * n1 + 0.032 * n2;
    const x = v.x * r * s.sx;
    let y = v.y * r * s.sy;
    let z = v.z * r * s.sz;
    if (s.lip > 0 && v.y > 0) {
      // bac : le dessus se creuse vers la paroi, le bord avant remonte
      const t = smoothstep(0.12, 0.95, v.y) * smoothstep(-0.25, 0.75, v.z);
      z -= t * s.lip * s.sz * 0.95;
      y += t * 0.07;
    }
    if (s.dent && v.z > 0) {
      const d = Math.hypot(v.x, v.y - 0.08);
      z -= s.dent * s.sz * Math.pow(Math.max(0, 1 - d / 0.55), 2);
    }
    if (z < 0) z *= 0.05; // dos plaqué contre la paroi
    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();

  // magnésie : surtout sur les faces tournées vers le haut et vers l'avant
  const nrm = g.getAttribute('normal') as THREE.BufferAttribute;
  const chalk = new Float32Array(pos.count);
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nrm, i);
    const up = smoothstep(0.15, 0.85, n.y);
    const front = smoothstep(-0.1, 0.4, n.z);
    const grain = 0.5 + 0.5 * noise(v.x * 6 + 11, v.y * 6, v.z * 6);
    chalk[i] = Math.min(1, up * front * (0.35 + 0.75 * grain) + 0.08 * grain);
    // vis : point le plus en avant près du centre
    if (Math.hypot(v.x - boltX, v.y - boltY) < 0.16 && v.z > boltZ) boltZ = v.z;
  }
  g.setAttribute('chalk', new THREE.BufferAttribute(chalk, 1));
  g.userData.bolt = new THREE.Vector3(boltX, boltY, boltZ);
  g.computeBoundingSphere();
  return g;
}

/**
 * Matériau de résine : la magnésie (attribut `chalk`) blanchit et mate la
 * prise. `glow` pilote la lumière propre des prises de la voie.
 */
export function makeHoldMaterial(opts: { chalk?: number; physical?: boolean; color?: THREE.ColorRepresentation } = {}) {
  const { chalk = 0.9, physical = false, color = 0xffffff } = opts;
  const mat = physical
    ? new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0 });
  const uniforms = { uChalk: { value: chalk } };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uChalk = uniforms.uChalk;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float chalk;\nvarying float vChalk;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvChalk = chalk;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uChalk;\nvarying float vChalk;')
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\nfloat chalkAmt = clamp(vChalk * uChalk, 0.0, 1.0);\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.80, 0.78, 0.74), chalkAmt * 0.82);',
      )
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.97, chalkAmt);',
      );
  };
  mat.customProgramCacheKey = () => `hold-${physical ? 'p' : 's'}`;
  return mat;
}

/** Vis à tête hexagonale et rondelle sombre. */
export function makeBoltGeometries() {
  const washer = new THREE.CylinderGeometry(0.019, 0.021, 0.006, 20);
  washer.rotateX(Math.PI / 2);
  const head = new THREE.CylinderGeometry(0.0105, 0.0105, 0.009, 6);
  head.rotateX(Math.PI / 2);
  head.translate(0, 0, 0.006);
  return { washer, head };
}
