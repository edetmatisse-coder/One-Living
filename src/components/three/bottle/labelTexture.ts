import * as THREE from 'three';
import type { Flavor } from '@/data/campagne';
import { ROUTE_COLORS } from '@/data/routes';

/**
 * Étiquette de la bouteille 3D, dessinée sur canvas avec les polices du site.
 * Si un visuel d'étiquette est fourni (public/brand/etiquette-*.png), il est
 * utilisé tel quel ; sinon on compose une étiquette propre, avec le logo
 * One Living s'il existe, ou son nom en toutes lettres.
 */

function cssFont(variable: string, fallback: string) {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function createLabelTexture(
  flavor: Flavor,
  opts: { labelSrc?: string | null; logoSrc?: string | null; anisotropy?: number } = {},
): Promise<THREE.CanvasTexture> {
  const W = 2048;
  const H = 820;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  const label = opts.labelSrc ? await loadImage(opts.labelSrc) : null;
  if (label) {
    ctx.drawImage(label, 0, 0, W, H);
  } else {
    const display = cssFont('--font-big-shoulders', 'Impact');
    const sans = cssFont('--font-instrument', 'sans-serif');
    const mono = cssFont('--font-jetbrains', 'monospace');
    try {
      await Promise.all([
        document.fonts.load(`900 120px ${display}`),
        document.fonts.load(`600 40px ${sans}`),
        document.fonts.load(`500 30px ${mono}`),
      ]);
    } catch {
      // polices système en secours
    }
    const route = ROUTE_COLORS[flavor.route];

    // papier
    ctx.fillStyle = '#F3EFE8';
    ctx.fillRect(0, 0, W, H);
    // fibres du papier
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(120,100,80,${Math.random() * 0.035})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 1);
    }
    // bande de couleur de voie (face avant, au centre de l'image)
    const cx = W * 0.5;
    ctx.fillStyle = route;
    ctx.fillRect(cx - 392, 0, 26, H);
    ctx.fillRect(cx + 366, 0, 26, H);

    // logo ou nom de la marque
    const logo = opts.logoSrc ? await loadImage(opts.logoSrc) : null;
    ctx.textAlign = 'center';
    if (logo) {
      const lh = 120;
      const lw = (logo.width / logo.height) * lh;
      ctx.drawImage(logo, cx - lw / 2, 70, lw, lh);
    } else {
      ctx.fillStyle = '#141210';
      ctx.font = `900 104px ${display}`;
      ctx.fillText('ONE LIVING', cx, 168);
    }
    // filet
    ctx.fillStyle = '#141210';
    ctx.fillRect(cx - 300, 218, 600, 4);

    ctx.font = `500 34px ${mono}`;
    ctx.fillStyle = '#5d564d';
    ctx.fillText('K O M B U C H A', cx, 300);

    // parfum
    ctx.fillStyle = '#141210';
    const name = flavor.name.toUpperCase();
    let size = 150;
    ctx.font = `900 ${size}px ${display}`;
    while (ctx.measureText(name).width > 640 && size > 70) {
      size -= 6;
      ctx.font = `900 ${size}px ${display}`;
    }
    ctx.fillText(name, cx, 470);

    // prise stylisée
    ctx.save();
    ctx.translate(cx, 560);
    ctx.scale(2.2, 2.2);
    ctx.translate(-20, -20);
    ctx.fillStyle = route;
    ctx.fill(new Path2D('M7.5 24.2C5.6 16.1 11.6 7.6 20.8 7.6c9.1 0 14.6 6.1 13.6 13.4-.5 3.8-3 6-6 6-3.1 0-4.2-2.7-8-2.7-3.9 0-5.1 4.6-9 4.6-2.2 0-3.4-1.6-3.9-4.7z'));
    ctx.fillStyle = '#141210';
    ctx.beginPath();
    ctx.arc(20, 16, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.font = `600 34px ${sans}`;
    ctx.fillStyle = '#25221e';
    ctx.fillText('Bio · Vivant · Non pasteurisé', cx, 690);
    ctx.font = `500 30px ${mono}`;
    ctx.fillStyle = '#5d564d';
    ctx.fillText('33 CL · À BOIRE FRAIS', cx, 750);

    // dos de l'étiquette : texte discret
    ctx.textAlign = 'left';
    ctx.font = `500 24px ${mono}`;
    ctx.fillStyle = '#7d776f';
    const back = ['APRÈS LA VOIE', 'SCANNE LE QR CODE', 'VOIE DU MOIS'];
    back.forEach((t, i) => ctx.fillText(t, 150, 320 + i * 44));
    ctx.textAlign = 'right';
    ctx.fillText('MAQUETTE ÉTUDIANTE', W - 150, 320);
    ctx.fillText('WIN SPORT SCHOOL', W - 150, 364);
    // faux QR au dos
    ctx.fillStyle = '#141210';
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if ((x * 7 + y * 13 + x * y) % 3 === 0 || x === 0 || y === 0 || x === 8 || y === 8) ctx.fillRect(W - 330 + x * 18, 430 + y * 18, 16, 16);
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = opts.anisotropy ?? 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}
