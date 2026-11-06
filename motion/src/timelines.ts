/**
 * Moments clés de chaque séquence, en images, calculés depuis config.ts.
 * Les animations ET la feuille de bruitages lisent ce fichier : ils restent
 * toujours calés ensemble. (Aucun import React ici : lu aussi par Node.)
 */
import {
  IMAGES_PAR_SECONDE as FPS,
  bandeaux,
  entonnoir,
  final,
  introInterview,
  marque,
  questions,
  soixanteNeuf,
  titre,
} from '../config';

/** secondes -> images */
export const img = (s: number) => Math.round(s * FPS);
/** images -> secondes */
export const sec = (i: number) => Math.round((i / FPS) * 100) / 100;

export type Son = 'whoosh' | 'pop' | 'tampon' | 'bouteille' | 'impact' | 'compteur' | 'feutre' | 'souffle' | 'clic' | 'tic';

export interface Bruit {
  /** seconde dans la séquence */
  t: number;
  son: Son;
  quoi: string;
  /** pour un son qui dure (compteur) : seconde de fin */
  fin?: number;
}

// Durées d'animation partagées (en images)
export const VOLET = 9; // un volet traverse l'écran
export const CHUTE = 9; // le logo tombe jusqu'au premier impact
export const REBOND = 10; // premier rebond du logo
export const REBOND2 = 6; // second rebond
export const APPROCHE = 5; // un tampon descend pendant 5 images avant l'impact
export const ENTREE_BOUTEILLE = 3; // la bouteille entre 3 images après le début du volet
export const POSE_BOUTEILLE = 13; // puis se pose 13 images plus tard
export const ECART_MOTS = 4; // images entre deux mots qui montent
export const ECART_LETTRES = 2; // images entre deux lettres qui tombent

/** Mots d'un texte (les espaces insécables restent dans le mot). */
export const mots = (t: string) => t.split(/ +/).filter(Boolean);

