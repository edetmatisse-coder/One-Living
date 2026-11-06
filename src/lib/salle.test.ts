import { describe, expect, it } from 'vitest';
import { SALLE_TYPE } from '@/data/campagne';
import { bouteillesParAn, margeAnnuelle, margeUnitaire, reventeHT } from './salle';

describe('salle type', () => {
  it('vend 1 485 bouteilles par an', () => {
    expect(bouteillesParAn(SALLE_TYPE)).toBe(1485);
  });
  it('revend 3,50 € TTC, soit 3,18 € HT (TVA à 10 % sur place)', () => {
    expect(reventeHT(SALLE_TYPE)).toBe(3.18);
  });
  it('garde 1,38 € HT par bouteille', () => {
    expect(margeUnitaire(SALLE_TYPE)).toBe(1.38);
  });
  it('garde 2 049,30 € HT sur l’année', () => {
    expect(margeAnnuelle(SALLE_TYPE)).toBe(2049.3);
  });
});

describe('TVA', () => {
  it('sans TVA, la marge est la simple différence des prix', () => {
    expect(margeUnitaire({ ...SALLE_TYPE, tvaPct: 0 })).toBe(1.7);
  });
  it('arrondit le prix HT au centime', () => {
    expect(reventeHT({ ...SALLE_TYPE, tvaPct: 5.5 })).toBe(3.32);
  });
});
