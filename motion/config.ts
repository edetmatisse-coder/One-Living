/**
 * APRÈS LA VOIE · réglages du motion design
 * ==========================================
 *
 * Tout ce qui se règle est dans ce fichier : durées, moments clés et textes.
 * Les animations (dossier src/) suivent toutes seules.
 *
 * RECALER SUR LA VOIX OFF
 * - Les moments sont en SECONDES, comptés depuis le début de la séquence
 *   (0 = première image du fichier, comme le début du clip dans CapCut).
 * - Écoute la voix off, note la seconde où chaque mot tombe, reporte-la ici.
 * - Les nombres s'écrivent avec un point : 4.5 (et pas 4,5).
 * - Puis relance le rendu : npm run rendu (tout) ou npm run rendu -- 01 (une séquence).
 *
 * TEXTES
 * - Écris-les normalement, avec les accents. Les espaces avant « ? », « ! », « : »
 *   et « % » deviennent insécables tout seuls (rien ne part seul à la ligne).
 */

export const IMAGES_PAR_SECONDE = 30;

/** Palette « Après la voie ». */
export const COULEURS = {
  fond: '#1B1916', // anthracite
  magnesie: '#F3EFE8', // blanc magnésie (textes)
  jaune: '#F2B705', // signature des questions, gingembre-curcuma
  rose: '#E64980', // framboise-grenade
  bleu: '#5C7CFA', // passion-goji
  orange: '#FD7E14', // mangue-citron vert
  vert: '#00FF00', // fond d'incrustation (chroma key)
} as const;

export type NomCouleur = keyof typeof COULEURS;

/** Intensité des effets (1 = réglage d'origine, 0 = coupé). */
export const EFFETS = {
  secousse: 1, // secousse de caméra aux impacts
  grain: 1, // grain animé du fond
  particules: 1, // bulles de fermentation et poussière de magnésie
};

// ---------------------------------------------------------------------------
// 01 · LA MARQUE (≈ 25 s)
// ---------------------------------------------------------------------------
export const marque = {
  duree: 25,

  // « One Living, c'est le kombucha fondé par Jonny Wilkinson »
  logo: {
    debut: 0, // le logo tombe et rebondit
    pastille: { texte: 'LE KOMBUCHA', a: 0.95 }, // texte '' = pas de pastille
    fondePar: { mots: ['FONDÉ', 'PAR', 'JONNY', 'WILKINSON'], a: 1.45, ecart: 0.2 },
    enJaune: ['JONNY', 'WILKINSON'],
  },

  // « champion du monde de rugby en 2003 »
  champion: {
    debut: 3.0,
    bandeau: { texte: 'CHAMPION DU MONDE DE RUGBY', a: 3.25 },
    compteur: { depuis: 1987, jusqua: 2003, depart: 3.15, pose: 4.85 }, // pose = 2003 s'arrête
  },

  // « Bio, fermenté, vivant, à boire bien frais »
  valeurs: {
    debut: 6.0,
    tampons: [
      { texte: 'BIO', a: 6.25, couleur: 'jaune' },
      { texte: 'FERMENTÉ', a: 6.8, couleur: 'orange' },
      { texte: 'VIVANT', a: 7.35, couleur: 'rose' },
      { texte: 'BIEN FRAIS', a: 7.9, couleur: 'bleu' },
    ] as { texte: string; a: number; couleur: NomCouleur }[],
    buee: 8.4, // l'écran se couvre de buée
    pastille: { texte: '1-4 °C', a: 8.7 },
  },

  // les 4 parfums : chaque bouteille entre sur un volet de sa couleur
  parfums: {
    debut: 10.0,
    liste: [
      { a: 10.0, nom: ['GINGEMBRE', 'CURCUMA'], couleur: 'jaune', image: 'bouteille-gingembre' },
      { a: 12.0, nom: ['FRAMBOISE', 'GRENADE'], couleur: 'rose', image: 'bouteille-framboise' },
      { a: 14.0, nom: ['PASSION', 'GOJI'], couleur: 'bleu', image: 'bouteille-passion' },
      { a: 16.0, nom: ['MANGUE', 'CITRON VERT'], couleur: 'orange', image: 'bouteille-mangue' },
    ] as { a: number; nom: string[]; couleur: NomCouleur; image: string }[],
  },

  // « Des shots pour avant la séance »
  shots: {
    debut: 18.0,
    rafale: { a: 18.2, ecart: 0.17 }, // premier shot, puis un toutes les 0,17 s
    images: ['shot-tropical', 'shot-fraise-citron', 'shot-agrumes-gingembre'],
    titre: { texte: 'AVANT LA SÉANCE', a: 18.95 },
    pastille: { texte: '10 cl', a: 19.6 },
  },

  // « chaque achat soutient des associations de santé mentale »
  giving: {
    debut: 21.0,
    titre: { texte: 'ONE GIVING', a: 21.15 },
    phrase: { texte: 'Chaque achat soutient des associations de santé mentale.', a: 22.0 },
    souligne: 'santé mentale.', // fin de phrase soulignée au feutre ('' = rien)
  },
};

