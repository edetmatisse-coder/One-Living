'use client';

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { FLAVORS } from '@/data/campagne';
import { useCapabilities } from '@/lib/device';
import { playSfx } from '@/lib/sound';
import { createWallTextures, SHEET_H, SHEET_W, createAOTexture, createChalkTexture } from '../wall/textures';
import { makeHoldGeometry, makeHoldMaterial, type HoldShape } from '../wall/holdGeometry';
import { arc, BODY, bodyFor, createPose, solvePose, type Targets } from './climber';
import { Bottle, createSpin } from '../bottle/Bottle';
import { useBrandAsset } from '@/components/ui/Brand';

const loadBurst = () => import('./BubbleBurst');
const BubbleBurst = lazy(loadBurst);

/** Pastille numérotée d'une prise (sprite dessiné sur canvas). */
function badgeTexture(n: number, color: string, done: boolean) {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 8, 0, Math.PI * 2);
  ctx.fillStyle = done ? color : 'rgba(20,18,16,0.88)';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = done ? '#141210' : '#F3EFE8';
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-jetbrains').trim() || 'monospace';
  ctx.font = `700 64px ${mono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), S / 2, S / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Les 5 prises à toucher, dans l'ordre (la 0 est le départ). */
export const GAME_HOLDS: { x: number; y: number; shape: HoldShape; color: string }[] = [
  { x: 0.05, y: 1.45, shape: 'jug', color: '#3B3630' },
  { x: 0.55, y: 2.05, shape: 'jug', color: '#F2B705' },
  { x: -0.35, y: 2.8, shape: 'sloper', color: '#E64980' },
  { x: 0.45, y: 3.55, shape: 'pinch', color: '#5C7CFA' },
  { x: -0.32, y: 4.3, shape: 'jug', color: '#FD7E14' },
  { x: 0.12, y: 5.08, shape: 'jug', color: '#F2B705' },
];

const FOOTHOLDS: [number, number][][] = [
  [[-0.16, 0.04], [0.16, 0.04]],
  [[-0.2, 0.28], [0.24, 0.42]],
  [[-0.28, 0.95], [0.12, 0.82]],
  [[-0.08, 1.62], [0.32, 1.5]],
  [[-0.3, 2.36], [0.1, 2.28]],
  [[-0.2, 3.5], [0.28, 3.42]],
];

const grip = (i: number, dx = 0) => new THREE.Vector3(GAME_HOLDS[i].x + dx, GAME_HOLDS[i].y + 0.03, 0.09);
const foot = (k: number, side: 0 | 1) =>
  new THREE.Vector3(FOOTHOLDS[k][side][0], FOOTHOLDS[k][side][1] + 0.04, k === 0 ? 0.2 : 0.07);

interface Tween {
  target: THREE.Vector3;
  to: THREE.Vector3;
  from: THREE.Vector3 | null;
  start: number;
  dur: number;
  lift: number;
}

/* ------------------------------------------------------------------ */

function Wall() {
  const gl = useThree((s) => s.gl);
  const { mat, pads } = useMemo(() => {
    const tex = createWallTextures('low', gl.capabilities.getMaxAnisotropy());
    const W = 6;
    const H = 9;
    tex.map.repeat.set(W / SHEET_W, H / SHEET_H);
    tex.bump.repeat.set(W / SHEET_W, H / SHEET_H);
    tex.orm.repeat.set(W / SHEET_W, H / SHEET_H);
    return {
      mat: new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump, bumpScale: 1.4, roughnessMap: tex.orm, metalnessMap: tex.orm, roughness: 1, metalness: 1 }),
      pads: new THREE.MeshStandardMaterial({ color: '#23262c', roughness: 0.9 }),
    };
  }, [gl]);
  return (
    <group>
      <mesh position={[0, 4.5, 0]} material={mat} receiveShadow>
        <planeGeometry args={[6, 9]} />
      </mesh>
      <mesh position={[0, -0.22, 1.6]} material={pads}>
        <boxGeometry args={[6, 0.44, 3.2]} />
      </mesh>
    </group>
  );
}

function HoldsLayer({
  step,
  shake,
  onHold,
}: {
  step: number;
  shake: { i: number; t: number };
  onHold: (i: number, e: ThreeEvent<MouseEvent>) => void;
}) {
  const items = useMemo(
    () =>
      GAME_HOLDS.map((h, i) => {
        const g = makeHoldGeometry(h.shape, 500 + i, 3);
        const m = makeHoldMaterial({ chalk: 0.45, color: h.color });
        m.emissive = new THREE.Color(h.color);
        m.emissiveIntensity = 0;
        return { g, m, h };
      }),
    [],
  );
  const feet = useMemo(() => {
    const g = makeHoldGeometry('crimp', 77, 2);
    const m = makeHoldMaterial({ chalk: 0.7, color: '#5d564d' });
    return { g, m };
  }, []);
  const decals = useMemo(() => {
    const ao = new THREE.MeshBasicMaterial({ map: createAOTexture(), transparent: true, depthWrite: false, color: '#000' });
    const chalk = new THREE.MeshStandardMaterial({ map: createChalkTexture(), transparent: true, depthWrite: false, roughness: 1 });
    return { ao, chalk, plane: new THREE.PlaneGeometry(1, 1) };
  }, []);
  const badges = useMemo(
    () =>
      GAME_HOLDS.map((h, i) => ({
        todo: new THREE.SpriteMaterial({ map: badgeTexture(i, h.color, false), depthWrite: false }),
        done: new THREE.SpriteMaterial({ map: badgeTexture(i, h.color, true), depthWrite: false }),
      })),
    [],
  );
  const groups = useRef<(THREE.Group | null)[]>([]);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false }), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    items.forEach((it, i) => {
      const next = i === step + 1;
      const done = i > 0 && i <= step;
      const want = next ? 0.55 + Math.sin(t * 4) * 0.25 : done ? 0.25 : 0;
      it.m.emissiveIntensity = THREE.MathUtils.damp(it.m.emissiveIntensity, want, 6, dt);
      const g = groups.current[i];
      if (g) {
        const k = shake.i === i ? Math.max(0, 1 - (t - shake.t) / 0.45) : 0;
        g.position.x = GAME_HOLDS[i].x + Math.sin(t * 60) * 0.03 * k;
      }
    });
    if (ring.current) {
      const nxt = GAME_HOLDS[step + 1];
      ring.current.visible = !!nxt;
      if (nxt) {
        const p = (t * 0.9) % 1;
        ring.current.position.set(nxt.x, nxt.y, 0.02);
        ring.current.scale.setScalar(0.22 + p * 0.38);
        ringMat.opacity = (1 - p) * 0.55;
        ringMat.color.set(nxt.color);
      }
    }
  });

  return (
    <group>
      {FOOTHOLDS.flat().map(([x, y], k) => (
        <group key={`f${k}`} position={[x, y, 0]} rotation={[0, 0, k * 1.7]}>
          <mesh geometry={feet.g} material={feet.m} scale={0.065} castShadow />
        </group>
      ))}
      {items.map((it, i) => (
        <group key={i} ref={(el) => { groups.current[i] = el; }} position={[it.h.x, it.h.y, 0]}>
          <mesh geometry={decals.plane} material={decals.ao} position={[-0.02, -0.04, 0.002]} scale={[0.5, 0.46, 1]} />
          <mesh geometry={decals.plane} material={decals.chalk} position={[0, -0.02, 0.003]} scale={[0.62, 0.7, 1]} />
          <mesh geometry={it.g} material={it.m} scale={i === 0 ? 0.16 : 0.19} rotation={[0, 0, (i * 0.9) % 1.4 - 0.7]} castShadow />
          {/* zone de clic généreuse */}
          <mesh
            onClick={(e) => onHold(i, e)}
            onPointerOver={() => {
              if (i > 0) document.body.dataset.gameHover = '1';
            }}
            onPointerOut={() => {
              delete document.body.dataset.gameHover;
            }}
          >
            <sphereGeometry args={[0.24, 12, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
          {i === 0 ? (
            <mesh position={[0, -0.2, 0.004]} rotation={[0, 0, -0.08]}>
              <planeGeometry args={[0.16, 0.05]} />
              <meshStandardMaterial color="#F3EFE8" roughness={0.6} />
            </mesh>
          ) : (
            <sprite position={[0.25, 0.17, 0.06]} scale={[0.13, 0.13, 1]} material={i <= step ? badges[i].done : badges[i].todo} />
          )}
        </group>
      ))}
      <mesh ref={ring} material={ringMat}>
        <ringGeometry args={[0.92, 1, 48]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

const SEGMENTS = ['uaL', 'faL', 'uaR', 'faR', 'thL', 'shL', 'thR', 'shR'] as const;

function Climber({ targets, topped, shirt }: { targets: Targets; topped: boolean; shirt: string }) {
  const pose = useMemo(() => createPose(), []);
  const chest = useRef(new THREE.Vector3(0, 1.0, 0.3));
  const pelvis = useRef(new THREE.Vector3(0, 0.5, 0.26));
  const want = useMemo(() => ({ c: new THREE.Vector3(), p: new THREE.Vector3() }), []);
  const refs = useRef<Record<string, THREE.Object3D | null>>({});
  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: '#c9b49a', roughness: 0.7 }),
      chalk: new THREE.MeshStandardMaterial({ color: '#f3efe8', roughness: 0.95 }),
      pants: new THREE.MeshStandardMaterial({ color: '#465063', roughness: 0.85 }),
      shirt: new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.75 }),
      shoe: new THREE.MeshStandardMaterial({ color: '#141210', roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: '#2b211b', roughness: 0.9 }),
      bag: new THREE.MeshStandardMaterial({ color: '#E64980', roughness: 0.7 }),
    }),
    [shirt],
  );
  const geo = useMemo(
    () => ({
      limb: new THREE.CylinderGeometry(1, 1, 1, 12),
      joint: new THREE.SphereGeometry(1, 16, 12),
      torso: new THREE.CapsuleGeometry(0.118, 0.26, 6, 16),
      chest: new THREE.CapsuleGeometry(0.13, 0.12, 6, 16),
    }),
    [],
  );
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const mid = useMemo(() => new THREE.Vector3(), []);

  const place = (key: string, a: THREE.Vector3, b: THREE.Vector3, r: number) => {
    const o = refs.current[key];
    if (!o) return;
    dir.subVectors(b, a);
    const len = dir.length();
    mid.addVectors(a, b).multiplyScalar(0.5);
    o.position.copy(mid);
    o.quaternion.setFromUnitVectors(up, dir.normalize());
    o.scale.set(r, len, r);
  };
  const dot = (key: string, p: THREE.Vector3, r: number) => {
    const o = refs.current[key];
    if (!o) return;
    o.position.copy(p);
    o.scale.setScalar(r);
  };

  useFrame((state, dt) => {
    const breathe = Math.sin(state.clock.elapsedTime * 2.1) * 0.008;
    bodyFor(targets, want.c, want.p, breathe);
    if (topped) want.c.y += 0.06;
    chest.current.lerp(want.c, 1 - Math.exp(-dt * 6));
    pelvis.current.lerp(want.p, 1 - Math.exp(-dt * 5));
    // colonne rigide : le bassin reste à une longueur de buste de la poitrine
    dir.subVectors(pelvis.current, chest.current);
    if (dir.lengthSq() < 1e-6) dir.set(0, -1, 0);
    pelvis.current.copy(chest.current).addScaledVector(dir.normalize(), BODY.torso);
    solvePose(targets, chest.current, pelvis.current, pose, 0.6);

    place('uaL', pose.shoulderL, pose.elbowL, 0.047);
    place('faL', pose.elbowL, pose.handL, 0.04);
    place('uaR', pose.shoulderR, pose.elbowR, 0.047);
    place('faR', pose.elbowR, pose.handR, 0.04);
    place('thL', pose.hipL, pose.kneeL, 0.068);
    place('shL', pose.kneeL, pose.footL, 0.055);
    place('thR', pose.hipR, pose.kneeR, 0.068);
    place('shR', pose.kneeR, pose.footR, 0.055);
    for (const k of ['elbowL', 'elbowR'] as const) dot(k, pose[k], 0.046);
    for (const k of ['kneeL', 'kneeR'] as const) dot(k, pose[k], 0.064);
    for (const k of ['shoulderL', 'shoulderR'] as const) dot(k, pose[k], 0.062);
    dot('handL', pose.handL, 0.045);
    dot('handR', pose.handR, 0.045);
    dot('head', pose.head, 0.105);
    const hair = refs.current.hair;
    if (hair) {
      hair.position.copy(pose.head).add(new THREE.Vector3(0, 0.012, -0.012));
      hair.scale.setScalar(0.11);
    }
    const torso = refs.current.torso;
    dir.subVectors(pose.chest, pose.pelvis).normalize();
    if (torso) {
      mid.addVectors(pose.pelvis, pose.chest).multiplyScalar(0.5);
      torso.position.copy(mid);
      torso.quaternion.setFromUnitVectors(up, dir);
    }
    const chestM = refs.current.chestM;
    if (chestM) {
      chestM.position.copy(pose.chest).addScaledVector(dir, -0.08);
      chestM.quaternion.setFromUnitVectors(up, dir);
      chestM.rotateZ(Math.PI / 2);
      chestM.scale.set(1, 1.15, 0.85);
    }
    const hips = refs.current.hips;
    if (hips) {
      hips.position.copy(pose.pelvis);
      hips.scale.set(0.15, 0.1, 0.12);
    }
    const bag = refs.current.bag;
    if (bag) bag.position.copy(pose.pelvis).add(new THREE.Vector3(0.02, -0.02, 0.15));
    for (const side of ['L', 'R'] as const) {
      const s = refs.current[`shoe${side}`];
      const f = side === 'L' ? pose.footL : pose.footR;
      if (s) {
        s.position.copy(f).add(new THREE.Vector3(0, 0.01, 0.035));
      }
    }
  });

  const setters = useMemo(() => {
    const keys = [...SEGMENTS, 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'shoulderL', 'shoulderR', 'torso', 'chestM', 'hips', 'handL', 'handR', 'head', 'hair', 'bag', 'shoeL', 'shoeR'];
    return Object.fromEntries(keys.map((k) => [k, (el: THREE.Object3D | null) => void (refs.current[k] = el)])) as Record<string, (el: THREE.Object3D | null) => void>;
  }, []);
  const set = (k: string) => setters[k];

  return (
    <group>
      {SEGMENTS.map((k) => (
        <mesh key={k} ref={set(k)} geometry={geo.limb} material={k.startsWith('th') || k.startsWith('sh') ? mats.pants : mats.skin} castShadow />
      ))}
      {['elbowL', 'elbowR'].map((k) => (
        <mesh key={k} ref={set(k)} geometry={geo.joint} material={mats.skin} castShadow />
      ))}
      {['kneeL', 'kneeR'].map((k) => (
        <mesh key={k} ref={set(k)} geometry={geo.joint} material={mats.pants} castShadow />
      ))}
      {['shoulderL', 'shoulderR'].map((k) => (
        <mesh key={k} ref={set(k)} geometry={geo.joint} material={mats.shirt} castShadow />
      ))}
      <mesh ref={set('torso')} geometry={geo.torso} material={mats.shirt} castShadow />
      <mesh ref={set('chestM')} geometry={geo.chest} material={mats.shirt} castShadow />
      <mesh ref={set('hips')} geometry={geo.joint} material={mats.pants} castShadow />
      <mesh ref={set('handL')} geometry={geo.joint} material={mats.chalk} castShadow />
      <mesh ref={set('handR')} geometry={geo.joint} material={mats.chalk} castShadow />
      <mesh ref={set('head')} geometry={geo.joint} material={mats.skin} castShadow />
      <mesh ref={set('hair')} geometry={geo.joint} material={mats.hair} />
      <mesh ref={set('bag')} material={mats.bag} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.11, 16]} />
      </mesh>
      <mesh ref={set('shoeL')} material={mats.shoe} castShadow>
        <boxGeometry args={[0.07, 0.06, 0.15]} />
      </mesh>
      <mesh ref={set('shoeR')} material={mats.shoe} castShadow>
        <boxGeometry args={[0.07, 0.06, 0.15]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

interface WorldProps {
  onStep: (k: number) => void;
  onWrong: (expected: number) => void;
  onTop: () => void;
  stepCmd: { current: number };
  framing: 'side' | 'center';
}

function World({ onStep, onWrong, onTop, stepCmd, framing }: WorldProps) {
  const caps = useCapabilities();
  const [step, setStep] = useState(0);
  const [topped, setTopped] = useState(false);
  const [burstAt, setBurstAt] = useState<THREE.Vector3 | null>(null);
  const [showBottle, setShowBottle] = useState(false);
  const [shake, setShake] = useState({ i: -1, t: 0 });
  const clock = useThree((s) => s.clock);
  const targets = useMemo<Targets>(
    () => ({ handL: grip(0, -0.07), handR: grip(0, 0.07), footL: foot(0, 0), footR: foot(0, 1) }),
    [],
  );
  const tweens = useRef<Tween[]>([]);
  const busy = useRef(false);
  const spin = useRef(createSpin());
  const flavor = FLAVORS[0];
  const labelSrc = useBrandAsset(flavor.labelAsset);
  const logoSrc = useBrandAsset('logoOneLiving');
  const spot = useRef<THREE.SpotLight>(null);
  const camY = useRef(1.6);
  const bottleScale = useRef(0);
  const bottleGroup = useRef<THREE.Group>(null);

  const schedule = (target: THREE.Vector3, to: THREE.Vector3, delay: number, dur: number, lift: number) => {
    tweens.current.push({ target, to, from: null, start: clock.elapsedTime + delay, dur, lift });
  };

  const advance = (k: number) => {
    busy.current = true;
    playSfx('clack');
    const right = k % 2 === 1;
    const hand = right ? targets.handR : targets.handL;
    schedule(hand, grip(k, right ? 0.03 : -0.03), 0, 0.55, 0.22);
    schedule(targets.footL, foot(k, 0), 0.42, 0.38, 0.1);
    schedule(targets.footR, foot(k, 1), 0.66, 0.38, 0.1);
    if (k === GAME_HOLDS.length - 1) {
      const other = right ? targets.handL : targets.handR;
      schedule(other, grip(k, right ? -0.07 : 0.07), 0.62, 0.5, 0.2);
    }
    setStep(k);
    onStep(k);
    if (k === 2) void loadBurst();
    window.setTimeout(() => {
      busy.current = false;
      if (k === GAME_HOLDS.length - 1) {
        setTopped(true);
        playSfx('top');
        onTop();
        const p = GAME_HOLDS[k];
        window.setTimeout(() => {
          setBurstAt(new THREE.Vector3(p.x, p.y + 0.05, 0.1));
          playSfx('pschitt');
        }, 250);
        window.setTimeout(() => setShowBottle(true), 1100);
      }
    }, 1050);
  };

  const onHold = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (i === 0 || topped) return;
    if (busy.current) return;
    if (i === step + 1) advance(i);
    else if (i > step) {
      setShake({ i, t: clock.elapsedTime });
      onWrong(step + 1);
    }
  };

  // commande externe (boutons accessibles, mode vidéo)
  useFrame(() => {
    if (stepCmd.current > step && !busy.current && !topped) advance(step + 1);
  });

  useFrame((state, dt) => {
    const now = state.clock.elapsedTime;
    // tweens des membres
    tweens.current = tweens.current.filter((tw) => {
      if (now < tw.start) return true;
      if (!tw.from) tw.from = tw.target.clone();
      const t = Math.min(1, (now - tw.start) / tw.dur);
      arc(tw.from, tw.to, t, tw.lift, tw.target);
      return t < 1;
    });
    // caméra : suit le grimpeur
    const cam = state.camera as THREE.PerspectiveCamera;
    const chestY = (targets.handL.y + targets.handR.y) / 2 - 0.5;
    const nextY = GAME_HOLDS[Math.min(step + 1, GAME_HOLDS.length - 1)].y;
    // ordinateur : on suit le buste ; mobile : la prochaine prise reste en haut de l'écran
    const wantY = framing === 'side' ? (showBottle ? chestY + 0.15 : chestY) + 0.1 : topped ? chestY + 0.3 : nextY - 0.72;
    camY.current = THREE.MathUtils.damp(camY.current, wantY, 2.2, dt);
    const side = framing === 'side';
    const zoomOut = showBottle ? 0.9 : 0;
    if (side) {
      cam.position.set(-1.1, camY.current + 0.3, 5.1 + zoomOut);
      cam.lookAt(-0.55, camY.current, 0);
    } else {
      // mobile : les mains et la prise suivante dans le haut de l'écran, le texte en dessous
      const lookY = camY.current - 0.78;
      cam.position.set(0.15, lookY + 0.25, 7.2 + zoomOut);
      cam.lookAt(0.15, lookY, 0);
    }
    if (spot.current) {
      spot.current.position.set(-1.4, camY.current + 3.2, 3.2);
      spot.current.target.position.set(0.1, camY.current - 0.2, 0);
      spot.current.target.updateMatrixWorld();
    }
    // bouteille révélée
    const g = bottleGroup.current;
    if (g) {
      bottleScale.current = THREE.MathUtils.damp(bottleScale.current, showBottle ? 1 : 0, 3.2, dt);
      const k = bottleScale.current;
      g.scale.setScalar(Math.max(0.0001, k * (1 + Math.sin(now * 2) * 0.006)));
      const top = GAME_HOLDS[GAME_HOLDS.length - 1];
      g.position.set(top.x + (side ? 1.05 : 0.7), top.y - 1.05 + (1 - k) * -0.6 + Math.sin(now * 1.4) * 0.03, 1.05);
    }
  });

  return (
    <>
      <color attach="background" args={['#100e0c']} />
      <fog attach="fog" args={['#100e0c', 6, 13]} />
      <hemisphereLight args={['#fff1dd', '#1b1916', 0.45]} />
      <spotLight
        ref={spot}
        intensity={70}
        angle={0.7}
        penumbra={0.85}
        distance={12}
        color="#ffe9cc"
        castShadow={caps.tier === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-radius={3}
      />
      <directionalLight position={[3, 4, 3]} intensity={0.35} color="#c9d4ff" />
      <Wall />
      <HoldsLayer step={step} shake={shake} onHold={onHold} />
      <Climber targets={targets} topped={topped} shirt="#F2B705" />
      {burstAt && (
        <Suspense fallback={null}>
          <BubbleBurst origin={burstAt} count={caps.tier === 'high' ? 80 : 40} tint="#F6D88C" />
        </Suspense>
      )}
      <group ref={bottleGroup} scale={0.0001}>
        {(showBottle || topped) && (
          <Bottle flavor={flavor} spin={spin} quality={caps.tier} scale={3.4} labelSrc={labelSrc} logoSrc={logoSrc} fill={showBottle ? 1 : 0} />
        )}
      </group>
      <BottleSpin spin={spin} active={showBottle} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={3} color="#fff6ea" position={[-2.5, 3, 3]} scale={[0.6, 4, 1]} rotation={[0, Math.PI / 3, 0]} />
        <Lightformer intensity={2} color="#ffe2c2" position={[2.5, 2.5, 2]} scale={[0.4, 3, 1]} rotation={[0, -Math.PI / 3, 0]} />
        <Lightformer intensity={1.2} color="#ffffff" position={[0, 6, 2]} scale={[3, 1, 1]} rotation={[Math.PI / 2, 0, 0]} />
      </Environment>
    </>
  );
}

function BottleSpin({ spin, active }: { spin: { current: ReturnType<typeof createSpin> }; active: boolean }) {
  useFrame((_, dt) => {
    if (!active) return;
    const s = spin.current;
    s.vel = THREE.MathUtils.damp(s.vel, 0.6, 1, dt);
    s.rot += s.vel * dt;
  });
  useEffect(() => {
    if (active) spin.current.vel = 9;
  }, [active, spin]);
  return null;
}

/* ------------------------------------------------------------------ */

export interface GameApi {
  /** demande la prise suivante (accessibilité, mode vidéo) */
  next: () => void;
}

interface Props {
  className?: string;
  onStep: (k: number) => void;
  onWrong: (expected: number) => void;
  onTop: () => void;
  apiRef?: { current: GameApi | null };
  framing?: 'side' | 'center';
}

export default function GameScene({ className = '', onStep, onWrong, onTop, apiRef, framing = 'side' }: Props) {
  const caps = useCapabilities();
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const stepCmd = useRef(0);

  useEffect(() => {
    if (apiRef) apiRef.current = { next: () => (stepCmd.current += 1) };
  }, [apiRef]);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className}>
      <Canvas
        frameloop={onScreen ? 'always' : 'never'}
        dpr={[1, caps.tier === 'high' ? 1.6 : 1.25]}
        shadows={caps.tier === 'high' ? 'percentage' : false}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
        camera={{ fov: 36, position: [-0.9, 1.9, 4.5], near: 0.05, far: 40 }}
      >
        <World onStep={onStep} onWrong={onWrong} onTop={onTop} stepCmd={stepCmd} framing={framing} />
      </Canvas>
    </div>
  );
}
