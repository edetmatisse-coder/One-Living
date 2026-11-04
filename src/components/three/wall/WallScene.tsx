'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useUI } from '@/store/ui';
import { useCapabilities } from '@/lib/device';
import { clamp, lerp, rng, smoothstep } from '@/lib/three/noise';
import { createAOTexture, createChalkTexture, createWallTextures, SHEET_H, SHEET_W } from './textures';
import { makeBoltGeometries, makeHoldGeometry, makeHoldMaterial, HOLD_SHAPES, type HoldShape } from './holdGeometry';
import {
  buildDecor,
  buildRoute,
  buildVolumes,
  makeVolumeGeometry,
  makeWallGeometry,
  routeX,
  routeY,
  surfaceAt,
  WALL_HEIGHT,
  WALL_WIDTH,
  type HoldPlacement,
} from './wallLayout';
import { ChalkBursts, FermentBubbles, MagnesiaDust, type BurstHandle } from '../shared/Particles';
import { FirstFrames } from '../shared/FirstFrames';

type Quality = 'high' | 'low';

/* ------------------------------------------------------------------ */
/* Surface de contreplaqué et tapis de réception                         */
/* ------------------------------------------------------------------ */

function WallSurface({ quality }: { quality: Quality }) {
  const gl = useThree((s) => s.gl);
  const { geometry, material } = useMemo(() => {
    const tex = createWallTextures(quality, gl.capabilities.getMaxAnisotropy());
    const m = new THREE.MeshStandardMaterial({
      map: tex.map,
      bumpMap: tex.bump,
      bumpScale: 1.6,
      roughnessMap: tex.orm,
      metalnessMap: tex.orm,
      roughness: 1,
      metalness: 1,
      envMapIntensity: 0.35,
    });
    return { geometry: makeWallGeometry(SHEET_W, SHEET_H), material: m };
  }, [quality, gl]);
  return <mesh geometry={geometry} material={material} receiveShadow />;
}

