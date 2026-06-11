/**
 * Phase-1-Meilenstein-Tests für den Wissens-Layer.
 * Benötigt knowledge/normgraph.sqlite (`bun run build:knowledge`).
 */
import { describe, expect, test } from "bun:test";
import { crossRefs, diffFassungen, fassungen, normAtDate, oeffneGraph } from "./query.ts";
import { resolveUebergangsrecht } from "./uebergangsrecht.ts";

const db = oeffneGraph();

describe("normAtDate (temporaler Zugriff)", () => {
  test("§ 24 EEG existiert in der Fassung 31.12.2022 und heute", () => {
    const alt = normAtDate(db, "eeg_2014", "§ 24", "2023-01-01");
    const neu = normAtDate(db, "eeg_2014", "§ 24", "2026-01-01");
    expect(alt).not.toBeNull();
    expect(neu).not.toBeNull();
    expect(alt!.text.length).toBeGreaterThan(200);
  });

  test("Solarpaket I (16.05.2024) hat § 24 geändert — Fassungen davor/danach unterscheiden sich", () => {
    const diff = diffFassungen(db, "eeg_2014", "§ 24", "2023-01-01", "2024-06-01");
    expect(diff).not.toBeNull();
    expect(diff!.unveraendert).toBe(false);
    // Solarpaket I: Steckersolargeräte (≤ 2 kW) bleiben bei Zusammenfassung unberücksichtigt
    expect(diff!.absaetze_b.join(" ")).toMatch(/Steckersolargerät/i);
  });

  test("§ 52 EEG (Sanktionen) enthält 10-Euro-Regel in aktueller Fassung", () => {
    const n = normAtDate(db, "eeg_2014", "§ 52", "2026-01-01");
    expect(n).not.toBeNull();
    expect(n!.text).toMatch(/10 Euro/);
  });

  test("§ 42c EnWG (Energy Sharing) existiert erst in neuer Fassung", () => {
    expect(normAtDate(db, "enwg_2005", "§ 42c", "2023-01-01")).toBeNull();
    const neu = normAtDate(db, "enwg_2005", "§ 42c", "2026-06-12");
    expect(neu).not.toBeNull();
  });

  test("§ 100 EEG hat mehrere Fassungen im Graph", () => {
    expect(fassungen(db, "eeg_2014", "§ 100").length).toBeGreaterThanOrEqual(2);
  });
});

describe("crossRefs (Querverweis-Graph)", () => {
  test("§ 24 EEG verweist auf § 21 (Veräußerungsformen-Kontext) oder § 3 (Begriffe)", () => {
    const refs = crossRefs(db, "eeg_2014", "§ 24", "2026-01-01", 1);
    expect(refs.length).toBeGreaterThan(0);
    const ziele = refs.map((r) => r.ziel_enbez);
    expect(ziele.some((z) => /^§ (3|21|38b)/.test(z))).toBe(true);
  });

  test("Multi-Hop liefert mehr Kanten als Single-Hop", () => {
    const t1 = crossRefs(db, "eeg_2014", "§ 52", "2026-01-01", 1);
    const t2 = crossRefs(db, "eeg_2014", "§ 52", "2026-01-01", 2);
    expect(t2.length).toBeGreaterThan(t1.length);
  });
});

describe("Übergangsrecht-Resolver (§ 100-Kaskade) — BGH XIII ZR 3/24-Pattern", () => {
  test("IBN 2005 → Vergütungsregime EEG 2004, Kette über alle Übergangsnormen", async () => {
    const r = await resolveUebergangsrecht("2005-03-15", "2026-06-12");
    expect(r.verguetungsregime.id).toBe("eeg-2004");
    // Kette muss die dokumentierte BGH-Kaskade abbilden: §100 EEG 2023 → ... → §66 EEG 2009
    expect(r.normenkette).toContain("§ 100 EEG 2023");
    expect(r.normenkette).toContain("§ 100 EEG 2017");
    expect(r.normenkette).toContain("§ 66 EEG 2009");
    expect(r.volltext_verfuegbar).toBe(false); // EEG 2004 nicht im QuantLaw-Archiv — ehrlich ausweisen
  });

  test("IBN 2016 → EEG 2014; IBN 2024 → EEG 2023 (keine Kette nötig)", async () => {
    const alt = await resolveUebergangsrecht("2016-05-01");
    expect(alt.verguetungsregime.id).toBe("eeg-2014");
    const neu = await resolveUebergangsrecht("2024-03-01");
    expect(neu.verguetungsregime.id).toBe("eeg-2023");
    expect(neu.normenkette.filter((s) => s.startsWith("§")).length).toBe(0);
  });

  test("§52-Durchbrechung wird immer mitgeliefert (FAQ 236)", async () => {
    const r = await resolveUebergangsrecht("2010-01-01");
    expect(r.durchbrechungen.some((d) => d.norm.includes("§ 52"))).toBe(true);
  });

  test("IBN vor EEG 2000 wirft verständlichen Fehler", async () => {
    expect(resolveUebergangsrecht("1999-01-01")).rejects.toThrow(/vor dem EEG 2000/);
  });
});
