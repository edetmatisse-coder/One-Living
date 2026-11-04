import * as THREE from 'three';
import { rng } from '@/lib/three/noise';

/**
 * Textures procédurales de la paroi, dessinées sur canvas au chargement.
 * Une tuile = une plaque de contreplaqué de 1,22 × 2,44 m, peinte en noir,
 * avec le fil du bois qui transparaît et une grille de 6 × 12 inserts.
 */
export const SHEET_W = 1.22;
export const SHEET_H = 2.44;
export const INSERT_COLS = 6;
export const INSERT_ROWS = 12;

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function grainLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  colors: string[],
  count: number,
  alpha: [number, number],
) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x0 = r() * w;
    const amp = 2 + r() * 14;
    const freq = 0.6 + r() * 2.2;
    const phase = r() * Math.PI * 2;
    ctx.globalAlpha = alpha[0] + r() * (alpha[1] - alpha[0]);
    ctx.strokeStyle = colors[Math.floor(r() * colors.length)];
    ctx.lineWidth = 0.6 + r() * (w / 380);
    ctx.beginPath();
    for (let y = -10; y <= h + 10; y += 12) {
      const t = y / h;
      const x = x0 + Math.sin(t * Math.PI * 2 * freq + phase) * amp + Math.sin(t * 31 + phase) * amp * 0.12;
      if (y < 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, strength: number) {
  const r = rng(seed);
  const tile = canvas(256, 256);
  const tctx = tile.getContext('2d')!;
  const img = tctx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 255 * strength;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = ctx.createPattern(tile, 'repeat')!;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export interface WallTextures {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  orm: THREE.CanvasTexture;
}

/** Couleur, relief et rugosité/métal de la plaque. */
export function createWallTextures(quality: 'high' | 'low', maxAnisotropy = 8): WallTextures {
  const W = quality === 'high' ? 1024 : 512;
  const H = W * 2;
  const px = W / SHEET_W; // pixels par mètre

  // ---- Couleur
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#2a2622';
  ctx.fillRect(0, 0, W, H);
  // nuances larges de la peinture
  const r = rng(11);
  for (let i = 0; i < 18; i++) {
    const g = ctx.createRadialGradient(r() * W, r() * H, 0, r() * W, r() * H, W * (0.3 + r() * 0.6));
    g.addColorStop(0, `rgba(${r() > 0.5 ? '60,52,44' : '14,12,10'},0.18)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  grainLines(ctx, W, H, 3, ['#3d362e', '#191613', '#46403a'], quality === 'high' ? 420 : 220, [0.05, 0.16]);
  speckle(ctx, W, H, 5, 0.22);

  // joints de plaque
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, 3);
  ctx.fillRect(0, 0, 3, H);
  ctx.fillStyle = 'rgba(255,240,220,0.06)';
  ctx.fillRect(0, 3, W, 2);
  ctx.fillRect(3, 0, 2, H);

  // ---- Relief (bump) et rugosité / métal (G = rugosité, B = métal)
  const b = canvas(W, H);
  const bctx = b.getContext('2d')!;
  bctx.fillStyle = 'rgb(128,128,128)';
  bctx.fillRect(0, 0, W, H);
  grainLines(bctx, W, H, 3, ['#909090', '#707070'], quality === 'high' ? 300 : 160, [0.08, 0.2]);
  bctx.fillStyle = 'rgb(40,40,40)';
  bctx.fillRect(0, 0, W, 3);
  bctx.fillRect(0, 0, 3, H);

  const o = canvas(W, H);
  const octx = o.getContext('2d')!;
  octx.fillStyle = 'rgb(255,204,0)'; // rugosité 0,8 ; métal 0
  octx.fillRect(0, 0, W, H);

  // inserts (T-nuts) : collerette métallique et trou fileté
  const dx = W / INSERT_COLS;
  const dy = H / INSERT_ROWS;
  const flange = 0.0125 * px;
  const hole = 0.0052 * px;
  for (let iy = 0; iy < INSERT_ROWS; iy++) {
    for (let ix = 0; ix < INSERT_COLS; ix++) {
      const x = (ix + 0.5) * dx;
      const y = (iy + 0.5) * dy;
      // couleur
      const fg = ctx.createRadialGradient(x - flange * 0.3, y - flange * 0.3, 0, x, y, flange);
      fg.addColorStop(0, '#7d766c');
      fg.addColorStop(0.7, '#514b44');
      fg.addColorStop(1, '#24201c');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(x, y, flange, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#060505';
      ctx.beginPath();
      ctx.arc(x, y, hole, 0, Math.PI * 2);
      ctx.fill();
      // relief
      bctx.fillStyle = 'rgb(176,176,176)';
      bctx.beginPath();
      bctx.arc(x, y, flange, 0, Math.PI * 2);
      bctx.fill();
      bctx.fillStyle = 'rgb(0,0,0)';
      bctx.beginPath();
      bctx.arc(x, y, hole, 0, Math.PI * 2);
      bctx.fill();
      // métal
      octx.fillStyle = 'rgb(255,90,255)';
      octx.beginPath();
      octx.arc(x, y, flange, 0, Math.PI * 2);
      octx.fill();
      octx.fillStyle = 'rgb(255,250,0)';
      octx.beginPath();
      octx.arc(x, y, hole, 0, Math.PI * 2);
      octx.fill();
    }
  }

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(b);
  const orm = new THREE.CanvasTexture(o);
  for (const t of [map, bump, orm]) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = Math.min(8, maxAnisotropy);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.needsUpdate = true;
  }
  return { map, bump, orm };
}

/** Halo de magnésie autour des prises (alpha), avec une ombre de contact au centre. */
export function createChalkTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, S, S);
  const r = rng(21);
  // nuage de magnésie, dense au centre, diffus sur les bords
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 0.9) * S * 0.3;
    const x = S / 2 + Math.cos(a) * d;
    const y = S / 2 + Math.sin(a) * d * 0.75 - S * 0.05;
    const rad = 10 + r() * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const al = 0.018 + r() * 0.04;
    g.addColorStop(0, `rgba(243,239,232,${al})`);
    g.addColorStop(1, 'rgba(243,239,232,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  // traces de doigts, très douces
  ctx.filter = 'blur(3px)';
  for (let i = 0; i < 6; i++) {
    const x = S / 2 + (r() - 0.5) * S * 0.34;
    const y = S / 2 + (r() - 0.4) * S * 0.16;
    ctx.strokeStyle = `rgba(243,239,232,${0.03 + r() * 0.04})`;
    ctx.lineWidth = 6 + r() * 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 10, y + 14 + r() * 26);
    ctx.stroke();
  }
  ctx.filter = 'none';
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Ombre de contact douce sous une prise (occlusion ambiante simulée). */
export function createAOTexture(): THREE.CanvasTexture {
  const S = 128;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.78)');
  g.addColorStop(0.42, 'rgba(0,0,0,0.5)');
  g.addColorStop(0.7, 'rgba(0,0,0,0.16)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

/** Disque doux pour les particules (magnésie, bulles). */
export function createSoftDot(): THREE.CanvasTexture {
  const S = 64;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}
