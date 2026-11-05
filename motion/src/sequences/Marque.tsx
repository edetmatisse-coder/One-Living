import React, { useMemo } from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { marque } from '../../config';
import { C, DISPLAY, TEXTE, alpha, coul, fr } from '../theme';
import { ENTREE_BOUTEILLE, ECART_LETTRES, ECART_MOTS, REBOND2, VOLET, img, mots, tMarque } from '../timelines';
import { coup, lin, sp } from '../lib/temps';
import { ajuste, largeur, useFormat } from '../lib/mise-en-page';
import { Porte } from '../composants/Porte';
import { Fond, Grain } from '../composants/Fond';
import { Camera } from '../composants/Camera';
import { Mots, Lettres } from '../composants/Mots';
import { Volet } from '../composants/Volet';
import { Tampon } from '../composants/Tampon';
import { Produit } from '../composants/Produit';
import { Compteur, FlouDefs } from '../composants/Compteur';
import { Cercle, Coeur, Eclats, Pastille } from '../composants/Stickers';
import { Poudre } from '../composants/Poudre';
import { Buee } from '../composants/Buee';
import { Bande, Flash } from '../composants/Bande';

type TM = ReturnType<typeof tMarque>;

/** Teinte plus profonde d'une couleur (mélange avec du noir). */
const fonce = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - k));
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

/** Marque les mots de `phrase` qui forment la fin `fin` (soulignés au feutre). */
const jetonsSoulignes = (phrase: string, fin: string) => {
  const ws = mots(phrase);
  const f = mots(fin);
  const debut = f.length && ws.slice(-f.length).join(' ') === f.join(' ') ? ws.length - f.length : ws.length;
  return ws.map((t, i) => ({ t, souligne: i >= debut }));
};

