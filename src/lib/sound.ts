'use client';

/**
 * Sons générés en direct (WebAudio), sans aucun fichier : l'ambiance feutrée
 * d'une salle de bloc et les bruitages. Tout est coupé par défaut ; le bouton
 * « Son » de l'en-tête l'active (un geste est nécessaire pour le navigateur).
 */
export type Sfx = 'pschitt' | 'fizz' | 'clack' | 'pop' | 'whoosh' | 'top';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
let noiseBuf: AudioBuffer | null = null;
let ambientStop: (() => void) | null = null;

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    // bruit blanc réutilisable (2 s)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noise(c: AudioContext, loop = false) {
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = loop;
  return src;
}

function startAmbient() {
  const c = ensure();
  if (!c || !master || ambientStop) return;
  const out = c.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(1, c.currentTime + 2.5);
  out.connect(master);

  // air de la salle : bruit très filtré
  const room = noise(c, true);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 320;
  const roomGain = c.createGain();
  roomGain.gain.value = 0.07;
  room.connect(lp).connect(roomGain).connect(out);
  room.start();

  // ventilation lointaine
  const vent = noise(c, true);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 900;
  bp.Q.value = 0.6;
  const ventGain = c.createGain();
  ventGain.gain.value = 0.012;
  vent.connect(bp).connect(ventGain).connect(out);
  vent.start();

  // prises qu'on attrape, réceptions sur les tapis, au loin
  let timer = 0;
  const schedule = () => {
    timer = window.setTimeout(() => {
      if (!ctx) return;
      if (Math.random() < 0.7) clack(c, out, 0.018 + Math.random() * 0.02, Math.random() * 1.6 - 0.8);
      else thud(c, out, 0.05);
      schedule();
    }, 1400 + Math.random() * 4200);
  };
  schedule();

  ambientStop = () => {
    window.clearTimeout(timer);
    const t = c.currentTime;
    out.gain.cancelScheduledValues(t);
    out.gain.setValueAtTime(out.gain.value, t);
    out.gain.linearRampToValueAtTime(0, t + 0.6);
    window.setTimeout(() => {
      room.stop();
      vent.stop();
      out.disconnect();
    }, 700);
    ambientStop = null;
  };
}

function clack(c: AudioContext, dest: AudioNode, gain: number, pan = 0) {
  const t = c.currentTime;
  const src = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1500 + Math.random() * 900;
  bp.Q.value = 3;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  const p = c.createStereoPanner();
  p.pan.value = pan;
  src.connect(bp).connect(g).connect(p).connect(dest);
  src.start(t);
  src.stop(t + 0.1);
}

function thud(c: AudioContext, dest: AudioNode, gain: number) {
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(78, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.28);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + 0.4);
}

function blip(c: AudioContext, dest: AudioNode, when: number, freq: number, gain: number) {
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, when);
  o.frequency.exponentialRampToValueAtTime(freq * 1.6, when + 0.05);
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
  o.connect(g).connect(dest);
  o.start(when);
  o.stop(when + 0.08);
}

/** Ouverture de bouteille : petit « pop » puis souffle qui s'éteint, puis pétillement. */
function pschitt(c: AudioContext, dest: AudioNode, scale = 1) {
  const t = c.currentTime;
  blip(c, dest, t, 170, 0.08 * scale);
  const src = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(6500, t);
  bp.frequency.exponentialRampToValueAtTime(2400, t + 0.45 * scale);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.16 * scale, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55 * scale);
  src.connect(bp).connect(g).connect(dest);
  src.start(t);
  src.stop(t + 0.7);
  const n = Math.round(18 * scale);
  for (let i = 0; i < n; i++) blip(c, dest, t + 0.25 + Math.random() * 0.9 * scale, 1800 + Math.random() * 2600, 0.012 + Math.random() * 0.012);
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on) {
    ensure();
    startAmbient();
  } else {
    ambientStop?.();
  }
}

export function isSoundEnabled() {
  return enabled;
}

export function playSfx(name: Sfx) {
  if (!enabled) return;
  const c = ensure();
  if (!c || !master) return;
  switch (name) {
    case 'pschitt':
      pschitt(c, master, 1);
      break;
    case 'fizz':
      pschitt(c, master, 0.55);
      break;
    case 'clack':
      clack(c, master, 0.09, 0);
      break;
    case 'pop':
      blip(c, master, c.currentTime, 700 + Math.random() * 900, 0.03);
      break;
    case 'whoosh': {
      const t = c.currentTime;
      const src = noise(c);
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 0.7;
      bp.frequency.setValueAtTime(300, t);
      bp.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.25);
      g.gain.linearRampToValueAtTime(0, t + 0.7);
      src.connect(bp).connect(g).connect(master);
      src.start(t);
      src.stop(t + 0.8);
      break;
    }
    case 'top':
      [660, 880, 1320].forEach((f, i) => blip(c, master!, c.currentTime + i * 0.09, f, 0.05));
      break;
  }
}
