'use client';

import { useFrame } from '@react-three/fiber';
import { BallCollider, CuboidCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { playSfx } from '@/lib/sound';

/*
 * @dimforge/rapier3d-compat 0.19 initialise son module WASM avec l'ancienne
 * signature de wasm-bindgen, qui affiche un avertissement sans conséquence.
 * On masque ce seul message pour garder une console propre.
 */
if (typeof window !== 'undefined' && !(window as unknown as { __olRapierWarn?: boolean }).__olRapierWarn) {
  (window as unknown as { __olRapierWarn?: boolean }).__olRapierWarn = true;
  const warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('using deprecated parameters for the initialization function')) return;
    warn(...args);
  };
}

/**
 * Explosion de bulles au sommet de la voie : de vraies sphères physiques qui
 * jaillissent, rebondissent sur la paroi, puis remontent et éclatent.
 */
const BUBBLE_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vV = normalize(cameraPosition - w.xyz);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const BUBBLE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uTint;
  varying vec3 vN;
  varying vec3 vV;
  vec3 hue(float h) {
    return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  }
  void main() {
    float f = 1.0 - max(dot(normalize(vN), normalize(vV)), 0.0);
    float rim = pow(f, 2.4);
    // film de savon : irisation selon l'angle
    vec3 film = hue(f * 1.6 + uTime * 0.05 + vN.y * 0.2);
    vec3 col = mix(uTint, film, 0.45) + vec3(1.0) * pow(f, 6.0) * 0.6;
    float spec = pow(max(dot(reflect(-normalize(vV), normalize(vN)), normalize(vec3(-0.5, 0.8, 0.6))), 0.0), 40.0);
    gl_FragColor = vec4(col + spec, rim * 0.85 + spec * 0.8 + 0.04);
  }
`;

interface Props {
  origin: THREE.Vector3;
  count?: number;
  tint?: string;
}

interface Item {
  key: number;
  r: number;
  pos: [number, number, number];
  vel: [number, number, number];
  life: number;
}

function Bubbles({ items, start, tint }: { items: Item[]; start: number; tint: string }) {
  const bodies = useRef<(RapierRigidBody | null)[]>([]);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 3), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BUBBLE_VERT,
        fragmentShader: BUBBLE_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uTint: { value: new THREE.Color(tint) } },
      }),
    [tint],
  );
  const popped = useRef<boolean[]>(items.map(() => false));
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const p = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    bodies.current.forEach((b, i) => {
      if (!b) return;
      const v = items[i].vel;
      b.setLinvel({ x: v[0], y: v[1], z: v[2] }, true);
    });
  }, [items]);

  useFrame((state) => {
    const t = state.clock.elapsedTime - start;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    const mm = mesh.current;
    if (!mm) return;
    items.forEach((it, i) => {
      const b = bodies.current[i];
      if (!b) return;
      const tr = b.translation();
      p.set(tr.x, tr.y, tr.z);
      // éclatement à la fin de vie
      const age = t / it.life;
      let k = 1;
      if (age > 1) {
        k = Math.max(0, 1 - (age - 1) * 8);
        if (!popped.current[i]) {
          popped.current[i] = true;
          if (i % 4 === 0) playSfx('pop');
          b.setEnabled(false);
        }
      } else if (t < 0.12) {
        k = t / 0.12;
      }
      s.setScalar(Math.max(0.0001, it.r * k * (1 + Math.sin(t * 9 + i) * 0.03)));
      m.compose(p, q, s);
      mm.setMatrixAt(i, m);
    });
    mm.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {items.map((it, i) => (
        <RigidBody
          key={it.key}
          ref={(el) => {
            bodies.current[i] = el;
          }}
          position={it.pos}
          colliders={false}
          linearDamping={1.4}
          angularDamping={1}
          restitution={0.7}
          friction={0.1}
        >
          <BallCollider args={[it.r]} restitution={0.7} />
        </RigidBody>
      ))}
      <instancedMesh ref={mesh} args={[geo, mat, items.length]} frustumCulled={false} renderOrder={6} />
    </>
  );
}

export default function BubbleBurst({ origin, count = 70, tint = '#F2B705' }: Props) {
  const [gravity, setGravity] = useState<[number, number, number]>([0, -3.5, 0]);
  const [start, setStart] = useState(0);
  const startRef = useRef<number | null>(null);
  const items = useMemo<Item[]>(() => {
    let a = 7;
    const r = () => {
      a = (a * 16807) % 2147483647;
      return (a - 1) / 2147483646;
    };
    return Array.from({ length: count }, (_, i) => {
      const ang = r() * Math.PI * 2;
      const sp = 0.8 + r() * 2.2;
      return {
        key: i,
        r: 0.03 + Math.pow(r(), 2) * 0.09,
        pos: [origin.x + (r() - 0.5) * 0.14, origin.y + (r() - 0.5) * 0.14, origin.z + 0.2 + r() * 0.12] as [number, number, number],
        vel: [Math.cos(ang) * sp, 0.4 + Math.sin(ang) * sp * 0.6, 1.2 + r() * 2.4] as [number, number, number],
        life: 2.8 + r() * 3.2,
      };
    });
  }, [origin, count]);

  useFrame((state) => {
    if (startRef.current === null) {
      startRef.current = state.clock.elapsedTime;
      setStart(state.clock.elapsedTime);
    }
  });

  // les bulles retombent un instant, puis remontent (poussée d'Archimède)
  useEffect(() => {
    const id = window.setTimeout(() => setGravity([0, 0.9, 0]), 800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <Physics gravity={gravity} timeStep={1 / 60}>
      {/* paroi, sol et bords invisibles */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[5, 8, 0.05]} position={[0, 4, -0.05]} />
        <CuboidCollider args={[5, 0.1, 3]} position={[0, -0.1, 1.5]} />
        <CuboidCollider args={[0.1, 8, 3]} position={[-3.2, 4, 1.5]} />
        <CuboidCollider args={[0.1, 8, 3]} position={[3.2, 4, 1.5]} />
      </RigidBody>
      {start > 0 && <Bubbles items={items} start={start} tint={tint} />}
    </Physics>
  );
}
