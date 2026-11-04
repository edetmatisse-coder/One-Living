import type { SourceId } from './sources';

/**
 * La marque en quatre relais. Chiffres et dates : The Grocer et la fiche
 * Decathlon Pro (voir src/data/sources.ts).
 */
export interface Milestone {
  id: string;
  year: string;
  title: string;
  text: string;
  /** Idée clé mise en avant (pas une citation). */
  idea?: string;
  stats?: { value: string; suffix?: string; label: string }[];
  tags?: { label: string; note?: string }[];
  sources: SourceId[];
}

export const BRAND_TIMELINE: Milestone[] = [
  {
    id: 'creation',
    year: '2018',
    title: 'No.1 Living',
    text: 'La marque naît sous le nom No.1 Living.',
    sources: ['grocer'],
  },
  {
    id: 'rebranding',
    year: '2024',
    title: 'One Living',
    text: 'Rebranding : No.1 Living devient One Living.',
    idea: 'De battre les autres à se sentir aligné.',
    sources: ['grocer'],
  },
  {
    id: 'royaume-uni',
    year: 'R.-U.',
    title: 'Au Royaume-Uni',
    text: 'Une marque déjà installée en grande distribution.',
    stats: [
      { value: '2', suffix: 'e', label: 'kombucha en GMS' },
      { value: '3,4 M£', label: 'de ventes' },
      { value: '+38,4 %', label: 'de croissance' },
    ],
    sources: ['grocer'],
  },
  {
    id: 'france',
    year: '2026',
    title: 'La France',
    text: 'Lancement national, en grande surface et dans le canal des clubs.',
    tags: [{ label: 'Carrefour' }, { label: 'Leclerc' }, { label: 'Decathlon Pro', note: 'le canal des clubs' }],
    sources: ['decathlon'],
  },
];
