import React, { useMemo, type CSSProperties } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { introInterview as cfg } from '../../config';
import { C, DISPLAY, TEXTE, coul, fr } from '../theme';
import { COULEURS_BANDES, IMPACT_MOT, tIntro } from '../timelines';
import { CLAMP, EASE_IN, POP, coup, lin, sp } from '../lib/temps';
import { secousse } from '../lib/camera';
import { ajuste, largeur, lignesEquilibrees, useFormat } from '../lib/mise-en-page';
import { Porte } from '../composants/Porte';
import { Fond, Grain } from '../composants/Fond';
import { Bande } from '../composants/Bande';
import { Pastille } from '../composants/Stickers';

/** Ce qui se voit là où il n'y a ni bandes ni scène : anthracite, transparence ou vert d'incrustation. */
export type FondIntro = 'plein' | 'transparent' | 'vert';

type TI = ReturnType<typeof tIntro>;

/** Bords en biais communs à toutes les bandes ; les polygones débordent en haut et en bas (la secousse ne laisse aucun trou). */
const biais = (W: number, H: number) => {
  const b = H * 0.32;
  const E = 180;
  const x = (X: number, y: number) => X + b * (1 - (2 * y) / H);
  const zone = (X0: number, X1: number) =>
    `polygon(${x(X0, -E).toFixed(1)}px ${-E}px, ${x(X1, -E).toFixed(1)}px ${-E}px, ${x(X1, H + E).toFixed(1)}px ${H + E}px, ${x(X0, H + E).toFixed(1)}px ${H + E}px)`;
  return { b, zone };
};

// ---------------------------------------------------------------------------
/** Mot qui claque : zoom qui recule (de très près à sa taille), traînée et flou de mouvement. */
const ZoomMot: React.FC<{ texte: string; a: number; taille: number; couleur: string }> = ({ texte, a, taille, couleur }) => {
  const frame = useCurrentFrame();
  const style: CSSProperties = {
    display: 'inline-block',
    fontFamily: DISPLAY,
    fontWeight: 900,
    fontSize: taille,
    lineHeight: 0.86,
    color: couleur,
    whiteSpace: 'nowrap',
  };
  const t = frame - a;
  if (t < 0) return <span style={{ ...style, opacity: 0 }}>{texte}</span>;
  // de très près (×3,6) à sa taille en IMPACT_MOT images, puis un petit rebond
  const echelle = (f: number) => {
    const u = f - a;
    if (u <= IMPACT_MOT) return 1 + 2.6 * Math.pow(1 - Math.max(0, u) / IMPACT_MOT, 2.4);
    return 1 - 0.07 * Math.exp(-(u - IMPACT_MOT) / 1.6) * Math.cos((u - IMPACT_MOT) * 1.1);
  };
  const s = echelle(frame);
  const vit = Math.abs(s - echelle(frame + 1));
  const flou = Math.min(18, vit * 24);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {vit > 0.04 &&
        [1, 2, 3].map((g) => (
          <span
            key={g}
            style={{
              ...style,
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `scale(${s + vit * g * 0.6})`,
              opacity: 0.24 * (1 - g / 4),
              filter: `blur(${(flou * (1 + g * 0.35)).toFixed(1)}px)`,
            }}
          >
            {texte}
          </span>
        ))}
      <span style={{ ...style, transform: `scale(${s})`, filter: flou > 0.6 ? `blur(${flou.toFixed(1)}px)` : undefined }}>{texte}</span>
    </span>
  );
};

