import type { SourceId } from './sources';

/**
 * Trois chiffres de marché, trois périmètres différents : ils ne
 * s'additionnent pas et ne se comparent pas terme à terme.
 */
export interface MarketFigure {
  id: string;
  /** en millions d'euros */
  value: number;
  display: string;
  label: string;
  perimeter: string;
  year?: string;
  growth?: string;
  source: SourceId;
}

export const MARKET: MarketFigure[] = [
  {
    id: 'kombucha-france',
    value: 6,
    display: '6 M€',
    label: 'Kombucha en France',
    perimeter: 'Le kombucha seul',
    year: '2024',
    source: 'itm',
  },
  {
    id: 'fermentees-gms',
    value: 21.4,
    display: '21,4 M€',
    label: 'Boissons fermentées en GMS',
    perimeter: 'Toutes les boissons fermentées, en grande surface',
    year: '2025',
    growth: 'près de +160 %',
    source: 'itm',
  },
  {
    id: 'ciao',
    value: 23,
    display: '23 M€',
    label: 'Ciao Kombucha',
    perimeter: 'Une seule marque',
    source: 'essentiel',
  },
];

/** Haut de l'échelle des éprouvettes (M€). */
export const MARKET_SCALE_MAX = 25;
