import { describe, expect, test } from 'bun:test';
import { calculate, checkMounting, sensitivity, DEMO } from '../site/assets/calculator.js';

describe('Montage-Gate', () => {
  test('nur ausdrückliches Ja erlaubt persönliche Rechnung', () => {
    expect(checkMounting('yes')).toBe(true);
    for (const value of ['no', 'unclear', '', null, undefined, 'YES']) expect(checkMounting(value)).toBe(false);
  });
});
describe('hypothetische Wirtschaftlichkeit, ohne Förderung/Vergütung', () => {
  test('nachvollziehbare Rechnung', () => {
    const r = calculate(DEMO);
    expect(r.selfConsumedKwh).toBe(360);
    expect(r.grossSavings).toBeCloseTo(108);
    expect(r.netSavings).toBeCloseTo(98);
    expect(r.paybackYears).toBeCloseTo(600 / 98);
  });
  test('Null und Verlust: keine Amortisation', () => {
    expect(calculate({...DEMO, annualYield: 0, annualCosts: 0}).paybackYears).toBeNull();
    expect(calculate({...DEMO, selfConsumption: 0}).netSavings).toBe(-10);
    expect(calculate({...DEMO, electricityPrice: 0}).paybackYears).toBeNull();
    expect(calculate({...DEMO, investment: 0}).paybackYears).toBe(0);
    expect(calculate({...DEMO, annualCosts: 108}).paybackYears).toBeNull();
  });
  test('ungültige Inputs werden nicht zu Null umgedeutet', () => {
    for (const key of Object.keys(DEMO)) {
      for (const value of [-1, NaN, Infinity, '', '3', null, undefined]) {
        expect(() => calculate({...DEMO, [key]: value})).toThrow();
      }
    }
    expect(() => calculate({...DEMO, selfConsumption: 101})).toThrow();
    expect(() => calculate(null)).toThrow();
    expect(() => calculate({...DEMO, annualYield: Number.MAX_VALUE, electricityPrice: Number.MAX_VALUE})).toThrow();
  });
  test('Sensitivität: Ertrag ±20%, nicht Prognose oder Konfidenzintervall', () => {
    const rows = sensitivity(DEMO);
    expect(rows.map(r => r.annualYield)).toEqual([480, 600, 720]);
    expect(rows[0].netSavings).toBeCloseTo(76.4);
    expect(rows[2].netSavings).toBeCloseTo(119.6);
    expect(DEMO.annualYield).toBe(600);
  });
});