// ---------------------------------------------------------------------------
// 02 · L'ENTONNOIR (≈ 6 s) : 16 sports, puis 4, puis 1
// ---------------------------------------------------------------------------
export const entonnoir = {
  duree: 6,
  sports: [
    'Football', 'Volley', 'Basket', 'Handball',
    'Running / trail', 'Triathlon', 'Cyclisme', 'Natation',
    'Escalade', 'Voile', 'Randonnée', 'Surf',
    'Yoga', 'Pilates', 'Danse', 'Gymnastique',
  ],
  finalistes: ['Running / trail', 'Escalade', 'Yoga', 'Football'],
  gagnant: 'Escalade',
  etiquette: { plusieurs: 'SPORTS', un: 'SPORT' },
  temps: {
    grille: 0.0, // les 16 noms arrivent
    seize: 0.35, // le compteur « 16 »
    tri: 1.35, // 12 noms sont barrés, un par un
    quatre: 2.3, // il en reste 4
    chute: 3.3, // 3 noms tombent
    un: 3.85, // ESCALADE remplit l'écran
  },
};

// ---------------------------------------------------------------------------
// 03 · LE CHIFFRE (≈ 4 s) : 69 %
// ---------------------------------------------------------------------------
export const soixanteNeuf = {
  duree: 4,
  valeur: 69,
  compteur: { depart: 0.1, pose: 1.15 },
  pourcent: 1.3, // le « % » claque
  phrase: { texte: 'des grimpeurs boivent un verre après leur séance', a: 1.5 },
  souligne: 'après leur séance', // souligné au feutre ('' = rien)
  source: { texte: 'Source : Observatoire de l’escalade 2026, Union Sport & Cycle', a: 2.0 },
};

// ---------------------------------------------------------------------------
// 04 · LES QUESTIONS (3 s chacune, sur fond vert + PNG transparent)
// ---------------------------------------------------------------------------
export const questions = {
  duree: 3,
  numeroter: true, // petite étiquette « QUESTION 1 » au-dessus du bandeau
  liste: [
    'Trois mots pour te décrire ?',
    'Ton rôle chez One Living ?',
    'Et toi, tu fais quel sport ?',
    'Les bienfaits du kombucha ?',
    'Pourquoi l’escalade ?',
  ],
};

// ---------------------------------------------------------------------------
// 05 · LES BANDEAUX (sur fond vert + PNG transparent)
// ---------------------------------------------------------------------------
export const bandeaux = {
  carton: {
    texte: 'Interview imaginée, rôle joué par un étudiant',
    duree: 3,
  },
  nom: {
    // Un bandeau est rendu pour chaque prénom de la liste :
    // garde seulement celui de l'étudiant qui joue l'employé si tu préfères.
    prenoms: ['Jeanelle', 'Matisse', 'Aïna', 'Benois'],
    role: 'Développement sport amateur, One Living',
    mention: '(rôle joué)',
    duree: 5,
  },
};

// ---------------------------------------------------------------------------
// 06 · LE FINAL (≈ 5 s)
// ---------------------------------------------------------------------------
export const final = {
  duree: 5,
  titre: 'APRÈS LA VOIE.',
  // orthographe des noms à vérifier
  equipe: [
    { prenom: 'Jeanelle', nom: 'LE MAREC' },
    { prenom: 'Matisse', nom: 'EDET' },
    { prenom: 'Aïna', nom: 'GOUARIN' },
    { prenom: 'Benois', nom: 'LE BIHAN' },
  ],
  mention: 'Projet étudiant WIN Sport School · Challenge Bachelor 3',
  temps: { titre: 0.1, trait: 1.05, equipe: 1.8, mention: 2.6 },
};

// ---------------------------------------------------------------------------
// 07 · LE TITRE (≈ 3 s, facultatif) : juste après l'accroche
// ---------------------------------------------------------------------------
export const titre = {
  duree: 3,
  lignes: ['COMMENT ONE LIVING', 'PEUT SORTIR', 'DU RUGBY ?'],
  enJaune: 'DU RUGBY ?', // ligne en jaune
  temps: { lettres: 0.1, parLettre: 0.033 }, // une lettre par image
};
