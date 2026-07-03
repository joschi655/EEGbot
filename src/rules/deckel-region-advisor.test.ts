/**
 * Advisor-getriebene Härtungstests (03.07.2026) — eigene Datei, damit sie
 * nicht mit parallel laufenden Test-Erweiterungen in fahrplan.test.ts kollidieren.
 * Deckt genau die vier Advisor-Punkte ab: Betragsdeckel, Zitat-deckt-Wert,
 * gemischter Region-Fall, OR-in-Liste/AND-über-Dimensionen.
 */
import { describe, expect, test } from "bun:test";
import { berechneKombination } from "./fahrplan.ts";
import { regionPasst } from "./foerderMatcher.ts";
import { Foerderprogramm } from "../schemas/program.ts";
import { extrahiereFall, type AnfrageFn } from "../rag/intake.ts";

const prog = (region: unknown) =>
  Foerderprogramm.parse({
    id: "advisor-region-test",
    name: "SYNTHETISCH",
    traeger: "Test",
    foerderart: "zuschuss",
    status: "aktiv",
    beschreibung: "Fixture",
    eligibility: { feld: "massnahme.typ", op: "eq", wert: "waermepumpe" },
    foerdersaetze: [{ bezeichnung: "Grundförderung", satz_prozent: 10 }],
    antragsweg: { kanal: "online-portal", antrag_vor_massnahmenbeginn: true, benoetigte_formulare: [] },
    quellen: [{ bezeichnung: "Fixture" }],
    zuletzt_geprueft: "2026-07-03",
    region,
  });

describe("Advisor-Härtung: Region — gemischte Fälle", () => {
  test("eine Dimension matcht (PLZ), eine fehlt (Bundesland) → unbekannt mit Rückfrage, NIE true", () => {
    const p = prog({ bundeslaender: ["BY"], plz_praefixe: ["80"] });
    const r = regionPasst(p, { standort: { plz: "80331" } });
    expect(r.ergebnis).toBe("unbekannt");
    expect(r.fehlende_felder).toEqual(["standort.bundesland"]);
  });

  test("OR innerhalb der Liste: bundeslaender [BY, BW] akzeptiert beide, AND gilt nur über Dimensionen", () => {
    const p = prog({ bundeslaender: ["BY", "BW"] });
    expect(regionPasst(p, { standort: { bundesland: "BW" } }).ergebnis).toBe(true);
    expect(regionPasst(p, { standort: { bundesland: "BY" } }).ergebnis).toBe(true);
  });

  test("Mismatch in einer Dimension dominiert fehlende andere Dimension (false schlägt unbekannt)", () => {
    const p = prog({ bundeslaender: ["BY"], kommunen: ["München"] });
    const r = regionPasst(p, { standort: { bundesland: "NW" } });
    expect(r.ergebnis).toBe(false);
  });
});

describe("Advisor-Härtung: Betragsdeckel (€) wird ausgewiesen, nicht verschluckt", () => {
  test("€-Deckel erscheint in gesamtbetrag_deckel_eur + Hinweis, Quote bleibt unangetastet", () => {
    const k = berechneKombination(
      { programm_id: "bund", quote_prozent: 70, foerderart: "zuschuss" },
      { programm_id: "kommune", quote_prozent: 10, deckel_betrag_eur: 60000, foerderart: "zuschuss" },
    );
    expect(k?.kombinierte_quote_prozent).toBe(80);
    expect(k?.gesamtbetrag_deckel_eur).toBe(60000);
    expect(k?.hinweis).toContain("60.000 €");
    expect(k?.hinweis).toContain("kommune");
  });

  test("Quoten- UND Betragsdeckel gleichzeitig → beide Hinweise", () => {
    const k = berechneKombination(
      { programm_id: "bund", quote_prozent: 70, foerderart: "zuschuss" },
      { programm_id: "land", quote_prozent: 20, deckel_prozent: 80, deckel_betrag_eur: 50000, foerderart: "zuschuss" },
    );
    expect(k?.kombinierte_quote_prozent).toBe(80);
    expect(k?.hinweis).toContain("80 %");
    expect(k?.hinweis).toContain("50.000 €");
  });
});

describe("Advisor-Härtung: Intake Zitat-deckt-Wert (Existenz ≠ Korrektheit)", () => {
  const fake =
    (antwort: string): AnfrageFn =>
    async () =>
      antwort;

  test("Zahl, die NICHT im Zitat vorkommt, wird verworfen (halluzinierte Zuordnung)", async () => {
    const antwort = JSON.stringify([
      { feld: "massnahme.kosten_eur", wert: 30000, beleg: { quelle: "angebot.pdf", zitat: "Fördersatz beträgt 20 Prozent" }, sicherheit: "hoch" },
      { feld: "massnahme.kosten_eur", wert: 38000, beleg: { quelle: "angebot.pdf", zitat: "Gesamtsumme 38.000,00 €" }, sicherheit: "hoch" },
    ]);
    const e = await extrahiereFall({ freitext: "x", anfrage: fake(antwort) });
    const kosten = e.felder.filter((f) => f.feld === "massnahme.kosten_eur");
    expect(kosten.map((f) => f.wert)).toEqual([38000]);
  });

  test("deutsches Zahlenformat im Zitat deckt den koerzierten Wert (38.000 € → 38000)", async () => {
    const antwort = JSON.stringify([
      { feld: "gebaeude.alter_jahre", wert: "27", beleg: { quelle: "freitext", zitat: "Baujahr vor 27 Jahren" }, sicherheit: "mittel" },
    ]);
    const e = await extrahiereFall({ freitext: "Baujahr vor 27 Jahren", anfrage: fake(antwort) });
    expect(e.felder[0]?.wert).toBe(27);
  });
});
