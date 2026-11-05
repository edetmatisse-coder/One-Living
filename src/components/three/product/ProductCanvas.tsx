'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { PRODUCTS, productLabel, type Product } from '@/data/campagne';
import { ROUTE_COLORS } from '@/data/routes';
import { useCapabilities } from '@/lib/device';
import { createWallTextures } from './plywood';
import { makeCausticMaterial, makeGlowTexture, makeShadowTexture } from './stage';
import { ProductModel, SCENE_HEIGHT } from './models';

// les 10 étiquettes sont légères : on les charge d'avance pour changer de produit sans attente
useTexture.preload(PRODUCTS.map((p) => productLabel(p.id)));

interface SpinState {
  rot: number;
  vel: number;
  tilt: number;
}

/** Décor : contreplaqué de salle, sol sombre, caustiques, lueur et ombre de contact. */
function Stage({ product }: { product: Product }) {
  const gl = useThree((s) => s.gl);
  const mats = useMemo(() => {
    const tex = createWallTextures('low', gl.capabilities.getMaxAnisotropy());
    tex.map.repeat.set(3, 1.5);
    tex.bump.repeat.set(3, 1.5);
    return {
      back: new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump, bumpScale: 0.8, roughness: 0.9, color: '#bdb5aa' }),
      floor: new THREE.MeshStandardMaterial({ color: '#1b1815', roughness: 0.78, metalness: 0, envMapIntensity: 0.3 }),
      caustic: makeCausticMaterial(),
      shadow: new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, color: '#000' }),
      glow: new THREE.MeshBasicMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    };
  }, [gl]);
  const target = useMemo(() => new THREE.Color(ROUTE_COLORS[product.route]), [product]);
  const caustic = product.format === 'shot' ? 0.75 : product.format === 'bouteille' ? 0.45 : 0.3;
  useFrame((state, dt) => {
    mats.caustic.uniforms.uTime.value = state.clock.elapsedTime;
    (mats.caustic.uniforms.uColor.value as THREE.Color).lerp(target, 1 - Math.exp(-dt * 3));
    mats.caustic.uniforms.uStrength.value = THREE.MathUtils.damp(mats.caustic.uniforms.uStrength.value, caustic, 3, dt);
  });
  return (
    <group>
      <mesh position={[0, 1.6, -1.6]} material={mats.back}>
        <planeGeometry args={[9, 5]} />
      </mesh>
      <mesh position={[0.15, 1.1, -1.55]} material={mats.glow}>
        <planeGeometry args={[3.4, 3.4]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.floor}>
        <planeGeometry args={[9, 6]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.002, -0.12]} material={mats.caustic}>
        <planeGeometry args={[1.5, 1.5]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.05, 0.003, 0]} material={mats.shadow}>
        <planeGeometry args={[0.95, 0.66]} />
      </mesh>
    </group>
  );
}

/** Version flottante (devant une photo) : seulement une ombre de contact douce. */
function FloatingShadow() {
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, color: '#000', opacity: 0.85 }),
    [],
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.04, 0.002, 0]} material={mat}>
      <planeGeometry args={[1.1, 0.75]} />
    </mesh>
  );
}

/**
 * Angle figé pour les captures de contrôle : `window.__olStill = { bottleRot }`
 * posé avant le chargement de la page.
 */
function stillAngle(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { __olStill?: { bottleRot?: number } }).__olStill?.bottleRot;
}

export type Facing = 'free' | 'front' | 'back';

