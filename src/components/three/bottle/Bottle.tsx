'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import * as THREE from 'three';
import type { Flavor } from '@/data/campagne';
import { ROUTE_COLORS } from '@/data/routes';
import { BOTTLE, bottleGeometry, liquidGeometry } from '../shared/bottleProfile';
import { makeBubbleGeometry, makeBubbleMaterial, makeLiquidMaterial } from './materials';
import { createLabelTexture } from './labelTexture';

/** État de rotation partagé avec les contrôles (glisser pour tourner). */
export interface SpinState {
  rot: number;
  vel: number;
  tilt: number;
  /** impulsion de vague (s'amortit) */
  slosh: number;
}

export function createSpin(): SpinState {
  return { rot: -0.35, vel: 0.35, tilt: 0, slosh: 0.4 };
}

interface Props extends Omit<ComponentProps<'group'>, 'scale'> {
  flavor: Flavor;
  spin: { current: SpinState };
  quality: 'high' | 'low';
  scale?: number;
  labelSrc?: string | null;
  logoSrc?: string | null;
  /** remplissage (0 à 1) : la bouteille du mini-jeu se remplit en apparaissant */
  fill?: number;
}

const LABEL_Y0 = 0.026;
const LABEL_Y1 = 0.104;

export function Bottle({ flavor, spin, quality, scale = 8, labelSrc, logoSrc, fill = 1, ...group }: Props) {
  const gl = useThree((s) => s.gl);
  const root = useRef<THREE.Group>(null);
  const tilted = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const glass = bottleGeometry(quality === 'high' ? 96 : 48, quality === 'high' ? 4 : 3);
    const liquid = liquidGeometry(BOTTLE.liquidTop, quality === 'high' ? 64 : 40, 0.0024);
    const label = new THREE.CylinderGeometry(0.03135, 0.03135, LABEL_Y1 - LABEL_Y0, 128, 1, true, -Math.PI * 0.94, Math.PI * 1.88);
    label.translate(0, (LABEL_Y0 + LABEL_Y1) / 2, 0);
    // bouchon moleté
    const cap = new THREE.CylinderGeometry(0.0168, 0.0168, 0.021, 96, 2, false);
    const p = cap.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const r = Math.hypot(x, z);
      if (r > 0.0165 && Math.abs(p.getY(i)) < 0.0098) {
        const a = Math.atan2(z, x);
        const k = 1 + Math.sin(a * 48) * 0.022;
        p.setX(i, x * k);
        p.setZ(i, z * k);
      }
    }
    cap.computeVertexNormals();
    cap.translate(0, 0.2075, 0);
    const bubbles = makeBubbleGeometry(quality === 'high' ? 120 : 50, 7);
    const cling = makeBubbleGeometry(quality === 'high' ? 70 : 30, 11);
    const seeds = cling.getAttribute('aSeed') as THREE.InstancedBufferAttribute;
    for (let i = 0; i < seeds.count; i++) seeds.setY(i, 0.94 + (i % 7) * 0.008);
    // condensation : gouttelettes sur le verre, au-dessus et au-dessous de l'étiquette
    const drops = makeBubbleGeometry(quality === 'high' ? 340 : 140, 23);
    const dseeds = drops.getAttribute('aSeed') as THREE.InstancedBufferAttribute;
    for (let i = 0; i < dseeds.count; i++) {
      dseeds.setY(i, 0.99 + (i % 5) * 0.002);
      // hauteur fixe, hors de la bande de l'étiquette (repère 0-1 sur le liquide)
      const w = dseeds.getW(i);
      dseeds.setW(i, w < 0.35 ? 0.01 + w * 0.42 : 0.68 + (w - 0.35) * 0.45);
    }
    return { glass, liquid, label, cap, bubbles, cling, drops };
  }, [quality]);

  const liquidMat = useMemo(() => makeLiquidMaterial(), []);
  const bubbleMat = useMemo(() => makeBubbleMaterial(), []);
  const clingMat = useMemo(() => {
    const m = makeBubbleMaterial();
    m.uniforms.uSpeed.value = 0;
    m.uniforms.uSize.value = 0.8;
    return m;
  }, []);
  const dropMat = useMemo(() => {
    const m = makeBubbleMaterial();
    m.uniforms.uSpeed.value = 0;
    m.uniforms.uSize.value = 0.55;
    m.uniforms.uTop.value = BOTTLE.liquidTop;
    m.uniforms.uOpacity.value = 0.5;
    m.uniforms.uBottom.value = 0.006;
    m.uniforms.uRadius.value = 0.0313;
    (m.uniforms.uTint.value as THREE.Color).set('#ffffff');
    return m;
  }, []);
  const capMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.9, roughness: 0.3 }), []);
  const labelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, metalness: 0 }), []);

  // étiquette (asynchrone : polices et visuels)
  const [labelTex, setLabelTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    createLabelTexture(flavor, { labelSrc, logoSrc, anisotropy: gl.capabilities.getMaxAnisotropy() }).then((t) => {
      if (!alive) {
        t.dispose();
        return;
      }
      made = t;
      setLabelTex(t);
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [flavor, labelSrc, logoSrc, gl]);
  useEffect(() => {
    labelMat.map = labelTex;
    labelMat.needsUpdate = true;
  }, [labelTex, labelMat]);

  // couleurs cibles (fondu au changement de parfum)
  const target = useMemo(
    () => ({
      color: new THREE.Color(flavor.liquid),
      deep: new THREE.Color(flavor.deep),
      foam: new THREE.Color(flavor.foam),
      cap: new THREE.Color(ROUTE_COLORS[flavor.route]),
      tint: new THREE.Color(flavor.foam),
    }),
    [flavor],
  );
  useEffect(() => {
    spin.current.slosh = Math.min(1.6, spin.current.slosh + 0.9);
  }, [flavor, spin]);

  const fillLevel = useRef(fill);
  const prevVel = useRef(0);
  const _v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const s = spin.current;
    const t = state.clock.elapsedTime;
    if (root.current) root.current.rotation.y = s.rot;
    if (tilted.current) tilted.current.rotation.z = s.tilt;

    // vagues : les à-coups de rotation agitent le liquide
    const dv = Math.abs(s.vel - prevVel.current);
    prevVel.current = s.vel;
    s.slosh = Math.min(1.8, s.slosh + dv * 0.05);
    s.slosh *= Math.exp(-dt * 1.1);

    fillLevel.current = THREE.MathUtils.damp(fillLevel.current, fill, 2.2, dt);
    const u = liquidMat.uniforms;
    const k = 1 - Math.exp(-dt * 3);
    (u.uColor.value as THREE.Color).lerp(target.color, k);
    (u.uDeep.value as THREE.Color).lerp(target.deep, k);
    (u.uFoam.value as THREE.Color).lerp(target.foam, k);
    capMat.color.lerp(target.cap, k);
    (bubbleMat.uniforms.uTint.value as THREE.Color).lerp(target.tint, k);

    // surface dans le repère du monde
    const localFill = 0.008 + (BOTTLE.liquidTop - 0.008) * fillLevel.current;
    if (tilted.current) {
      _v.set(0, localFill, 0);
      tilted.current.localToWorld(_v);
      u.uFill.value = _v.y;
      (u.uCenter.value as THREE.Vector3).copy(_v);
      _v.set(0, 0.003, 0);
      tilted.current.localToWorld(_v);
      u.uBottom.value = _v.y;
    }
    const a = s.slosh * 0.09;
    (u.uTilt.value as THREE.Vector2).set(Math.sin(t * 7.3) * a, Math.cos(t * 6.1) * a * 0.8);
    u.uWave.value = 0.18 + s.slosh * 1.4;
    u.uTime.value = t;

    for (const m of [bubbleMat, clingMat]) {
      m.uniforms.uTime.value = t;
      m.uniforms.uTop.value = localFill - 0.004;
    }
    dropMat.uniforms.uTime.value = t;
    bubbleMat.uniforms.uSpeed.value = 0.55 + s.slosh * 0.9;
    bubbleMat.uniforms.uRadius.value = 0.0235;
    clingMat.uniforms.uRadius.value = 0.0283;
  });

  return (
    <group {...group} scale={scale}>
      <group ref={tilted}>
        <group ref={root}>
          <mesh geometry={geo.liquid} material={liquidMat} renderOrder={1} />
          <mesh geometry={geo.bubbles} material={bubbleMat} renderOrder={2} frustumCulled={false} />
          <mesh geometry={geo.cling} material={clingMat} renderOrder={2} frustumCulled={false} />
          <mesh geometry={geo.glass} renderOrder={3}>
            {quality === 'high' ? (
              <MeshTransmissionMaterial
                backside
                backsideThickness={0.012}
                thickness={0.006}
                roughness={0.05}
                transmission={1}
                ior={1.48}
                chromaticAberration={0.035}
                anisotropicBlur={0.06}
                distortion={0.06}
                distortionScale={0.3}
                temporalDistortion={0.04}
                samples={6}
                resolution={768}
                color="#f1f7f3"
                attenuationColor="#e6f2ea"
                attenuationDistance={0.5}
                envMapIntensity={1.15}
              />
            ) : (
              <meshPhysicalMaterial
                transmission={1}
                thickness={0.006}
                roughness={0.06}
                ior={1.48}
                color="#f1f7f3"
                envMapIntensity={1.1}
                transparent
              />
            )}
          </mesh>
          <mesh geometry={geo.label} material={labelMat} renderOrder={4} />
          <mesh geometry={geo.drops} material={dropMat} renderOrder={5} frustumCulled={false} />
          <mesh geometry={geo.cap} material={capMat} renderOrder={4} />
        </group>
      </group>
    </group>
  );
}
