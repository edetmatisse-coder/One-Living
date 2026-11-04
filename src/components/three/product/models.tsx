'use client';

import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SHAPES, PHOTO_COLORS } from '@/data/product-shapes';
import { productLabel, type FormatId, type Product } from '@/data/campagne';

/**
 * Les trois contenants de la gamme, construits par révolution à partir des
 * silhouettes mesurées sur les photos de oneliving.com
 * (src/data/product-shapes.ts), avec les vraies étiquettes déroulées.
 */

/** Hauteur de chaque format dans la scène. Le shot et la canette restent plus petits que la bouteille. */
export const SCENE_HEIGHT: Record<FormatId, number> = { bouteille: 1.6, canette: 1.36, shot: 1.02 };

type P2 = [number, number];

/** Lisse légèrement le profil mesuré au pixel (évite les ondulations dans les reflets). */
function smooth(profile: P2[]): P2[] {
  return profile.map((p, i) => {
    if (i < 2 || i > profile.length - 3) return p;
    const r = (profile[i - 2][0] + profile[i - 1][0] * 2 + p[0] * 3 + profile[i + 1][0] * 2 + profile[i + 2][0]) / 9;
    return [r, p[1]];
  });
}

const PROFILES = Object.fromEntries(Object.entries(SHAPES).map(([k, s]) => [k, smooth(s.profile as P2[])])) as Record<FormatId, P2[]>;

/** Rayon interpolé à la hauteur y (normalisée). */
function radiusAt(profile: P2[], y: number): number {
  if (y <= profile[0][1]) return profile[0][0];
  for (let i = 1; i < profile.length; i++) {
    const [r1, y1] = profile[i];
    if (y <= y1) {
      const [r0, y0] = profile[i - 1];
      return r0 + ((r1 - r0) * (y - y0)) / Math.max(1e-6, y1 - y0);
    }
  }
  return profile[profile.length - 1][0];
}

/** Portion du profil entre y0 et y1, avec des points exacts aux bornes. */
function segment(profile: P2[], y0: number, y1: number, scale = 1): P2[] {
  const out: P2[] = [[radiusAt(profile, y0) * scale, y0]];
  for (const [r, y] of profile) if (y > y0 + 1e-4 && y < y1 - 1e-4) out.push([r * scale, y]);
  out.push([radiusAt(profile, y1) * scale, y1]);
  return out;
}

function lathe(points: P2[], H: number, segments: number) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(Math.max(0, r * H), y * H)),
    segments,
  );
}

/** Stries verticales pour les bouchons (moletage). */
function ridgeTexture(count: number) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 8;
  const ctx = c.getContext('2d')!;
  const w = c.width / count;
  for (let i = 0; i < count; i++) {
    const g = ctx.createLinearGradient(i * w, 0, (i + 1) * w, 0);
    g.addColorStop(0, '#202020');
    g.addColorStop(0.5, '#ffffff');
    g.addColorStop(1, '#202020');
    ctx.fillStyle = g;
    ctx.fillRect(i * w, 0, w, c.height);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function useLabel(product: Product, maxAnisotropy: number) {
  const tex = useTexture(productLabel(product.id));
  return useMemo(() => {
    const t = tex.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    // la face avant est au centre de l'image, l'angle 0 du tour est à gauche
    t.offset.x = 0.5;
    t.anisotropy = maxAnisotropy;
    t.needsUpdate = true;
    return t;
  }, [tex, maxAnisotropy]);
}

interface ModelProps {
  product: Product;
  quality: 'high' | 'low';
  maxAnisotropy: number;
}

/* ------------------------------------------------------------------ */
/* Bouteille en verre ambré, 33 cl                                      */
/* ------------------------------------------------------------------ */

function Bouteille({ product, quality, maxAnisotropy }: ModelProps) {
  const H = SCENE_HEIGHT.bouteille;
  const shape = SHAPES.bouteille;
  const seg = quality === 'high' ? 112 : 64;
  const label = useLabel(product, maxAnisotropy);
  const colors = PHOTO_COLORS[product.id] ?? {};

  const geo = useMemo(() => {
    const prof = PROFILES.bouteille;
    const [cap0, cap1] = shape.cap!;
    const [lab0, lab1] = shape.label;
    return {
      glass: lathe([[0, 0], ...segment(prof, 0, cap0 + 0.004), [0, cap0 + 0.004]], H, seg),
      label: lathe(segment(prof, lab0, lab1, 1.004), H, seg),
      cap: lathe([[0, cap0 - 0.002], ...segment(prof, cap0 - 0.002, cap1, 1.01), [0, cap1]], H, seg),
    };
  }, [H, seg, shape]);

  const mats = useMemo(() => {
    const ridges = ridgeTexture(90);
    return {
      glass: new THREE.MeshPhysicalMaterial({
        color: '#3b1a08',
        roughness: 0.06,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        specularIntensity: 1,
        ior: 1.52,
        envMapIntensity: 1.35,
        sheen: 0.4,
        sheenColor: new THREE.Color('#c87a3a'),
        sheenRoughness: 0.5,
      }),
      cap: new THREE.MeshStandardMaterial({
        color: colors.cap ?? '#e7bd08',
        metalness: 0.55,
        roughness: 0.32,
        bumpMap: ridges,
        bumpScale: 1.6,
      }),
    };
  }, [colors.cap]);

  const labelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: label, roughness: 0.62, metalness: 0, alphaTest: 0.5 }),
    [label],
  );

  return (
    <group>
      <mesh geometry={geo.glass} material={mats.glass} />
      <mesh geometry={geo.label} material={labelMat} />
      <mesh geometry={geo.cap} material={mats.cap} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Canette 25 cl                                                        */
/* ------------------------------------------------------------------ */

function tabGeometry(r: number) {
  // languette d'ouverture : plaque arrondie percée d'un anneau
  const w = r * 0.42;
  const l = r * 0.62;
  const s = new THREE.Shape();
  const rr = w * 0.48;
  s.moveTo(-w / 2 + rr, 0);
  s.lineTo(w / 2 - rr, 0);
  s.quadraticCurveTo(w / 2, 0, w / 2, rr);
  s.lineTo(w / 2, l - rr);
  s.quadraticCurveTo(w / 2, l, w / 2 - rr, l);
  s.lineTo(-w / 2 + rr, l);
  s.quadraticCurveTo(-w / 2, l, -w / 2, l - rr);
  s.lineTo(-w / 2, rr);
  s.quadraticCurveTo(-w / 2, 0, -w / 2 + rr, 0);
  const hole = new THREE.Path();
  hole.absellipse(0, l * 0.62, w * 0.3, l * 0.22, 0, Math.PI * 2, false, 0);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: r * 0.02, bevelEnabled: false, curveSegments: 12 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, -l * 0.28);
  return g;
}

