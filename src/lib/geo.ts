/**
 * Carte stylisée de l'Ouest de la France : un contour approximatif du
 * littoral (Normandie, Bretagne, Pays de la Loire) fermé à l'est par une
 * limite arbitraire, projeté en équirectangulaire. Sert à dessiner une
 * trame de points, comme la grille d'inserts d'une paroi.
 */
export type LonLat = [number, number];

export const WEST_OUTLINE: LonLat[] = [
  [1.55, 50.05],
  [1.08, 49.93],
  [0.6, 49.86],
  [0.37, 49.77],
  [0.12, 49.68],
  [0.08, 49.49],
  [0.23, 49.42],
  [-0.1, 49.32],
  [-0.25, 49.29],
  [-0.6, 49.34],
  [-1.0, 49.38],
  [-1.12, 49.33],
  [-1.25, 49.4],
  [-1.26, 49.6],
  [-1.27, 49.69],
  [-1.6, 49.65],
  [-1.94, 49.72],
  [-1.86, 49.5],
  [-1.8, 49.35],
  [-1.62, 49.2],
  [-1.58, 48.98],
  [-1.6, 48.84],
  [-1.51, 48.64],
  [-1.7, 48.62],
  [-1.85, 48.68],
  [-2.02, 48.65],
  [-2.32, 48.68],
  [-2.55, 48.6],
  [-2.73, 48.52],
  [-2.9, 48.65],
  [-3.05, 48.8],
  [-3.25, 48.86],
  [-3.44, 48.82],
  [-3.57, 48.72],
  [-3.85, 48.7],
  [-3.98, 48.73],
  [-4.33, 48.68],
  [-4.57, 48.6],
  [-4.77, 48.48],
  [-4.77, 48.33],
  [-4.5, 48.38],
  [-4.32, 48.3],
  [-4.55, 48.22],
  [-4.5, 48.17],
  [-4.33, 48.1],
  [-4.55, 48.05],
  [-4.73, 48.04],
  [-4.5, 48.0],
  [-4.36, 47.81],
  [-4.1, 47.86],
  [-3.92, 47.87],
  [-3.6, 47.77],
  [-3.37, 47.73],
  [-3.15, 47.6],
  [-3.13, 47.47],
  [-3.0, 47.57],
  [-2.76, 47.53],
  [-2.55, 47.5],
  [-2.45, 47.41],
  [-2.51, 47.29],
  [-2.2, 47.27],
  [-2.12, 47.14],
  [-2.02, 47.08],
  [-2.18, 46.98],
  [-2.0, 46.86],
  [-1.94, 46.7],
  [-1.78, 46.5],
  [-1.45, 46.34],
  [-1.2, 46.27],
  [-1.15, 46.16],
  [-0.6, 46.1],
  [0.2, 46.1],
  [1.2, 46.3],
  [1.6, 46.8],
  [1.6, 48.0],
  [1.6, 49.2],
  [1.7, 49.7],
];

export const BOUNDS = { minLon: -5.0, maxLon: 1.8, minLat: 46.0, maxLat: 50.15 };
const LAT0 = 48;
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

/** Point dans le polygone (lancer de rayon). */
export function inside([lon, lat]: LonLat, poly: LonLat[] = WEST_OUTLINE): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

export interface Dot {
  x: number;
  y: number;
  /** 0 à 1 : estompé vers la limite est, arbitraire */
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
        const fade = Math.min(1, Math.max(0, (1.7 - lon) / 2.2));
        dots.push({ x, y, fade });
      }
    }
  }
  return dots;
}

/** Partie littorale du contour (sans la limite est, arbitraire). */
export const COAST_END = WEST_OUTLINE.findIndex(([lon, lat]) => lon === -1.15 && lat === 46.16);

/** Villes WIN de la R2 Ouest, dans l'ordre de la voie (zigzag vers le nord). */
export const WIN_CITIES: { id: string; name: string; lonlat: LonLat }[] = [
  { id: 'vannes', name: 'Vannes', lonlat: [-2.76, 47.66] },
  { id: 'tours', name: 'Tours', lonlat: [0.69, 47.39] },
  { id: 'laval', name: 'Laval', lonlat: [-0.77, 48.07] },
  { id: 'rennes', name: 'Rennes', lonlat: [-1.68, 48.11] },
  { id: 'caen', name: 'Caen', lonlat: [-0.37, 49.18] },
];