function CrashPads() {
  const { pad, seam } = useMemo(() => {
    const pad = new THREE.MeshStandardMaterial({ color: '#23262c', roughness: 0.88, metalness: 0 });
    const seam = new THREE.MeshStandardMaterial({ color: '#0e0f12', roughness: 1 });
    return { pad, seam };
  }, []);
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.23, 1.85]} material={pad} receiveShadow>
        <boxGeometry args={[WALL_WIDTH, 0.46, 3.5]} />
      </mesh>
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 0.002, 1.85]} rotation={[-Math.PI / 2, 0, 0]} material={seam}>
          <planeGeometry args={[0.025, 3.5]} />
        </mesh>
      ))}
      <mesh position={[0, 0.002, 1.25]} rotation={[-Math.PI / 2, 0, 0]} material={seam}>
        <planeGeometry args={[WALL_WIDTH, 0.025]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Prises décoratives (instanciées) et halos de magnésie                */
/* ------------------------------------------------------------------ */

const _m = new THREE.Matrix4();
const _up = new THREE.Vector3();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();

function DecorHolds({ placements, quality }: { placements: HoldPlacement[]; quality: Quality }) {
  const groups = useMemo(() => {
    const detail = quality === 'high' ? 3 : 2;
    const byShape = new Map<HoldShape, HoldPlacement[]>();
    for (const p of placements) {
      if (!byShape.has(p.shape)) byShape.set(p.shape, []);
      byShape.get(p.shape)!.push(p);
    }
    return HOLD_SHAPES.filter((s) => byShape.has(s)).map((shape, k) => ({
      shape,
      items: byShape.get(shape)!,
      geometry: makeHoldGeometry(shape, 20 + k, detail),
    }));
  }, [placements, quality]);
  const material = useMemo(() => makeHoldMaterial({ chalk: 0.75 }), []);
  const bolts = useMemo(() => makeBoltGeometries(), []);
  const boltMats = useMemo(
    () => ({
      washer: new THREE.MeshStandardMaterial({ color: '#0c0b0a', roughness: 0.7 }),
      head: new THREE.MeshStandardMaterial({ color: '#8a8780', roughness: 0.35, metalness: 1 }),
    }),
    [],
  );

  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const washerRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let b = 0;
    groups.forEach((grp, gi) => {
      const mesh = refs.current[gi];
      if (!mesh) return;
      grp.items.forEach((it, i) => {
        _s.setScalar(it.scale);
        _m.compose(it.position, it.quaternion, _s);
        mesh.setMatrixAt(i, _m);
        mesh.setColorAt(i, new THREE.Color(it.color));
        // vis
        const bolt = (grp.geometry.userData.bolt as THREE.Vector3).clone().multiplyScalar(it.scale);
        _p.copy(bolt).applyQuaternion(it.quaternion).add(it.position);
        _m.compose(_p, it.quaternion, _s.setScalar(1));
        washerRef.current?.setMatrixAt(b, _m);
        headRef.current?.setMatrixAt(b, _m);
        b++;
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
    if (washerRef.current && headRef.current) {
      washerRef.current.count = b;
      headRef.current.count = b;
      washerRef.current.instanceMatrix.needsUpdate = true;
      headRef.current.instanceMatrix.needsUpdate = true;
      washerRef.current.computeBoundingSphere();
      headRef.current.computeBoundingSphere();
    }
  }, [groups]);

  return (
    <group>
      {groups.map((grp, gi) => (
        <instancedMesh
          key={grp.shape}
          ref={(el) => {
            refs.current[gi] = el;
          }}
          args={[grp.geometry, material, grp.items.length]}
          castShadow
          receiveShadow
        />
      ))}
      <instancedMesh ref={washerRef} args={[bolts.washer, boltMats.washer, placements.length]} />
      <instancedMesh ref={headRef} args={[bolts.head, boltMats.head, placements.length]} />
    </group>
  );
}

function ChalkDecals({ placements }: { placements: HoldPlacement[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = useMemo(() => {
    const tex = createChalkTexture();
    const material = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      roughness: 1,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    return { geometry: new THREE.PlaneGeometry(1, 1), material };
  }, []);
  const chosen = useMemo(() => {
    const r = rng(5);
    return placements.filter((p) => p.section !== undefined || r() < 0.4);
  }, [placements]);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(8);
    const q = new THREE.Quaternion();
    const qz = new THREE.Quaternion();
    chosen.forEach((p, i) => {
      qz.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (r() - 0.5) * 0.8);
      q.copy(p.quaternion).multiply(qz);
      const k = p.scale * (p.section !== undefined ? 2.9 : 2.5) * (0.8 + r() * 0.45);
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(p.quaternion);
      _p.copy(p.position)
        .addScaledVector(n, 0.003)
        .add(new THREE.Vector3(0, -p.scale * 0.2, 0));
      _m.compose(_p, q, _s.set(k, k * 1.15, 1));
      mesh.setMatrixAt(i, _m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [chosen]);
  return <instancedMesh ref={ref} args={[geometry, material, chosen.length]} receiveShadow />;
}

/** Ombre de contact sous chaque prise : elle les « visse » visuellement à la paroi. */
function ContactShadows({ placements }: { placements: HoldPlacement[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      map: createAOTexture(),
      transparent: true,
      depthWrite: false,
      color: '#000000',
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    return { geometry: new THREE.PlaneGeometry(1, 1), material };
  }, []);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    placements.forEach((p, i) => {
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(p.quaternion);
      _p.copy(p.position)
        .addScaledVector(n, 0.002)
        .add(new THREE.Vector3(-p.scale * 0.12, -p.scale * 0.22, 0));
      const k = p.scale * 2.35;
      _m.compose(_p, p.quaternion, _s.set(k, k * 0.92, 1));
      mesh.setMatrixAt(i, _m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements]);
  return <instancedMesh ref={ref} args={[geometry, material, placements.length]} renderOrder={1} />;
}

function Volumes() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const vols = useMemo(() => buildVolumes(), []);
  const { geometry, material } = useMemo(
    () => ({
      geometry: makeVolumeGeometry(),
      material: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7, metalness: 0 }),
    }),
    [],
  );
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    vols.forEach((v, i) => {
      _m.compose(v.position, v.quaternion, _s.set(v.size, v.size, v.depth));
      mesh.setMatrixAt(i, _m);
      mesh.setColorAt(i, new THREE.Color(v.tint).multiplyScalar(v.tint === '#3a332c' ? 1 : 0.55));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [vols]);
  return <instancedMesh ref={ref} args={[geometry, material, vols.length]} castShadow receiveShadow />;
}

/* ------------------------------------------------------------------ */
/* La voie du Dossier : une prise par section, qui s'allume              */
/* ------------------------------------------------------------------ */

interface RouteHoldsProps {
  route: HoldPlacement[];
  quality: Quality;
  burst: React.RefObject<BurstHandle | null>;
}

function RouteHolds({ route, quality, burst }: RouteHoldsProps) {
  const items = useMemo(
    () =>
      route.map((p, i) => {
        const geometry = makeHoldGeometry(p.shape, 300 + i, quality === 'high' ? 4 : 3);
        const material = makeHoldMaterial({ chalk: 0.16, physical: quality === 'high', color: p.color });
        material.emissive = new THREE.Color(p.color);
        material.emissiveIntensity = 0;
        material.envMapIntensity = 0.45;
        if (material instanceof THREE.MeshPhysicalMaterial) material.clearcoat = 0.18;
        const n = new THREE.Vector3(0, 0, 1).applyQuaternion(p.quaternion);
        return { p, geometry, material, normal: n, glow: 0 };
      }),
    [route, quality],
  );
  const tapes = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.1, 0.034);
    return items.map((it) => ({ g, m: new THREE.MeshStandardMaterial({ color: it.p.color, roughness: 0.6 }) }));
  }, [items]);
  const light = useRef<THREE.PointLight>(null);
  const lastReached = useRef(-1);

  useFrame((state, dt) => {
    const { reachedIndex, activeIndex } = useUI.getState();
    const t = state.clock.elapsedTime;
    if (reachedIndex > lastReached.current) {
      for (let i = lastReached.current + 1; i <= reachedIndex; i++) {
        const it = items[i];
        if (it && i === reachedIndex) burst.current?.fire(it.p.position, it.normal);
      }
      lastReached.current = reachedIndex;
    }
    items.forEach((it, i) => {
      const peak = quality === 'high' ? 0.46 : 0.28;
      const target = i <= reachedIndex ? (i === activeIndex ? peak + Math.sin(t * 2.2) * 0.08 : peak * 0.4) : 0;
      it.glow = THREE.MathUtils.damp(it.glow, target, 3.2, dt);
      it.material.emissiveIntensity = it.glow;
    });
    const act = items[Math.max(0, Math.min(items.length - 1, activeIndex))];
    if (light.current && act) {
      // la lumière colorée éclaire la paroi autour de la prise, pas la prise elle-même
      _p.copy(act.p.position)
        .addScaledVector(act.normal, 0.75)
        .add(_up.set(-0.25, 0.35, 0));
      light.current.position.lerp(_p, 1 - Math.exp(-dt * 4));
      light.current.color.lerp(new THREE.Color(act.p.color), 1 - Math.exp(-dt * 3));
      const want = reachedIndex >= 0 ? 1.5 : 0;
      light.current.intensity = THREE.MathUtils.damp(light.current.intensity, want, 2.5, dt);
    }
  });

  return (
    <group>
      {items.map((it, i) => (
        <group key={i} position={it.p.position} quaternion={it.p.quaternion}>
          <mesh geometry={it.geometry} material={it.material} scale={it.p.scale} castShadow receiveShadow />
          <mesh
            geometry={tapes[i].g}
            material={tapes[i].m}
            position={[-it.p.scale * 0.15, -it.p.scale * 0.95, 0.004]}
            rotation={[0, 0, 0.12 * (i % 2 ? 1 : -1)]}
          />
        </group>
      ))}
      <pointLight ref={light} intensity={0} distance={3.2} decay={1.6} color={route[0]?.color ?? '#F2B705'} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Caméra qui grimpe la voie, lumière de salle qui suit                  */
/* ------------------------------------------------------------------ */

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

interface RigProps {
  count: number;
  mobile: boolean;
  spot: React.RefObject<THREE.SpotLight | null>;
  focus: { current: { y: number; z: number } };
}

function CameraRig({ count, mobile, spot, focus }: RigProps) {
  const { camera, size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const cur = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null);
  const tPos = useMemo(() => new THREE.Vector3(), []);
  const tLook = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, dt) => {
    const climb = clamp(useUI.getState().climb, 0, count - 1);
    const i0 = Math.floor(climb);
    const i1 = Math.min(count - 1, i0 + 1);
    const f = easeInOut(climb - i0);
    const y = lerp(routeY(i0), routeY(i1), f);
    const x = lerp(routeX(i0), routeX(i1), f);
    const surf = surfaceAt(y);
    const aspect = size.width / size.height;
    const cam = camera as THREE.PerspectiveCamera;
    const dist = mobile ? 3.7 : 3.4;
    const halfW = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect;
    const hero = 1 - smoothstep(0, 0.9, climb);
    // au départ, la caméra descend et lève les yeux vers la première prise ;
    // sur mobile, la prise se place dans la bande libre à droite du titre
    const offX = mobile ? 0.15 + hero * 0.3 : halfW * 0.4;
    const lookY = y + (mobile ? -0.85 : -0.05) + hero * (mobile ? 0.97 : -0.55);
    const t = state.clock.elapsedTime;

    tLook.set(x - offX, lookY, surf.point.z);
    tPos.set(
      x - offX - 0.3 + pointer.current.x * 0.28 + Math.sin(t * 0.37) * 0.04,
      lookY - 0.5 - hero * (mobile ? 0.65 : 0.75) + pointer.current.y * 0.16 + Math.sin(t * 0.51) * 0.03,
      surf.point.z + dist + hero * 0.3,
    );
    if (!cur.current) cur.current = { pos: tPos.clone(), look: tLook.clone() };
    const k = 1 - Math.exp(-dt * 3.4);
    cur.current.pos.lerp(tPos, k);
    cur.current.look.lerp(tLook, k);
    camera.position.copy(cur.current.pos);
    camera.lookAt(cur.current.look);

    focus.current.y = cur.current.look.y;
    focus.current.z = surf.point.z;

    if (spot.current) {
      spot.current.position.set(cur.current.look.x + 2.2, cur.current.look.y + 3.6, cur.current.look.z + 3.4);
      spot.current.target.position.set(cur.current.look.x + offX * 0.35, cur.current.look.y - 0.35, cur.current.look.z);
      spot.current.target.updateMatrixWorld();
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Monde                                                                */
/* ------------------------------------------------------------------ */

function WallWorld({ colors, quality, mobile }: { colors: string[]; quality: Quality; mobile: boolean }) {
  const route = useMemo(() => buildRoute(colors.length, colors), [colors]);
  const decor = useMemo(
    () =>
      buildDecor(
        quality,
        route.map((r) => r.position),
      ),
    [quality, route],
  );
  const all = useMemo(() => [...route, ...decor], [route, decor]);
  const spot = useRef<THREE.SpotLight>(null);
  const focus = useRef({ y: 1.5, z: 0 });
  const burst = useRef<BurstHandle>(null);
  const routeColor = useRef(new THREE.Color(colors[0]));
  const lightInfo = useMemo(() => ({ position: new THREE.Vector3(), direction: new THREE.Vector3() }), []);

  useFrame(() => {
    routeColor.current.set(useUI.getState().activeColor);
    if (spot.current) {
      lightInfo.position.copy(spot.current.position);
      lightInfo.direction.copy(spot.current.target.position).sub(spot.current.position).normalize();
    }
  });

  const follow = () => [focus.current.y, focus.current.z] as [number, number];

  return (
    <>
      <color attach="background" args={['#100e0c']} />
      <fog attach="fog" args={['#100e0c', 5.5, 15]} />
      <hemisphereLight args={['#fff1dd', '#1b1916', 0.2]} />
      <ambientLight intensity={0.05} />
      <spotLight
        ref={spot}
        color="#ffe9cc"
        intensity={quality === 'high' ? 105 : 72}
        angle={0.62}
        penumbra={0.85}
        distance={14}
        decay={2}
        castShadow={quality === 'high'}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
        shadow-camera-near={1}
        shadow-camera-far={12}
      />
      <directionalLight position={[-5, 6, 6]} intensity={0.22} color="#c9d4ff" />

      <WallSurface quality={quality} />
      <CrashPads />
      <Volumes />
      <DecorHolds placements={decor} quality={quality} />
      <ContactShadows placements={all} />
      <ChalkDecals placements={all} />
      <RouteHolds route={route} quality={quality} burst={burst} />
      <ChalkBursts ref={burst} />

      <MagnesiaDust
        count={quality === 'high' ? 1800 : 600}
        width={9}
        height={6}
        depth={3.1}
        size={quality === 'high' ? 1.3 : 1.6}
        follow={follow}
        light={lightInfo}
      />
      <FermentBubbles
        count={quality === 'high' ? 70 : 30}
        width={7}
        height={6}
        size={1.6}
        opacity={0.5}
        follow={follow}
        colorRef={routeColor}
      />

      <CameraRig count={colors.length} mobile={mobile} spot={spot} focus={focus} />

      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} color="#fff3e2" position={[0, 6, 4]} scale={[10, 2, 1]} />
        <Lightformer intensity={0.6} color="#9fb3ff" position={[-6, 2, 2]} scale={[4, 4, 1]} />
        <Lightformer intensity={0.4} color="#ffd2a8" position={[6, 1, 3]} scale={[3, 6, 1]} />
      </Environment>
    </>
  );
}

/** Prévient le parent après les premières images (textures prêtes). */
function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.78} luminanceSmoothing={0.22} radius={0.75} />
      <Vignette offset={0.28} darkness={0.72} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas fixe derrière le Dossier                                      */
/* ------------------------------------------------------------------ */

/**
 * Ne dessine que lorsque la paroi est visible (hero et en-têtes de
 * section transparents) : sous les panneaux opaques, le rendu s'arrête.
 */
function useWallVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('#depart, [data-section-head]'));
    if (!targets.length) return;
    const shown = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) shown.add(e.target);
          else shown.delete(e.target);
        }
        setVisible(shown.size > 0);
      },
      { rootMargin: '120px 0px 120px 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return visible;
}

export default function WallCanvas({ colors, onReady }: { colors: string[]; onReady?: () => void }) {
  const caps = useCapabilities();
  const quality: Quality = caps.tier;
  const visible = useWallVisible();
  const presentation = useUI((s) => s.presentation);
  const [dpr, setDpr] = useState<number>(quality === 'high' ? 1.5 : 1);
  const maxDpr = quality === 'high' ? Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1.5) : 1.25;

  return (
    <Canvas
      resize={{ offsetSize: true }}
      className="!pointer-events-none"
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      frameloop={visible || presentation ? 'always' : 'never'}
      dpr={[1, Math.min(dpr, maxDpr)]}
      shadows={quality === 'high' ? 'percentage' : false}
      gl={{
        antialias: quality !== 'high',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        toneMapping: THREE.NeutralToneMapping,
      }}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0.6, 0.8, 3.8] }}
    >
      <FirstFrames onReady={onReady} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
      />
      <WallWorld colors={colors} quality={quality} mobile={caps.mobile} />
      {quality === 'high' && <Effects />}
    </Canvas>
  );
}

export { WALL_HEIGHT };
