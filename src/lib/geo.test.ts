import { describe, expect, it } from 'vitest';
import { dotGrid, inside, project, WIN_CITIES } from './geo';

describe('carte de l’Ouest', () => {
  it('place les 5 villes WIN sur la terre', () => {
    for (const c of WIN_CITIES) expect(inside(c.lonlat), c.name).toBe(true);
  });

  it('laisse la mer en dehors (Atlantique, Manche)', () => {
    expect(inside([-5.5, 47.5])).toBe(false);
    expect(inside([-2.5, 49.6])).toBe(false);
  });

  it('respecte l’ordre géographique', () => {
    const w = 600;
    const caen = project([-0.37, 49.18], w);
    const tours = project([0.69, 47.39], w);
    const vannes = project([-2.76, 47.66], w);
    expect(caen.y).toBeLessThan(tours.y); // Caen au nord de Tours
    expect(vannes.x).toBeLessThan(tours.x); // Vannes à l'ouest de Tours
  });

  it('produit une trame de points non vide', () => {
    expect(dotGrid(600, 14).length).toBeGreaterThan(300);
  });
});
