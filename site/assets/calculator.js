/** Reines Szenariomodell. Keine Rechts-, Förder- oder Ertragsprognose. */
export const DEMO = Object.freeze({annualYield: 600, selfConsumption: 60, electricityPrice: 0.30, investment: 600, annualCosts: 10});

export function checkMounting(answer) { return answer === 'yes'; }

export function calculate(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Bitte alle Annahmen als Zahlen eingeben.');
  for (const key of Object.keys(DEMO)) {
    if (typeof input[key] !== 'number' || !Number.isFinite(input[key]) || input[key] < 0) {
      throw new RangeError('Alle Annahmen müssen endliche, nicht negative Zahlen sein.');
    }
  }
  if (input.selfConsumption > 100) throw new RangeError('Eigenverbrauch muss zwischen 0 und 100 Prozent liegen.');
  const selfConsumedKwh = input.annualYield * (input.selfConsumption / 100);
  const grossSavings = selfConsumedKwh * input.electricityPrice;
  const netSavings = grossSavings - input.annualCosts;
  const paybackYears = netSavings > 0 ? input.investment / netSavings : null;
  if (![selfConsumedKwh, grossSavings, netSavings].every(Number.isFinite) || (paybackYears !== null && !Number.isFinite(paybackYears))) {
    throw new RangeError('Die Zahlen sind für diese Rechnung zu groß.');
  }
  return {selfConsumedKwh, grossSavings, netSavings, paybackYears};
}

/** ±20% Ertrag ist eine frei gewählte Variation, kein Unsicherheitsintervall. */
export function sensitivity(input) {
  calculate(input);
  return [0.8, 1, 1.2].map(factor => {
    const annualYield = input.annualYield * factor;
    return {factor, annualYield, ...calculate({...input, annualYield})};
  });
}