/** Le produit : rotation au glisser avec inertie, petit saut à chaque changement, face ou dos sur demande. */
function Turntable({
  product,
  spin,
  dragging,
  idle,
  facing,
}: {
  product: Product;
  spin: { current: SpinState };
  dragging: { current: boolean };
  idle: number;
  facing: Facing;
}) {
  const caps = useCapabilities();
  const gl = useThree((s) => s.gl);
  const group = useRef<THREE.Group>(null);
  const swap = useRef(1);
  const still = useMemo(() => stillAngle(), []);
  const aniso = useMemo(() => Math.min(8, gl.capabilities.getMaxAnisotropy()), [gl]);

  useEffect(() => {
    swap.current = 0;
    spin.current.vel += 7.5;
  }, [product.id, spin]);

  // face ou dos : on vise l'angle le plus proche (face à 0, dos à pi, modulo un tour)
  const hold = useRef<number | null>(null);
  useEffect(() => {
    if (facing === 'free') {
      hold.current = null;
      return;
    }
    const s = spin.current;
    const base = facing === 'back' ? Math.PI : 0;
    hold.current = base + Math.round((s.rot - base) / (Math.PI * 2)) * Math.PI * 2;
    s.vel = 0;
  }, [facing, spin]);

  useFrame((_, dt) => {
    const s = spin.current;
    if (still !== undefined) {
      s.vel = 0;
      s.rot = still;
      s.tilt = 0;
      swap.current = 1;
    } else if (hold.current !== null && !dragging.current) {
      s.vel = 0;
      s.rot = THREE.MathUtils.damp(s.rot, hold.current, 4.5, dt);
      s.tilt = THREE.MathUtils.damp(s.tilt, 0, 4, dt);
      swap.current = Math.min(1, swap.current + dt / 0.7);
    } else {
      if (dragging.current) hold.current = null;
      if (!dragging.current) s.vel = THREE.MathUtils.damp(s.vel, idle, 0.9, dt);
      s.rot += s.vel * dt;
      s.tilt = THREE.MathUtils.damp(s.tilt, THREE.MathUtils.clamp(-s.vel * 0.03, -0.18, 0.18), 4, dt);
      swap.current = Math.min(1, swap.current + dt / 0.7);
    }
    const g = group.current;
    if (!g) return;
    const t = swap.current;
    const ease = 1 - Math.pow(1 - t, 3);
    const back = 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2); // léger rebond
    g.rotation.y = s.rot;
    g.rotation.z = s.tilt * 0.12;
    g.scale.setScalar(0.86 + 0.14 * back);
    g.position.y = (1 - ease) * 0.22;
  });

  return (
    <group ref={group}>
      <Suspense fallback={null}>
        <ProductModel product={product} quality={caps.tier} maxAnisotropy={aniso} />
      </Suspense>
    </group>
  );
}

/** Caméra cadrée sur la hauteur du produit, en douceur quand on change de format. */
function Rig({ product }: { product: Product }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.8, 0));
  const pos = useRef<THREE.Vector3 | null>(null);
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const H = SCENE_HEIGHT[product.format];
    const portrait = size.width / size.height < 0.9;
    const visible = H * (portrait ? 1.42 : 1.3) + 0.25;
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    let dist = visible / 2 / Math.tan(vfov / 2);
    const aspect = size.width / size.height;
    if (aspect < 0.62) dist /= aspect / 0.62; // écran très étroit : on recule
    const target = new THREE.Vector3(0, H * 0.5, 0);
    const want = new THREE.Vector3(0, H * 0.5 + H * 0.16, dist);
    if (!pos.current) pos.current = want.clone();
    const k = 1 - Math.exp(-dt * 3.2);
    pos.current.lerp(want, k);
    look.current.lerp(target, k);
    cam.position.copy(pos.current);
    cam.lookAt(look.current);
  });
  return null;
}

interface Props {
  product: Product;
  /** « stage » : décor de salle complet ; « floating » : fond transparent, à poser devant une photo */
  variant?: 'stage' | 'floating';
  /** « front » ou « back » tourne la boisson face ou dos à la caméra et l'y garde */
  facing?: Facing;
  className?: string;
  /** vitesse de rotation au repos (rad/s) */
  idle?: number;
  /** libellé lu par les lecteurs d'écran */
  label?: string;
}

export default function ProductCanvas({ product, variant = 'stage', facing = 'free', className = '', idle = 0.35, label }: Props) {
  const caps = useCapabilities();
  const wrap = useRef<HTMLDivElement>(null);
  const spin = useRef<SpinState>({ rot: -0.08, vel: 0, tilt: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, t: 0 });
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      aria-label={label ?? `${product.name}. Glisser pour faire tourner.`}
    >
      <Canvas
        resize={{ offsetSize: true }}
        frameloop={onScreen ? 'always' : 'never'}
        dpr={[1, caps.tier === 'high' ? 1.75 : 1.25]}
        gl={{ antialias: true, alpha: variant === 'floating', powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
        camera={{ fov: 30, position: [0, 1.1, 4.2], near: 0.05, far: 30 }}
      >
        {variant === 'stage' && <color attach="background" args={['#15130f']} />}
        <ambientLight intensity={0.25} />
        <directionalLight position={[-2.5, 3.5, 2.5]} intensity={2.2} color="#fff3e4" />
        <directionalLight position={[2.5, 1.5, -1.5]} intensity={1.2} color="#ffd6a8" />
        <spotLight position={[0, 4.5, 1.5]} angle={0.5} penumbra={0.9} intensity={18} distance={10} color="#fff5e6" />
        <spotLight position={[0.4, 2.2, -2.4]} angle={0.6} penumbra={1} intensity={14} distance={8} color="#ffcf9a" />
        {variant === 'stage' ? <Stage product={product} /> : <FloatingShadow />}
        <Turntable product={product} spin={spin} dragging={dragging} idle={idle} facing={facing} />
        <Rig product={product} />
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
