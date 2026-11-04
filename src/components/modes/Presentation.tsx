'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUI } from '@/store/ui';
import { CAMPAGNE_SECTIONS, DOSSIER_SECTIONS } from '@/data/sections';
import { getLenis, scrollToElement } from '@/lib/scroll';
import { Hold, type HoldKind } from '@/components/ui/Hold';
import { IconClose } from '@/components/ui/Icons';

/**
 * Mode présentation : chaque section (ou sous-partie marquée data-part)
 * devient une diapositive plein écran. Flèches pour naviguer, N pour les
 * notes de l'orateur, F pour le plein écran, Échap ou P pour sortir.
 */
interface Slide {
  section: HTMLElement;
  sectionIndex: number;
  part: HTMLElement | null;
  partIndex: number;
  partCount: number;
  title: string;
  notes: string;
  color: string;
}

const META = [...DOSSIER_SECTIONS, ...CAMPAGNE_SECTIONS];
const TOP = 76; // hauteur de la barre de diapositive
const BOTTOM = 56;
const KINDS: HoldKind[] = ['jug', 'crimp', 'sloper', 'pinch', 'pocket'];

function collect(): Slide[] {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  const out: Slide[] = [];
  sections.forEach((section, si) => {
    const meta = META.find((m) => m.id === section.dataset.section);
    const color = section.dataset.color || '#F2B705';
    const parts = Array.from(section.querySelectorAll<HTMLElement>('[data-part]'));
    const base = meta?.short ?? section.dataset.title ?? '';
    if (!parts.length) {
      out.push({ section, sectionIndex: si, part: null, partIndex: 0, partCount: 1, title: base, notes: meta?.notes ?? '', color });
    } else {
      parts.forEach((part, k) =>
        out.push({
          section,
          sectionIndex: si,
          part,
          partIndex: k,
          partCount: parts.length,
          title: `${base} · ${part.dataset.partTitle ?? k + 1}`,
          notes: k === 0 ? (meta?.notes ?? '') : (part.dataset.notes ?? meta?.notes ?? ''),
          color,
        }),
      );
    }
  });
  return out;
}

function clearMarks() {
  document.querySelectorAll<HTMLElement>('[data-current]').forEach((e) => delete e.dataset.current);
  document.querySelectorAll<HTMLElement>('[data-part-active]').forEach((e) => delete e.dataset.partActive);
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((e) => {
    e.style.zoom = '';
    delete e.dataset.firstPart;
  });
}

function show(slide: Slide, all: Slide[]) {
  clearMarks();
  const { section, part, partIndex } = slide;
  section.dataset.current = 'true';
  section.dataset.firstPart = partIndex === 0 ? 'true' : 'false';
  if (part) part.dataset.partActive = 'true';

  // étendue de la diapositive : de son début jusqu'à la partie suivante
  const start = part && partIndex > 0 ? part : section;
  const nextPart = part ? all.find((s) => s.section === section && s.partIndex === partIndex + 1)?.part ?? null : null;
  const measure = () => {
    const top = start.getBoundingClientRect().top;
    const bottom = nextPart ? nextPart.getBoundingClientRect().top : section.getBoundingClientRect().bottom;
    return Math.max(1, bottom - top);
  };
  section.style.zoom = '1';
  // le hero occupe déjà tout l'écran : les barres se posent dessus
  const isHero = !section.querySelector('[data-section-head]');
  const avail = isHero ? window.innerHeight : window.innerHeight - TOP - BOTTOM;
  const z = Math.max(0.42, Math.min(1, avail / measure()));
  section.style.zoom = String(Math.round(z * 1000) / 1000);
  const y = start.getBoundingClientRect().top + window.scrollY - (start === section ? 0 : TOP);
  window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
  getLenis()?.scrollTo(Math.max(0, y), { immediate: true, force: true });

  const ui = useUI.getState();
  ui.setActive(section.dataset.section ?? '', slide.sectionIndex, slide.color);
  ui.setClimb(slide.sectionIndex);
}

