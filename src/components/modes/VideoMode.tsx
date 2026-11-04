'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUI } from '@/store/ui';
import { useEco, useMatrix, useSim } from '@/store/tools';
import { getLenis } from '@/lib/scroll';
import { IconClose, IconPause, IconPlay } from '@/components/ui/Icons';

/** Durée totale du déroulé, en secondes : 3 minutes exactement. */
export const VIDEO_DURATION = 180;

const fmt = (t: number) => {
  const s = Math.max(0, Math.min(VIDEO_DURATION, Math.floor(t)));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function scrollTop(el: Element | null) {
  if (!el) return 0;
  return el.getBoundingClientRect().top + window.scrollY;
}

function setScroll(y: number) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/**
 * Le script du déroulé : où se trouve la page à chaque instant, et ce que
 * font les outils. Les positions sont mesurées au lancement.
 */
function buildTimeline(onEnd: () => void) {
  const vh = window.innerHeight;
  const sec = (id: string) => document.getElementById(id);
  const head = (id: string) => scrollTop(sec(id));
  const body = (id: string, dy = 0) => scrollTop(sec(id)?.querySelector('[data-section-body]') ?? null) - 40 + dy;
  const part = (id: string, k: number) => {
    const p = sec(id)?.querySelectorAll('[data-part]')[k] ?? null;
    return scrollTop(p) - 110;
  };
  const marqueSpacer = sec('marque')?.querySelector('.pin-spacer') as HTMLElement | null;
  const marqueEnd = marqueSpacer ? scrollTop(marqueSpacer) + marqueSpacer.offsetHeight - vh : body('marque', vh);

  const proxy = { y: window.scrollY };
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const to = (y: number, at: number, dur: number, ease = 'power2.inOut') =>
    tl.to(proxy, { y, duration: dur, ease, onUpdate: () => setScroll(proxy.y) }, at);
  const matrix = useMatrix.getState();
  const sim = useSim.getState();
  const eco = useEco.getState();

  // 0 – 9 s : le départ (titre, 69 %)
  tl.set(proxy, { y: 0, onComplete: () => setScroll(0) }, 0);
  // 9 – 22 s : le problème
  to(head('probleme'), 9, 4);
  to(body('probleme', 260), 13, 9, 'none');
  // 22 – 40 s : la marque, frise horizontale
  to(head('marque'), 22, 4);
  to(marqueEnd, 26, 14, 'none');
  // 40 – 52 s : le marché
  to(head('marche'), 40, 4);
  to(body('marche', 120), 44, 8, 'power1.inOut');
  // 52 – 84 s : la matrice, manipulée
  to(head('matrice'), 52, 4);
  to(body('matrice'), 56, 3);
  tl.call(() => matrix.applyScenario('egal', 900), [], 60);
  tl.call(() => matrix.applyScenario('volume', 900), [], 64.5);
  tl.call(() => matrix.applyScenario('recit', 900), [], 69);
  tl.call(() => matrix.applyScenario('acces', 900), [], 73.5);
  tl.call(() => matrix.animateWeights([50, 20, 20, 15, 10, 10], 2200, null), [], 78);
  tl.call(() => matrix.applyScenario('nos-poids', 1200), [], 81.5);
  // 84 – 106 s : l'escalade, puis la note économique et le potentiel national
  to(head('escalade'), 84, 4);
  to(part('escalade', 0), 88, 3);
  to(part('escalade', 1), 94, 3);
  ['egal', 'volume', 'rentabilite', 'national', 'nos-poids'].forEach((id, i) => tl.call(() => eco.setSetId(id), [], 97.5 + i * 1.4));
  to(part('escalade', 2), 104, 2);
  // 106 – 136 s : le simulateur, manipulé
  to(head('simulateur'), 106, 4);
  to(body('simulateur'), 110, 3);
  tl.call(() => sim.applyPreset('salle-type', 600), [], 113);
  tl.call(() => sim.animateField('passages', 240, 2200), [], 119);
  tl.call(() => sim.applyPreset('salle-type', 1200), [], 123);
  tl.call(() => sim.applyPreset('prudent', 1400), [], 126);
  tl.call(() => sim.applyPreset('grande', 1400), [], 131);
  tl.call(() => sim.applyPreset('salle-type', 1200), [], 134);
  // 136 – 150 s : les 3 moments et les mots de la campagne
  to(head('moments'), 136, 4);
  to(part('moments', 0), 140, 3);
  to(part('moments', 1), 146, 3);
  // 150 – 160 s : le POC
  to(head('poc'), 150, 3);
  to(body('poc'), 153, 3);
  // 160 – 170 s : les indicateurs
  to(head('indicateurs'), 160, 3);
  to(body('indicateurs'), 163, 3);
  // 170 – 180 s : sources, fin
  to(head('sources'), 170, 3);
  to(body('sources'), 173, 3);
  // la timeline dure exactement VIDEO_DURATION ; la fin déclenche onComplete
  tl.set({}, {}, VIDEO_DURATION);
  tl.eventCallback('onComplete', onEnd);
  return tl;
}

export function VideoMode() {
  const active = useUI((s) => s.videoActive);
  const playing = useUI((s) => s.videoPlaying);
  const setVideo = useUI((s) => s.setVideo);
  const pathname = usePathname();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(0);
  const ended = useUI((s) => s.videoEnded);
  const [chrome, setChrome] = useState(true);

  // lancement et arrêt
  useEffect(() => {
    if (!active) return;
    if (pathname?.startsWith('/campagne')) {
      setVideo({ videoActive: false, videoPlaying: false });
      return;
    }
    const root = document.documentElement;
    root.dataset.mode = 'video';
    const lenis = getLenis();
    useMatrix.getState().applyScenario('nos-poids', 0);
    useSim.getState().applyPreset('salle-type', 0);
    useEco.getState().setSetId('nos-poids');
    setScroll(0);
    let tl: gsap.core.Timeline | null = null;
    const t = window.setTimeout(() => {
      ScrollTrigger.refresh();
      lenis?.stop();
      tl = buildTimeline(() => useUI.getState().setVideo({ videoPlaying: false, videoEnded: true }));
      tlRef.current = tl;
      // accroche de test : vitesse de lecture réglable (scripts de contrôle)
      (window as unknown as { __olVideo?: gsap.core.Timeline }).__olVideo = tl;
      if (useUI.getState().videoPlaying) tl.play(0);
    }, 400);
    const tick = () => {
      const tt = tlRef.current?.time() ?? 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${tt / VIDEO_DURATION})`;
      setTime((prev) => (Math.floor(prev) === Math.floor(tt) ? prev : tt));
    };
    gsap.ticker.add(tick);
    return () => {
      window.clearTimeout(t);
      gsap.ticker.remove(tick);
      tl?.kill();
      tlRef.current = null;
      delete root.dataset.mode;
      lenis?.start();
    };
  }, [active, pathname, setVideo]);

  // pause et reprise
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || ended) return;
    if (playing) tl.play();
    else tl.pause();
  }, [playing, ended]);

  // clavier : espace = pause, flèches = ±10 s, Échap = quitter
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const ui = useUI.getState();
      if (e.key === ' ') {
        e.preventDefault();
        if (ended) return;
        ui.setVideo({ videoPlaying: !ui.videoPlaying });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        ui.setVideo({ videoActive: false, videoPlaying: false });
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const tl = tlRef.current;
        if (!tl) return;
        // les évènements traversés sont rejoués : défilement et outils restent synchronisés
        tl.seek(Math.max(0, Math.min(VIDEO_DURATION - 0.1, tl.time() + (e.key === 'ArrowRight' ? 10 : -10))), false);
      }
    };
    let hideT = 0;
    const onMove = () => {
      setChrome(true);
      window.clearTimeout(hideT);
      hideT = window.setTimeout(() => setChrome(false), 2200);
    };
    onMove();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(hideT);
    };
  }, [active, ended]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[78]" aria-live="polite">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-chalk/10">
        <div ref={barRef} className="h-full origin-left bg-route" style={{ transform: 'scaleX(0)' }} />
      </div>
      <div
        className={`pointer-events-auto absolute bottom-5 right-5 flex items-center gap-3 rounded-full border border-chalk/15 bg-ply-950/85 py-2 pl-4 pr-2 transition-opacity duration-500 ${
          chrome || !playing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="label-mono text-[10px] text-dust">Mode vidéo</span>
        <span className="font-mono text-[13px] tabular-nums text-chalk">
          {fmt(time)} <span className="text-dust">/ {fmt(VIDEO_DURATION)}</span>
        </span>
        <button
          type="button"
          onClick={() => setVideo({ videoPlaying: !playing })}
          disabled={ended}
          className="grid h-9 w-9 place-items-center rounded-full bg-chalk text-ply-900 disabled:opacity-40"
          aria-label={playing ? 'Mettre en pause (espace)' : 'Reprendre (espace)'}
        >
          {playing ? <IconPause size={14} /> : <IconPlay size={14} />}
        </button>
        <button
          type="button"
          onClick={() => setVideo({ videoActive: false, videoPlaying: false })}
          className="grid h-9 w-9 place-items-center rounded-full border border-chalk/20 text-chalk-dim hover:text-chalk"
          aria-label="Quitter le mode vidéo (Échap)"
        >
          <IconClose size={14} />
        </button>
      </div>
      {ended && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-24 mx-auto w-fit rounded-[8px] border border-chalk/15 bg-ply-950/90 px-6 py-4 text-center">
          <p className="font-display text-[34px] text-chalk">Fin du déroulé</p>
          <p className="mt-1 text-[14px] text-dust">3 minutes. Échap pour quitter, ou relancez avec V.</p>
        </div>
      )}
    </div>
  );
}