// ---------------------------------------------------------------------------
// 0 à 3 s : le logo tombe et rebondit, « FONDÉ PAR JONNY WILKINSON »
// ---------------------------------------------------------------------------
const SceneLogo: React.FC<{ T: TM }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const o = T.logo.from;
  const d = T.logo.to - o + VOLET;
  const i1 = T.logo.impact1 - o;
  const i2 = T.logo.impact2 - o;
  const lw = v ? 880 : 840;
  const lh = (lw * 800) / 1372;
  const sol = v ? H * 0.48 : H * 0.64;

  // chute qui accélère, puis deux rebonds amortis, avec écrasement à l'impact
  let dy = 0;
  let rot = 0;
  if (frame < i1) {
    const q = Math.max(0, frame) / i1;
    dy = -(sol + 60) * (1 - q * q);
    rot = -9 * (1 - q);
  } else if (frame < i2) {
    const s = (frame - i1) / (i2 - i1);
    dy = -115 * 4 * s * (1 - s);
    rot = 2.6 * Math.sin(s * Math.PI);
  } else if (frame < i2 + REBOND2) {
    const s = (frame - i2) / REBOND2;
    dy = -26 * 4 * s * (1 - s);
  }
  const ecrase = (t0: number, k: number) => {
    const t = frame - t0;
    return t >= 0 ? k * Math.exp(-t / 1.9) * Math.cos(t * 0.85) : 0;
  };
  const e = ecrase(i1, 0.2) + ecrase(i2, 0.07);
  const hauteurVol = Math.min(1, -dy / 420);

  const fp = marque.logo.fondePar;
  const jetons = fp.mots.map((m) => ({ t: m, couleur: marque.logo.enJaune.includes(m) ? C.jaune : undefined, souligne: marque.logo.enJaune.includes(m) }));
  const a0 = T.logo.mots[0] - o;
  const ecart = Math.max(1, img(fp.ecart));
  const taille = v ? ajuste('JONNY WILKINSON', W * 0.86, 172) : ajuste(fp.mots.join(' '), W * 0.8, 156);
  const souligne = { a: T.logo.trait - o, couleur: C.magnesie, epaisseur: taille * 0.085, duree: 6 };
  const p = marque.logo.pastille;

  return (
    <AbsoluteFill>
      <Fond graine="logo" />
      <Camera
        impacts={[
          { f: i1, force: 1.3 },
          { f: i2, force: 0.35 },
          { f: T.logo.pastille - o, force: 0.2 },
        ]}
        zoom={[1, 1.045]}
        duree={d}
      >
        {/* ombre au sol */}
        <div
          style={{
            position: 'absolute',
            left: W / 2 - lw * 0.42,
            top: sol - 18,
            width: lw * 0.84,
            height: 44,
            background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))',
            opacity: frame < 0 ? 0 : 1 - hauteurVol * 0.85,
            transform: `scaleX(${1 - hauteurVol * 0.45})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: W / 2 - lw / 2,
            top: sol - lh,
            width: lw,
            height: lh,
            transform: `translateY(${dy}px) rotate(${rot}deg) scale(${1 + e * 0.6}, ${1 - e})`,
            transformOrigin: '50% 100%',
          }}
        >
          <Img src={staticFile('logo-one-living.png')} style={{ width: lw, height: lh, display: 'block' }} />
        </div>
        <Poudre a={i1} x={W / 2} y={sol} n={42} direction="cotes" vitesse={1.25} graine="logo" />
        {p.texte && (
          <Pastille
            a={T.logo.pastille - o}
            fond={C.magnesie}
            couleur={C.fond}
            taille={v ? 62 : 58}
            rot={9}
            style={{ left: W / 2 + lw * (v ? 0.33 : 0.4), top: sol - lh - (v ? 34 : 4) }}
          >
            {fr(p.texte)}
          </Pastille>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, top: sol + (v ? 90 : 62) }}>
          {v ? (
            <>
              <Mots mots={jetons.slice(0, 2)} a={a0} ecart={ecart} taille={taille} famille={DISPLAY} poids={900} couleur={C.magnesie} interligne={0.95} />
              <Mots
                mots={jetons.slice(2)}
                a={a0 + ecart * 2}
                ecart={ecart}
                taille={taille}
                famille={DISPLAY}
                poids={900}
                couleur={C.magnesie}
                interligne={0.95}
                souligne={{ ...souligne }}
              />
            </>
          ) : (
            <Mots mots={jetons} a={a0} ecart={ecart} taille={taille} famille={DISPLAY} poids={900} couleur={C.magnesie} interligne={1} souligne={souligne} />
          )}
        </div>
      </Camera>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 3 à 6 s : compteur qui défile jusqu'à 2003, bandeau « CHAMPION DU MONDE DE RUGBY »
// ---------------------------------------------------------------------------
const SceneChampion: React.FC<{ T: TM }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const o = T.champion.from;
  const d = T.champion.to - o + VOLET;
  const c = marque.champion;
  const dep = T.champion.depart - o;
  const pose = T.champion.pose - o;
  const bande = T.champion.bandeau - o;
  const taille = v ? 420 : 650;
  const chiffres = String(c.compteur.jusqua).length;
  const colW = Math.max(...'0123456789'.split('').map((ch) => largeur(ch, taille)));
  const nombreW = colW * chiffres;
  const cy = v ? H * 0.4 : H * 0.42;
  const bump = coup(frame, pose, 3.2);
  const lignes = v ? [c.bandeau.texte.split(' ').slice(0, 3).join(' '), c.bandeau.texte.split(' ').slice(3).join(' ')] : [c.bandeau.texte];
  return (
    <Volet depuis="droite" bandes={[{ couleur: C.jaune, largeur: v ? 130 : 180 }]}>
      <Fond graine="champ" />
      <Camera impacts={[{ f: pose, force: 1.45 }, { f: bande, force: 0.25 }]} zoom={[1, 1.06]} duree={d}>
        <div
          style={{
            position: 'absolute',
            left: W / 2 - nombreW / 2,
            top: cy - taille / 2,
            transform: `scale(${1 + 0.13 * bump})`,
            filter: bump > 0.25 ? `blur(${(bump * 7).toFixed(1)}px)` : undefined,
          }}
        >
          <Compteur de={c.compteur.depuis} vers={c.compteur.jusqua} debut={dep} pose={pose} chiffres={chiffres} taille={taille} couleur={C.magnesie} />
        </div>
        <Eclats a={pose + 1} x={W / 2 - nombreW / 2 - 10} y={cy - taille * 0.3} angle={-150} couleur={C.jaune} longueur={v ? 60 : 80} />
        <Eclats a={pose + 1} x={W / 2 + nombreW / 2 + 10} y={cy - taille * 0.3} angle={-30} couleur={C.jaune} longueur={v ? 60 : 80} />
        <Poudre a={pose} x={W / 2} y={cy + taille * 0.36} n={36} direction="cotes" vitesse={1.4} graine="2003" />
        <AbsoluteFill style={{ alignItems: 'center', top: v ? cy + taille * 0.46 : cy + taille * 0.37 }}>
          <Bande lignes={lignes} a={bande} taille={v ? 100 : 116} fond={C.magnesie} couleur={C.fond} rot={-2.5} decalage={v ? 26 : 0} />
        </AbsoluteFill>
      </Camera>
      <Flash a={pose} force={0.16} />
    </Volet>
  );
};

// ---------------------------------------------------------------------------
// 6 à 10 s : BIO / FERMENTÉ / VIVANT / BIEN FRAIS tamponnés, buée, « 1-4 °C »
// ---------------------------------------------------------------------------
const SceneValeurs: React.FC<{ T: TM }> = ({ T }) => {
  const { W, H, v } = useFormat();
  const o = T.valeurs.from;
  const d = T.valeurs.to - o + VOLET;
  const tps = marque.valeurs.tampons;
  const places: [number, number, number][] = v
    ? [
        [0.5, 0.27, -6],
        [0.5, 0.415, 4],
        [0.5, 0.56, -3],
        [0.5, 0.705, 3],
      ]
    : [
        [0.27, 0.3, -7],
        [0.69, 0.29, 4],
        [0.27, 0.7, 3],
        [0.705, 0.72, -4],
      ];
  const taille = v ? 176 : 205;
  const pt = marque.valeurs.pastille;
  const diam = v ? 480 : 440;
  const tPastille = Math.min(diam * 0.34, ajuste(fr(pt.texte), diam * 0.7, 400));
  const rel = (f: number) => f - o;
  return (
    <Volet
      depuis="gauche"
      biais={170}
      bandes={(['jaune', 'rose', 'bleu', 'orange'] as const).map((n) => ({ couleur: coul(n), largeur: v ? 64 : 84 }))}
    >
      <Fond graine="val" />
      <Camera
        impacts={[...T.valeurs.tampons.map((f) => ({ f: rel(f), force: 0.95 })), { f: rel(T.valeurs.pastille), force: 0.45 }]}
        zoom={[1, 1.05]}
        duree={d}
      >
        {tps.map((tp, i) => (
          <React.Fragment key={i}>
            <Tampon
              texte={tp.texte}
              a={rel(T.valeurs.tampons[i])}
              couleur={coul(tp.couleur)}
              rot={places[i][2]}
              taille={taille}
              x={W * places[i][0]}
              y={H * places[i][1]}
              graine={`t${i}`}
            />
            <Poudre a={rel(T.valeurs.tampons[i])} x={W * places[i][0]} y={H * places[i][1]} n={18} couleur={coul(tp.couleur)} vitesse={0.85} graine={`tp${i}`} />
          </React.Fragment>
        ))}
        <Buee a={rel(T.valeurs.buee)} />
        <Pastille
          a={rel(T.valeurs.pastille)}
          rond={diam}
          fond={C.bleu}
          couleur={C.magnesie}
          taille={tPastille}
          poids={900}
          rot={-6}
          bord={C.magnesie}
          style={{ left: W / 2, top: H / 2 }}
        >
          {fr(pt.texte)}
        </Pastille>
        <Cercle a={rel(T.valeurs.pastille) + 7} w={diam * 1.22} h={diam * 1.16} couleur={C.magnesie} epaisseur={9} style={{ left: W / 2, top: H / 2 }} />
      </Camera>
    </Volet>
  );
};

// ---------------------------------------------------------------------------
// 10 à 18 s : les 4 parfums, chacun sur un volet de sa couleur
// ---------------------------------------------------------------------------
const Parfum: React.FC<{ T: TM; i: number }> = ({ T, i }) => {
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const p = marque.parfums.liste[i];
  const s = T.parfums.slides[i];
  const d = s.to - s.from + VOLET;
  const fond = coul(p.couleur);
  const encre = fonce(fond, 0.3);
  const brut = v ? [...p.nom, ...p.nom] : p.nom;
  const cap = v ? 300 : 470;
  const tailles = brut.map((l) => ajuste(l, W * 0.94, cap));
  const lignes = brut.map((l, k) => (largeur(l, tailles[k]) < W * 0.6 ? [l, l, l, l].join('\u2003') : l));
  const hTotal = tailles.reduce((acc, t) => acc + t * 0.84, 0);
  const pose = s.pose - s.from;
  let y = H / 2 - hTotal / 2 + (v ? -40 : 0);
  return (
    <Volet depuis="droite" biais={170} bandes={[{ couleur: C.magnesie, largeur: v ? 40 : 54 }]}>
      <Fond couleur={fond} vignette={0.55} teinte={C.magnesie} graine={`parfum${i}`} />
      <Camera impacts={[{ f: pose, force: 0.6 }]} zoom={[1, 1.045]} duree={d} graine={`pc${i}`}>
        {lignes.map((l, k) => {
          const t = tailles[k];
          const top = y;
          y += t * 0.84;
          const sens = k % 2 === 0 ? 1 : -1;
          const q = sp(frame, 1 + k * 2, { damping: 16, stiffness: 170, mass: 0.7 });
          const x = sens * (1 - q) * W * 0.75 - sens * frame * 3.2;
          const plein = k % 2 === 0;
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top,
                textAlign: 'center',
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: t,
                lineHeight: 0.84,
                whiteSpace: 'nowrap',
                color: plein ? encre : 'transparent',
                WebkitTextStroke: plein ? undefined : `${Math.max(3, t * 0.014)}px ${encre}`,
                transform: `translateX(${x}px)`,
              }}
            >
              {l}
            </div>
          );
        })}
        {/* halo de lumière derrière la bouteille */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse ${v ? '55% 34%' : '30% 50%'} at 50% ${v ? '52%' : '56%'}, ${alpha('#FFFFFF', 0.32)}, rgba(255,255,255,0) 70%)`,
            opacity: lin(frame, ENTREE_BOUTEILLE, ENTREE_BOUTEILLE + 12),
          }}
        />
        <Produit
          id={p.image}
          hauteur={v ? 1120 : 880}
          a={ENTREE_BOUTEILLE}
          x={W / 2}
          bas={v ? H * 0.84 : H * 0.93}
          depuis="bas"
          inclinaison={30}
          reflet={s.reflet - s.from}
          ombre="rgba(0,0,0,0.42)"
        />
        <Pastille
          a={s.nom - s.from}
          fond={C.magnesie}
          couleur={C.fond}
          taille={v ? 52 : 50}
          police="texte"
          rot={v ? 6 : -5}
          style={{ left: v ? W * 0.74 : W / 2 + 390, top: v ? H * 0.19 : H * 0.7 }}
        >
          {p.nom.join('-').toLowerCase().replace(/^./, (c) => c.toUpperCase())}
        </Pastille>
        <Pastille
          a={s.index - s.from}
          rond={v ? 150 : 140}
          fond={C.fond}
          couleur={C.magnesie}
          taille={v ? 56 : 52}
          rot={-8}
          poids={900}
          style={{ left: v ? 150 : 170, top: v ? 300 : 160 }}
        >
          {i + 1}/{marque.parfums.liste.length}
        </Pastille>
      </Camera>
    </Volet>
  );
};

