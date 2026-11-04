/**
 * Couleurs de voies = parfums de la gamme.
 * En salle, chaque voie a sa couleur de prises : on reprend ce code partout.
 */
export const ROUTE_COLORS = {
  yellow: '#F2B705',
  pink: '#E64980',
  blue: '#5C7CFA',
  orange: '#FD7E14',
} as const;

export type RouteColor = keyof typeof ROUTE_COLORS;

export const ROUTE_ORDER: RouteColor[] = ['yellow', 'pink', 'blue', 'orange'];

/** Parfum associé à chaque couleur de voie. */
export const ROUTE_FLAVOR: Record<RouteColor, string> = {
  yellow: 'Gingembre-curcuma',
  pink: 'Framboise-grenade',
  blue: 'Passion-goji',
  orange: 'Mangue-citron vert',
};

export function routeHex(color: RouteColor): string {
  return ROUTE_COLORS[color];
}
