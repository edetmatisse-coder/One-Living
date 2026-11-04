import { describe, expect, it } from 'vitest';
import { GYMS } from '@/data/campagne';
import { BOUNDS, dotGrid, inside, project } from './geo';

describe('carte du sud de la Bretagne', () => {
  it('place les 3 salles B’Wall sur la terre, dans le cadre', () => {
    for (const g of GYMS) {
      expect(inside(g.lonlat), g.name).toBe(true);
      expect(g.lonlat[0]).toBeGreaterThan(BOUNDS.minLon);
      expect(g.lonlat[0]).toBeLessThan(BOUNDS.maxLon);
      expect(g.lonlat[1]).toBeGreaterThan(BOUNDS.minLat);
      expect(g.lonlat[1]).toBeLessThan(BOUNDS.maxLat);
    }
  });

  it('laisse la mer en dehors, mais garde Groix et Belle-Île', () => {
    expect(inside([-4.0, 47.6])).toBe(false); // au large de Concarneau
    expect(inside([-3.6, 47.5])).toBe(false); // entre Groix et Belle-Île
    expect(inside([-3.47, 47.64])).toBe(true); // Groix
    expect(inside([-3.16, 47.34])).toBe(true); // Belle-Île
  });

  it('respecte l’ordre géographique : Quimper, Lorient (Lanester), Vannes d’ouest en est', () => {
    const w = 600;
    const [quimper, lanester, vannes] = ['quimper', 'lanester', 'vannes'].map((id) => project(GYMS.find((g) => g.id === id)!.lonlat, w));
    expect(quimper.x).toBeLessThan(lanester.x);
    expect(lanester.x).toBeLessThan(vannes.x);
    expect(quimper.y).toBeLessThan(vannes.y); // Quimper plus au nord que Vannes
  });

  it('produit une trame de points non vide', () => {
    expect(dotGrid(600, 10).length).toBeGreaterThan(400);
  });
});
