import { describe, expect, it } from 'vitest';
import { fmtEuro, fmtInt, fmtNumber, fmtPct, fmtPrice, fmtScore } from './format';

describe('formatage à la française', () => {
  it('sépare les milliers par une espace fine insécable', () => {
    expect(fmtInt(432000)).toBe('432 000');
    expect(fmtInt(1070)).toBe('1 070');
    expect(fmtInt(291)).toBe('291');
  });

  it('utilise la virgule décimale', () => {
    expect(fmtNumber(21.4, 1)).toBe('21,4');
    expect(fmtScore(4.9)).toBe('4,90');
    expect(fmtPrice(1.8)).toBe('1,80 €');
  });

  it('écrit le vrai signe moins et le plus devant les gains', () => {
    expect(fmtEuro(-490, { signed: true })).toBe('−490 €');
    expect(fmtEuro(1038, { signed: true })).toBe('+1 038 €');
    expect(fmtEuro(0, { signed: true })).toBe('0 €');
  });

  it('place une espace insécable avant %', () => {
    expect(fmtPct(69)).toBe('69 %');
    expect(fmtPct(38.4, 1)).toBe('38,4 %');
  });
});
