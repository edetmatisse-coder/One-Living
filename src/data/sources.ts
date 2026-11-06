/**
 * Sources citées dans le site. Chaque chiffre affiché renvoie à une source
 * de cette liste, ou porte le badge « Hypothèse ».
 */
export interface Source {
  id: SourceId;
  num: number;
  publisher: string;
  title: string;
  url: string;
  /** Ce que la source appuie dans le site. */
  supports: string[];
}

export type SourceId =
  | 'obs-escalade'
  | 'insee'
  | 'grocer'
  | 'itm'
  | 'essentiel'
  | 'decathlon'
  | 'obs-running'
  | 'foodinnov';

export const SOURCES: Source[] = [
  {
    id: 'obs-escalade',
    num: 1,
    publisher: 'Union Sport & Cycle',
    title: "Observatoire de l'escalade 2026 (version light)",
    url: 'https://www.unionsportcycle.com/medias/documents/usc-observatoire-de-escalade-2026-versionlight_1479453669.pdf',
    supports: [
      '69 % des grimpeurs boivent un verre après leur séance',
      '291 salles privées en 2025 et 1 070 structures FFME',
    ],
  },
  {
    id: 'insee',
    num: 2,
    publisher: 'Insee',
    title: 'Licences sportives 2025 par fédération',
    url: 'https://www.insee.fr/fr/statistiques/2408252',
    supports: ['Critère « volume » de la matrice des 16 sports'],
  },
  {
    id: 'grocer',
    num: 3,
    publisher: 'The Grocer',
    title: 'La marque de boissons de Jonny Wilkinson relancée sous le nom One Living',
    url: 'https://www.thegrocer.co.uk/news/jonny-wilkinsons-drinks-brand-to-relaunch-under-one-living-name/692295.article',
    supports: [
      '2018 : création sous le nom No.1 Living',
      '2024 : rebranding en One Living',
      'Royaume-Uni : 2e kombucha en GMS, 3,4 M£, +38,4 %',
    ],
  },
  {
    id: 'itm',
    num: 4,
    publisher: 'IntoTheMinds',
    title: 'Le marché des boissons fermentées et du kombucha en France',
    url: 'https://www.intotheminds.com/blog/?p=73224',
    supports: ['Kombucha en France : 6 M€ (2024)', 'Boissons fermentées en GMS : 21,4 M€ (2025), près de +160 %'],
  },
  {
    id: 'essentiel',
    num: 5,
    publisher: "L'Essentiel de l'Éco",
    title: 'Ciao Kombucha, la boisson lancée par Squeezie',
    url: 'https://lessentieldeleco.fr/4218-ciao-kombucha-boisson-squeezie/',
    supports: ['Ciao Kombucha : 23 M€'],
  },
  {
    id: 'decathlon',
    num: 6,
    publisher: 'Decathlon Pro',
    title: 'Fiche produit N°1 Living kombucha 330 ml gingembre',
    url: 'https://www.decathlonpro.fr/n-1-living-kombucha-330-ml-gingembre-id-8977202.html',
    supports: ['Présence chez Decathlon Pro, le canal des clubs', 'Format 33 cl'],
  },
  {
    id: 'obs-running',
    num: 7,
    publisher: 'Marathons.com',
    title: 'Observatoire du Running 2026 : 13,2 millions de pratiquants',
    url: 'https://www.marathons.com/fr/conseils/observatoire-du-running-2026-13-2-millions-de-pratiquants-et-un-marche-toujours-en-croissance_3y4j',
    supports: ['13,2 millions de pratiquants de running en France'],
  },
  {
    id: 'foodinnov',
    num: 8,
    publisher: 'Foodinnov',
    title: 'Allégation « probiotique » : la décision du Médiateur européen',
    url: 'https://foodinnov.fr/allegation-probiotique-decision-du-mediateur-europeen/',
    supports: ['Pourquoi « probiotique » figure dans la colonne « On évite »'],
  },
];

export const SOURCE_BY_ID: Record<SourceId, Source> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
) as Record<SourceId, Source>;

/** Tout ce qui, dans le site, relève de l'hypothèse ou du choix de l'équipe. */
export const HYPOTHESES: { label: string; detail: string }[] = [
  {
    label: 'Modèle économique par point de vente',
    detail:
      "Jours d'ouverture, passages par jour, taux de prise, prix de cession et de revente, coût de revient de 1,00 €, coût d'activation : valeurs de travail, à confirmer avec One Living.",
  },
  {
    label: 'Notes des 16 sports (1 à 5)',
    detail: "Notation de l'équipe sur les 6 critères de la matrice, appuyée sur les licences Insee et l'Observatoire de l'escalade.",
  },
  {
    label: 'Note économique sur 7 critères',
    detail: "Notation de l'équipe à partir du modèle économique. Les 5 jeux de pondérations testés sont définis par l'équipe.",
  },
  {
    label: 'Potentiel national',
    detail:
      'Environ 432 000 bouteilles, 780 000 € de chiffre d’affaires de cession et 300 000 € de contribution si les 291 salles privées sont équipées comme la salle type.',
  },
  {
    label: 'Préréglage « Grande salle »',
    detail: '350 jours, 400 passages par jour, 3 % de prise, 300 € d’activation (deux frigos) : profil imaginé pour le simulateur.',
  },
  {
    label: 'Marge de la salle',
    detail:
      'Environ 1,38 € HT par bouteille : revente à 3,50 € TTC, soit 3,18 € HT avec la TVA à 10 % sur place, moins cession à 1,80 € HT. Environ 2 000 € HT par an pour la salle type (1 485 bouteilles).',
  },
  {
    label: 'Contenus de la campagne',
    detail: 'Salles partenaires, profils de grimpeurs, compteurs One Giving : exemples fictifs, étiquetés comme tels.',
  },
];