// ---------------------------------------------------------------------------
export function tMarque() {
  const m = marque;
  const total = img(m.duree);
  const debut = {
    logo: img(m.logo.debut),
    champion: img(m.champion.debut),
    valeurs: img(m.valeurs.debut),
    parfums: img(m.parfums.debut),
    shots: img(m.shots.debut),
    giving: img(m.giving.debut),
  };
  const b: Bruit[] = [];

  // logo
  const impact1 = debut.logo + CHUTE;
  const impact2 = impact1 + REBOND;
  const motsFonde = m.logo.fondePar.mots.map((_, i) => img(m.logo.fondePar.a + i * m.logo.fondePar.ecart));
  const traitNom = motsFonde[motsFonde.length - 1] + 7;
  b.push({ t: sec(debut.logo), son: 'whoosh', quoi: 'le logo tombe' });
  b.push({ t: sec(impact1), son: 'impact', quoi: 'le logo touche le sol' });
  b.push({ t: sec(impact2), son: 'pop', quoi: 'petit rebond du logo' });
  if (m.logo.pastille.texte) b.push({ t: m.logo.pastille.a, son: 'pop', quoi: `pastille « ${m.logo.pastille.texte} »` });
  b.push({ t: sec(motsFonde[0]), son: 'whoosh', quoi: `« ${m.logo.fondePar.mots.join(' ')} », mot par mot (whoosh léger)` });
  b.push({ t: sec(traitNom), son: 'feutre', quoi: 'souligné au feutre sous le nom' });

  // champion
  const depart = img(m.champion.compteur.depart);
  const pose = img(m.champion.compteur.pose);
  b.push({ t: sec(debut.champion), son: 'whoosh', quoi: 'volet jaune' });
  b.push({ t: m.champion.bandeau.a, son: 'whoosh', quoi: `bandeau « ${m.champion.bandeau.texte} »` });
  b.push({ t: sec(depart), son: 'compteur', quoi: `le compteur défile jusqu'à ${m.champion.compteur.jusqua}`, fin: sec(pose) });
  b.push({ t: sec(pose), son: 'impact', quoi: `${m.champion.compteur.jusqua} se pose` });

  // valeurs
  const tampons = m.valeurs.tampons.map((x) => img(x.a));
  const buee = img(m.valeurs.buee);
  const pastilleFroid = img(m.valeurs.pastille.a);
  b.push({ t: sec(debut.valeurs), son: 'whoosh', quoi: 'volet aux 4 couleurs' });
  m.valeurs.tampons.forEach((x) => b.push({ t: x.a, son: 'tampon', quoi: `tampon « ${x.texte} »` }));
  b.push({ t: sec(buee), son: 'souffle', quoi: "l'écran se couvre de buée (souffle froid)" });
  b.push({ t: sec(pastilleFroid), son: 'pop', quoi: `pastille « ${m.valeurs.pastille.texte} »` });

  // parfums
  const slides = m.parfums.liste.map((p, i) => {
    const from = img(p.a);
    return {
      from,
      entree: from + ENTREE_BOUTEILLE,
      pose: from + ENTREE_BOUTEILLE + POSE_BOUTEILLE,
      reflet: from + 22,
      index: from + 34,
      nom: from + 46,
      to: i < m.parfums.liste.length - 1 ? img(m.parfums.liste[i + 1].a) : debut.shots,
    };
  });
  m.parfums.liste.forEach((p, i) => {
    const s = slides[i];
    b.push({ t: sec(s.from), son: 'whoosh', quoi: `volet ${p.couleur}, ${p.nom.join('-').toLowerCase()}` });
    b.push({
      t: sec(s.pose),
      son: i === 0 ? 'bouteille' : 'pop',
      quoi: i === 0 ? 'la bouteille se pose (ouverture de bouteille, « pschitt »)' : 'la bouteille se pose',
    });
    b.push({ t: sec(s.nom), son: 'pop', quoi: `pastille « ${p.nom.join('-').toLowerCase()} » (pop léger)` });
  });

  // shots
  const arrivees = m.shots.images.map((_, i) => img(m.shots.rafale.a + i * m.shots.rafale.ecart));
  const titreShots = img(m.shots.titre.a);
  const pastilleShots = img(m.shots.pastille.a);
  const hop = pastilleShots + 16;
  b.push({ t: sec(debut.shots), son: 'whoosh', quoi: 'volet anthracite' });
  arrivees.forEach((a, i) =>
    b.push({ t: sec(a + 5), son: i === 0 ? 'bouteille' : 'pop', quoi: i === 0 ? 'premier shot (ouverture, « pschitt » court)' : `shot ${i + 1}` }),
  );
  b.push({ t: sec(titreShots), son: 'whoosh', quoi: `« ${m.shots.titre.texte} »` });
  if (m.shots.pastille.texte) b.push({ t: sec(pastilleShots), son: 'pop', quoi: `pastille « ${m.shots.pastille.texte} »` });
  b.push({ t: sec(hop), son: 'pop', quoi: 'les 3 shots font un petit saut (3 pops légers, facultatif)' });

  // giving
  const titreGiving = img(m.giving.titre.a);
  const lettres = [...m.giving.titre.texte.replace(/ /g, '')].map((_, i) => titreGiving + i * ECART_LETTRES);
  const phrase = img(m.giving.phrase.a);
  const nMots = mots(m.giving.phrase.texte).length;
  const traitGiving = phrase + nMots * ECART_MOTS + 6;
  const coeur = lettres[lettres.length - 1] + 8;
  const pouls = traitGiving + 22;
  b.push({ t: sec(debut.giving), son: 'whoosh', quoi: 'volet magnésie (vers le haut)' });
  b.push({ t: sec(lettres[lettres.length - 1] + 3), son: 'impact', quoi: `« ${m.giving.titre.texte} » complet` });
  b.push({ t: sec(coeur), son: 'pop', quoi: 'cœur dessiné' });
  b.push({ t: sec(phrase), son: 'whoosh', quoi: 'la phrase monte (whoosh léger)' });
  if (m.giving.souligne) b.push({ t: sec(traitGiving), son: 'feutre', quoi: `souligné au feutre « ${m.giving.souligne} »` });
  b.push({ t: sec(pouls), son: 'pop', quoi: 'le cœur bat une fois (pop léger)' });

  return {
    total,
    debut,
    logo: { from: debut.logo, to: debut.champion, impact1, impact2, pastille: img(m.logo.pastille.a), mots: motsFonde, trait: traitNom },
    champion: { from: debut.champion, to: debut.valeurs, bandeau: img(m.champion.bandeau.a), depart, pose },
    valeurs: { from: debut.valeurs, to: debut.parfums, tampons, buee, pastille: pastilleFroid },
    parfums: { from: debut.parfums, to: debut.shots, slides },
    shots: { from: debut.shots, to: debut.giving, arrivees, titre: titreShots, pastille: pastilleShots, hop },
    giving: { from: debut.giving, to: total, titre: titreGiving, lettres, phrase, trait: traitGiving, coeur, pouls },
    bruits: b,
  };
}

