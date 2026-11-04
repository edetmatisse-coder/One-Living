'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ComponentProps, type CSSProperties } from 'react';
import { useUI } from '@/store/ui';
import { readCapabilities } from '@/lib/device';
import { getLenis, scrollToY } from '@/lib/scroll';
import { Hold, type HoldKind } from '@/components/ui/Hold';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pendingPush: ((href: string) => void) | null = null;

function norm(p: string) {
  return p.replace(/\/+$/, '') || '/';
}

interface TLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  /** Texte affiché sur la paroi pendant la transition. */
  label: string;
  sub?: string;
  color?: string;
}

/**
 * Lien entre le Dossier et la Campagne : la paroi pivote pour couvrir
 * l'écran, la page change derrière, puis la paroi pivote pour révéler.
 */
export function TransitionLink({ href, label, sub = '', color = '#F2B705', children, onNavigate, ...rest }: TLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        onNavigate?.(e);
        if (norm(href) === norm(pathname)) {
          e.preventDefault();
          scrollToY(0, { duration: 1.6 });
          return;
        }
        if (readCapabilities().reducedMotion) return;
        const st = useUI.getState();
        if (st.transition.phase !== 'idle') {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        pendingPush = (h) => router.push(h, { scroll: false });
        st.setTransition({ phase: 'cover', to: href, label, sub, color });
      }}
    >
      {children}
    </Link>
  );
}

const PANEL_HOLDS: { kind: HoldKind; x: number; y: number; s: number; r: number; c: string }[] = [
  { kind: 'jug', x: 12, y: 72, s: 120, r: -18, c: '#F2B705' },
  { kind: 'crimp', x: 78, y: 18, s: 96, r: 12, c: '#E64980' },
  { kind: 'sloper', x: 70, y: 76, s: 150, r: 4, c: '#5C7CFA' },
  { kind: 'pinch', x: 26, y: 16, s: 84, r: 30, c: '#FD7E14' },
  { kind: 'pocket', x: 88, y: 52, s: 70, r: -8, c: '#F2B705' },
  { kind: 'jug', x: 46, y: 88, s: 64, r: 160, c: '#E64980' },
];

const EASE_IN = 'cubic-bezier(0.7, 0, 0.2, 1)';
const EASE_OUT = 'cubic-bezier(0.65, 0, 0.25, 1)';

/**
 * Animations jouées par le compositeur (Web Animations API) : elles restent
 * fluides même quand le fil principal monte la nouvelle page.
 */
export function PageTransition() {
  const phase = useUI((s) => s.transition.phase);
  const to = useUI((s) => s.transition.to);
  const label = useUI((s) => s.transition.label);
  const sub = useUI((s) => s.transition.sub);
  const color = useUI((s) => s.transition.color);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. La paroi pivote (charnière à gauche) pour couvrir l'écran
  useEffect(() => {
    if (phase !== 'cover') return;
    const panel = panelRef.current;
    const shade = shadeRef.current;
    if (!panel || !shade) return;
    panel.style.transformOrigin = '0% 50%';
    const a = panel.animate([{ transform: 'rotateY(96deg)' }, { transform: 'rotateY(0deg)' }], {
      duration: 780,
      easing: EASE_IN,
      fill: 'forwards',
    });
    const b = shade.animate([{ opacity: 0.92 }, { opacity: 0 }], { duration: 780, easing: EASE_IN, fill: 'forwards' });
    let done = false;
    a.onfinish = () => {
      done = true;
      useUI.getState().setTransition({ phase: 'hold' });
      getLenis()?.stop();
      pendingPush?.(to ?? '/');
      timeout.current = setTimeout(() => useUI.getState().setTransition({ phase: 'reveal' }), 6000);
    };
    return () => {
      if (!done) {
        a.cancel();
        b.cancel();
      }
    };
  }, [phase, to]);

  // 2. La nouvelle page est montée : retour en haut, puis révélation
  useEffect(() => {
    if (phase !== 'hold' || !to) return;
    if (norm(pathname) !== norm(to)) return;
    if (timeout.current) clearTimeout(timeout.current);
    let r1 = 0;
    let r2 = 0;
    const t = setTimeout(() => {
      const lenis = getLenis();
      lenis?.start();
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
      lenis?.resize();
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          useUI.getState().setTransition({ phase: 'reveal' });
        });
      });
    }, 160);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [phase, pathname, to]);

  // 3. La paroi pivote (charnière à droite) et s'éloigne
  useEffect(() => {
    if (phase !== 'reveal') return;
    getLenis()?.start();
    const panel = panelRef.current;
    const shade = shadeRef.current;
    if (!panel || !shade) return;
    panel.style.transformOrigin = '100% 50%';
    const a = panel.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-96deg)' }], {
      duration: 1000,
      easing: EASE_OUT,
      fill: 'forwards',
    });
    shade.animate([{ opacity: 0 }, { opacity: 0.92 }], { duration: 1000, easing: EASE_OUT, fill: 'forwards' });
    a.onfinish = () => useUI.getState().setTransition({ phase: 'idle', to: null });
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[85]" style={{ perspective: '1600px', perspectiveOrigin: '50% 45%' }} aria-live="polite">
      <div
        ref={panelRef}
        className="plywood absolute inset-0 overflow-hidden"
        style={{ transform: 'rotateY(96deg)', transformOrigin: '0% 50%', backfaceVisibility: 'hidden', '--route': color } as CSSProperties}
      >
        <div aria-hidden className="absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,.65)]" />
        {PANEL_HOLDS.map((h, i) => (
          <Hold
            key={i}
            kind={h.kind}
            color={h.c}
            size={h.s}
            className="absolute"
            style={{ left: `${h.x}%`, top: `${h.y}%`, transform: `translate(-50%,-50%) rotate(${h.r}deg)`, filter: 'drop-shadow(0 18px 22px rgba(0,0,0,.55))' }}
          />
        ))}
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <div className="label-mono mb-5 text-dust">{sub}</div>
            <div className="font-display text-[clamp(64px,14vw,240px)] text-chalk" style={{ textShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
              {label}
            </div>
            <div className="mx-auto mt-6 h-1.5 w-24 rounded-full" style={{ background: color }} />
          </div>
        </div>
        <div ref={shadeRef} aria-hidden className="absolute inset-0 bg-black" style={{ opacity: 0.92 }} />
      </div>
    </div>
  );
}
