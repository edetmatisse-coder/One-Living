import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Liquide : la surface découpe le volume dans le repère du monde        */
/* (elle reste horizontale quand la bouteille penche) et ondule.        */
/* Les faces arrière, vues à travers la découpe, dessinent le dessus.   */
/* ------------------------------------------------------------------ */

const LIQUID_VERT = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vView;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - w.xyz);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const LIQUID_FRAG = /* glsl */ `
  uniform float uFill;
  uniform float uBottom;
  uniform vec3 uCenter;
  uniform vec2 uTilt;
  uniform float uTime;
  uniform float uWave;
  uniform vec3 uColor;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec3 uLightDir;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vView;

  float surfaceAt(vec2 d) {
    float s = uFill + uTilt.x * d.x + uTilt.y * d.y;
    s += (sin(d.x * 26.0 + uTime * 3.1) * 0.6 + sin(d.y * 22.0 - uTime * 2.3) * 0.4 + sin((d.x + d.y) * 41.0 + uTime * 4.7) * 0.25) * 0.0042 * uWave;
    return s;
  }

  void main() {
    vec2 d = vWorld.xz - uCenter.xz;
    float surface = surfaceAt(d);
    if (vWorld.y > surface) discard;
    float h = max(0.0001, uFill - uBottom);
    float depth = clamp((surface - vWorld.y) / h, 0.0, 1.0);
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(vView);
    vec3 col;
    if (!gl_FrontFacing) {
      // dessus du liquide, vu à travers la découpe
      float fres = pow(1.0 - abs(dot(vec3(0.0, 1.0, 0.0), v)), 3.0);
      col = mix(uFoam * 0.82, uColor * 1.15, fres * 0.6);
    } else {
      float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
      float light = 0.55 + 0.45 * max(dot(n, normalize(uLightDir)), 0.0);
      col = mix(uColor, uDeep, smoothstep(0.05, 1.0, depth)) * light;
      // la lumière traverse le liquide : bord plus clair et saturé
      col += uColor * fres * 0.55;
      // ménisque juste sous la surface
      col = mix(col, uFoam, smoothstep(0.01, 0.0, surface - vWorld.y) * 0.55);
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function makeLiquidMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: LIQUID_VERT,
    fragmentShader: LIQUID_FRAG,
    side: THREE.DoubleSide,
    uniforms: {
      uFill: { value: 1.5 },
      uBottom: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uTilt: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uWave: { value: 0.2 },
      uColor: { value: new THREE.Color('#D9930F') },
      uDeep: { value: new THREE.Color('#7A4304') },
      uFoam: { value: new THREE.Color('#F6D88C') },
      uLightDir: { value: new THREE.Vector3(-0.6, 0.8, 0.5) },
    },
  });
}

/* ------------------------------------------------------------------ */
/* Bulles qui montent dans le liquide (instances animées par le GPU)    */
/* ------------------------------------------------------------------ */

const BUBBLE_VERT = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform float uTop;
  uniform float uBottom;
  uniform float uRadius;
  uniform float uSpeed;
  uniform float uSize;
  varying float vFres;
  varying float vFade;
  void main() {
    float h = max(0.001, uTop - uBottom);
    float speed = (0.1 + aSeed.z * 0.25) * uSpeed;
    float t = fract(aSeed.w + uTime * speed / h);
    float y = uBottom + t * h;
    float ang = aSeed.x * 6.2831 + sin(uTime * 1.1 + aSeed.w * 17.0) * 0.25;
    // le rayon disponible se resserre à l'épaule de la bouteille
    float rMax = mix(uRadius, uRadius * 0.42, smoothstep(0.112, 0.16, y));
    float r = sqrt(aSeed.y) * rMax;
    vec3 offset = vec3(cos(ang) * r + sin(uTime * 2.3 + aSeed.w * 31.0) * 0.0015 * uSpeed, y, sin(ang) * r);
    float s = (0.00045 + aSeed.y * 0.00085) * (0.6 + 0.4 * t) * uSize;
    vec4 w = modelMatrix * vec4(position * s + offset, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * normal);
    vec3 v = normalize(cameraPosition - w.xyz);
    vFres = pow(1.0 - max(dot(n, v), 0.0), 1.6);
    vFade = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.86, 1.0, t));
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const BUBBLE_FRAG = /* glsl */ `
  uniform vec3 uTint;
  uniform float uOpacity;
  varying float vFres;
  varying float vFade;
  void main() {
    float a = (0.1 + vFres * 0.85) * vFade * uOpacity;
    gl_FragColor = vec4(mix(uTint, vec3(1.0), 0.6 + vFres * 0.4), a);
  }
`;

export function makeBubbleMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: BUBBLE_VERT,
    fragmentShader: BUBBLE_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uTop: { value: 1.5 },
      uBottom: { value: 0.05 },
      uRadius: { value: 0.25 },
      uSpeed: { value: 1 },
      uSize: { value: 1 },
      uOpacity: { value: 1 },
      uTint: { value: new THREE.Color('#ffe7b0') },
    },
  });
}

/** Géométrie instanciée des bulles (graines aléatoires dans un attribut). */
export function makeBubbleGeometry(count: number, seed = 1) {
  const base = new THREE.IcosahedronGeometry(1, 1);
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  g.setAttribute('position', base.getAttribute('position'));
  g.setAttribute('normal', base.getAttribute('normal'));
  const seeds = new Float32Array(count * 4);
  let a = seed;
  const rnd = () => {
    a = (a * 16807) % 2147483647;
    return (a - 1) / 2147483646;
  };
  for (let i = 0; i < count * 4; i++) seeds[i] = rnd();
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  g.instanceCount = count;
  return g;
}

/* ------------------------------------------------------------------ */
/* Caustiques simulées projetées au sol, teintées par le liquide        */
/* ------------------------------------------------------------------ */

const CAUSTIC_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CAUSTIC_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uStrength;
  uniform vec2 uOffset;
  varying vec2 vUv;

  float web(vec2 p, float t) {
    float c = 0.0;
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      vec2 q = p * (2.2 + fk * 0.9) + vec2(sin(t * 0.37 + fk * 1.7), cos(t * 0.29 - fk));
      q += vec2(sin(q.y * 1.6 + t * 0.8), cos(q.x * 1.8 - t * 0.6)) * 0.75;
      float v = abs(sin(q.x) * sin(q.y));
      c += pow(1.0 - v, 7.0) * (0.65 - fk * 0.16);
    }
    return c;
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0 - uOffset;
    // tache allongée, du côté opposé à la lumière
    float mask = 1.0 - smoothstep(0.05, 0.85, length(p * vec2(1.0, 1.45)));
    mask *= mask;
    float c = web(p * 3.4, uTime) * mask;
    float core = (1.0 - smoothstep(0.0, 0.5, length(p * vec2(1.1, 1.8)))) * 0.45;
    vec3 col = uColor * (c * 1.05 + core) * uStrength;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function makeCausticMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: CAUSTIC_VERT,
    fragmentShader: CAUSTIC_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#D9930F') },
      uStrength: { value: 0.9 },
      uOffset: { value: new THREE.Vector2(-0.25, -0.15) },
    },
  });
}

/** Lueur chaude derrière la bouteille : le verre réfracte une vraie source. */
export function makeGlowTexture(color = '255,214,160') {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${color},0.55)`);
  g.addColorStop(0.4, `rgba(${color},0.18)`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Ombre de contact douce sous la bouteille. */
export function makeShadowTexture() {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.35, 'rgba(0,0,0,0.45)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}
