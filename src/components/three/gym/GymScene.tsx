'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { bottleGeometry } from '../shared/bottleProfile';
import { createWallTextures } from '../wall/textures';
import { makeHoldGeometry, makeHoldMaterial, type HoldShape } from '../wall/holdGeometry';
import { useCapabilities } from '@/lib/device';
import { GYM_CAPACITY } from './constants';

/**
 * La petite salle du simulateur : un bar, un frigo, des caisses. Elle se
 * remplit de bouteilles au fil des ventes de l'année (voir constants.ts).
 */

const LIQUIDS = ['#E9A21B', '#C9245A', '#EE6A2B', '#F2C14E'];

interface Slot {
  p: THREE.Vector3;
  s: number;
}

const BOTTLE_SCALE = 1.5;
const CRATES: [number, number][] = [
  [2.0, -0.32],
  [2.62, -0.32],
  [2.0, 0.24],
  [2.62, 0.24],
];

function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  // frigo : 4 étagères × 7, derrière la porte vitrée
  for (let shelf = 0; shelf < 4; shelf++) {
    for (let i = 0; i < 7; i++) {
      slots.push({ p: new THREE.Vector3(-2.03 + i * 0.11, 0.31 + shelf * 0.43, -1.16), s: 1 });
    }
  }
  // comptoir : 3 rangées × 13
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 13; i++) {
      slots.push({ p: new THREE.Vector3(-0.46 + i * 0.17 + (row % 2) * 0.06, 1.1, -1.17 + row * 0.16), s: 1 });
    }
  }
  // caisses sur le tapis : 4 caisses de 5 × 4
  for (const [cx, cz] of CRATES) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        slots.push({ p: new THREE.Vector3(cx - 0.21 + c * 0.105, 0.19, cz - 0.16 + r * 0.105), s: 1 });
      }
    }
  }
  return slots;
}


