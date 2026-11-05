import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { entonnoir } from '../../config';
import { C, DISPLAY, alpha } from '../theme';
import { tEntonnoir } from '../timelines';
import { CLAMP, DOUX, EASE, POP, coup, lin, sp } from '../lib/temps';
import { ajuste, largeur, useFormat } from '../lib/mise-en-page';
import { Porte } from '../composants/Porte';
import { Fond, Grain } from '../composants/Fond';
import { Camera } from '../composants/Camera';
import { Pastille, Trait } from '../composants/Stickers';
import { Poudre } from '../composants/Poudre';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

/** 16 sports -> 4 -> ESCALADE plein écran. */
const EntonnoirContenu: React.FC = () => {
  const T = useMemo(() => tEntonnoir(), []);
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const e = entonnoir;

  // grille de départ
  const g = v ? { x: 70, y: 720, w: W - 140, h: 980, cols: 2 } : { x: 700, y: 150, w: 1100, h: 780, cols: 4 };
  const rangs = Math.ceil(e.sports.length / g.cols);
  const ecart = v ? 14 : 18;
  const cw = (g.w - ecart * (g.cols - 1)) / g.cols;
  const ch = (g.h - ecart * (rangs - 1)) / rangs;
  const caseDe = (i: number): Rect => ({ x: g.x + (i % g.cols) * (cw + ecart), y: g.y + Math.floor(i / g.cols) * (ch + ecart), w: cw, h: ch });
  // les 4 finalistes, regroupés en carré
  const k = v ? { cx: W / 2, cy: 1190, w: 470, h: 200, e: 22 } : { cx: 1250, cy: 540, w: 420, h: 236, e: 26 };
  const caseFinale = (j: number): Rect => ({
    x: k.cx - k.w - k.e / 2 + (j % 2) * (k.w + k.e),
    y: k.cy - k.h - k.e / 2 + Math.floor(j / 2) * (k.h + k.e),
    w: k.w,
    h: k.h,
  });
  const plein: Rect = { x: -20, y: -20, w: W + 40, h: H + 40 };

  // ordre d'arrivée et ordre des barrés (fixes, tirés au sort une fois)
  const arrivee = useMemo(() => {
    const r = e.sports.map((s) => random(`arr${s}`));
    return r.map((x) => r.filter((y) => y < x).length);
  }, [e.sports]);
  const ordreTri = useMemo(() => [...T.elimines].sort((a, b) => random(`tri${a}`) - random(`tri${b}`)), [T]);

  // compteur : 16, puis -1 à chaque nom barré, puis à chaque nom qui tombe
  const seuils = [...T.tri, ...T.chute.map((f) => f + 4)];
  const restants = e.sports.length - seuils.filter((f) => frame >= f).length;
  const dernierChangement = Math.max(T.seize, ...seuils.filter((f) => frame >= f));
  const pop = coup(frame, dernierChangement, 2.6);
  const entreeCompteur = sp(frame, T.seize, POP);
  const finCompteur = lin(frame, T.un, T.un + 7, 1, 0, EASE);

  const tCase = v ? 50 : 50;
  const tCaseFinale = v ? 66 : 70;
  const tGeant = v ? ajuste(e.gagnant.toUpperCase(), W * 0.9, 330) : ajuste(e.gagnant.toUpperCase(), W * 0.84, 520);
  const expansion = sp(frame, T.un, { damping: 16, stiffness: 190, mass: 0.75 });
  const regroupe = sp(frame, T.quatre, DOUX);

  const nombreTaille = v ? 330 : 420;
  const etiquette = restants > 1 ? e.etiquette.plusieurs : e.etiquette.un;
  const cx = v ? W / 2 : 360;
  const cy = v ? 430 : H / 2 - 40;

  return (
    <>
      <AbsoluteFill style={{ background: C.fond }}>
        <Fond graine="ent" />
        <Camera
          impacts={[
            { f: T.seize, force: 0.9 },
            { f: T.quatre, force: 0.6 },
            ...T.chute.map((f) => ({ f: f + 8, force: 0.35 })),
            { f: T.un + 10, force: 1.2 },
          ]}
          zoom={[1, 1.05]}
          duree={T.total}
        >
          {/* le compteur */}
          <div
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              transform: `translate(-50%, -50%) scale(${Math.max(0, entreeCompteur) * (1 + 0.16 * pop) * (0.85 + 0.15 * finCompteur)})`,
              opacity: finCompteur,
              textAlign: 'center',
              filter: pop > 0.4 ? `blur(${(pop * 4).toFixed(1)}px)` : undefined,
            }}
          >
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: nombreTaille, lineHeight: 0.82, color: C.magnesie }}>{frame >= T.seize ? restants : ''}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: v ? 60 : 74, letterSpacing: '0.06em', color: C.jaune, marginTop: v ? 6 : 12 }}>
              {frame >= T.seize ? etiquette : ''}
            </div>
          </div>

          {/* les cases */}
          {e.sports.map((nom, i) => {
            const elimine = T.elimines.includes(nom);
            const tombe = T.tombent.includes(nom);
            const gagnant = nom === e.gagnant;
            const j = e.finalistes.indexOf(nom);
            const a = T.grille + arrivee[i];
            if (frame < a) return null;
            const apparait = sp(frame, a, POP);
            let r = caseDe(i);
            let o = 1;
            let rot = 0;
            let dy = 0;
            let taille = tCase;
            let fond: string = alpha(C.magnesie, 0.06);
            let bord: string = alpha(C.magnesie, 0.16);
            let texte: string = C.magnesie;
            let barre: number | null = null;
            if (elimine) {
              const f = T.tri[ordreTri.indexOf(nom)];
              barre = f;
              // barré, puis grisé ; disparaît quand il n'en reste que 4 (jamais avant d'avoir été lu barré)
              const fin = Math.max(T.quatre, f + 7);
              o = interpolate(frame, [f + 4, f + 9], [1, 0.2], CLAMP) * interpolate(frame, [fin, fin + 6], [1, 0], CLAMP);
            }
            if (j >= 0) {
              r = mix(caseDe(i), caseFinale(j), regroupe);
              taille = tCase + (tCaseFinale - tCase) * Math.min(1, Math.max(0, regroupe));
              const surbrille = lin(frame, T.quatre, T.quatre + 6);
              bord = surbrille > 0 ? alpha(C.jaune, 0.16 + 0.7 * surbrille) : bord;
              texte = surbrille > 0.5 ? C.jaune : C.magnesie;
            }
            if (tombe) {
              const f = T.chute[T.tombent.indexOf(nom)];
              const t = Math.max(0, frame - f);
              dy = 2.1 * t * t;
              rot = t * (random(`rot${nom}`) - 0.5) * 3.2;
              o = lin(frame, f + 10, f + 16, 1, 0);
            }
            if (gagnant && frame >= T.un) {
              const ex = Math.max(0, expansion);
              r = mix(caseFinale(j), plein, Math.min(1, ex));
              taille = tCaseFinale + (tGeant - tCaseFinale) * ex;
              fond = C.jaune;
              bord = C.jaune;
              texte = C.fond;
            }
            if (o <= 0.001) return null;
            const s = gagnant && frame >= T.un ? 1 : 0.6 + 0.4 * apparait;
            const libelle = nom.toUpperCase();
            const tw = Math.min(r.w * 0.86, largeur(libelle, taille, { poids: 800 }));
            return (
              <div
                key={nom}
                style={{
                  position: 'absolute',
                  left: r.x,
                  top: r.y + dy,
                  width: r.w,
                  height: r.h,
                  transform: `rotate(${rot}deg) scale(${s})`,
                  opacity: o * Math.min(1, apparait * 1.5),
                  background: fond,
                  border: `2px solid ${bord}`,
                  borderRadius: gagnant && frame >= T.un ? 0 : 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: taille,
                  lineHeight: 0.92,
                  color: texte,
                  padding: '0 0.2em',
                }}
              >
                <span style={{ position: 'relative' }}>
                  {libelle}
                  {barre != null && (
                    <Trait
                      a={barre}
                      duree={4}
                      largeur={tw + 24}
                      couleur={C.rose}
                      epaisseur={9}
                      fin={false}
                      graine={`b${i}`}
                      style={{ position: 'absolute', left: -12, top: '50%', marginTop: -18 }}
                    />
                  )}
                </span>
              </div>
            );
          })}

          {/* ESCALADE : la pastille « 1 » et le souligné */}
          <Pastille
            a={T.un + 12}
            rond={v ? 230 : 250}
            fond={C.fond}
            couleur={C.magnesie}
            taille={v ? 150 : 160}
            poids={900}
            rot={-8}
            ombre={false}
            style={{ left: v ? W / 2 : W * 0.13, top: v ? H / 2 - tGeant * 1.15 : H / 2 - tGeant * 0.7 }}
          >
            <span style={{ lineHeight: 0.8 }}>1</span>
            <span style={{ fontSize: v ? 30 : 32, letterSpacing: '0.08em', color: C.jaune, fontWeight: 800, marginTop: 4 }}>{e.etiquette.un}</span>
          </Pastille>
          <div
            style={{
              position: 'absolute',
              left: W / 2 - (largeur(e.gagnant.toUpperCase(), tGeant, { poids: 800 }) * 0.9) / 2,
              top: H / 2 + tGeant * 0.36,
            }}
          >
            <Trait
              a={T.un + 22}
              duree={8}
              largeur={largeur(e.gagnant.toUpperCase(), tGeant, { poids: 800 }) * 0.9}
              couleur={C.fond}
              epaisseur={v ? 16 : 22}
              graine="esc"
            />
          </div>
          <Poudre a={T.un + 10} x={W / 2} y={H / 2 + tGeant * 0.3} n={40} direction="cotes" couleur={C.fond} vitesse={1.4} graine="esc" />
        </Camera>
        <Grain />
      </AbsoluteFill>
    </>
  );
};

/** Mesures du texte seulement une fois les polices chargées (d'où la porte autour). */
export const Entonnoir: React.FC = () => (
  <Porte>
    <EntonnoirContenu />
  </Porte>
);
