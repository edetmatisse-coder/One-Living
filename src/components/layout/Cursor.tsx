'use client';

import { useEffect, useRef, useState } from 'react';
import { useCapabilities } from '@/lib/device';
import { useUI } from '@/store/ui';

const INTERACTIVE =
  'a, button, [role="button"], [role="slider"], [role="tab"], [role="switch"], input[type="range"], input[type="checkbox"], label, select, summary, [data-cursor]';
const TEXT_INPUT = 'input[type="text"], input[type="email"], input[type="number"], textarea';

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  r: number;
}

/**
 * Curseur en forme de petite prise. Le trou de vis est le point chaud.
 * Il grossit sur les éléments cliquables et laisse une trace de magnésie.
 */
export function Cursor() {
  const caps = useCapabilities();
  const enabled = caps.ready && !caps.touch && !caps.reducedMotion;
  const posRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const activeColor = useUI((s) => s.activeColor);
  const [hoverColor, setHoverColor] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.dataset.cursor = 'on';

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    const last = { ...target };
    const puffs: Puff[] = [];
    let raf = 0;
    let visible = false;

    const spawn = (x: number, y: number, n: number, spread: number, speed: number) => {
      for (let i = 0; i < n; i++) {
        if (puffs.length > 220) puffs.shift();
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * speed;
        puffs.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 0.05,
          life: 1,
          decay: 0.012 + Math.random() * 0.02,
          r: 0.6 + Math.random() * 1.8,
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = target.x;
        pos.y = target.y;
        last.x = target.x;
        last.y = target.y;
        setHidden(false);
      }
      const d = Math.hypot(target.x - last.x, target.y - last.y);
      if (d > 6) {
        spawn(target.x, target.y, Math.min(4, Math.floor(d / 8)), 6, 0.35);
        last.x = target.x;
        last.y = target.y;
      }
    };
    const onDown = () => {
      setPressed(true);
      spawn(target.x, target.y, 26, 10, 1.6);
    };
    const onUp = () => setPressed(false);
    const onLeave = () => {
      visible = false;
      setHidden(true);
    };
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (!el || !el.closest) return;
      if (el.closest(TEXT_INPUT)) {
        setHidden(true);
        return;
      }
      if (visible) setHidden(false);
      const hit = el.closest(INTERACTIVE) as HTMLElement | null;
      setHover(!!hit);
      setLabel(hit?.dataset.cursorLabel ?? null);
      if (hit) {
        const c = getComputedStyle(hit).getPropertyValue('--route').trim();
        setHoverColor(c || null);
      } else {
        setHoverColor(null);
      }
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.28;
      pos.y += (target.y - pos.y) * 0.28;
      if (posRef.current) {
        posRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      if (puffs.length) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy = p.vy * 0.94 + 0.012; // la magnésie retombe doucement
          p.life -= p.decay;
          if (p.life <= 0) {
            puffs.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = p.life * 0.55;
          ctx.fillStyle = '#F3EFE8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (1.4 - p.life * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
        if (!puffs.length) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      delete root.dataset.cursor;
    };
  }, [enabled]);

  if (!enabled) return null;
  const color = hoverColor || activeColor;

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[95]" />
      <div
        ref={posRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[96]"
        style={{ opacity: hidden ? 0 : 1, transition: 'opacity .25s' }}
      >
        <div
          className="relative"
          style={{
            transform: `translate(-50%, -50%) scale(${pressed ? 0.82 : hover ? 2.1 : 1})`,
            transition: 'transform .35s cubic-bezier(.2,.8,.1,1)',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 40 40" style={{ overflow: 'visible' }}>
            <path
              d="M7.5 24.2C5.6 16.1 11.6 7.6 20.8 7.6c9.1 0 14.6 6.1 13.6 13.4-.5 3.8-3 6-6 6-3.1 0-4.2-2.7-8-2.7-3.9 0-5.1 4.6-9 4.6-2.2 0-3.4-1.6-3.9-4.7z"
              fill={hover ? 'rgba(20,18,16,0.08)' : '#F3EFE8'}
              stroke={hover ? color : 'rgba(15,14,12,.55)'}
              strokeWidth={hover ? 1.6 : 1.2}
              style={{ transition: 'fill .3s, stroke .3s' }}
            />
            <circle cx="20" cy="17" r={hover ? 1.4 : 2.6} fill={hover ? color : '#141210'} style={{ transition: 'r .3s' }} />
          </svg>
        </div>
        {label && (
          <span
            className="label-mono absolute left-6 top-5 whitespace-nowrap rounded-[3px] bg-chalk px-2 py-1 text-ply-900"
            style={{ boxShadow: `inset 3px 0 0 ${color}` }}
          >
            {label}
          </span>
        )}
      </div>
    </>
  );
}