// ---------------------------------------------------------------------------
/** « ON A » / « POSÉ » / « 5 QUESTIONS » : le dernier en jaune, deux fois plus gros. */
const Accroche: React.FC<{ T: TI }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { W, v } = useFormat();
  const mots = cfg.accroche.mots.map((m) => fr(m.texte));
  const dernier = mots[mots.length - 1];
  const parties = v ? dernier.split(' ') : [dernier];
  const grand = Math.min(...parties.map((p) => ajuste(p, W * (v ? 0.9 : 0.84), v ? 340 : 430)));
  const petit = grand / 2;
  const lignes: { texte: string; a: number; taille: number; couleur: string }[][] = v
    ? [
        ...mots.slice(0, -1).map((m, i) => [{ texte: m, a: T.mots[i], taille: petit, couleur: C.magnesie }]),
        ...parties.map((p) => [{ texte: p, a: T.mots[mots.length - 1], taille: grand, couleur: C.jaune }]),
      ]
    : [
        mots.slice(0, -1).map((m, i) => ({ texte: m, a: T.mots[i], taille: petit, couleur: C.magnesie })),
        [{ texte: dernier, a: T.mots[mots.length - 1], taille: grand, couleur: C.jaune }],
      ];
  const fin = lin(frame, T.invite, T.invite + 3, 1, 0, EASE_IN);
  if (fin <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fin,
        transform: `translateY(${v ? -40 : -10}px) scale(${1 + 0.1 * (1 - fin)})`,
      }}
    >
      {lignes.map((l, i) => (
        <div key={i} style={{ display: 'flex', gap: l[0].taille * 0.24, justifyContent: 'center', height: l[0].taille * 0.86 }}>
          {l.map((m, k) => (
            <ZoomMot key={k} texte={m.texte} a={m.a} taille={m.taille} couleur={m.couleur} />
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
/** L'invité : prénom sur bandeau jaune, rôle dessous, logo en pop, pastille « rôle joué ». */
const Invite: React.FC<{ T: TI }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  if (frame < T.invite || frame >= T.teaser + 2) return null;
  const nom = fr(cfg.prenom).toUpperCase();
  const tNom = v ? ajuste(nom, W * 0.7, 250) : ajuste(nom, W * 0.56, 300);
  const role = fr(cfg.invite.role);
  const tRole = v ? 50 : 48;
  const lignesRole = v ? lignesEquilibrees(role, tRole, W * 0.84 - tRole * 0.6, { famille: TEXTE, poids: 700 }) : [role];
  const hNom = tNom * 1.17;
  const cy = v ? H * 0.42 : H * 0.43;
  const haut = cy - hNom / 2;
  const largeurBande = largeur(nom, tNom) + tNom * 0.6;
  const sortie = lin(frame, T.sortieInvite, T.sortieInvite + 4, 1, 0, EASE_IN);
  const logoP = sp(frame, T.logo, POP);
  const logoW = v ? 300 : 360;
  const xPastille = v ? Math.min(W - 170, W / 2 + largeurBande / 2 - 70) : Math.max(150, W / 2 - largeurBande / 2 + 40);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: haut, display: 'flex', justifyContent: 'center' }}>
        <Bande lignes={[nom]} a={T.invite} taille={tNom} fond={C.jaune} couleur={C.fond} rot={-2} sortie={T.sortieInvite} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: haut + hNom + (v ? 34 : 30), display: 'flex', justifyContent: 'center' }}>
        <Bande
          lignes={lignesRole}
          a={T.role}
          taille={tRole}
          fond={C.magnesie}
          couleur={C.fond}
          rot={1.5}
          sortie={T.sortieInvite}
          famille={TEXTE}
          poids={700}
          decalage={lignesRole.length > 1 ? 14 : 0}
        />
      </div>
      {frame >= T.logo && (
        <div
          style={{
            position: 'absolute',
            left: v ? W - logoW / 2 - 70 : W - logoW / 2 - 110,
            top: v ? 380 : 190,
            width: logoW,
            transform: `translate(-50%, -50%) rotate(${(1 - logoP) * -24 + 4}deg) scale(${Math.max(0, logoP) * sortie})`,
          }}
        >
          <Img src={staticFile('logo-one-living.png')} style={{ width: logoW, display: 'block' }} />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${sortie})`, transformOrigin: `${xPastille}px ${haut}px` }}>
        <Pastille
          a={T.pastille}
          fond={C.rose}
          couleur={C.magnesie}
          taille={v ? 46 : 48}
          police="texte"
          poids={700}
          rot={-9}
          bord={C.magnesie}
          style={{ left: xPastille, top: haut - (v ? 14 : 10) }}
        >
          {fr(cfg.invite.pastille.texte)}
        </Pastille>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
/** Les 5 questions en rafale : des cartes qui se retournent, compteur 1/5 à 5/5. */
const Teaser: React.FC<{ T: TI }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  if (frame < T.teaser) return null;
  const cartes = cfg.teaser.questions.map((q) => fr(q).toUpperCase());
  const n = cartes.length;
  const cw = v ? W * 0.86 : 1120;
  const ch = v ? 580 : 460;
  const tq = v ? 108 : 124;
  const cx = v ? W / 2 : W / 2 + 120;
  const cy = v ? H * 0.5 : H * 0.48;
  let i = 0;
  for (let k = 0; k < n; k++) if (frame >= T.cartes[k]) i = k;
  const t = frame - T.cartes[i];
  const dernier = i === n - 1;
  const angle = interpolate(t, dernier ? [0, 1, 2] : [0, 1, 2, 5, 6], dernier ? [-72, 7, 0] : [-72, 7, 0, 0, 72], CLAMP);
  const wob = (i % 2 === 0 ? -1 : 1) * 1.4;
  const ls = lignesEquilibrees(cartes[i], tq, cw - tq * 1.1);
  const entree = sp(frame, T.teaser, POP);
  const pop = coup(frame, T.cartes[i], 2.4);
  const tc = v ? 150 : 170;
  const carte = (fond: string, dx: number, dy: number, r: number, contenu?: React.ReactNode, transform = '') => (
    <div
      style={{
        position: 'absolute',
        left: cx - cw / 2 + dx,
        top: cy - ch / 2 + dy,
        width: cw,
        height: ch,
        background: fond,
        borderRadius: 22,
        transform: `${transform} rotate(${r}deg)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {contenu}
    </div>
  );
  return (
    <AbsoluteFill style={{ transform: `scale(${0.8 + 0.2 * Math.max(0, entree)})`, transformOrigin: `${cx}px ${cy}px` }}>
      {/* le paquet, derrière */}
      {carte('#9C7600', 30, 34, 3.5)}
      {carte('#C79400', 15, 17, 1.6)}
      {/* la carte du dessus, qui se retourne */}
      {carte(
        C.jaune,
        0,
        0,
        wob,
        ls.map((l, k) => (
          <div key={k} style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: tq, lineHeight: 0.94, color: C.fond, whiteSpace: 'nowrap' }}>
            {l}
          </div>
        )),
        `perspective(1800px) rotateY(${angle}deg)`,
      )}
      {/* compteur */}
      <div
        style={{
          position: 'absolute',
          left: v ? W / 2 : cx - cw / 2 - 210,
          top: v ? cy - ch / 2 - 150 : cy,
          transform: `translate(-50%, -50%) scale(${1 + 0.28 * pop})`,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: tc,
          lineHeight: 0.85,
          color: C.magnesie,
          whiteSpace: 'nowrap',
        }}
      >
        {i + 1}
        <span style={{ fontSize: '0.5em', color: C.jaune }}>/{n}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
/** « Interview imaginée, rôle joué par un étudiant » : en petit, en bas à gauche, tout le temps. */
const Mention: React.FC = () => {
  const { v } = useFormat();
  const t = v ? 30 : 26;
  return (
    <div
      style={{
        position: 'absolute',
        left: v ? 48 : 56,
        bottom: v ? 260 : 44,
        display: 'flex',
        alignItems: 'center',
        gap: t * 0.5,
        background: C.fond,
        color: C.magnesie,
        fontFamily: TEXTE,
        fontWeight: 600,
        fontSize: t,
        lineHeight: 1,
        padding: `${t * 0.5}px ${t * 0.75}px ${t * 0.48}px ${t * 0.58}px`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: t * 0.46, height: t * 0.46, borderRadius: '50%', background: C.jaune, flex: 'none' }} />
      {fr(cfg.mention)}
    </div>
  );
};

// ---------------------------------------------------------------------------
const IntroContenu: React.FC<{ fond: FondIntro }> = ({ fond }) => {
  const T = useMemo(() => tIntro(), []);
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const { b, zone } = biais(W, H);
  const w = v ? W * 0.56 : W * 0.34;
  const elan = Easing.bezier(0.42, 0, 0.2, 1);
  const course = W + 2 * b + w;

  // bandes d'entrée : de droite à gauche, jaune, rose, bleue ; la scène arrive derrière la dernière
  const pE = T.entree.map((a) => lin(frame, a - 1, a - 1 + T.traversee, 0, 1, elan));
  const gaucheE = pE.map((p) => W + b - p * course);
  // bandes de sortie : de gauche à droite, bleue, rose, jaune ; la transparence revient derrière la première
  const pS = T.sortie.map((a) => lin(frame, a - 1, a - 1 + T.traverseeSortie, 0, 1, elan));
  const droiteS = pS.map((p) => -b + p * course);

  let clip: string | undefined;
  let scene = true;
  if (frame < T.finEntree) clip = zone(gaucheE[2] + w, gaucheE[2] + w + 4 * W);
  else if (frame >= T.sortie[0]) {
    if (pS[0] >= 1) scene = false;
    else clip = zone(droiteS[0], droiteS[0] + 4 * W);
  }

  const impacts = [
    { f: T.secousse, force: 0.6 },
    ...T.impacts.map((f, k) => ({ f, force: k === T.impacts.length - 1 ? 1.3 : 0.75 })),
    { f: T.invite + 4, force: 0.55 },
    { f: T.logo + 3, force: 0.25 },
    ...T.cartes.map((f) => ({ f: f + 1, force: 0.22 })),
    { f: T.sortie[0] + 2, force: 0.4 },
  ];
  const s = secousse(frame, impacts, 'intro');
  const zoom = lin(frame, T.finEntree, T.sortie[0], 1, 1.05);
  const flash = frame === T.impacts[T.impacts.length - 1];

  const bande = (couleur: string, x0: number, cle: string) => (
    <AbsoluteFill key={cle} style={{ clipPath: zone(x0, x0 + w), background: couleur, transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg)` }}>
      <Grain />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: fond === 'plein' ? C.fond : fond === 'vert' ? C.vert : 'transparent' }}>
      {scene && (
        <AbsoluteFill style={{ clipPath: clip }}>
          <Fond graine="intro" />
          <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(${zoom * (1 + s.s)})` }}>
            <Accroche T={T} />
            <Invite T={T} />
            <Teaser T={T} />
          </AbsoluteFill>
          <Grain />
          {flash && <AbsoluteFill style={{ background: '#FFFFFF', opacity: 0.88 }} />}
        </AbsoluteFill>
      )}
      {COULEURS_BANDES.map((c, k) => (pE[k] > 0 && pE[k] < 1 ? bande(coul(c), gaucheE[k], `e${k}`) : null))}
      {COULEURS_BANDES.map((_, k) => {
        const c = COULEURS_BANDES[COULEURS_BANDES.length - 1 - k];
        return pS[k] > 0 && pS[k] < 1 ? bande(coul(c), droiteS[k] - w, `s${k}`) : null;
      })}
      <Mention />
    </AbsoluteFill>
  );
};

/** 08 · l'intro de l'interview. `fond` : plein (MP4), transparent (ProRes 4444), vert (incrustation). */
export const IntroInterview: React.FC<{ fond?: FondIntro }> = ({ fond = 'plein' }) => (
  <Porte>
    <IntroContenu fond={fond} />
  </Porte>
);

