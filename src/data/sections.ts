import type { RouteColor } from './routes';

/**
 * Chaque section est une prise de la voie : une couleur, une cotation,
 * et une note pour l'orateur (mode présentation, touche N).
 */
export interface SectionMeta {
  id: string;
  /** Numéro de prise affiché (01, 02...). */
  num: number;
  title: string;
  /** Titre court pour la voie latérale et le compteur de diapositives. */
  short: string;
  route: RouteColor;
  /** Cotation française, de plus en plus dure au fil du Dossier. */
  grade: string;
  notes: string;
}

export const DOSSIER_SECTIONS: SectionMeta[] = [
  {
    id: 'depart',
    num: 0,
    title: 'Le kombucha a trouvé sa paroi',
    short: 'Départ',
    route: 'yellow',
    grade: '3c',
    notes:
      "On ouvre sur la paroi. Le chiffre qui lance tout : 69 % des grimpeurs boivent un verre après leur séance (Observatoire de l'escalade 2026). Notre thèse tient en une phrase : le kombucha a trouvé sa paroi. Annoncer les deux outils qu'on va manipuler devant vous.",
  },
  {
    id: 'probleme',
    num: 1,
    title: 'Le problème',
    short: 'Le problème',
    route: 'pink',
    grade: '4a',
    notes:
      'Problématique 2 : développer One Living dans le sport amateur, hors rugby. Trois conditions à réunir en même temps : un récit légitime (le mental, l’équilibre), un vrai moment de consommation, et une gamme fraîche à environ 3 € que l’on peut distribuer.',
  },
  {
    id: 'marque',
    num: 2,
    title: 'La marque',
    short: 'La marque',
    route: 'blue',
    grade: '4c',
    notes:
      '2018 : No.1 Living. 2024 : One Living, on passe de battre les autres à se sentir aligné. Au Royaume-Uni : 2e kombucha en GMS, 3,4 M£, +38,4 %. 2026 : lancement national en France, avec Decathlon Pro, le canal des clubs.',
  },
  {
    id: 'marche',
    num: 3,
    title: 'Le marché',
    short: 'Le marché',
    route: 'orange',
    grade: '5a',
    notes:
      'Trois chiffres, trois périmètres : on ne les additionne pas. Le kombucha seul en France pèse 6 M€ (2024). Les boissons fermentées en GMS, 21,4 M€ (2025), près de +160 %. Ciao Kombucha, 23 M€ : une marque peut décoller vite.',
  },
  {
    id: 'matrice',
    num: 4,
    title: 'La matrice des 16 sports',
    short: 'Outil 1 · Matrice',
    route: 'yellow',
    grade: '5c',
    notes:
      'Seize sports, quatre pôles, six critères. Montrer nos poids, puis bouger un curseur devant le jury. Les barres se réordonnent, mais les quatre gagnants de pôle restent les mêmes dans les cinq scénarios : football, running, escalade, yoga.',
  },
  {
    id: 'escalade',
    num: 5,
    title: 'Un seul sport : l’escalade',
    short: 'L’escalade',
    route: 'pink',
    grade: '6a',
    notes:
      'Les quatre finalistes passent au modèle économique par point de vente. Seuls l’escalade et le yoga sont rentables la première année. Note économique : escalade 4,90, yoga 3,50, football 2,45, running 2,30. L’escalade reste première dans les cinq jeux de pondérations.',
  },
  {
    id: 'simulateur',
    num: 6,
    title: 'Le simulateur « Ma salle »',
    short: 'Outil 2 · Ma salle',
    route: 'blue',
    grade: '6b',
    notes:
      'Salle type : 330 jours, 150 passages, 3 % de prise. 1 485 bouteilles par an, +1 038 € de contribution, rentable dès 188 bouteilles. Passer au scénario prudent : avec un taux divisé par deux, la contribution reste positive.',
  },
  {
    id: 'moments',
    num: 7,
    title: 'Les 3 moments',
    short: 'Les 3 moments',
    route: 'orange',
    grade: '6b+',
    notes:
      'Trois moments qui existent déjà en salle : avant la séance (le shot), après la voie (le kombucha au bar), entre grimpeurs (l’alternative à la bière). Puis ce qu’on peut dire et ce qu’on évite : aucune allégation santé.',
  },
  {
    id: 'poc',
    num: 8,
    title: 'Le POC en R2 Ouest',
    short: 'Le POC',
    route: 'yellow',
    grade: '6c',
    notes:
      'Un test grandeur nature autour des villes WIN : Laval, Rennes, Vannes, Tours, Caen. Trois salles test, frigo et dotation, trois mois, un bilan, puis l’extension aux structures FFME.',
  },
  {
    id: 'indicateurs',
    num: 9,
    title: 'Les indicateurs',
    short: 'Indicateurs',
    route: 'pink',
    grade: '7a',
    notes:
      'Quatre indicateurs pour décider de la suite : salles activées, bouteilles par salle, taux de réachat, coût par pratiquant touché. Le seuil de 188 bouteilles par salle sert de ligne de flottaison.',
  },
  {
    id: 'sources',
    num: 10,
    title: 'Sources et hypothèses',
    short: 'Sources',
    route: 'blue',
    grade: '7a+',
    notes:
      'Toutes les sources sont cliquables. Les valeurs marquées Hypothèse sont à confirmer avec One Living et notre sondage terrain. Fin du Dossier : ouvrir la maquette de la campagne « Après la voie ».',
  },
];

