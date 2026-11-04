import { describe, expect, it } from 'vitest';
import { ECO_NOTES, ECO_WEIGHT_SETS, FINALISTS, NATIONAL, SIM_PRESETS } from '@/data/economics';
import {
  bottlesPerYear,
  breakEven,
  contribution,
  ecoScore,
  gaugePosition,
  margeSalleUnitaire,
  nationalPotential,
  revenueCession,
  simulate,
} from './economics';
import { fmtEuro, fmtInt, fmtScore } from './format';

const fin = (id: string) => FINALISTS.find((f) => f.id === id)!;

describe('modèle économique par point de vente (un an)', () => {
  it('football (buvette) : 360 bouteilles, −330 €, seuil 1 020', () => {
    const f = fin('football');
    expect(bottlesPerYear(f)).toBe(360);
    expect(contribution(f)).toBe(-330);
    expect(breakEven(f)).toBe(1020);
  });

  it('running (un événement) : 200 bouteilles, −490 €, seuil 813', () => {
    const f = fin('running');
    expect(bottlesPerYear(f)).toBe(200);
    expect(contribution(f)).toBe(-490);
    // 650 ÷ 0,80 = 812,5 : l'arrondi supérieur donne 813.
    // Le brief indiquait 812 ; la formule « arrondi supérieur » donne 813.
    expect(breakEven(f)).toBe(813);
  });

  it('escalade (salle) : 1 485 bouteilles, +1 038 €, seuil 188', () => {
    const f = fin('escalade');
    expect(bottlesPerYear(f)).toBe(1485);
    expect(contribution(f)).toBe(1038);
    expect(breakEven(f)).toBe(188);
  });

  it('yoga (studio) : 720 bouteilles, +136 €, seuil 550', () => {
    const f = fin('yoga');
    expect(bottlesPerYear(f)).toBe(720);
    expect(contribution(f)).toBe(136);
    expect(breakEven(f)).toBe(550);
  });

  it('tous les coûts de revient valent 1,00 €', () => {
    expect(FINALISTS.every((f) => f.coutRevient === 1)).toBe(true);
  });

  it('formate les contributions à la française', () => {
    expect(fmtEuro(contribution(fin('escalade')), { signed: true })).toBe('+1 038 €');
    expect(fmtEuro(contribution(fin('football')), { signed: true })).toBe('−330 €');
    expect(fmtInt(bottlesPerYear(fin('escalade')))).toBe('1 485');
  });
});

describe('note économique sur 7 critères', () => {
  it('redonne escalade 4,90, yoga 3,50, football 2,45, running 2,30', () => {
    expect(fmtScore(ecoScore(ECO_NOTES.escalade))).toBe('4,90');
    expect(fmtScore(ecoScore(ECO_NOTES.yoga))).toBe('3,50');
    expect(fmtScore(ecoScore(ECO_NOTES.football))).toBe('2,45');
    expect(fmtScore(ecoScore(ECO_NOTES.running))).toBe('2,30');
  });

  it('les poids de base sont 25, 20, 15, 15, 10, 10, 5', () => {
    expect(ECO_WEIGHT_SETS[0].weights).toEqual([25, 20, 15, 15, 10, 10, 5]);
  });

  it('« L’escalade est première dans les 5 jeux de pondérations testés »', () => {
    expect(ECO_WEIGHT_SETS).toHaveLength(5);
    for (const set of ECO_WEIGHT_SETS) {
      const scores = Object.entries(ECO_NOTES).map(([id, notes]) => ({ id, s: ecoScore(notes, set.weights) }));
      scores.sort((a, b) => b.s - a.s);
      expect(scores[0].id, set.label).toBe('escalade');
      expect(scores[0].s).toBeGreaterThan(scores[1].s);
    }
  });
});

describe('potentiel national', () => {
  it('291 salles privées et 1 070 structures FFME', () => {
    expect(NATIONAL.sallesPrivees).toBe(291);
    expect(NATIONAL.structuresFFME).toBe(1070);
  });

  it('291 salles équipées : environ 432 000 bouteilles, 780 000 € de CA, 300 000 € de contribution', () => {
    const p = nationalPotential(fin('escalade'));
    expect(p.bottles).toBe(432135);
    expect(p.rounded.bottles).toBe(432000);
    expect(p.revenue).toBe(777843);
    expect(p.rounded.revenue).toBe(780000);
    expect(p.contribution).toBe(302058);
    expect(p.rounded.contribution).toBe(300000);
  });
});

describe('simulateur « Ma salle »', () => {
  const preset = (id: string) => SIM_PRESETS.find((p) => p.id === id)!.inputs;

  it('la salle type redonne les chiffres de l’escalade', () => {
    const s = simulate(preset('salle-type'));
    expect(s.bottles).toBe(1485);
    expect(s.contribution).toBe(1038);
    expect(s.breakEven).toBe(188);
    expect(s.revenue).toBe(2673);
    expect(s.margeSalle).toBe(2524.5);
  });

  it('le scénario prudent divise le taux par deux et reste positif', () => {
    const p = preset('prudent');
    expect(p.tauxPct).toBe(1.5);
    const s = simulate(p);
    expect(s.bottles).toBe(743);
    expect(s.contribution).toBeCloseTo(444.4, 9);
    expect(s.contribution).toBeGreaterThan(0);
  });

  it('marge de la salle : environ 1,70 € par bouteille', () => {
    expect(margeSalleUnitaire(preset('salle-type'))).toBe(1.7);
  });

  it('CA de cession = bouteilles × prix de cession', () => {
    expect(revenueCession(fin('yoga'))).toBe(1296);
  });

  it('seuil infini si la cession ne couvre pas le coût de revient', () => {
    expect(breakEven({ ...preset('salle-type'), cession: 1 })).toBe(Infinity);
  });

  it('la jauge est au milieu au seuil, rouge en dessous, verte au-dessus', () => {
    const base = preset('salle-type');
    // 188 bouteilles = seuil : 330 jours × 19 passages × 3 % ≈ 188
    const atSeuil = simulate({ ...base, passages: 19 });
    expect(atSeuil.bottles).toBe(188);
    expect(gaugePosition(atSeuil)).toBeCloseTo(0.5, 5);
    expect(gaugePosition(simulate(fin('football')))).toBeLessThan(0.5);
    expect(gaugePosition(simulate(base))).toBe(1);
  });
});
