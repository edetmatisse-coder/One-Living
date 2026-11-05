import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { final } from '../../config';
import { C, DISPLAY, TEXTE, alpha, fr } from '../theme';
import { tFinal } from '../timelines';
import { EASE, POP, lin, sp } from '../lib/temps';
import { ajuste, largeur, useFormat } from '../lib/mise-en-page';
import { Porte } from '../composants/Porte';
import { Fond, Grain } from '../composants/Fond';
import { Camera } from '../composants/Camera';
import { Lettres } from '../composants/Mots';
import { TraitCraie } from '../composants/Stickers';

/** « APRÈS LA VOIE. » s'écrit, trait de magnésie, l'équipe, la mention du projet. */
export const Final: React.FC = () => {
  const T = useMemo(() => tFinal(), []);
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const titre = fr(final.titre);
  const lignes = v ? (() => {
    const ws = titre.split(' ');
    return [ws[0], ws.slice(1).join(' ')];
  })() : [titre];
  const taille = Math.min(...lignes.map((l) => ajuste(l, W * (v ? 0.84 : 0.84), v ? 330 : 320)));
  const hTitre = taille * 0.86 * lignes.length;
  const top = v ? H * 0.25 : H * 0.2;
  const largeurTitre = Math.max(...lignes.map((l) => largeur(l, taille)));
  const yTrait = top + hTitre + taille * 0.02;
  const tNom = v ? 62 : 58;
  const tPrenom = v ? 36 : 32;
  const derniere = T.lettres[T.lettres.length - 1];
  const mention = lin(frame, T.mention, T.mention + 10, 0, 1, EASE);
  let n = 0;
  return (
    <Porte>
      <AbsoluteFill style={{ background: C.fond }}>
        <Fond graine="final" particules={1.3} />
        <Camera impacts={[{ f: derniere + 2, force: 0.9 }, { f: T.trait + 10, force: 0.35 }]} zoom={[1, 1.05]} duree={T.total}>
          <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center' }}>
            {lignes.map((l, k) => {
              const debut = T.lettres[n] ?? 0;
              const nb = l.replace(/[\s ]/g, '').length;
              n += nb;
              return (
                <div key={k} style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: taille, lineHeight: 0.86, color: C.magnesie }}>
                  <Lettres
                    texte={l}
                    a={debut}
                    ecart={2}
                    mode="ecrit"
                    couleur={(i, c) => (c === '.' && k === lignes.length - 1 && i === nb - 1 ? C.jaune : undefined)}
                  />
                </div>
              );
            })}
          </div>
          <TraitCraie
            a={T.trait}
            duree={14}
            x={W / 2 - (largeurTitre * 1.02) / 2}
            y={yTrait}
            largeur={largeurTitre * 1.02}
            epaisseur={taille * 0.13}
            couleur={C.magnesie}
          />
          <div
            style={{
              position: 'absolute',
              left: v ? W * 0.08 : W * 0.05,
              right: v ? W * 0.08 : W * 0.05,
              top: yTrait + taille * (v ? 0.5 : 0.42),
              display: 'grid',
              gridTemplateColumns: v ? '1fr 1fr' : `repeat(${final.equipe.length}, auto)`,
              justifyContent: 'center',
              columnGap: v ? 40 : 76,
              rowGap: v ? 44 : 0,
              textAlign: 'center',
            }}
          >
            {final.equipe.map((m, i) => {
              const a = T.equipe[i];
              const p = sp(frame, a, POP);
              if (frame < a) return <div key={i} />;
              return (
                <div key={i} style={{ transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.6) }}>
                  <div style={{ fontFamily: TEXTE, fontWeight: 500, fontSize: tPrenom, color: alpha(C.magnesie, 0.75), lineHeight: 1.1 }}>{fr(m.prenom)}</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: tNom, color: C.magnesie, lineHeight: 1, letterSpacing: '0.01em' }}>{fr(m.nom)}</div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: 'absolute',
              left: W * 0.06,
              right: W * 0.06,
              bottom: v ? 300 : 70,
              textAlign: 'center',
              fontFamily: TEXTE,
              fontWeight: 600,
              fontSize: v ? 32 : 28,
              letterSpacing: '0.02em',
              color: C.jaune,
              opacity: mention,
              transform: `translateY(${(1 - mention) * 16}px)`,
            }}
          >
            {fr(final.mention)}
          </div>
        </Camera>
        <Grain />
      </AbsoluteFill>
    </Porte>
  );
};