function Room() {
  const gl = useThree((s) => s.gl);
  const mats = useMemo(() => {
    const tex = createWallTextures('low', gl.capabilities.getMaxAnisotropy());
    tex.map.repeat.set(2.2, 1);
    tex.bump.repeat.set(2.2, 1);
    const wall = new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump, bumpScale: 1, roughness: 0.85 });
    const floorTex = tex.map.clone();
    floorTex.repeat.set(2.6, 1.4);
    floorTex.needsUpdate = true;
    return {
      wall,
      floor: new THREE.MeshStandardMaterial({ color: '#2b2622', roughness: 0.92 }),
      mat: new THREE.MeshStandardMaterial({ color: '#23262c', roughness: 0.9 }),
      counter: new THREE.MeshStandardMaterial({ color: '#2f2a25', roughness: 0.75 }),
      top: new THREE.MeshStandardMaterial({ color: '#c9b38f', roughness: 0.55 }),
      fridge: new THREE.MeshStandardMaterial({ color: '#16171a', roughness: 0.4, metalness: 0.3 }),
      glass: new THREE.MeshStandardMaterial({ color: '#cfe8ff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16 }),
      glow: new THREE.MeshBasicMaterial({ color: '#e9f3ff' }),
      shelf: new THREE.MeshStandardMaterial({ color: '#d8dde3', roughness: 0.5, metalness: 0.4 }),
      crate: new THREE.MeshStandardMaterial({ color: '#8a6a45', roughness: 0.8 }),
      brand: new THREE.MeshBasicMaterial({ color: '#F2B705' }),
    };
  }, [gl]);

  const holds = useMemo(() => {
    const shapes: HoldShape[] = ['jug', 'crimp', 'sloper', 'pinch', 'jug', 'pocket', 'edge'];
    const colors = ['#F2B705', '#E64980', '#5C7CFA', '#FD7E14', '#E64980', '#5C7CFA', '#F2B705'];
    const pos: [number, number][] = [
      [-0.6, 2.2],
      [0.3, 2.6],
      [1.1, 2.05],
      [1.8, 2.5],
      [-0.1, 1.75],
      [2.4, 1.9],
      [0.8, 2.9],
    ];
    return shapes.map((s, i) => ({
      geometry: makeHoldGeometry(s, 60 + i, 2),
      material: makeHoldMaterial({ chalk: 0.6, color: colors[i] }),
      position: [pos[i][0], pos[i][1], -1.58] as [number, number, number],
      rotation: i * 1.3,
    }));
  }, []);

  return (
    <group>
      {/* sol et tapis */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.floor} receiveShadow>
        <planeGeometry args={[7, 5]} />
      </mesh>
      <mesh position={[1.2, 0.08, -0.85]} material={mats.mat}>
        <boxGeometry args={[4.6, 0.16, 1.4]} />
      </mesh>
      {/* murs */}
      <mesh position={[0.5, 1.6, -1.6]} material={mats.wall}>
        <planeGeometry args={[6, 3.2]} />
      </mesh>
      <mesh position={[-2.5, 1.6, 0.4]} rotation={[0, Math.PI / 2, 0]} material={mats.wall}>
        <planeGeometry args={[4, 3.2]} />
      </mesh>
      {holds.map((h, i) => (
        <mesh key={i} geometry={h.geometry} material={h.material} position={h.position} rotation={[0, 0, h.rotation]} scale={0.16} />
      ))}
      {/* comptoir */}
      <mesh position={[0.6, 0.52, -0.95]} material={mats.counter}>
        <boxGeometry args={[2.4, 1.04, 0.62]} />
      </mesh>
      <mesh position={[0.6, 1.07, -0.93]} material={mats.top}>
        <boxGeometry args={[2.55, 0.06, 0.72]} />
      </mesh>
      <mesh position={[0.6, 0.62, -0.635]} material={mats.brand}>
        <planeGeometry args={[0.9, 0.05]} />
      </mesh>
      {/* frigo : caisson creux, fond lumineux, porte vitrée */}
      <group position={[-1.7, 0, -1.2]}>
        <mesh position={[0, 0.98, -0.3]} material={mats.fridge}>
          <boxGeometry args={[0.86, 1.96, 0.04]} />
        </mesh>
        <mesh position={[0, 1.0, -0.275]} material={mats.glow}>
          <planeGeometry args={[0.76, 1.76]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.41, 0.98, 0]} material={mats.fridge}>
            <boxGeometry args={[0.04, 1.96, 0.62]} />
          </mesh>
        ))}
        <mesh position={[0, 1.94, 0]} material={mats.fridge}>
          <boxGeometry args={[0.86, 0.08, 0.62]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={mats.fridge}>
          <boxGeometry args={[0.86, 0.2, 0.62]} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} position={[0, 0.3 + k * 0.43, 0.02]} material={mats.shelf}>
            <boxGeometry args={[0.76, 0.015, 0.5]} />
          </mesh>
        ))}
        <mesh position={[0, 1.0, 0.31]} material={mats.glass}>
          <planeGeometry args={[0.8, 1.84]} />
        </mesh>
        <mesh position={[0, 1.94, 0.315]} material={mats.brand}>
          <planeGeometry args={[0.5, 0.05]} />
        </mesh>
        <pointLight position={[0, 1.2, 0.05]} intensity={0.9} distance={1.6} color="#e6f0ff" />
      </group>
      {/* caisses */}
      {CRATES.map(([x, z], k) => (
        <group key={k} position={[x, 0.16, z]}>
          <mesh position={[0, 0.012, 0]} material={mats.crate}>
            <boxGeometry args={[0.58, 0.024, 0.48]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={`x${side}`} position={[side * 0.28, 0.08, 0]} material={mats.crate}>
              <boxGeometry args={[0.024, 0.16, 0.48]} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <mesh key={`z${side}`} position={[0, 0.08, side * 0.23]} material={mats.crate}>
              <boxGeometry args={[0.58, 0.16, 0.024]} />
            </mesh>
          ))}
        </group>
      ))}
      <pointLight position={[-1.7, 1.2, -0.4]} intensity={1.2} distance={2.2} color="#dbeaff" />
    </group>
  );
}

