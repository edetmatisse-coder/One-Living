'use client';

import { useRef, useState, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { Section, SectionInner } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { useInView } from '@/lib/use-in-view';
import { IconPlay } from '@/components/ui/Icons';
import { asset } from '@/lib/asset';

const N = 25;

/** Modules du faux QR code, tirés une fois pour toutes (graine fixe). */
const QR_CELLS: { x: number; y: number; d: number }[] = (() => {
  let a = 42;
  const r = () => {
    a = (a * 16807) % 2147483647;
    return (a - 1) / 2147483646;
  };
  const out: { x: number; y: number; d: number }[] = [];
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (finder(x, y)) continue;
      if (r() < 0.47) out.push({ x, y, d: Math.round(Math.hypot(x - N / 2, y - N / 2) * 100) / 100 });
    }
  }
  return out;
})();

function Finder({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="7" height="7" rx="1.4" fill="#141210" />
      <rect x="1" y="1" width="5" height="5" rx="0.9" fill="#F3EFE8" />
      <rect x="2" y="2" width="3" height="3" rx="0.6" fill={color} />
    </g>
  );
}

/** Faux QR code : motif décoratif, il ne mène nulle part. */
function FakeQR({ on, color }: { on: boolean; color: string }) {
  const cells = QR_CELLS;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[10px] bg-chalk p-5">
      <svg viewBox={`0 0 ${N} ${N}`} className="h-full w-full" role="img" aria-label="QR code de démonstration">
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x + 0.08}
            y={c.y + 0.08}
            width="0.84"
            height="0.84"
            rx="0.22"
            fill="#141210"
            style={{
              transformOrigin: `${c.x + 0.5}px ${c.y + 0.5}px`,
              transform: on ? 'scale(1)' : 'scale(0)',
              transition: `transform .5s cubic-bezier(.2,.8,.1,1) ${Math.round(c.d * 40)}ms`,
            }}
          />
        ))}
        <Finder x={0} y={0} color={color} />
        <Finder x={N - 7} y={0} color={color} />
        <Finder x={0} y={N - 7} color={color} />
        <g transform={`translate(${N / 2 - 2} ${N / 2 - 2})`}>
          <rect width="4" height="4" rx="1" fill="#F3EFE8" />
          <rect x="0.7" y="0.7" width="2.6" height="2.6" rx="0.7" fill={color} />
        </g>
      </svg>
      {/* ligne de lecture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 h-[3px] rounded-full"
        style={{ background: color, boxShadow: `0 0 18px 4px ${color}`, animation: on ? 'qrScan 2.6s cubic-bezier(.45,0,.55,1) infinite' : 'none', top: '10%' }}
      />
      <span className="label-mono absolute bottom-2 right-3 text-[9px] text-ply-400">Démo</span>
    </div>
  );
}

const TIPS = [
  { t: 'Lis la voie depuis le sol', d: 'Du départ au top, repère les mouvements avant de partir.' },
  { t: 'Respire avant le pas dur', d: 'Une expiration longue, puis tu y vas.' },
  { t: 'Trouve tes repos', d: 'Sur une bonne prise, secoue un bras, puis l’autre.' },
];

/** La voie du mois : le QR code de la bouteille ouvre la vidéo et des conseils. */
export function VoieDuMois({ meta }: { meta: SectionMeta }) {
  const color = ROUTE_COLORS[meta.route];
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -25% 0px' });
  const [playing, setPlaying] = useState(false);

  return (
    <Section
      meta={meta}
      solid
      title={['La voie', 'du mois']}
      cardFoot="QR code · ouvreurs B’Wall"
      lead={<>Scanne le QR code de ta bouteille : la voie du mois, ouverte par les ouvreurs B’Wall, et trois conseils de concentration s’ouvrent.</>}
    >
      <SectionInner>
        <div ref={ref} className="grid items-center gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
          <div className="mx-auto w-full max-w-[360px]">
            <FakeQR on={on} color={color} />
            <p className="mt-4 flex items-center justify-center gap-3 text-[14px] text-dust">
              <Badge kind="demo">Faux QR code</Badge> Il ne mène nulle part.
            </p>
          </div>

          {/* téléphone */}
          <div className="relative mx-auto w-full max-w-[380px]" style={{ '--route': color } as CSSProperties}>
            <div className="rounded-[42px] border border-chalk/20 bg-ply-950 p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]">
              <div className="overflow-hidden rounded-[32px] bg-ply-800">
                <div className="flex items-center justify-between px-6 pb-2 pt-4 font-mono text-[11px] text-dust">
                  <span>20:41</span>
                  <span className="h-5 w-20 rounded-full bg-ply-950" />
                  <span>5G</span>
                </div>
                {/* lecteur vidéo stylisé */}
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="relative block aspect-[4/5] w-full overflow-hidden bg-ply-900"
                  aria-label={playing ? 'Mettre en pause la démo vidéo' : 'Lancer la démo vidéo'}
                >
                  {/* la paroi de B'Wall Vannes, 15 m, en guise d'image de la vidéo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset('/brand/bwall/voie-du-mois.jpg')}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[6000ms] ease-linear ${playing ? 'scale-[1.12]' : 'scale-100'}`}
                  />
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,14,12,.35),rgba(16,14,12,.15)_40%,rgba(16,14,12,.7))]" />
                  <span className="label-mono absolute bottom-7 right-4 text-[8.5px] text-chalk/70">Photo b-wall.fr</span>
                  <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" aria-hidden>
                    <path d="M30 118 C 40 98, 62 92, 55 74 S 34 50, 52 34 S 70 14, 60 6" fill="none" stroke="rgba(243,239,232,.75)" strokeWidth="0.9" strokeDasharray="1.5 3" />
                    {[
                      [30, 112],
                      [52, 88],
                      [56, 70],
                      [40, 54],
                      [54, 34],
                      [62, 16],
                    ].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r={i === 5 ? 3.4 : 2.6} fill={color} stroke="rgba(16,14,12,.6)" strokeWidth="0.6" />
                    ))}
                    <circle r="2.2" fill="#F3EFE8" style={{ offsetPath: "path('M30 118 C 40 98, 62 92, 55 74 S 34 50, 52 34 S 70 14, 60 6')", animation: playing ? 'routeClimb 6s cubic-bezier(.45,0,.55,1) infinite' : 'none' } as CSSProperties} />
                  </svg>
                  <span className="absolute left-4 top-4 rounded-[3px] bg-ply-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-chalk">
                    Voie du mois · jaune 6a+
                  </span>
                  {!playing && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-route text-ply-900">
                        <IconPlay size={22} />
                      </span>
                    </span>
                  )}
                  <span className="absolute inset-x-4 bottom-4 h-1 overflow-hidden rounded-full bg-chalk/20">
                    <span className="block h-full bg-route" style={{ width: playing ? '100%' : '8%', transition: playing ? 'width 6s linear' : 'none' }} />
                  </span>
                </button>
                <div className="space-y-4 px-6 py-6">
                  <p className="label-mono text-route">Concentration · 3 conseils</p>
                  {TIPS.map((t, i) => (
                    <div key={t.t} className="flex gap-3">
                      <span className="font-display text-[26px] leading-none text-route">{i + 1}</span>
                      <div>
                        <p className="text-[15px] font-semibold text-chalk">{t.t}</p>
                        <p className="text-[13.5px] leading-snug text-dust">{t.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
