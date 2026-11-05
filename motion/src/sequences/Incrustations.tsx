import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { bandeaux, questions } from '../../config';
import { C, DISPLAY, TEXTE, fr } from '../theme';
import { tCarton, tNom, tQuestion } from '../timelines';
import { EASE, EASE_IN, lin, sp } from '../lib/temps';
import { lignes, useFormat } from '../lib/mise-en-page';
import { Porte } from '../composants/Porte';
import { Bande } from '../composants/Bande';
import { Mots } from '../composants/Mots';

/**
 * Incrustations pour CapCut : fond vert pur (#00FF00) pour l'incrustation
 * chroma, ou fond transparent (PNG). Aucune ombre floue ni grain : des bords
 * nets, faciles à détourer.
 */
const fondIncrustation = (transparent: boolean) => (transparent ? 'transparent' : C.vert);

// ---------------------------------------------------------------------------
/** Question de l'interview, sur bandeau jaune façon Konbini. */
const QuestionContenu: React.FC<{ index: number; transparent?: boolean }> = ({ index, transparent = false }) => {
  const T = useMemo(() => tQuestion(), []);
  const frame = useCurrentFrame();
  const { W, v } = useFormat();
  const texte = fr(questions.liste[index]).toUpperCase();
  const taille = v ? 106 : 118;
  const ls = lignes(texte, taille, (v ? W * 0.84 : W * 0.78) - taille * 0.6);
  const flotte = Math.sin(frame / 17) * 4;
  return (
    <>
      <AbsoluteFill style={{ background: fondIncrustation(transparent), alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${flotte}px) rotate(${-1.8 + Math.sin(frame / 31) * 0.35}deg)` }}>
          <Bande
            lignes={ls}
            a={T.bande}
            taille={taille}
            fond={C.jaune}
            couleur={C.fond}
            ombre={C.fond}
            sortie={T.sortie}
            decalage={ls.length > 1 ? (v ? 22 : 30) : 0}
            etiquette={questions.numeroter ? { texte: `QUESTION ${index + 1}`, a: T.etiquette, fond: C.fond, couleur: C.magnesie } : null}
          />
        </div>
      </AbsoluteFill>
    </>
  );
};

// ---------------------------------------------------------------------------
/** Petit carton « Interview imaginée… », en haut à gauche. */
const CartonContenu: React.FC<{ transparent?: boolean }> = ({ transparent = false }) => {
  const T = useMemo(() => tCarton(), []);
  const frame = useCurrentFrame();
  const { v } = useFormat();
  const taille = v ? 34 : 31;
  const p = sp(frame, 0, { damping: 16, stiffness: 200, mass: 0.6 });
  const s = lin(frame, T.sortie, T.sortie + 8, 0, 1, EASE_IN);
  const ouvert = Math.max(0, Math.min(1, p)) * (1 - s);
  const point = sp(frame, 6, { damping: 9, stiffness: 260, mass: 0.6 });
  return (
    <>
      <AbsoluteFill style={{ background: fondIncrustation(transparent) }}>
        <div
          style={{
            position: 'absolute',
            left: v ? 64 : 96,
            top: v ? 250 : 84,
            display: 'flex',
            alignItems: 'center',
            gap: taille * 0.55,
            background: C.fond,
            color: C.magnesie,
            fontFamily: TEXTE,
            fontWeight: 600,
            fontSize: taille,
            lineHeight: 1,
            padding: `${taille * 0.55}px ${taille * 0.8}px ${taille * 0.52}px ${taille * 0.62}px`,
            borderRadius: 999,
            clipPath: `inset(0 ${(1 - ouvert) * 100}% 0 0 round 999px)`,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: taille * 0.5,
              height: taille * 0.5,
              borderRadius: '50%',
              background: C.jaune,
              transform: `scale(${Math.max(0, point)})`,
              flex: 'none',
            }}
          />
          <span style={{ opacity: lin(frame, 4, 10, 0, 1, EASE) * (1 - s), transform: `translateX(${(1 - lin(frame, 4, 12, 0, 1, EASE)) * -16}px)` }}>
            {fr(bandeaux.carton.texte)}
          </span>
        </div>
      </AbsoluteFill>
    </>
  );
};

// ---------------------------------------------------------------------------
/** Bandeau nominatif bas d'écran : prénom · rôle (rôle joué). */
const BandeauNomContenu: React.FC<{ prenom: string; transparent?: boolean }> = ({ prenom, transparent = false }) => {
  const T = useMemo(() => tNom(), []);
  const frame = useCurrentFrame();
  const { v } = useFormat();
  const n = bandeaux.nom;
  const tNomP = v ? 84 : 76;
  const tRole = v ? 36 : 34;
  // le prénom s'ouvre, puis le rôle glisse de derrière ; sortie dans l'ordre inverse
  const pNom = sp(frame, 0, { damping: 15, stiffness: 240, mass: 0.6 });
  const pRole = sp(frame, 6, { damping: 17, stiffness: 200, mass: 0.7 });
  const sRole = lin(frame, T.sortie, T.sortie + 6, 0, 1, EASE_IN);
  const sNom = lin(frame, T.sortie + 3, T.sortie + 10, 0, 1, EASE_IN);
  const ouvreNom = Math.max(0, Math.min(1.04, pNom)) * (1 - sNom);
  const sortRole = Math.max(0, Math.min(1, pRole)) * (1 - sRole);
  const boiteNom = (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        background: C.jaune,
        color: C.fond,
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: tNomP,
        lineHeight: 1,
        padding: `${tNomP * 0.1}px ${tNomP * 0.28}px ${tNomP * 0.04}px`,
        clipPath: `inset(0 ${(1 - ouvreNom) * 100}% 0 0)`,
        whiteSpace: 'nowrap',
        alignSelf: 'flex-start',
      }}
    >
      <Mots mots={[fr(prenom).toUpperCase()]} a={3} taille={tNomP} famille={DISPLAY} poids={900} couleur={C.fond} interligne={1} />
    </div>
  );
  const boiteRole = (
    <div style={{ overflow: 'hidden', alignSelf: 'flex-start' }}>
      <div
        style={{
          background: C.fond,
          color: C.magnesie,
          fontFamily: TEXTE,
          fontWeight: 600,
          fontSize: tRole,
          lineHeight: 1.15,
          padding: `${tRole * 0.5}px ${tRole * 0.7}px ${tRole * 0.46}px`,
          transform: v ? `translateY(${(1 - sortRole) * -105}%)` : `translateX(${(1 - sortRole) * -105}%)`,
          display: 'flex',
          alignItems: 'center',
          gap: tRole * 0.45,
          whiteSpace: 'nowrap',
        }}
      >
        {!v && <span style={{ width: tRole * 0.32, height: tRole * 0.32, borderRadius: '50%', background: C.jaune, flex: 'none' }} />}
        <span>
          {fr(n.role)}{' '}
          <span style={{ fontWeight: 500, fontStyle: 'italic', color: '#BDB6AC' }}>{fr(n.mention)}</span>
        </span>
      </div>
    </div>
  );
  return (
    <>
      <AbsoluteFill style={{ background: fondIncrustation(transparent) }}>
        <div
          style={{
            position: 'absolute',
            left: v ? 64 : 110,
            bottom: v ? 430 : 120,
            display: 'flex',
            flexDirection: v ? 'column' : 'row',
            alignItems: v ? 'flex-start' : 'flex-end',
          }}
        >
          {boiteNom}
          {boiteRole}
        </div>
      </AbsoluteFill>
    </>
  );
};


/** Mesures du texte seulement une fois les polices chargées (d'où la porte autour). */
export const Question: React.FC<{ index: number; transparent?: boolean }> = (props) => (
  <Porte>
    <QuestionContenu {...props} />
  </Porte>
);

/** Mesures du texte seulement une fois les polices chargées (d'où la porte autour). */
export const Carton: React.FC<{ transparent?: boolean }> = (props) => (
  <Porte>
    <CartonContenu {...props} />
  </Porte>
);

/** Mesures du texte seulement une fois les polices chargées (d'où la porte autour). */
export const BandeauNom: React.FC<{ prenom: string; transparent?: boolean }> = (props) => (
  <Porte>
    <BandeauNomContenu {...props} />
  </Porte>
);
