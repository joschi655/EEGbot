#!/usr/bin/env bun
/**
 * EEG-2027-Zeitmaschine (Demo) — dieselbe Anlage, einen Monat auseinander in
 * Betrieb genommen: IBN 15.12.2026 (geltendes Recht: feste Einspeisevergütung
 * § 48 EEG 2023) vs. IBN 15.01.2027 (ENTWURF EEG 2027: Netzbetreiberabnahme).
 *
 * Voraussetzung: bun run build:eeg2027 (Entwurfs-Snapshot im Normgraph).
 * Aufruf:        bun run demo:zeitmaschine [kWp] [kWh/Jahr]
 *
 * Alle 2027-Zahlen sind ENTWURF + SCHÄTZUNG und so gekennzeichnet — dieses
 * Skript trifft keine Rechtsaussage und ersetzt keine Beratung.
 */
import { diffFassungen, fassungen, oeffneGraph } from "../src/graph/query.ts";
import { parameterWert } from "../src/lib/parameter.ts";

const KWP = Number(process.argv[2] ?? 9.9);
const KWH_JAHR = Number(process.argv[3] ?? 9900);
if (!Number.isFinite(KWP) || KWP <= 0 || !Number.isFinite(KWH_JAHR) || KWH_JAHR <= 0) {
  console.error("Nutzung: bun run demo:zeitmaschine [kWp] [kWh/Jahr] — Zahlen mit Punkt, z. B. 9.9 9900");
  process.exit(1);
}
const IBN_ALT = "2026-12-15";
const IBN_NEU = "2027-01-15";
const ENTWURF_STICHTAG = "2027-01-15";
/** Bezahlte Abnahmedauer der Netzbetreiberabnahme: Branchenschätzung ~30 Monate nach
 *  RefE-Sekundärquellen (Rödl zu § 25 Abs. 1a EEG 2027-E; § 25 ist NICHT Teil der
 *  kuratierten Entwurfs-Normen in data/entwuerfe/ — reine SCHÄTZUNG). */
const ABNAHME_MONATE_ENTWURF = 30;
const FOERDERDAUER_JAHRE = 20;

const eur = (x: number) => x.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const heute = new Date().toISOString().slice(0, 10);

const db = oeffneGraph();
const historie = fassungen(db, "eeg_2014", "§ 21");
if (!historie.some((f) => f.fassung_von === "2027-01-01")) {
  console.error(
    "Der EEG-2027-Entwurf ist nicht im Normgraph.\nZuerst ausführen: bun run build:eeg2027",
  );
  process.exit(1);
}

console.log("═══ EEG-2027-ZEITMASCHINE ══════════════════════════════════════");
console.log(`Anlage: PV ${KWP} kWp, Volleinspeisung, ${KWH_JAHR.toLocaleString("de-DE")} kWh/Jahr (Annahme)\n`);

console.log(`§ 21 EEG — Fassungshistorie im Normgraph (${historie.length} Fassungen):`);
for (const f of historie)
  console.log(
    `  ${f.fassung_von} → ${f.fassung_bis ?? "offen"}  ${f.fassung_von >= "2027-01-01" ? "⚠️ ENTWURF" : ""}`,
  );

const diff = diffFassungen(db, "eeg_2014", "§ 21", heute, ENTWURF_STICHTAG);
if (diff && !diff.unveraendert) {
  console.log(`\nDiff § 21: geltend (${diff.fassung_a.von}) ↔ ENTWURF (${diff.fassung_b.von}) — ${diff.geaenderte_absaetze.length} geänderte Absätze:`);
  for (const i of diff.geaenderte_absaetze.slice(0, 3)) {
    const t = diff.absaetze_b[i]!;
    console.log(`  » ${t.length > 220 ? `${t.slice(0, 220)}…` : t}`);
  }
}

// ── Euro-Delta ──
const alt = await parameterWert("verguetung.solar.volleinspeisung", IBN_ALT, KWP);
const jahresAlt = (KWH_JAHR * Number(alt.wert)) / 100;
const gesamtAlt = jahresAlt * FOERDERDAUER_JAHRE;

const neu = await parameterWert("markt.netzbetreiberabnahme_entwurf2027", IBN_NEU);
const jahresNeu = (KWH_JAHR * Number(neu.wert)) / 100;
const gesamtNeu = (jahresNeu * ABNAHME_MONATE_ENTWURF) / 12;

console.log("\n──────────────────────────────────────────────────────────────");
console.log(`IBN ${IBN_ALT} — geltendes Recht (§ 48 EEG 2023, Volleinspeisung):`);
console.log(`  Satz ${alt.wert} ct/kWh (Quelle: ${alt.quelle})`);
console.log(`  ${eur(jahresAlt)}/Jahr → ${eur(gesamtAlt)} über ${FOERDERDAUER_JAHRE} Jahre (§ 25 EEG 2023)`);

console.log(`\nIBN ${IBN_NEU} — ⚠️ ENTWURF EEG 2027 (RefE 21.04.2026, kein geltendes Recht):`);
console.log(`  keine feste Einspeisevergütung mehr (§ 21 EEG 2027-E)`);
console.log(`  Netzbetreiberabnahme ~${neu.wert} ct/kWh — SCHÄTZUNG (Quelle: ${neu.quelle})`);
console.log(`  ${eur(jahresNeu)}/Jahr, bezahlt voraussichtlich nur ~${ABNAHME_MONATE_ENTWURF} Monate (Branchenschätzung nach RefE-Sekundärquellen) → ${eur(gesamtNeu)}`);
console.log(`  danach: Eigenverbrauch/Direktvermarktung; 50-%-Wirkleistungskappung geplant`);

console.log("\n──────────────────────────────────────────────────────────────");
console.log(`Δ GEFÖRDERTE ERLÖSE ≈ ${eur(gesamtAlt - gesamtNeu)} — ein Monat IBN-Unterschied`);
console.log(
  `  (${FOERDERDAUER_JAHRE} Jahre feste Vergütung vs. ~${ABNAHME_MONATE_ENTWURF} Monate Netzbetreiberabnahme;` +
    ` spätere Erlöse aus Eigenverbrauch/Direktvermarktung sind hier NICHT eingerechnet)`,
);
console.log(
  "\n⚠️ Der 2027-Zweig beruht auf einem ENTWURF (Referentenentwurf 21.04.2026) und" +
    "\n   SCHÄTZUNGEN aus Sekundärquellen. Keine Rechts- oder Anlageberatung —" +
    "\n   Gesetzgebungsverfahren läuft (Bundestag voraussichtlich September 2026).",
);
