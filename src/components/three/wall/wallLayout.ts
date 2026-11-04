import * as THREE from 'three';
import { HOLD_SHAPES, type HoldShape } from './holdGeometry';
import { pick, range, rng } from '@/lib/three/noise';

/**
 * Géométrie de la paroi : une suite de pans plans, verticaux ou en dévers.
 * Angle positif = dévers (le haut du pan avance vers le grimpeur, +z).
 */
export const WALL_WIDTH = 13;

interface SegmentDef {
  h: number;
  deg: number;
}

const PROFILE: SegmentDef[] = [
  { h: 0.42, deg: -34 }, // marchepied (kicker)
  { h: 3.4, deg: 0 },
  { h: 4.1, deg: 14 },
  { h: 3.1, deg: -5 },
  { h: 4.4, deg: 21 },
  { h: 3.3, deg: -9 },
  { h: 4.6, deg: 9 },
  { h: 5.2, deg: 0 },
];

export interface WallSegment {
  y0: number;
  y1: number;
  z0: number;
  z1: number;
  /** abscisse curviligne (pour la texture) */
  s0: number;
  s1: number;
  angle: number;
  normal: THREE.Vector3;
}

export const SEGMENTS: WallSegment[] = (() => {
  const out: WallSegment[] = [];
  let y = 0;
  let z = 0;
  let s = 0;
  for (const d of PROFILE) {
    const a = THREE.MathUtils.degToRad(d.deg);
    const y1 = y + d.h;
    const z1 = z + d.h * Math.tan(a);
    const len = d.h / Math.cos(a);
    out.push({ y0: y, y1, z0: z, z1, s0: s, s1: s + len, angle: a, normal: new THREE.Vector3(0, -Math.sin(a), Math.cos(a)) });
    y = y1;
    z = z1;
    s += len;
  }
  return out;
})();

export const WALL_HEIGHT = SEGMENTS[SEGMENTS.length - 1].y1;

/** Point et normale de la paroi à la hauteur y. */
export function surfaceAt(y: number, out = new THREE.Vector3()): { point: THREE.Vector3; normal: THREE.Vector3; seg: WallSegment } {
  const yc = Math.min(WALL_HEIGHT, Math.max(0, y));
  const seg = SEGMENTS.find((sg) => yc >= sg.y0 && yc <= sg.y1) ?? SEGMENTS[SEGMENTS.length - 1];
  const t = (yc - seg.y0) / (seg.y1 - seg.y0);
  out.set(0, yc, seg.z0 + (seg.z1 - seg.z0) * t);
  return { point: out, normal: seg.normal, seg };
}

export interface HoldPlacement {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  shape: HoldShape;
  color: string;
  /** index de section pour les prises de la voie du Dossier */
  section?: number;
}

const _q = new THREE.Quaternion();
const _qz = new THREE.Quaternion();
const _z = new THREE.Vector3(0, 0, 1);

/** Oriente une prise : son dos (z local) suit la normale, rotation libre autour. */
export function placeOnWall(x: number, y: number, rot: number, lift = 0) {
  const { point, normal } = surfaceAt(y);
  const position = new THREE.Vector3(x, point.y, point.z).addScaledVector(normal, lift);
  _q.setFromUnitVectors(_z, normal);
  _qz.setFromAxisAngle(_z, rot);
  const quaternion = new THREE.Quaternion().multiplyQuaternions(_q, _qz);
  return { position, quaternion, normal };
}

/** Couleurs de voies (prises du Dossier) et teintes des voies décoratives. */
export const ROUTE_HEX = ['#F2B705', '#E64980', '#5C7CFA', '#FD7E14'];
const DECOR_HEX = ['#C99A08', '#B83C68', '#4A63C8', '#C9650F', '#2A2724', '#D8D2C8', '#3C3833'];

/** Prises de la voie du Dossier : une par section, en zigzag à droite du titre. */
const ROUTE_XY: [number, number][] = [
  [2.05, 2.6],
  [1.25, 4.95],
  [1.8, 7.25],
  [1.15, 9.55],
  [1.85, 11.85],
  [1.3, 14.15],
  [1.95, 16.45],
  [1.2, 18.75],
  [1.8, 21.05],
  [1.35, 23.35],
  [1.7, 25.65],
];

export function routeY(i: number) {
  return ROUTE_XY[Math.max(0, Math.min(ROUTE_XY.length - 1, i))][1];
}

export function routeX(i: number) {
  return ROUTE_XY[Math.max(0, Math.min(ROUTE_XY.length - 1, i))][0];
}

