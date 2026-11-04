import type { SourceId } from './sources';

/** Les 3 moments de consommation en salle (Dossier) et les mots qu'on s'autorise. */
export interface Moment {
  id: string;
  when: string;
  title: string;
  product: string;
  text: string;
  /** Heure indicative d'une séance type (illustration). */
  clock: string;
  source?: SourceId;
}

export const MOMENTS: Moment[] = [
  {
    id: 'avant',
    when: 'Avant la séance',
    title: 'Le shot',
    product: 'Shot',
    text: 'Un petit format pris à l’accueil en se changeant, avant d’attaquer l’échauffement.',
    clock: '18 h 50',
  },
  {
    id: 'apres',
    when: 'Après la voie',
    title: 'Le kombucha au bar',
    product: 'Kombucha 33 cl',
    text: 'Le moment clé : 69 % des grimpeurs boivent déjà un verre après leur séance.',
    clock: '20 h 40',
    source: 'obs-escalade',
  },
  {
    id: 'entre',
    when: 'Entre grimpeurs',
    title: 'L’alternative à la bière',
    product: 'Kombucha 33 cl',
    text: 'Le verre qu’on partage en refaisant la voie : une alternative à la bière, avec du goût.',
    clock: '21 h 05',
  },
];

export interface Claim {
  say: string;
  why: string;
  source?: SourceId;
}

export const CAN_SAY: Claim[] = [
  { say: 'Bio, vivant, non pasteurisé', why: 'Des caractéristiques du produit, vérifiables sur l’étiquette.' },
  { say: 'Sans sucres ajoutés', why: 'Une mention de composition, pas une promesse.' },
  { say: 'Un moment pour souffler après la séance', why: 'On parle d’un moment, pas d’un effet.' },
  { say: 'Une alternative à la bière, avec du goût', why: 'Le goût et le partage, sans comparer les effets.' },
  { say: 'Chaque achat finance des associations de santé mentale', why: 'L’engagement de la marque (One Giving), pas un bienfait du produit.' },
];

export const AVOID: Claim[] = [
  { say: '« Probiotique »', why: 'Allégation non autorisée en Europe.', source: 'foodinnov' },
  { say: '« Favorise la récupération »', why: 'Promesse santé, interdite sans allégation autorisée.' },
  { say: '« Bon pour le microbiote »', why: 'Promesse santé, interdite sans allégation autorisée.' },
  { say: '« Améliore le mental »', why: 'Le mental est le récit de la marque, pas un effet du produit.' },
  { say: '« Sans alcool », sans nuance', why: 'La fermentation laisse des traces d’alcool : on dit « alternative ».' },
];