export function Presentation() {
  const on = useUI((s) => s.presentation);
  const notesOpen = useUI((s) => s.notesOpen);
  const index = useUI((s) => s.slideIndex);
  const setSlide = useUI((s) => s.setSlide);
  const setPresentation = useUI((s) => s.setPresentation);
  const toggleNotes = useUI((s) => s.toggleNotes);
  const pathname = usePathname();
  const [slides, setSlides] = useState<Slide[]>([]);
  const slidesRef = useRef<Slide[]>([]);

  // entrée / sortie du mode
  useEffect(() => {
    const root = document.documentElement;
    if (!on) return;
    const lenis = getLenis();
    lenis?.stop();
    root.dataset.mode = 'presentation';
    // on part de la section la plus proche du haut de l'écran
    const t = window.setTimeout(() => {
      const list = collect();
      slidesRef.current = list;
      setSlides(list);
      const probe = window.innerHeight * 0.35;
      let start = 0;
      list.forEach((s, i) => {
        const el = s.part && s.partIndex > 0 ? s.part : s.section;
        if (el.getBoundingClientRect().top <= probe) start = i;
      });
      setSlide(start);
      if (list[start]) show(list[start], list);
    }, 60);
    return () => {
      window.clearTimeout(t);
      const cur = slidesRef.current[useUI.getState().slideIndex];
      clearMarks();
      delete root.dataset.mode;
      lenis?.start();
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lenis?.resize();
        if (cur) scrollToElement(cur.part && cur.partIndex > 0 ? cur.part : cur.section, { immediate: true, offset: cur.part && cur.partIndex > 0 ? -90 : 0 });
      });
    };
  }, [on, setSlide, pathname]);

  const go = useCallback(
    (i: number) => {
      const list = slidesRef.current;
      if (!list.length) return;
      const j = Math.max(0, Math.min(list.length - 1, i));
      setSlide(j);
      show(list[j], list);
    },
    [setSlide],
  );

  // clavier
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
      if (e.key === 'Escape') {
        e.preventDefault();
        setPresentation(false);
        return;
      }
      if (typing) return;
      const i = useUI.getState().slideIndex;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        go(i + 1);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault();
        go(i - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        go(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        go(slidesRef.current.length - 1);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        toggleNotes();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    };
    // la molette ne fait pas défiler la page : elle change de diapositive
    let wheelLock = 0;
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-lenis-prevent]')) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock || Math.abs(e.deltaY) < 24) return;
      wheelLock = now + 700;
      go(useUI.getState().slideIndex + (e.deltaY > 0 ? 1 : -1));
    };
    const onResize = () => {
      const list = slidesRef.current;
      const s = list[useUI.getState().slideIndex];
      if (s) show(s, list);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    };
  }, [on, go, setPresentation, toggleNotes]);

  if (!on || !slides.length) return null;
  const s = slides[Math.min(index, slides.length - 1)];
  const page = pathname?.startsWith('/campagne') ? 'Campagne' : 'Dossier';

  return (
    <div className="pointer-events-none fixed inset-0 z-[75]" style={{ '--route': s.color } as CSSProperties}>
      {/* barre du haut */}
      <div className="pointer-events-auto absolute inset-x-0 top-0 flex h-[76px] items-center justify-between gap-6 bg-gradient-to-b from-ply-950/95 to-ply-950/0 px-[var(--gutter)]">
        <div className="flex min-w-0 items-center gap-4">
          <span className="label-mono rounded-[3px] bg-chalk px-2 py-1 text-[10px] text-ply-900">{page}</span>
          <span className="truncate text-[15px] font-semibold text-chalk">{s.title}</span>
        </div>
        <ol className="hidden items-center gap-1.5 lg:flex" aria-label="Diapositives">
          {slides.map((sl, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => go(i)}
                className="grid h-6 w-6 place-items-center"
                aria-label={`Aller à la diapositive ${i + 1} : ${sl.title}`}
                aria-current={i === index ? 'step' : undefined}
              >
                <Hold kind={KINDS[i % KINDS.length]} color={sl.color} lit={i <= index} size={i === index ? 20 : 13} />
              </button>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[14px] tabular-nums text-chalk" aria-live="polite">
            {String(index + 1).padStart(2, '0')} <span className="text-dust">/ {String(slides.length).padStart(2, '0')}</span>
          </span>
          <button
            type="button"
            onClick={toggleNotes}
            aria-pressed={notesOpen}
            className="label-mono ml-3 rounded-[4px] border border-chalk/20 px-2.5 py-2 text-[10px] text-chalk-dim hover:text-chalk"
          >
            Notes · N
          </button>
          <button
            type="button"
            onClick={() => setPresentation(false)}
            className="grid h-9 w-9 place-items-center rounded-[4px] border border-chalk/20 text-chalk-dim hover:text-chalk"
            aria-label="Quitter le mode présentation (Échap)"
          >
            <IconClose />
          </button>
        </div>
      </div>

      {/* barre du bas : navigation */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex h-[56px] items-center justify-between bg-gradient-to-t from-ply-950/90 to-ply-950/0 px-[var(--gutter)]">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="label-mono text-[10px] text-dust hover:text-chalk disabled:opacity-30"
        >
          Précédente
        </button>
        <p className="label-mono hidden text-[10px] text-dust/70 md:block">Flèches pour naviguer · N notes · F plein écran · Échap pour quitter</p>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === slides.length - 1}
          className="label-mono text-[10px] text-chalk hover:text-route disabled:opacity-30"
        >
          Suivante
        </button>
      </div>

      {/* notes de l'orateur */}
      {notesOpen && (
        <aside
          className="pointer-events-auto absolute inset-x-[var(--gutter)] bottom-[64px] mx-auto max-w-[980px] rounded-[8px] border border-chalk/15 bg-ply-950/95 p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)]"
          aria-label="Notes de l’orateur"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="label-mono text-route">Note pour l’orateur · {s.title}</p>
            <span className="label-mono text-[10px] text-dust">N pour masquer</span>
          </div>
          <p className="text-[19px] leading-relaxed text-chalk">{s.notes || 'Pas de note pour cette diapositive.'}</p>
        </aside>
      )}
    </div>
  );
}

