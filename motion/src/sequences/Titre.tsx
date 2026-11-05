import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { IMAGES_PAR_SECONDE, titre } from '../../config';
import { C, DISPLAY, fr } from '../theme';
import { tTitre } from '../timelines';
import { ajuste, largeur, useFormat } from '../lib/mise-en-page';
import { Porte } from '../composants/Porte';
import { Fond, Grain } from '../composants/Fond';
import { Camera } from '../composants/Camera';
import { Lettres } from '../composants/Mots';
import { Trait } from '../composants/Stickers';

/** En vertical, une ligne trop longue est coupée en deux (au mot le plus proche du milieu). */
const couper = (ls: string[], max: number) =>
  ls.flatMap((l) => {
    if (l.length <= max || !l.includes(' ')) return [l];
    const ws = l.split(' ');
    let best = 1;
    for (let i = 1; i < ws.length; i++)
      if (Math.abs(ws.slice(0, i).join(' ').length - l.length / 2) < Math.abs(ws.slice(0, best).join(' ').length - l.length / 2)) best = i;
    return [ws.slice(0, best).join(' '), ws.slice(best).join(' ')];
  });

/** « COMMENT ONE LIVING PEUT SORTIR DU RUGBY ? » : les lettres claquent une à une, en bloc justifié. */
const TitreContenu: React.FC = () => {
  const T = useMemo(() => tTitre(), []);
  const { W, H, v } = useFormat();
  const base = titre.lignes.map(fr);
  const jaune = fr(titre.enJaune);
  const ls = v ? couper(base, 12) : base;
  const largeurBloc = W * (v ? 0.86 : 0.8);
  const tailles = ls.map((l) => ajuste(l, largeurBloc, v ? 260 : 360));
  const hTotal = tailles.reduce((s, t) => s + t * 0.86, 0);
  const top = (H - hTotal) / 2 - (v ? 30 : 10);
  // fins de lignes : petit impact à chaque ligne complète
  let n = 0;
  const finsLignes = ls.map((l) => {
    n += l.replace(/[\s ]/g, '').length;
    return T.lettres[n - 1];
  });
  const derniere = ls[ls.length - 1];
  const tDerniere = tailles[tailles.length - 1];
  let y = top;
  let k = 0;
  return (
    <>
      <AbsoluteFill style={{ background: C.fond }}>
        <Fond graine="titre" />
        <Camera
          impacts={finsLignes.map((f, i) => ({ f: f + 2, force: i === finsLignes.length - 1 ? 1.1 : 0.5 }))}
          zoom={[1, 1.06]}
          duree={T.total}
        >
          {ls.map((l, i) => {
            const t = tailles[i];
            const haut = y;
            y += t * 0.86;
            const debut = T.lettres[k] ?? 0;
            const nb = l.replace(/[\s ]/g, '').length;
            k += nb;
            const enJaune = jaune.includes(l) || l === jaune;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: haut,
                  textAlign: 'center',
                  fontFamily: DISPLAY,
                  fontWeight: 900,
                  fontSize: t,
                  lineHeight: 0.86,
                  color: enJaune ? C.jaune : C.magnesie,
                  whiteSpace: 'nowrap',
                }}
              >
                <Lettres texte={l} a={debut} ecart={titre.temps.parLettre * IMAGES_PAR_SECONDE} mode="claque" />
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: W / 2 - (largeur(derniere, tDerniere) * 0.92) / 2, top: y - tDerniere * 0.02 }}>
            <Trait a={T.trait} duree={8} largeur={largeur(derniere, tDerniere) * 0.92} couleur={C.jaune} epaisseur={v ? 16 : 20} graine="titre" />
          </div>
        </Camera>
        <Grain />
      </AbsoluteFill>
    </>
  );
};

/** Mesures du texte seulement une fois les polices chargées (d'où la porte autour). */
export const Titre: React.FC = () => (
  <Porte>
    <TitreContenu />
  </Porte>
);
