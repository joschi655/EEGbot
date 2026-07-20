/**
 * Tests der Programmauskunft-Engine: Durchführer-Fakten (KfW vs. BAFA) aus
 * data/programs als deterministisches Lookup — Basis der Benchmark-Fälle b33–b36
 * (Praxisfälle M. Schäfer, PDF 17.07.2026).
 */
import { describe, expect, test } from "bun:test";
import { programmauskunft } from "./programmauskunft.ts";

describe("Programmauskunft (Durchführer-Fakten KfW vs. BAFA)", () => {
  test("Vollmacht: KfW 458 nein (Meine KfW), BAFA BEG EM ja (b33)", async () => {
    const r = await programmauskunft({ programm_ids: ["kfw-458", "bafa-beg-em"] });
    expect(r["kfw-458"]!.antragstellung?.vollmacht_durch_eee_moeglich).toBe(false);
    expect(r["kfw-458"]!.antragstellung?.antragsteller_persoenlich_erforderlich).toBe(true);
    expect(r["bafa-beg-em"]!.antragstellung?.vollmacht_durch_eee_moeglich).toBe(true);
  });

  test("Nebenkosten-Map: Fachplanung/Baubegleitung BAFA ja, KfW nein (b34)", async () => {
    const r = await programmauskunft({ programm_ids: ["kfw-458", "bafa-beg-em"] });
    expect(r["kfw-458"]!.nebenkosten["fachplanung_baubegleitung"]?.foerderfaehig).toBe(false);
    expect(r["bafa-beg-em"]!.nebenkosten["fachplanung_baubegleitung"]?.foerderfaehig).toBe(true);
  });

  test("Antragsberechtigte: Nießbraucher KfW nein, BAFA ja (b35)", async () => {
    const r = await programmauskunft({ programm_ids: ["kfw-458", "bafa-beg-em"] });
    expect(r["kfw-458"]!.antragsberechtigte?.niessbrauchsberechtigter).toBe(false);
    expect(r["bafa-beg-em"]!.antragsberechtigte?.niessbrauchsberechtigter).toBe(true);
  });

  test("Bearbeitungszeiten-Map: Gebäudenetze > 6 Monate, kein Rechtsanspruch (b36)", async () => {
    const r = await programmauskunft({ programm_ids: ["bafa-beg-em"] });
    const gz = r["bafa-beg-em"]!.bearbeitungszeiten["gebaeudenetze"];
    expect(gz?.praxis_monate_min).toBe(6);
    expect(gz?.kein_rechtsanspruch).toBe(true);
    expect(gz?.hinweis).toMatch(/kein Rechtsanspruch/i);
  });

  test("Auslegungshinweise werden mitgeliefert (known unknowns, keine erfundenen Konditionen)", async () => {
    const r = await programmauskunft({ programm_ids: ["kfw-458"] });
    const ids = r["kfw-458"]!.auslegungshinweise.map((h) => h.id);
    expect(ids).toContain("etagen_zentral_klimabonus");
    expect(ids).toContain("wpb_bonus_mechanik");
    for (const h of r["kfw-458"]!.auslegungshinweise) {
      expect(h.grundregel.length).toBeGreaterThan(10);
      expect(h.offene_frage.length).toBeGreaterThan(10);
      expect(h.verweis_an.length).toBeGreaterThan(0);
    }
  });

  test("Richtlinien-Stand mit Novellen-Marker (21.07.2026) wird ausgeliefert", async () => {
    const r = await programmauskunft({ programm_ids: ["kfw-458"] });
    expect(r["kfw-458"]!.richtlinie?.naechste_fassung_gueltig_ab).toBe("2026-07-21");
    expect(r["kfw-458"]!.richtlinie?.hinweis).toMatch(/verifizieren/);
  });

  test("Unbekannte Programm-ID → ehrlicher Fehler statt leerem Ergebnis", async () => {
    expect(programmauskunft({ programm_ids: ["kfw-999"] })).rejects.toThrow(/nicht erfasst/);
  });
});