// ---------------------------------------------------------------------------
export function tEntonnoir() {
  const e = entonnoir;
  const T = e.temps;
  const total = img(e.duree);
  const elimines = e.sports.filter((s) => !e.finalistes.includes(s));
  const tombent = e.finalistes.filter((s) => s !== e.gagnant);
  const tri = elimines.map((_, i) => img(T.tri) + i * 2);
  const chute = tombent.map((_, i) => img(T.chute) + i * 3);
  const un = img(T.un);
  const b: Bruit[] = [
    { t: T.grille, son: 'whoosh', quoi: 'les 16 noms arrivent' },
    { t: T.seize, son: 'impact', quoi: 'le compteur « 16 »' },
    { t: T.tri, son: 'clic', quoi: '12 noms barrés au feutre (rafale de clics, ou feutre)', fin: sec(tri[tri.length - 1] + 4) },
    { t: T.quatre, son: 'pop', quoi: 'il en reste 4' },
    ...chute.map((c, i) => ({ t: sec(c), son: 'whoosh' as Son, quoi: `« ${tombent[i]} » tombe` })),
    { t: sec(un), son: 'whoosh', quoi: 'ESCALADE remplit l’écran' },
    { t: sec(un + 10), son: 'impact', quoi: 'écran jaune' },
    { t: sec(un + 12), son: 'pop', quoi: 'pastille « 1 »' },
    { t: sec(un + 22), son: 'feutre', quoi: 'souligné sous ESCALADE' },
  ];
  return {
    total,
    grille: img(T.grille),
    seize: img(T.seize),
    tri,
    elimines,
    quatre: img(T.quatre),
    chute,
    tombent,
    un,
    bruits: b,
  };
}

// ---------------------------------------------------------------------------
export function tSoixanteNeuf() {
  const s = soixanteNeuf;
  const total = img(s.duree);
  const depart = img(s.compteur.depart);
  const pose = img(s.compteur.pose);
  const pourcent = img(s.pourcent);
  const phrase = img(s.phrase.a);
  const nMots = mots(s.phrase.texte).length;
  const trait = phrase + nMots * 3 + 5;
  const source = img(s.source.a);
  const b: Bruit[] = [
    { t: sec(depart), son: 'compteur', quoi: `le compteur file de 0 à ${s.valeur}`, fin: sec(pose) },
    { t: sec(pose), son: 'impact', quoi: `${s.valeur} se pose` },
    { t: sec(pourcent), son: 'impact', quoi: 'le « % » claque (impact + whoosh court)' },
    { t: sec(phrase), son: 'whoosh', quoi: 'la phrase monte (whoosh léger)' },
  ];
  if (s.souligne) b.push({ t: sec(trait), son: 'feutre', quoi: `souligné au feutre « ${s.souligne} »` });
  return { total, depart, pose, pourcent, phrase, trait, source, bruits: b };
}

// ---------------------------------------------------------------------------
export function tQuestion() {
  const total = img(questions.duree);
  const sortie = total - 9;
  const b: Bruit[] = [
    { t: 0, son: 'whoosh', quoi: 'le bandeau jaune s’ouvre' },
    { t: sec(4), son: 'pop', quoi: 'étiquette « QUESTION n »' },
    { t: sec(sortie), son: 'whoosh', quoi: 'le bandeau repart' },
  ];
  return { total, bande: 0, etiquette: 4, texte: 7, sortie, bruits: b };
}

export function tCarton() {
  const total = img(bandeaux.carton.duree);
  const sortie = total - 9;
  return {
    total,
    sortie,
    bruits: [
      { t: 0, son: 'whoosh', quoi: 'le carton glisse (whoosh très doux, facultatif)' },
      { t: sec(sortie), son: 'whoosh', quoi: 'le carton repart (facultatif)' },
    ] as Bruit[],
  };
}

export function tNom() {
  const total = img(bandeaux.nom.duree);
  const sortie = total - 10;
  return {
    total,
    sortie,
    bruits: [
      { t: 0, son: 'whoosh', quoi: 'le bandeau nominatif entre' },
      { t: sec(sortie), son: 'whoosh', quoi: 'le bandeau sort' },
    ] as Bruit[],
  };
}

