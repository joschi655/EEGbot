import {calculate, sensitivity, checkMounting, DEMO} from './calculator.js';
const $ = id => document.getElementById(id);
const keys = Object.keys(DEMO);
const money = n => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
const number = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(n);
const years = n => n === null ? 'Keine einfache Amortisation' : `${number(n)} Jahre`;
let mode = null;
function clearResult() { $('result').hidden = true; $('handoff').value = ''; $('copy-status').textContent = ''; $('error').textContent = ''; }
function openScenario(demo) {
  mode = demo ? 'demo' : 'own'; clearResult();
  $('scenario').hidden = false;
  $('mode').textContent = demo ? 'Synthetische Demo — nicht deine Wohnung' : 'Eigene Szenarioannahmen — keine Standortprognose';
  $('mode-help').textContent = demo ? 'Alle Beispielwerte sind frei gewählte, hypothetische Lernwerte für einen fiktiven geeigneten Standort. Auch nach Änderungen bleibt dies eine Demo, keine persönliche Empfehlung.' : 'Fülle alle Annahmen bewusst aus. Unbekannte Werte nicht als gesichert behandeln. Ein Ja zur Montagefrage ist deine Angabe, keine technische Freigabe durch EEGbot.';
  keys.forEach(key => {$(key).value = demo ? DEMO[key] : '';});
  $('mode').focus();
}
$('mount-form').addEventListener('submit', event => {
  event.preventDefault();
  const answer = new FormData(event.currentTarget).get('mount');
  clearResult(); $('scenario').hidden = true; mode = null;
  const allowed = checkMounting(answer);
  $('stop').hidden = allowed;
  if (allowed) openScenario(false); else $('stop').focus();
});
$('mount-form').addEventListener('change', () => { mode = null; clearResult(); $('scenario').hidden = true; $('stop').hidden = true; });
$('demo').addEventListener('click', () => openScenario(true));
$('reset').addEventListener('click', () => { mode = null; clearResult(); $('scenario').hidden = true; $('mount-form').querySelector('input').focus(); });
$('calc-form').addEventListener('input', clearResult);
$('calc-form').addEventListener('submit', event => {
  event.preventDefault(); clearResult();
  if (!mode || (mode === 'own' && !checkMounting(new FormData($('mount-form')).get('mount')))) return;
  try {
    const input = Object.fromEntries(keys.map(key => [key, $(key).value.trim() === '' ? NaN : $(key).valueAsNumber]));
    const result = calculate(input), rows = sensitivity(input);
    $('result-mode').textContent = $('mode').textContent;
    $('summary').replaceChildren();
    for (const [label, value] of [['Zeitgleich selbst genutzt',`${number(result.selfConsumedKwh)} kWh/Jahr`],['Vermiedener Strombezug',`${money(result.grossSavings)}/Jahr`],['Nettoersparnis nach Betriebskosten',`${money(result.netSavings)}/Jahr`],['Einfache Amortisation', years(result.paybackYears)]]) {
      const p = document.createElement('p'), strong = document.createElement('strong');
      p.append(`${label}: `); strong.textContent = value; p.append(strong); $('summary').append(p);
    }
    $('sensitivity').replaceChildren();
    for (const row of rows) {
      const tr = document.createElement('tr');
      for (const text of [`${number(row.annualYield)} kWh`,money(row.netSavings),years(row.paybackYears)]) {const td = document.createElement('td'); td.textContent = text; tr.append(td);}
      $('sensitivity').append(tr);
    }
    $('handoff').value = [
      `EEGbot — ${$('mode').textContent}`,
      mode === 'demo' ? 'Fiktiver geeigneter Standort. Nicht auf meine Wohnung übertragbar.' : 'Montage: vom Nutzer als geklärt angegeben; keine technische Freigabe.',
      `Annahmen: ${number(input.annualYield)} kWh/Jahr; Eigenverbrauch ${number(input.selfConsumption)} %; Strompreis ${money(input.electricityPrice)}/kWh; Gesamtkosten ${money(input.investment)}; Betriebskosten ${money(input.annualCosts)}/Jahr.`,
      `Selbst genutzt: ${number(result.selfConsumedKwh)} kWh/Jahr. Nettoersparnis: ${money(result.netSavings)}/Jahr. Einfache Amortisation: ${years(result.paybackYears)}.`,
      `Sensitivität (Ertrag −20 % / Basis / +20 %): ${rows.map(r => money(r.netSavings)+'/Jahr').join(' / ')}. Keine Prognose.`,
      'Keine Förderung/Vergütung, Finanzierung, Alterung, Ersatzinvestitionen oder Preisänderungen berücksichtigt. Keine Renditegarantie oder individuelle Beratung.',
      mode === 'demo' ? 'Nächster Schritt: Für einen realen Versuch zuerst geeignete Montagefläche fachlich klären. Ohne diese STOP.' : 'Nächster Schritt: Ertragsannahme und zeitgleichen Verbrauch überprüfen, vollständiges Angebot einholen und offene Montage-/Elektrofragen mit Fachbetrieb klären. Noch keine Kaufentscheidung.',
      'Quelle zur Vertiefung: https://solar.htw-berlin.de/rechner/stecker-solar-simulator/'
    ].join('\n\n');
    $('result').hidden = false; $('result-title').focus();
  } catch (error) { $('error').textContent = error.message; }
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('handoff').value); $('copy-status').textContent = 'Rechenblatt kopiert.'; }
  catch { $('handoff').focus(); $('handoff').select(); $('copy-status').textContent = 'Automatisches Kopieren nicht verfügbar. Der Text ist markiert: mit Strg+C bzw. der Kopierfunktion deines Geräts kopieren.'; }
});
$('print').addEventListener('click', () => window.print());
$('copy-install').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('install-prompt').value); $('install-status').textContent = 'Installationssatz kopiert.'; }
  catch { $('install-prompt').focus(); $('install-prompt').select(); $('install-status').textContent = 'Der Satz ist markiert. Mit der Kopierfunktion deines Geräts kopieren.'; }
});