const SceneParfums: React.FC<{ T: TM }> = ({ T }) => (
  <>
    {T.parfums.slides.map((s, i) => (
      <Sequence key={i} from={s.from - T.parfums.from} durationInFrames={s.to - s.from + VOLET + 1} name={`Parfum ${i + 1}`}>
        <Parfum T={T} i={i} />
      </Sequence>
    ))}
  </>
);

// ---------------------------------------------------------------------------
// 18 à 21 s : les 3 shots en rafale, « AVANT LA SÉANCE »
// ---------------------------------------------------------------------------
const SceneShots: React.FC<{ T: TM }> = ({ T }) => {
  const frame = useCurrentFrame();
  const { W, H, v } = useFormat();
  const o = T.shots.from;
  const d = T.shots.to - o + VOLET;
  const m = marque.shots;
  const hs = v ? [440, 510, 440] : [540, 620, 540];
  const ecartX = v ? 300 : 360;
  const xs = [W / 2 - ecartX, W / 2, W / 2 + ecartX];
  const bas = v ? H * 0.58 : H * 0.665;
  const depuis = ['gauche', 'bas', 'droite'] as const;
  const rots = [-8, 0, 8];
  const tTitre = v ? ajuste('LA SÉANCE', W * 0.86, 240) : ajuste(m.titre.texte, W * 0.72, 200);
  const motsTitre = mots(m.titre.texte);
  const rel = (f: number) => f - o;
  return (
    <Volet depuis="gauche" bandes={[{ couleur: C.magnesie, largeur: v ? 40 : 54 }]}>
      <Fond graine="shots" />
      <Camera impacts={T.shots.arrivees.map((a) => ({ f: rel(a) + 5, force: 0.85 }))} zoom={[1, 1.05]} duree={d}>
        {T.shots.arrivees.map((a, i) => {
          const t = frame - rel(a) - 5;
          if (t < 0 || t > 12) return null;
          const r = hs[i] * (0.35 + t * 0.06);
          return (
            <div
              key={`r${i}`}
              style={{
                position: 'absolute',
                left: xs[i] - r,
                top: bas - hs[i] / 2 - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                border: `${Math.max(2, 10 - t * 0.7)}px solid ${C.magnesie}`,
                opacity: 0.5 * (1 - t / 12),
              }}
            />
          );
        })}
        {m.images.map((id, i) => (
          <Produit
            key={id}
            id={id}
            hauteur={hs[i]}
            a={rel(T.shots.arrivees[i])}
            x={xs[i]}
            bas={bas}
            depuis={depuis[i]}
            inclinaison={26}
            rot={rots[i]}
            reflet={rel(T.shots.arrivees[i]) + 12}
            ombre="rgba(0,0,0,0.55)"
            ressort={{ damping: 10, stiffness: 220, mass: 0.7 }}
            saut={rel(T.shots.hop) + i * 2}
          />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: v ? H * 0.62 : H * 0.705 }}>
          {v ? (
            <>
              <Mots mots={motsTitre.slice(0, 1)} a={rel(T.shots.titre)} ecart={ECART_MOTS} taille={tTitre} famille={DISPLAY} poids={900} couleur={C.magnesie} interligne={0.92} />
              <Mots
                mots={motsTitre.slice(1).map((t) => ({ t, couleur: C.jaune }))}
                a={rel(T.shots.titre) + ECART_MOTS}
                ecart={ECART_MOTS}
                taille={tTitre}
                famille={DISPLAY}
                poids={900}
                couleur={C.magnesie}
                interligne={0.92}
              />
            </>
          ) : (
            <Mots
              mots={motsTitre.map((t, k) => (k === 0 ? t : { t, couleur: C.jaune }))}
              a={rel(T.shots.titre)}
              ecart={ECART_MOTS}
              taille={tTitre}
              famille={DISPLAY}
              poids={900}
              couleur={C.magnesie}
            />
          )}
        </div>
        {m.pastille.texte && (
          <Pastille
            a={rel(T.shots.pastille)}
            fond={C.jaune}
            couleur={C.fond}
            taille={v ? 50 : 46}
            police="texte"
            rot={12}
            style={{ left: xs[2] + (v ? 60 : 150), top: bas - hs[2] - (v ? 40 : 10) }}
          >
            {fr(m.pastille.texte)}
          </Pastille>
        )}
      </Camera>
    </Volet>
  );
};

// ---------------------------------------------------------------------------
// 21 à 25 s : ONE GIVING, puis la phrase
// ---------------------------------------------------------------------------
const SceneGiving: React.FC<{ T: TM }> = ({ T }) => {
  const { W, H, v } = useFormat();
  const o = T.giving.from;
  const d = T.giving.to - o + VOLET;
  const g = marque.giving;
  const lignes = v ? g.titre.texte.split(' ') : [g.titre.texte];
  const tTitre = Math.min(...lignes.map((l) => ajuste(l, W * (v ? 0.86 : 0.8), v ? 380 : 400)));
  const hTitre = tTitre * 0.86 * lignes.length;
  const tPhrase = v ? 68 : 68;
  const lignesPhrase = v ? 3 : 1;
  const ecartTitre = v ? 70 : 56;
  const top = (H - (hTitre + ecartTitre + lignesPhrase * tPhrase * 1.22)) / 2 - (v ? 40 : 10);
  const rel = (f: number) => f - o;
  const lw = largeur(lignes[0], tTitre);
  let n = 0;
  return (
    <Volet depuis="bas" biais={110} bandes={[{ couleur: C.rose, largeur: v ? 70 : 64 }]}>
      <Fond couleur={C.magnesie} vignette={0.22} teinte={C.fond} graine="giving" particules={0.7} />
      <Camera impacts={[{ f: rel(T.giving.lettres[T.giving.lettres.length - 1]) + 3, force: 0.8 }]} zoom={[1, 1.05]} duree={d}>
        <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center' }}>
          {lignes.map((l, k) => {
            const debut = rel(T.giving.titre) + n * ECART_LETTRES;
            n += l.replace(/ /g, '').length;
            return (
              <div key={k} style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: tTitre, lineHeight: 0.86, color: C.fond }}>
                <Lettres texte={l} a={debut} ecart={ECART_LETTRES} mode="tombe" graine={`g${k}`} />
              </div>
            );
          })}
        </div>
        <Coeur
          a={rel(T.giving.coeur)}
          x={W / 2 + lw / 2 + (v ? 10 : 60)}
          y={top + tTitre * (v ? 0.1 : 0.12)}
          taille={v ? 120 : 130}
          couleur={C.rose}
          epaisseur={11}
          pouls={rel(T.giving.pouls)}
        />
        <div style={{ position: 'absolute', left: W * 0.08, right: W * 0.08, top: top + hTitre + ecartTitre }}>
          <Mots
            mots={jetonsSoulignes(fr(g.phrase.texte), fr(g.souligne))}
            a={rel(T.giving.phrase)}
            ecart={ECART_MOTS}
            taille={tPhrase}
            famille={TEXTE}
            poids={600}
            couleur={C.fond}
            interligne={1.22}
            espaceMots={0.26}
            largeurMax={W * 0.84}
            souligne={{ a: rel(T.giving.trait), couleur: C.rose, epaisseur: tPhrase * 0.16, duree: 6 }}
          />
        </div>
      </Camera>
    </Volet>
  );
};

// ---------------------------------------------------------------------------
export const Marque: React.FC = () => {
  const T = useMemo(() => tMarque(), []);
  const scene = (from: number, to: number, nom: string, el: React.ReactNode) => (
    <Sequence from={from} durationInFrames={to - from + VOLET + 1} name={nom}>
      {el}
    </Sequence>
  );
  return (
    <Porte>
      <AbsoluteFill style={{ background: C.fond }}>
        <FlouDefs />
        {scene(T.logo.from, T.logo.to, 'Logo', <SceneLogo T={T} />)}
        {scene(T.champion.from, T.champion.to, 'Champion 2003', <SceneChampion T={T} />)}
        {scene(T.valeurs.from, T.valeurs.to, 'Bio fermenté vivant', <SceneValeurs T={T} />)}
        {scene(T.parfums.from, T.parfums.to, 'Parfums', <SceneParfums T={T} />)}
        {scene(T.shots.from, T.shots.to, 'Shots', <SceneShots T={T} />)}
        {scene(T.giving.from, T.giving.to, 'One Giving', <SceneGiving T={T} />)}
        <Grain />
      </AbsoluteFill>
    </Porte>
  );
};