export function buildRoute(sectionCount: number, colors: string[]): HoldPlacement[] {
  const r = rng(404);
  const shapes: HoldShape[] = ['jug', 'sloper', 'jug', 'pinch', 'jug', 'pocket', 'sloper', 'jug', 'pinch', 'jug', 'sloper'];
  return Array.from({ length: sectionCount }, (_, i) => {
    const { position, quaternion } = placeOnWall(routeX(i), routeY(i), range(r, -0.5, 0.5));
    return { position, quaternion, scale: range(r, 0.2, 0.25), shape: shapes[i % shapes.length], color: colors[i], section: i };
  });
}

/** Voies décoratives : lignes de prises de même couleur, comme en salle. */
export function buildDecor(quality: 'high' | 'low', avoid: THREE.Vector3[]): HoldPlacement[] {
  const r = rng(77);
  const lines = quality === 'high' ? 10 : 6;
  const out: HoldPlacement[] = [];
  for (let l = 0; l < lines; l++) {
    const color = l < 4 ? ROUTE_HEX[l] : pick(r, DECOR_HEX);
    const dim = l < 4 ? 0.62 : 1;
    const c = new THREE.Color(color).multiplyScalar(dim);
    const hex = '#' + c.getHexString();
    let x = range(r, -WALL_WIDTH / 2 + 1, WALL_WIDTH / 2 - 1);
    let y = range(r, 0.6, 1.4);
    while (y < WALL_HEIGHT - 0.6) {
      x += range(r, -0.42, 0.42);
      x = Math.max(-WALL_WIDTH / 2 + 0.6, Math.min(WALL_WIDTH / 2 - 0.6, x));
      const tooClose = avoid.some((p) => Math.hypot(p.x - x, p.y - y) < 0.6);
      // derrière les titres (gauche de l'écran), la paroi reste calme
      const behindText = x < 0.5 && r() < 0.62;
      if (!tooClose && !behindText) {
        const { position, quaternion } = placeOnWall(x, y, range(r, -Math.PI, Math.PI));
        out.push({ position, quaternion, scale: range(r, 0.07, 0.17), shape: pick(r, HOLD_SHAPES), color: hex });
      }
      y += range(r, 0.5, 0.95);
    }
  }
  return out;
}

/** Volumes : pyramides triangulaires vissées sur la paroi. */
export interface VolumePlacement {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  size: number;
  depth: number;
  tint: string;
}

export function buildVolumes(): VolumePlacement[] {
  const defs = [
    { x: -2.6, y: 5.6, size: 1.3, depth: 0.42, tint: '#3a332c' },
    { x: 3.4, y: 9.6, size: 1.05, depth: 0.36, tint: '#5C7CFA' },
    { x: -1.2, y: 13.7, size: 1.5, depth: 0.5, tint: '#3a332c' },
    { x: 3.1, y: 18.2, size: 1.15, depth: 0.4, tint: '#E64980' },
    { x: -3.0, y: 21.4, size: 1.25, depth: 0.44, tint: '#3a332c' },
    { x: 0.2, y: 26.2, size: 1.0, depth: 0.34, tint: '#F2B705' },
  ];
  return defs.map((d, i) => {
    const { position, quaternion } = placeOnWall(d.x, d.y, i * 1.3);
    return { position, quaternion, size: d.size, depth: d.depth, tint: d.tint };
  });
}

/** Géométrie d'un volume : base triangulaire contre la paroi, sommet décalé. */
export function makeVolumeGeometry(): THREE.BufferGeometry {
  const a = new THREE.Vector3(-0.5, -0.36, 0);
  const b = new THREE.Vector3(0.5, -0.36, 0);
  const c = new THREE.Vector3(0.05, 0.5, 0);
  const apex = new THREE.Vector3(0.08, -0.08, 1);
  const tris = [
    [a, b, apex],
    [b, c, apex],
    [c, a, apex],
  ];
  const positions: number[] = [];
  const uvs: number[] = [];
  for (const [p, q, r] of tris) {
    positions.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
    uvs.push(0, 0, 1, 0, 0.5, 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals();
  return g;
}

/** Surface de la paroi : un quadrilatère par pan, UV en mètres (tuiles de contreplaqué). */
export function makeWallGeometry(sheetW: number, sheetH: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const hw = WALL_WIDTH / 2;
  let base = 0;
  for (const s of SEGMENTS) {
    const verts = [
      [-hw, s.y0, s.z0, 0, s.s0],
      [hw, s.y0, s.z0, WALL_WIDTH, s.s0],
      [hw, s.y1, s.z1, WALL_WIDTH, s.s1],
      [-hw, s.y1, s.z1, 0, s.s1],
    ];
    for (const [x, y, z, u, v] of verts) {
      positions.push(x, y, z);
      normals.push(s.normal.x, s.normal.y, s.normal.z);
      uvs.push(u / sheetW, v / sheetH);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    base += 4;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  return g;
}
