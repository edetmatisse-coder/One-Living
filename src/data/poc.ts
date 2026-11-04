/** Le POC en R2 Ouest et les indicateurs de décision. */
export interface PocStep {
  id: string;
  when: string;
  title: string;
  text: string;
}

export const POC_STEPS: PocStep[] = [
  { id: 'selection', when: 'Mois 0', title: 'Sélection de 3 salles test', text: 'Trois salles proches de nos campus, de tailles différentes.' },
  { id: 'installation', when: 'Mois 0', title: 'Installation du frigo et dotation', text: 'Frigo prêté, dotation de lancement, PLV au bar et QR code sur les bouteilles.' },
  { id: 'test', when: 'Mois 1 à 3', title: '3 mois de test', text: 'Ventes suivies chaque semaine, sondage au bar, voie du mois.' },
  { id: 'bilan', when: 'Mois 4', title: 'Bilan', text: 'On compare chaque salle au seuil et on garde ce qui marche.' },
  { id: 'extension', when: 'Ensuite', title: 'Extension aux structures FFME', text: 'Des salles privées vers les clubs de la fédération, en passant par Decathlon Pro.' },
];

export interface Kpi {
  id: string;
  label: string;
  value: string;
  unit?: string;
  hypothesis?: boolean;
  definition: string;
  how: string;
}