export const CAMPAGNE_SECTIONS: SectionMeta[] = [
  {
    id: 'apres-la-voie',
    num: 0,
    title: 'Après la voie',
    short: 'Accueil',
    route: 'yellow',
    grade: '3c',
    notes:
      'La maquette du site public, telle qu’un grimpeur la verrait. Faire le mini-jeu en direct : cinq prises dans l’ordre, la dernière libère les bulles et révèle la bouteille.',
  },
  {
    id: 'concept',
    num: 1,
    title: 'Le concept en 3 temps',
    short: 'Le concept',
    route: 'pink',
    grade: '4b',
    notes: 'Avant de grimper, après la voie, entre grimpeurs. Le kombucha s’installe dans un rituel qui existe déjà.',
  },
  {
    id: 'gamme',
    num: 2,
    title: 'La gamme',
    short: 'La gamme',
    route: 'blue',
    grade: '5a',
    notes: 'Faire tourner la bouteille, changer de parfum : la couleur de voie suit le parfum. Bio, vivant, non pasteurisé, 33 cl. Les shots sont présentés par leurs parfums uniquement.',
  },
  {
    id: 'histoire',
    num: 3,
    title: 'L’histoire',
    short: 'L’histoire',
    route: 'orange',
    grade: '5c',
    notes: 'Un champion de rugby qui a fait de l’équilibre mental son combat. Le nom raconte le virage : de No.1 à One, d’être numéro un à se sentir aligné.',
  },
  {
    id: 'salles',
    num: 4,
    title: 'Trouver une salle',
    short: 'Les salles',
    route: 'yellow',
    grade: '6a',
    notes: 'Carte de l’Ouest avec des salles partenaires. Ce sont des exemples : aucune salle réelle n’est engagée à ce stade.',
  },
  {
    id: 'voie-du-mois',
    num: 5,
    title: 'La voie du mois',
    short: 'Voie du mois',
    route: 'pink',
    grade: '6a+',
    notes: 'Le QR code de la bouteille ouvre la vidéo de la voie du mois et des conseils de concentration. C’est le lien entre le produit et la pratique.',
  },
  {
    id: 'one-giving',
    num: 6,
    title: 'One Giving',
    short: 'One Giving',
    route: 'blue',
    grade: '6b',
    notes: 'Chaque achat finance des associations de santé mentale. Les compteurs affichés sont des chiffres de démonstration.',
  },
  {
    id: 'grimpeurs',
    num: 7,
    title: 'Les grimpeurs',
    short: 'Grimpeurs',
    route: 'orange',
    grade: '6b+',
    notes: 'Trois profils fictifs, tous dans la cible des 35 ans et plus, avec leur parfum et leur moment préférés.',
  },
  {
    id: 'pour-les-salles',
    num: 8,
    title: 'Pour les salles',
    short: 'Pour les salles',
    route: 'yellow',
    grade: '6c',
    notes: 'Le discours B2B : frigo prêté, dotation de lancement, environ 1,70 € de marge par bouteille (hypothèse). Le formulaire est une démo.',
  },
  {
    id: 'faq',
    num: 9,
    title: 'Questions fréquentes',
    short: 'FAQ',
    route: 'pink',
    grade: '7a',
    notes: 'Réponses factuelles : ce qu’est le kombucha, les traces d’alcool, la caféine du thé, pourquoi le garder au frais.',
  },
];