function Bottles({ count }: { count: number }) {
  const slots = useMemo(() => buildSlots(), []);
  const body = useRef<THREE.InstancedMesh>(null);
  const cap = useRef<THREE.InstancedMesh>(null);
  const scales = useRef(new Float32Array(slots.length));
  const geo = useMemo(() => {
    const g = bottleGeometry(14, 2, BOTTLE_SCALE);
    const c = new THREE.CylinderGeometry(0.0165 * BOTTLE_SCALE, 0.0165 * BOTTLE_SCALE, 0.02 * BOTTLE_SCALE, 12);
    c.translate(0, 0.207 * BOTTLE_SCALE, 0);
    return { g, c };
  }, []);
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.22, metalness: 0.05 }),
      cap: new THREE.MeshStandardMaterial({ color: '#efe9de', roughness: 0.4, metalness: 0.6 }),
    }),
    [],
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const p = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const b = body.current;
    if (!b) return;
    slots.forEach((_, i) => b.setColorAt(i, new THREE.Color(LIQUIDS[i % LIQUIDS.length])));
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
  }, [slots]);

  useFrame((_, dt) => {
    const b = body.current;
    const c = cap.current;
    if (!b || !c) return;
    let dirty = false;
    const sc = scales.current;
    for (let i = 0; i < slots.length; i++) {
      // les bouteilles arrivent une par une, avec un petit retard en cascade
      const target = i < count ? 1 : 0;
      const prev = sc[i];
      const lambda = target > prev ? 9 - Math.min(6, (i % 13) * 0.4) : 12;
      sc[i] = THREE.MathUtils.damp(prev, target, lambda, dt);
      if (Math.abs(sc[i] - target) < 0.002) sc[i] = target;
      if (sc[i] !== prev) dirty = true;
    }
    if (!dirty) return;
    for (let i = 0; i < slots.length; i++) {
      const k = sc[i];
      const slot = slots[i];
      p.copy(slot.p);
      p.y += (1 - k) * 0.45;
      s.setScalar(Math.max(0.0001, k * slot.s));
      m.compose(p, q, s);
      b.setMatrixAt(i, m);
      c.setMatrixAt(i, m);
    }
    b.instanceMatrix.needsUpdate = true;
    c.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={body} args={[geo.g, mats.body, slots.length]} frustumCulled={false} />
      <instancedMesh ref={cap} args={[geo.c, mats.cap, slots.length]} frustumCulled={false} />
    </>
  );
}

function Rig() {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const tx = 4.4 + pointer.current.x * 0.35 + Math.sin(t * 0.2) * 0.12;
    const ty = 3.1 - pointer.current.y * 0.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 2.5, dt);
    camera.lookAt(0.2, 0.85, -0.8);
  });
  return null;
}

/** Visible à l'écran ? (pour suspendre le rendu hors champ) */
function useOnScreen(ref: React.RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

export default function GymScene({ count, className = '' }: { count: number; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(wrap);
  const caps = useCapabilities();
  return (
    <div ref={wrap} className={className}>
      <Canvas
        frameloop={onScreen ? 'always' : 'never'}
        dpr={[1, caps.tier === 'high' ? 1.75 : 1.25]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
        camera={{ fov: 28, position: [4.4, 3.1, 5.4], near: 0.1, far: 40 }}
      >
        <hemisphereLight args={['#fff2df', '#211d19', 1.1]} />
        <spotLight position={[1.5, 5.5, 3.2]} angle={0.8} penumbra={0.9} intensity={95} distance={16} color="#ffe6c4" />
        <directionalLight position={[-3, 4, 4]} intensity={0.8} color="#bfd0ff" />
        <directionalLight position={[4, 2, 5]} intensity={0.45} color="#ffd9b0" />
        <Room />
        <Bottles count={Math.min(count, GYM_CAPACITY)} />
        <Rig />
      </Canvas>
    </div>
  );
}
