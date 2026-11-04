'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { FLAVORS } from '@/data/campagne';
import { KineticTitle } from '@/components/ui/KineticTitle';
import { StartCard } from '@/components/ui/StartCard';
import { Arrow, Button } from '@/components/ui/Button';
import { Hold, type HoldKind } from '@/components/ui/Hold';
import { useCapabilities } from '@/lib/device';
import { scrollToElement } from '@/lib/scroll';
import { BottleSketch } from './Gamme';
import type { GameApi } from '@/components/three/game/GameScene';

const GameScene = dynamic(() => import('@/components/three/game/GameScene'), { ssr: false });

const HOLD_COLORS = ['#F2B705', '#E64980', '#5C7CFA', '#FD7E14', '#F2B705'];
const KINDS: HoldKind[] = ['jug', 'sloper', 'pinch', 'jug', 'jug'];

/**
 * Accueil de la campagne : le mini-jeu des 5 prises. Toucher les prises dans
 * l'ordre fait grimper le grimpeur ; la dernière libère les bulles et révèle
 * la bouteille.
 */
export function CampagneHero({ meta }: { meta: SectionMeta }) {
  const hex = ROUTE_COLORS[meta.route];
  const caps = useCapabilities();
  const show3D = caps.ready && caps.webgl && !caps.reducedMotion;
  const [step, setStep] = useState(0);
  const [top, setTop] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const api = useRef<GameApi | null>(null);
  const hintTimer = useRef<number | null>(null);

  const onStep = useCallback((k: number) => {
    setStep(k);
    setHint(null);
  }, []);
  const onWrong = useCallback((expected: number) => {
    setHint(`Dans l’ordre : la prise ${expected} d’abord.`);
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 2200);
  }, []);
  const onTop = useCallback(() => setTop(true), []);
  const replay = () => {
    setStep(0);
    setTop(false);
    setHint(null);
    setRound((r) => r + 1);
  };

  return (
    <section
      id={meta.id}
      data-section={meta.id}
      data-index={0}
      data-color={hex}
      data-title={meta.short}
      className="relative min-h-[100svh] overflow-hidden"
      style={{ '--route': hex } as CSSProperties}
      aria-labelledby="campagne-title"
    >
      {/* le jeu remplit l'arrière-plan */}
      <div className="absolute inset-0">
        {show3D ? (
          <GameScene
            key={round}
            className="absolute inset-0"
            onStep={onStep}
            onWrong={onWrong}
            onTop={onTop}
            apiRef={api}
            framing={caps.mobile ? 'center' : 'side'}
          />
        ) : (
          <div className="plywood absolute inset-0">
            <div className="absolute right-[8%] top-1/2 h-[70%] -translate-y-1/2">
              <BottleSketch flavor={FLAVORS[0]} className="h-full" />
            </div>
          </div>
        )}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,14,12,.92)_0%,rgba(16,14,12,.6)_38%,rgba(16,14,12,0)_62%)] max-md:bg-[linear-gradient(0deg,rgba(16,14,12,.96)_0%,rgba(16,14,12,.7)_42%,rgba(16,14,12,0)_68%)]"
      />

      <div className="pointer-events-none relative flex min-h-[100svh] flex-col justify-end px-[var(--gutter)] pb-[clamp(28px,7vh,80px)] pt-[calc(var(--header-h)+60px)] md:justify-center">
        <div className="pointer-events-auto max-w-[620px]">
          <StartCard num={0} name="Après la voie" grade={meta.grade} color={hex} foot="One Living · salles de l’Ouest" size="sm" className="mb-8 hidden md:block" />
          <KineticTitle
            as="h1"
            id="campagne-title"
            lines={['Après', { text: 'la voie.', className: 'text-route' }]}
            className="font-display text-[clamp(76px,13vw,220px)] text-chalk"
            play
            delayMs={200}
          />
          <p className="mt-6 max-w-[30ch] text-[20px] leading-snug text-chalk-dim md:text-[24px]">
            Le moment pour souffler, juste après ta séance.
          </p>

          <div className="mt-10 rounded-[6px] border border-chalk/12 bg-ply-900/70 p-5 backdrop-blur-sm md:max-w-[460px]">
            {!top ? (
              <>
                <p className="text-[15px] font-semibold text-chalk">
                  {show3D ? 'Touche les 5 prises dans l’ordre pour finir la voie.' : 'Les 5 prises de la voie, dans l’ordre.'}
                </p>
                <ol className="mt-4 flex items-center gap-2" aria-label="Progression sur la voie">
                  {HOLD_COLORS.map((c, i) => {
                    const done = i < step;
                    const next = i === step;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          disabled={!next || !show3D}
                          onClick={() => api.current?.next()}
                          aria-label={done ? `Prise ${i + 1} atteinte` : next ? `Attraper la prise ${i + 1}` : `Prise ${i + 1}`}
                          className={`relative grid h-11 w-11 place-items-center rounded-full border transition-all ${
                            next ? 'border-chalk/60 bg-chalk/10' : 'border-chalk/10'
                          } disabled:cursor-default`}
                        >
                          <Hold kind={KINDS[i]} color={c} lit={done || next} size={26} style={{ opacity: done ? 1 : next ? 0.9 : 0.35 }} />
                          <span className="label-mono absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-ply-900 text-[9px] text-chalk">
                            {i + 1}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-3 h-5 text-[13.5px] text-route" aria-live="polite">
                  {hint ?? (step > 0 ? `${step} sur 5. Continue.` : 'Touche la prise 1 qui brille.')}
                </p>
              </>
            ) : (
              <div aria-live="polite">
                <p className="font-display text-[44px] leading-none text-route">Top !</p>
                <p className="mt-2 text-[16px] text-chalk-dim">Tu as fini la voie. Le moment est à toi.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => scrollToElement('gamme', { duration: 1.8 })}>
                    Découvrir la gamme <Arrow dir="down" />
                  </Button>
                  <Button variant="ghost" onClick={replay}>
                    Rejouer la voie
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
