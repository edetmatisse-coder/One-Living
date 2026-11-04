/**
 * Carte stylisée du sud de la Bretagne (Finistère sud et Morbihan), là où
 * sont les salles B'Wall : un contour approximatif du littoral, fermé à l'est
 * et au nord par des limites arbitraires hors cadre, projeté en
 * équirectangulaire. Sert à dessiner une trame de points, comme la grille
 * d'inserts d'une paroi.
 */
export type LonLat = [number, number];

/** Littoral, du nord-ouest (Iroise) au sud-est (Saint-Nazaire). */
export const COAST: LonLat[] = [
  [-4.78, 48.6],
  [-4.78, 48.45],
  [-4.77, 48.36],
  [-4.76, 48.33],
  [-4.62, 48.34],
  [-4.52, 48.37],
  [-4.42, 48.37],
  [-4.33, 48.33],
  [-4.28, 48.3],
  [-4.38, 48.28],
  [-4.5, 48.3],
  [-4.58, 48.29],
  [-4.62, 48.27],
  [-4.63, 48.25],
  [-4.56, 48.23],
  [-4.55, 48.17],
  [-4.47, 48.2],
  [-4.36, 48.2],
  [-4.28, 48.15],
  [-4.27, 48.11],
  [-4.33, 48.09],
  [-4.45, 48.08],
  [-4.56, 48.07],
  [-4.66, 48.06],
  [-4.74, 48.04],
  [-4.6, 48.01],
  [-4.54, 48.02],
  [-4.47, 47.97],
  [-4.41, 47.9],
  [-4.37, 47.81],
  [-4.33, 47.79],
  [-4.28, 47.79],
  [-4.21, 47.8],
  [-4.17, 47.83],
  [-4.12, 47.87],
  [-4.06, 47.87],
  [-4.04, 47.85],
  [-3.98, 47.85],
  [-3.95, 47.88],
  [-3.92, 47.87],
  [-3.89, 47.83],
  [-3.86, 47.79],
  [-3.79, 47.8],
  [-3.74, 47.8],
  [-3.66, 47.78],
  [-3.61, 47.77],
  [-3.54, 47.77],
  [-3.49, 47.76],
  [-3.44, 47.73],
  [-3.38, 47.71],
  [-3.35, 47.71],
  [-3.35, 47.69],
  [-3.27, 47.67],
  [-3.21, 47.65],
  [-3.16, 47.61],
  [-3.15, 47.55],
  [-3.14, 47.5],
  [-3.11, 47.47],
  [-3.09, 47.52],
  [-3.1, 47.57],
  [-3.07, 47.58],
  [-3.03, 47.58],
  [-2.99, 47.57],
  [-2.95, 47.56],
  [-2.91, 47.55],
  [-2.87, 47.52],
  [-2.84, 47.5],
  [-2.76, 47.49],
  [-2.68, 47.5],
  [-2.62, 47.51],
  [-2.58, 47.51],
  [-2.52, 47.5],
  [-2.49, 47.51],
  [-2.48, 47.46],
  [-2.5, 47.42],
  [-2.55, 47.38],
  [-2.51, 47.33],
  [-2.55, 47.29],
  [-2.45, 47.27],
  [-2.39, 47.27],
  [-2.34, 47.25],
  [-2.2, 47.26],
];

/** Terre ferme : le littoral, refermé à l'est et au nord hors du cadre. */
export const MAINLAND: LonLat[] = [...COAST, [-1.9, 47.2], [-1.9, 48.6]];

/** Îles de Groix et Belle-Île. */
export const ISLANDS: LonLat[][] = [
  [
    [-3.51, 47.65],
    [-3.46, 47.66],
    [-3.42, 47.645],
    [-3.43, 47.625],
    [-3.48, 47.62],
    [-3.51, 47.63],
  ],
  [
    [-3.26, 47.37],
    [-3.2, 47.39],
    [-3.12, 47.37],
    [-3.06, 47.33],
    [-3.08, 47.29],
    [-3.15, 47.29],
    [-3.22, 47.32],
    [-3.26, 47.35],
  ],
];

/** Cadre de la carte. */
export const BOUNDS = { minLon: -4.85, maxLon: -2.15, minLat: 47.22, maxLat: 48.42 };
const LAT0 = 47.8;
const KX = Math.cos((LAT0 * Math.PI) / 180);

/** Projection dans un repère [0, width] × [0, height] (y vers le bas). */
export function project([lon, lat]: LonLat, width: number) {
  const wDeg = (BOUNDS.maxLon - BOUNDS.minLon) * KX;
  const hDeg = BOUNDS.maxLat - BOUNDS.minLat;
  const scale = width / wDeg;
  return {
    x: (lon - BOUNDS.minLon) * KX * scale,
    y: (BOUNDS.maxLat - lat) * scale,
    height: hDeg * scale,
  };
}

export function mapHeight(width: number) {
  return project([BOUNDS.minLon, BOUNDS.minLat], width).height;
}

/** Point dans un polygone (lancer de rayon). */
function inPolygon([lon, lat]: LonLat, poly: LonLat[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Vrai sur la terre ferme ou sur une île. */
export function inside(p: LonLat): boolean {
  return inPolygon(p, MAINLAND) || ISLANDS.some((isl) => inPolygon(p, isl));
}

export interface Dot {
  x: number;
  y: number;
  /** 0 à 1 : estompé vers l'intérieur des terres (est et nord du cadre) */
  fade: number;
}

/** Trame de points (inserts) qui remplit la terre. */
export function dotGrid(width: number, step: number): Dot[] {
  const h = mapHeight(width);
  const dots: Dot[] = [];
  const wDeg = (BOUNDS.maxLon - BOUNDS.minLon) * KX;
  const scale = width / wDeg;
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const lon = x / scale / KX + BOUNDS.minLon;
      const lat = BOUNDS.maxLat - y / scale;
      if (inside([lon, lat])) {
        const east = Math.min(1, Math.max(0, (BOUNDS.maxLon - lon) / 0.7));
        const north = Math.min(1, Math.max(0, (BOUNDS.maxLat - lat) / 0.35));
        dots.push({ x, y, fade: east * (0.35 + 0.65 * north) });
      }
    }
  }
  return dots;
}
