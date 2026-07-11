/**
 * Regressionsnetz für den Default-Stichtag von sucheNormen (Forge-Fund 2026-07-11):
 * Ohne Stichtag darf NIE eine künftige Fassung (z. B. der EEG-2027-Entwurf aus
 * build:eeg2027) auftauchen, und ein leerer Stichtag ("") darf die Filterung
 * nicht aushebeln. Läuft nur, wenn der Suchindex lokal gebaut ist.
 */
import { describe, expect, test } from "bun:test";
import { sucheNormen } from "./suche.ts";

const INDEX = new URL("../../knowledge/index/normen.json", import.meta.url).pathname;
const indexDa = await Bun.file(INDEX).exists();
const heute = new Date().toISOString().slice(0, 10);

(indexDa ? describe : describe.skip)("sucheNormen Default-Stichtag (Entwurfs-Leak-Regression)", () => {
  test("Default liefert nur heute geltende Fassungen, nie ENTWURF-Text", async () => {
    const treffer = await sucheNormen("Zahlungsanspruch", { slug: "eeg_2014", limit: 8 });
    expect(treffer.length).toBeGreaterThan(0);
    for (const t of treffer) {
      expect(t.fassung_von <= heute).toBe(true);
      if (t.fassung_bis !== null) expect(t.fassung_bis > heute).toBe(true);
      expect(t.titel ?? "").not.toContain("[ENTWURF");
    }
  });

  test("leerer Stichtag verhält sich wie Default statt alle Treffer zu filtern", async () => {
    const leer = await sucheNormen("Zahlungsanspruch", { slug: "eeg_2014", stichtag: "", limit: 8 });
    expect(leer.length).toBeGreaterThan(0);
  });
});