function Canette({ product, quality, maxAnisotropy }: ModelProps) {
  const H = SCENE_HEIGHT.canette;
  const shape = SHAPES.canette;
  const seg = quality === 'high' ? 112 : 64;
  const label = useLabel(product, maxAnisotropy);

  const geo = useMemo(() => {
    const prof = PROFILES.canette;
    const top = shape.top!;
    const bottom = shape.bottom!;
    const rTop = radiusAt(prof, 1);
    const lid = 0.985;
    return {
      body: lathe(segment(prof, bottom, top), H, seg),
      top: lathe(
        [...segment(prof, top - 0.002, 1), [rTop * 0.95, 0.997], [rTop * 0.9, lid], [0, lid]],
        H,
        seg,
      ),
      bottom: lathe([[0, 0.012], [radiusAt(prof, 0) * 0.9, 0], ...segment(prof, 0, bottom + 0.002)], H, seg),
      tab: tabGeometry(rTop * H),
      tabY: lid * H + 0.001,
    };
  }, [H, seg, shape]);

  const mats = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({
        map: label,
        metalness: 0.35,
        roughness: 0.3,
        clearcoat: 0.7,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.1,
      }),
      alu: new THREE.MeshStandardMaterial({ color: '#e6e9ec', metalness: 0.72, roughness: 0.3, envMapIntensity: 1.6 }),
    }),
    [label],
  );

  return (
    <group>
      <mesh geometry={geo.body} material={mats.body} />
      <mesh geometry={geo.top} material={mats.alu} />
      <mesh geometry={geo.bottom} material={mats.alu} />
      <mesh geometry={geo.tab} material={mats.alu} position={[0, geo.tabY, 0]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Shot 10 cl : flacon transparent, liquide opaque                      */
/* ------------------------------------------------------------------ */

function Shot({ product, quality, maxAnisotropy }: ModelProps) {
  const H = SCENE_HEIGHT.shot;
  const shape = SHAPES.shot;
  const seg = quality === 'high' ? 96 : 56;
  const label = useLabel(product, maxAnisotropy);
  const colors = PHOTO_COLORS[product.id] ?? {};

  const geo = useMemo(() => {
    const prof = PROFILES.shot;
    const [cap0, cap1] = shape.cap!;
    const [lab0, lab1] = shape.label;
    const level = lab1 + (cap0 - lab1) * 0.5;
    return {
      bottle: lathe([[0, 0], ...segment(prof, 0, cap0 + 0.004), [0, cap0 + 0.004]], H, seg),
      liquid: lathe([[0, 0.014], ...segment(prof, 0.014, level, 0.955), [0, level]], H, seg),
      label: lathe(segment(prof, lab0, lab1, 1.006), H, seg),
      cap: lathe([[0, cap0 - 0.002], ...segment(prof, cap0 - 0.002, cap1, 1.008), [0, cap1]], H, seg),
    };
  }, [H, seg, shape]);

  const mats = useMemo(() => {
    const ridges = ridgeTexture(70);
    return {
      bottle: new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.04,
        metalness: 0,
        transparent: true,
        opacity: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.8,
        depthWrite: false,
      }),
      liquid: new THREE.MeshStandardMaterial({ color: colors.liquid ?? '#c48827', roughness: 0.35, metalness: 0 }),
      cap: new THREE.MeshStandardMaterial({ color: '#efefeb', roughness: 0.42, metalness: 0, bumpMap: ridges, bumpScale: 1.2 }),
    };
  }, [colors.liquid]);

  const labelMat = useMemo(() => new THREE.MeshStandardMaterial({ map: label, roughness: 0.38, metalness: 0 }), [label]);

  return (
    <group>
      <mesh geometry={geo.liquid} material={mats.liquid} />
      <mesh geometry={geo.label} material={labelMat} />
      <mesh geometry={geo.cap} material={mats.cap} />
      <mesh geometry={geo.bottle} material={mats.bottle} renderOrder={2} />
    </group>
  );
}

export function ProductModel(props: ModelProps) {
  if (props.product.format === 'canette') return <Canette {...props} />;
  if (props.product.format === 'shot') return <Shot {...props} />;
  return <Bouteille {...props} />;
}
