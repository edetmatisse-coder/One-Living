import * as THREE from 'three';

/* Décor du présentoir : caustiques colorées au sol, lueur chaude derrière le produit, ombre de contact. */

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