// ---------------------------------------------------------------------------
export function tFinal() {
  const F = final.temps;
  const total = img(final.duree);
  const lettres = [...final.titre.replace(/ /g, '')].map((_, i) => img(F.titre) + i * ECART_LETTRES);
  const trait = img(F.trait);
  const equipe = final.equipe.map((_, i) => img(F.equipe) + i * 4);
  const mention = img(F.mention);
  const b: Bruit[] = [
    { t: F.titre, son: 'clic', quoi: '« APRÈS LA VOIE. » lettre par lettre (clics rapides)', fin: sec(lettres[lettres.length - 1]) },
    { t: sec(lettres[lettres.length - 1] + 2), son: 'impact', quoi: 'le point final' },
    { t: F.trait, son: 'souffle', quoi: 'trait de magnésie (frottement de craie, souffle de poudre)' },
    ...equipe.map((e, i) => ({ t: sec(e), son: 'pop' as Son, quoi: `${final.equipe[i].prenom} ${final.equipe[i].nom}` })),
    { t: F.mention, son: 'whoosh', quoi: 'mention du projet (whoosh très doux)' },
  ];
  return { total, lettres, trait, equipe, mention, bruits: b };
}

// ---------------------------------------------------------------------------
export function tTitre() {
  const T = titre.temps;
  const total = img(titre.duree);
  const n = titre.lignes.join('').replace(/ /g, '').length;
  const lettres = Array.from({ length: n }, (_, i) => img(T.lettres + i * T.parLettre));
  const fin = lettres[lettres.length - 1];
  const b: Bruit[] = [
    { t: T.lettres, son: 'clic', quoi: 'les lettres claquent une à une (machine à écrire rapide)', fin: sec(fin) },
    { t: sec(fin + 2), son: 'impact', quoi: 'la question est complète' },
    { t: sec(fin + 8), son: 'feutre', quoi: 'souligné sous la dernière ligne' },
  ];
  return { total, lettres, fin, trait: fin + 8, bruits: b };
}

// ---------------------------------------------------------------------------
/** Images entre le début d'un mot de l'accroche et son impact (zoom qui recule). */
export const IMPACT_MOT = 4;
export const COULEURS_BANDES = ['jaune', 'rose', 'bleu'] as const;

export function tIntro() {
  const c = introInterview;
  const total = img(c.duree);
  const noms = ['jaune', 'rose', 'bleue'];
  const entree = COULEURS_BANDES.map((_, k) => img(c.entree.a + k * c.entree.ecart));
  const traversee = Math.max(2, img(c.entree.traversee));
  const finEntree = entree[entree.length - 1] + traversee;
  const mots = c.accroche.mots.map((m) => img(m.a));
  const impacts = mots.map((f) => f + IMPACT_MOT);
  const invite = img(c.invite.a);
  const par = Math.max(2, img(c.teaser.parQuestion));
  const cartes = c.teaser.questions.map((_, i) => img(c.teaser.a) + i * par);
  // les bandes repartent dans l'ordre inverse : bleue, rose, jaune
  const sortie = COULEURS_BANDES.map((_, k) => img(c.sortie.a + k * c.sortie.ecart));
  const traverseeSortie = Math.max(2, img(c.sortie.traversee));
  const b: Bruit[] = [
    ...entree.map((f, k) => ({ t: sec(f), son: 'whoosh' as Son, quoi: `bande ${noms[k]} (entrée)` })),
    ...impacts.map((f, k) => ({ t: sec(f), son: 'impact' as Son, quoi: `« ${c.accroche.mots[k].texte} »` })),
    { t: c.invite.logoA, son: 'pop', quoi: 'le logo One Living' },
    ...cartes.map((f, i) => ({ t: sec(f), son: 'tic' as Son, quoi: `question ${i + 1}/${cartes.length}` })),
    { t: sec(sortie[0]), son: 'whoosh', quoi: 'les bandes repartent (sortie)' },
  ];
  return {
    total,
    entree,
    traversee,
    finEntree,
    secousse: img(c.entree.secousse),
    mots,
    impacts,
    invite,
    role: img(c.invite.roleA),
    logo: img(c.invite.logoA),
    pastille: img(c.invite.pastille.a),
    sortieInvite: img(c.invite.sortie),
    teaser: img(c.teaser.a),
    par,
    cartes,
    sortie,
    traverseeSortie,
    bruits: b,
  };
}
