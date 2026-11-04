'use client';

import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { rng } from '@/lib/three/noise';

/* ------------------------------------------------------------------ */
/* Magnésie en suspension : poussière qui s'éclaire dans le cône du spot */
/* ------------------------------------------------------------------ */

const DUST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uCamY;
  uniform float uHeight;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uBaseZ;
  uniform float uDepth;
  uniform vec3 uLightPos;
  uniform vec3 uLightDir;
  attribute vec4 aRand;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime * (0.015 + aRand.x * 0.04);
    float y = mod(p.y - t - uCamY + uHeight * 0.5, uHeight) + uCamY - uHeight * 0.5;
    p.x += sin(uTime * 0.11 + aRand.y * 6.2831) * 0.28 + sin(uTime * 0.37 + y * 0.9) * 0.05;
    float z = uBaseZ + 0.12 + p.z * uDepth + sin(uTime * 0.17 + aRand.z * 6.2831) * 0.08;
    vec4 world = modelMatrix * vec4(p.x, y, z, 1.0);
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.35 + aRand.w * 1.25);
    gl_PointSize = size * uPixelRatio * (7.0 / -mv.z);
    float lo = uCamY - uHeight * 0.5;
    float edge = smoothstep(0.0, 0.9, y - lo) * smoothstep(0.0, 0.9, lo + uHeight - y);
    vec3 L = normalize(world.xyz - uLightPos);
    float cone = smoothstep(0.80, 0.97, dot(L, normalize(uLightDir)));
    float twinkle = 0.65 + 0.35 * sin(uTime * (1.2 + aRand.y * 2.0) + aRand.z * 40.0);
    vAlpha = edge * smoothstep(0.3, 1.4, -mv.z) * (0.18 + 1.25 * cone) * twinkle * (0.3 + 0.7 * aRand.w);
  }
`;

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
  }
`;

export interface DustProps {
  count: number;
  width?: number;
  height?: number;
  depth?: number;
  size?: number;
  opacity?: number;
  /** Fonction qui renvoie [camY, baseZ] à chaque image. */
  follow: () => [number, number];
  light?: { position: THREE.Vector3; direction: THREE.Vector3 };
}

export function MagnesiaDust({ count, width = 10, height = 6, depth = 3, size = 1.4, opacity = 0.55, follow, light }: DustProps) {
  const { geometry, material } = useMemo(() => {
    const r = rng(9);
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * width;
      pos[i * 3 + 1] = r() * height;
      pos[i * 3 + 2] = Math.pow(r(), 1.4);
      rand.set([r(), r(), r(), r()], i * 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
    const m = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCamY: { value: 0 },
        uHeight: { value: height },
        uSize: { value: size },
        uPixelRatio: { value: 1 },
        uBaseZ: { value: 0 },
        uDepth: { value: depth },
        uLightPos: { value: new THREE.Vector3(0, 5, 5) },
        uLightDir: { value: new THREE.Vector3(0, -1, -1) },
        uColor: { value: new THREE.Color('#F3EFE8') },
        uOpacity: { value: opacity },
      },
    });
    return { geometry: g, material: m };
  }, [count, width, height, depth, size, opacity]);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const [camY, baseZ] = follow();
    u.uCamY.value = camY;
    u.uBaseZ.value = baseZ;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    if (light) {
      u.uLightPos.value.copy(light.position);
      u.uLightDir.value.copy(light.direction);
    }
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Bulles de fermentation : anneaux lumineux qui remontent en ondulant  */
/* ------------------------------------------------------------------ */

const BUBBLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uCamY;
  uniform float uHeight;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uBaseZ;
  attribute vec4 aRand;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec3 p = position;
    float speed = 0.12 + aRand.x * 0.28;
    float y = mod(p.y + uTime * speed - uCamY + uHeight * 0.5, uHeight) + uCamY - uHeight * 0.5;
    p.x += sin(uTime * (0.8 + aRand.y) + aRand.z * 6.2831) * 0.06;
    float z = uBaseZ + 0.25 + p.z * 2.2;
    vec4 mv = viewMatrix * modelMatrix * vec4(p.x, y, z, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aRand.w * 1.3) * uPixelRatio * (11.0 / -mv.z);
    float lo = uCamY - uHeight * 0.5;
    vAlpha = smoothstep(0.0, 1.2, y - lo) * smoothstep(0.0, 1.6, lo + uHeight - y) * smoothstep(0.5, 1.6, -mv.z);
    vSeed = aRand.z;
  }
