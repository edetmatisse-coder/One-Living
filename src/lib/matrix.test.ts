import { describe, expect, it } from 'vitest';
import { BASE_WEIGHTS, SCENARIOS, SPORTS } from '@/data/sports';
import { normalize, poleWinners, rankSports, sameWinners, scoreOf, toPercent, winnerChanges } from './matrix';
import { fmtScore } from './format';

const sport = (id: string) => SPORTS.find((s) => s.id === id)!;

describe('matrice des 16 sports', () => {
  it('contient 16 sports répartis en 4 pôles de 4', () => {
    expect(SPORTS).toHaveLength(16);
    const byPole = SPORTS.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.pole]: (acc[s.pole] ?? 0) + 1 }), {});
    expect(Object.values(byPole)).toEqual([4, 4, 4, 4]);
  });

  it('normalise les poids à 100 %', () => {
    expect(toPercent([25, 20, 20, 15, 10, 10])).toEqual([25, 20, 20, 15, 10, 10]);
    const p = toPercent([50, 40, 40, 30, 20, 20]);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 10);
    expect(p[0]).toBeCloseTo(25, 10);
    expect(normalize([0, 0, 0, 0, 0, 0])).toEqual(Array(6).fill(1 / 6));
  });

  it('redonne les scores du dossier avec nos poids', () => {
    expect(fmtScore(scoreOf(sport('running').notes, BASE_WEIGHTS))).toBe('4,50');
    expect(fmtScore(scoreOf(sport('escalade').notes, BASE_WEIGHTS))).toBe('4,15');
    expect(fmtScore(scoreOf(sport('yoga').notes, BASE_WEIGHTS))).toBe('4,15');
    expect(fmtScore(scoreOf(sport('football').notes, BASE_WEIGHTS))).toBe('3,55');
    expect(scoreOf(sport('running').notes, BASE_WEIGHTS)).toBeCloseTo(4.5, 9);
    expect(scoreOf(sport('escalade').notes, BASE_WEIGHTS)).toBeCloseTo(4.15, 9);
    expect(scoreOf(sport('yoga').notes, BASE_WEIGHTS)).toBeCloseTo(4.15, 9);
    expect(scoreOf(sport('football').notes, BASE_WEIGHTS)).toBeCloseTo(3.55, 9);
  });

  it('désigne football, running, escalade et yoga gagnants de pôle avec nos poids', () => {
    expect(poleWinners(BASE_WEIGHTS)).toEqual({
      collectifs: 'football',
      individuel: 'running',
      glisse: 'escalade',
      bienetre: 'yoga',
    });
  });

  it('classe running premier, puis escalade et yoga à égalité', () => {
    const r = rankSports(BASE_WEIGHTS);
    expect(r[0].id).toBe('running');
    expect(r.slice(1, 3).map((s) => s.id).sort()).toEqual(['escalade', 'yoga']);
    expect(r).toHaveLength(16);
    expect(r.filter((s) => s.poleWinner)).toHaveLength(4);
  });

  it('« Les 4 gagnants de pôle ne changent dans aucun des 5 scénarios »', () => {
    expect(SCENARIOS).toHaveLength(5);
    for (const sc of SCENARIOS) {
      expect(sameWinners(sc.weights, BASE_WEIGHTS), sc.label).toBe(true);
      expect(winnerChanges(sc.weights, BASE_WEIGHTS)).toEqual([]);
    }
  });

  it('les scénarios ont les poids du dossier', () => {
    const get = (id: string) => SCENARIOS.find((s) => s.id === id)!.weights;
    expect(get('nos-poids')).toEqual([25, 20, 20, 15, 10, 10]);
    expect(toPercent(get('egal')).map((w) => Math.round(w * 1000) / 1000)).toEqual(Array(6).fill(16.667));
    expect(get('volume')).toEqual([40, 15, 15, 10, 10, 10]);
    expect(get('recit')).toEqual([15, 35, 20, 10, 10, 10]);
    expect(get('acces')).toEqual([15, 15, 20, 30, 5, 15]);
  });

  it('signale un changement de gagnant quand les poids basculent fortement', () => {
    // Tout sur l'accès terrain : la gymnastique (4) dépasse le yoga (2).
    const changes = winnerChanges([0, 0, 0, 100, 0, 0], BASE_WEIGHTS);
    expect(changes.length).toBeGreaterThan(0);
  });
});
