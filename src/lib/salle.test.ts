import { describe, expect, it } from 'vitest';
import { SALLE_TYPE } from '@/data/campagne';
import { bouteillesParAn, margeAnnuelle, margeUnitaire } from './salle';

describe('salle type', () => {
  it('vend 1 485 bouteilles par an', () => {
    expect(bouteillesParAn(SALLE_TYPE)).toBe(1485);
  });
  it('garde 1,70 € par bouteille', () => {
    expect(margeUnitaire(SALLE_TYPE)).toBe(1.7);
  });
  it('garde 2 524,50 € sur l’année', () => {
    expect(margeAnnuelle(SALLE_TYPE)).toBe(2524.5);
  });
});