`;

const BUBBLE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;
    float rim = smoothstep(0.62, 0.92, d) * (1.0 - smoothstep(0.92, 1.0, d));
    float core = (1.0 - d) * 0.07;
    float spec = smoothstep(0.32, 0.0, length(c - vec2(-0.16, -0.18)));
    vec3 col = mix(uColor, vec3(1.0), 0.35 + spec * 0.6);
    float a = (rim * 0.85 + core + spec * 0.9) * vAlpha * uOpacity;
    gl_FragColor = vec4(col, a);
  }
`;

export function FermentBubbles({
  count,
  width = 8,
  height = 6,
  size = 1.6,
  opacity = 0.5,
  color = '#F2B705',
  follow,
  colorRef,
}: {
  count: number;
  width?: number;
  height?: number;
  size?: number;
  opacity?: number;
  color?: string;
  follow: () => [number, number];
  /** Couleur pilotée de l'extérieur (couleur de la voie courante). */
  colorRef?: { current: THREE.Color };
}) {
  const { geometry, material } = useMemo(() => {
    const r = rng(33);
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (0.15 + r() * 0.85) * width * 0.5;
      pos[i * 3 + 1] = r() * height;
      pos[i * 3 + 2] = r();
      rand.set([r(), r(), r(), r()], i * 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
    const m = new THREE.ShaderMaterial({
      vertexShader: BUBBLE_VERT,
      fragmentShader: BUBBLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCamY: { value: 0 },
        uHeight: { value: height },
        uSize: { value: size },
        uPixelRatio: { value: 1 },
        uBaseZ: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
    });
    return { geometry: g, material: m };
  }, [count, width, height, size, opacity, color]);

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const [camY, baseZ] = follow();
    u.uCamY.value = camY;
    u.uBaseZ.value = baseZ;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    if (colorRef) (u.uColor.value as THREE.Color).lerp(colorRef.current, 0.05);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Bouffée de magnésie quand une prise est atteinte                     */
/* ------------------------------------------------------------------ */

const BURST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uStart;
  uniform vec3 uOrigin;
  uniform vec3 uNormal;
  uniform float uPixelRatio;
  attribute vec4 aRand;
  varying float vAlpha;
  void main() {
    float t = uTime - uStart;
    vec3 dir = normalize(vec3(aRand.x - 0.5, aRand.y - 0.35, 0.0) * 2.0 + uNormal * (0.4 + aRand.z));
    float k = 1.0 - exp(-t * 2.6);
    vec3 p = uOrigin + dir * k * (0.25 + aRand.w * 0.55) + vec3(0.0, -0.04 * t * t, 0.0);
    vec4 mv = viewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + aRand.w * 4.0) * (1.0 + k * 1.4) * uPixelRatio * (9.0 / -mv.z);
    vAlpha = (t < 0.0 ? 0.0 : 1.0) * smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.4, 2.6, t));
  }
`;

const BURST_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.96, 0.94, 0.90), a * a * vAlpha * 0.55);
  }
`;

export interface BurstHandle {
  fire: (origin: THREE.Vector3, normal: THREE.Vector3) => void;
}

/** Réserve de quelques bouffées, réutilisées à tour de rôle. */
export const ChalkBursts = forwardRef<BurstHandle, { pool?: number; count?: number }>(function ChalkBursts(
  { pool = 3, count = 70 },
  ref,
) {
  const items = useMemo(() => {
    return Array.from({ length: pool }, (_, k) => {
      const r = rng(100 + k);
      const pos = new Float32Array(count * 3);
      const rand = new Float32Array(count * 4);
      for (let i = 0; i < count; i++) rand.set([r(), r(), r(), r()], i * 4);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
      const m = new THREE.ShaderMaterial({
        vertexShader: BURST_VERT,
        fragmentShader: BURST_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uStart: { value: -100 },
          uOrigin: { value: new THREE.Vector3() },
          uNormal: { value: new THREE.Vector3(0, 0, 1) },
          uPixelRatio: { value: 1 },
        },
      });
      return { g, m };
    });
  }, [pool, count]);
  const next = useRef(0);
  const clock = useRef(0);

  useImperativeHandle(ref, () => ({
    fire(origin, normal) {
      const it = items[next.current % items.length];
      next.current++;
      it.m.uniforms.uOrigin.value.copy(origin);
      it.m.uniforms.uNormal.value.copy(normal);
      it.m.uniforms.uStart.value = clock.current;
    },
  }));

  useFrame((state) => {
    clock.current = state.clock.elapsedTime;
    for (const it of items) {
      it.m.uniforms.uTime.value = clock.current;
      it.m.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    }
  });

  return (
    <>
      {items.map((it, i) => (
        <points key={i} geometry={it.g} material={it.m} frustumCulled={false} />
      ))}
    </>
  );
});
