'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Flavor } from '@/data/campagne';
import { useCapabilities } from '@/lib/device';
import { useBrandAsset } from '@/components/ui/Brand';
import { createWallTextures } from '../wall/textures';
import { Bottle, createSpin, type SpinState } from './Bottle';
import { makeCausticMaterial, makeGlowTexture, makeShadowTexture } from './materials';

/** Décor : fond de contreplaqué, sol, caustiques et ombre de contact. */
function Stage({ flavor }: { flavor: Flavor }) {
  const gl = useThree((s) => s.gl);
  const mats = useMemo(() => {
    const tex = createWallTextures('low', gl.capabilities.getMaxAnisotropy());
    tex.map.repeat.set(3, 1.5);
    tex.bump.repeat.set(3, 1.5);
    return {
      back: new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump, bumpScale: 0.8, roughness: 0.9, color: '#bdb5aa' }),
      floor: new THREE.MeshStandardMaterial({ color: '#1b1815', roughness: 0.82, metalness: 0, envMapIntensity: 0.25 }),
      caustic: makeCausticMaterial(),
      shadow: new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, color: '#000' }),
      glow: new THREE.MeshBasicMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    };
  }, [gl]);
  const target = useMemo(() => new THREE.Color(flavor.liquid), [flavor]);
  useFrame((state, dt) => {
    mats.caustic.uniforms.uTime.value = state.clock.elapsedTime;
    (mats.caustic.uniforms.uColor.value as THREE.Color).lerp(target, 1 - Math.exp(-dt * 3));
  });
  return (
    <group>
      <mesh position={[0, 1.6, -1.6]} material={mats.back}>
        <planeGeometry args={[9, 5]} />
      </mesh>
      <mesh position={[0.15, 1.15, -1.55]} material={mats.glow}>
        <planeGeometry args={[3.4, 3.4]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.floor}>
        <planeGeometry args={[9, 6]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.32, 0.002, -0.12]} material={mats.caustic}>
        <planeGeometry args={[1.6, 1.6]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.06, 0.003, 0]} material={mats.shadow}>
        <planeGeometry args={[0.9, 0.62]} />
      </mesh>
    </group>
  );
}

/**
 * Angle figé pour le rendu des visuels fixes (scripts/render-fallbacks.mjs) :
 * le script pose `window.__olStill` avant le chargement de la page.
 */
function stillAngle(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { __olStill?: { bottleRot?: number } }).__olStill?.bottleRot;
}

/** Rotation au glisser, avec inertie, et retour au calme. */
function Spinner({ spin, dragging, idle }: { spin: { current: SpinState }; dragging: { current: boolean }; idle: number }) {
  const still = useMemo(() => stillAngle(), []);
  useFrame((_, dt) => {
    const s = spin.current;
    if (still !== undefined) {
      s.vel = 0;
      s.rot = still;
      s.tilt = 0;
      return;
    }
    if (!dragging.current) s.vel = THREE.MathUtils.damp(s.vel, idle, 0.9, dt);
    s.rot += s.vel * dt;
    s.tilt = THREE.MathUtils.damp(s.tilt, THREE.MathUtils.clamp(-s.vel * 0.035, -0.2, 0.2), 4, dt);
  });
  return null;
}

function Rig() {
  const { camera, size } = useThree();
  useFrame(() => {
    const portrait = size.width / size.height < 0.9;
    camera.position.set(0, portrait ? 1.05 : 0.95, portrait ? 4.9 : 4.1);
    camera.lookAt(0, 0.78, 0);
  });
  return null;
}

interface Props {
  flavor: Flavor;
  className?: string;
  /** vitesse de rotation au repos (rad/s) */
  idle?: number;
  onReady?: () => void;
}

export default function BottleCanvas({ flavor, className = '', idle = 0.35, onReady }: Props) {
  const caps = useCapabilities();
  const quality = caps.tier;
  const wrap = useRef<HTMLDivElement>(null);
  const spin = useRef<SpinState>(createSpin());
  const dragging = useRef(false);
  const last = useRef({ x: 0, t: 0 });
  const [onScreen, setOnScreen] = useState(false);
  const labelSrc = useBrandAsset(flavor.labelAsset);
  const logoSrc = useBrandAsset('logoOneLiving');

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // un parfum choisi : la bouteille fait un tour sur elle-même
  useEffect(() => {
    spin.current.vel += 7.5;
  }, [flavor]);

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, t: performance.now() };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - last.current.x;
    const dt = Math.max(8, now - last.current.t) / 1000;
    spin.current.vel = THREE.MathUtils.clamp(((dx / Math.max(200, wrap.current?.clientWidth ?? 600)) * 9) / dt, -14, 14);
    last.current = { x: e.clientX, t: now };
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={wrap}
      className={`touch-pan-y select-none ${className || 'relative'}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      data-cursor-label="Glisser pour tourner"
      data-cursor
      role="img"
      aria-label={`Bouteille ${flavor.name}, 33 cl. Glisser pour la faire tourner.`}
    >
      <Canvas
        resize={{ offsetSize: true }}
        frameloop={onScreen ? 'always' : 'never'}
        dpr={[1, quality === 'high' ? 1.75 : 1.25]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
        camera={{ fov: 30, position: [0, 0.95, 4.1], near: 0.05, far: 30 }}
        onCreated={() => onReady?.()}
      >
        <color attach="background" args={['#15130f']} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[-2.5, 3.5, 2.5]} intensity={2.2} color="#fff3e4" />
        <directionalLight position={[2.5, 1.5, -1.5]} intensity={1.2} color="#ffd6a8" />
        <spotLight position={[0, 4.5, 1.5]} angle={0.5} penumbra={0.9} intensity={18} distance={10} color="#fff5e6" />
        <spotLight position={[0.4, 2.2, -2.4]} angle={0.6} penumbra={1} intensity={14} distance={8} color="#ffcf9a" />
        <Stage flavor={flavor} />
        <Bottle flavor={flavor} spin={spin} quality={quality} labelSrc={labelSrc} logoSrc={logoSrc} position={[0, 0, 0]} />
        <Spinner spin={spin} dragging={dragging} idle={idle} />
        <Rig />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={5} color="#fff6ea" position={[-2.4, 1.1, 2.2]} rotation={[0, Math.PI / 3.2, 0]} scale={[0.5, 4, 1]} />
          <Lightformer intensity={3.2} color="#ffe2c2" position={[2.4, 1.0, 1.8]} rotation={[0, -Math.PI / 3, 0]} scale={[0.3, 3.6, 1]} />
          <Lightformer intensity={1.6} color="#ffffff" position={[0, 3.6, 0.8]} rotation={[Math.PI / 2, 0, 0]} scale={[2.6, 1.0, 1]} />
          <Lightformer intensity={0.35} color="#ffd9b0" position={[0, 1, -3]} scale={[6, 3, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
