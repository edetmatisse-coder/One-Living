import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { soixanteNeuf } from '../../config';
import { C, DISPLAY, TEXTE, alpha, fr } from '../theme';
import { mots, tSoixanteNeuf } from '../timelines';
import { EASE, SEC, coup, lin, sp } from '../lib/temps';
import { largeur, useFormat } from '../lib/mise-en-page';
import { Porte } from '../composants/Porte';
import { Fond, Grain } from '../composants/Fond';
import { Camera } from '../composants/Camera';
import { Compteur, FlouDefs } from '../composants/Compteur';
import { Mots } from '../composants/Mots';
import { Poudre } from '../composants/Poudre';
import { Eclats } from '../composants/Stickers';
import { Flash } from '../composants/Bande';

/** 0 -> 69, le « % » qui claque, la phrase, la source. */
const SoixanteNeufContenu: React.FC = () => {
  const T = useMemo(() => tSoixanteNeuf(), []);
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const s = soixanteNeuf;
  const taille = v ? 520 : 660;
  const chiffres = String(s.valeur).length;
  const colW = Math.max(...'0123456789'.split('').map((c) => largeur(c, taille)));
  const nombreW = colW * chiffres;
  const tPct = taille * 0.52;
  const pctW = largeur('%', tPct);
  const gap = taille * 0.04;
  const total = nombreW + gap + pctW;
  const x0 = (W - total) / 2;
  const top = v ? H * 0.27 : H * 0.1;
  const bump = coup(frame, T.pose, 3.2);
  // « % » : arrive de très grand, tourné, et claque
  const p = sp(frame, T.pourcent, SEC);
  const pctVisible = frame >= T.pourcent;
  const pctS = 3.2 - 2.2 * p;
  const pctFlou = Math.max(0, 1 - p) * 20;
  // phrase
  const tPhrase = v ? 74 : 70;
  const ws = mots(fr(s.phrase.texte));
  const fin = mots(fr(s.souligne));
  const debutSouligne = fin.length && ws.slice(-fin.length).join(' ') === fin.join(' ') ? ws.length - fin.length : ws.length;
  const jetons = ws.map((t, i) => ({ t, souligne: i >= debutSouligne }));
  const source = lin(frame, T.source, T.source + 10, 0, 1, EASE);
  return (
    <>
      <AbsoluteFill style={{ background: C.fond }}>
        <FlouDefs />
        <Fond graine="69" />
        <Camera
          impacts={[
            { f: T.pose, force: 1.2 },
            { f: T.pourcent + 3, force: 1.1 },
          ]}
          zoom={[1, 1.06]}
          duree={T.total}
        >
          <div
            style={{
              position: 'absolute',
              left: x0,
              top,
              transform: `scale(${1 + 0.12 * bump})`,
              transformOrigin: '50% 60%',
              filter: bump > 0.25 ? `blur(${(bump * 7).toFixed(1)}px)` : undefined,
            }}
          >
            <Compteur de={0} vers={s.valeur} debut={T.depart} pose={T.pose} chiffres={chiffres} taille={taille} couleur={C.magnesie} zeroPale />
          </div>
          {pctVisible && (
            <div
              style={{
                position: 'absolute',
                left: x0 + nombreW + gap,
                top: top + taille * 0.17,
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: tPct,
                lineHeight: 1,
                color: C.jaune,
                transform: `scale(${pctS}) rotate(${(1 - p) * 26}deg)`,
                transformOrigin: '30% 60%',
                filter: pctFlou > 0.6 ? `blur(${pctFlou.toFixed(1)}px)` : undefined,
              }}
            >
              %
            </div>
          )}
          <Eclats a={T.pourcent + 3} x={x0 + nombreW + gap + pctW * 0.9} y={top + taille * 0.2} angle={-45} couleur={C.jaune} longueur={v ? 60 : 76} />
          <Poudre a={T.pourcent + 3} x={x0 + nombreW + gap + pctW / 2} y={top + taille * 0.45} n={30} direction="tout" couleur={C.jaune} vitesse={1.1} graine="pct" />
          <div style={{ position: 'absolute', left: W * 0.07, right: W * 0.07, top: top + taille * (v ? 1.02 : 0.94) }}>
            <Mots
              mots={jetons}
              a={T.phrase}
              ecart={3}
              taille={tPhrase}
              famille={TEXTE}
              poids={600}
              couleur={C.magnesie}
              interligne={1.2}
              espaceMots={0.26}
              largeurMax={W * 0.86}
              souligne={{ a: T.trait, couleur: C.jaune, epaisseur: tPhrase * 0.15, duree: 5 }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: W * 0.06,
              right: W * 0.06,
              bottom: v ? 380 : 64,
              textAlign: 'center',
              fontFamily: TEXTE,
              fontWeight: 500,
              fontSize: v ? 30 : 26,
              color: alpha(C.magnesie, 0.62),
              opacity: source,
              transform: `translateY(${(1 - source) * 14}px)`,
            }}
          >
            {fr(s.source.texte)}
          </div>
        </Camera>
        <Flash a={T.pose} force={0.14} />
        <Grain />
      </AbsoluteFill>
    </>
  );
};

/** Mesures du texte seulement une fois les polices chargées (d'où la porte autour). */
export const SoixanteNeuf: React.FC = () => (
  <Porte>
    <SoixanteNeufContenu />
  </Porte>
);
