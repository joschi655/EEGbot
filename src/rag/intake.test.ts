import { describe, expect, test } from "bun:test";
import { erstelleIntakeVorschau, extrahiereFall, FELD_KATALOG, type AnfrageFn } from "./intake.ts";

const fakeAnfrage =
  (antwort: string): AnfrageFn =>
  async () =>
    antwort;

describe("KI-Intake — extrahiereFall (injizierte Inferenz, kein API-Key nötig)", () => {
  test("FELD_KATALOG deckt alle Fahrplan-Felder mit Typinfo ab", () => {
    const pfade = FELD_KATALOG.map((k) => k.feld);
    for (const muss of ["massnahme.typ", "massnahme.kosten_eur", "antragsteller.haushaltseinkommen_eur", "standort.bundesland", "eigentumsform"])
      expect(pfade).toContain(muss);
    expect(FELD_KATALOG.every((k) => ["boolean", "zahl", "text"].includes(k.typ))).toBe(true);
    expect(FELD_KATALOG.find((k) => k.feld === "massnahme.typ")?.erlaubte_werte).toContain("waermepumpe");
  });

  test("gültige Vorschläge werden gemappt und koerziert (ja→true, '38.000 €'→38000, Enum exakt)", async () => {
    const antwort = JSON.stringify([
      { feld: "massnahme.typ", wert: "Waermepumpe", beleg: { quelle: "angebot.pdf", zitat: "Lieferung einer Wärmepumpe" }, sicherheit: "hoch" },
      { feld: "massnahme.kosten_eur", wert: "38.000 €", beleg: { quelle: "angebot.pdf", zitat: "Gesamtsumme 38.000 €" }, sicherheit: "hoch" },
      { feld: "antragsteller.selbstnutzend", wert: "ja", beleg: { quelle: "freitext", zitat: "wir wohnen selbst im Haus" }, sicherheit: "mittel" },
    ]);
    const e = await extrahiereFall({ freitext: "wir wohnen selbst im Haus", anfrage: fakeAnfrage(antwort) });
    expect(e.felder).toHaveLength(3);
    expect(e.felder.find((f) => f.feld === "massnahme.typ")?.wert).toBe("waermepumpe");
    expect(e.felder.find((f) => f.feld === "massnahme.kosten_eur")?.wert).toBe(38000);
    expect(e.felder.find((f) => f.feld === "antragsteller.selbstnutzend")?.wert).toBe(true);
    expect(e.nicht_gefunden).toContain("standort.bundesland");
  });

  test("Beleg-Pflicht: Vorschläge ohne Quelle/Zitat werden verworfen (Anti-Halluzination)", async () => {
    const antwort = JSON.stringify([
      { feld: "massnahme.kosten_eur", wert: 25000, sicherheit: "hoch" },
      { feld: "gebaeude.alter_jahre", wert: 40, beleg: { quelle: "freitext", zitat: "" }, sicherheit: "hoch" },
      { feld: "gebaeude.bestandsgebaeude", wert: true, beleg: { quelle: "freitext", zitat: "Baujahr 1985" }, sicherheit: "hoch" },
    ]);
    const e = await extrahiereFall({ freitext: "Baujahr 1985", anfrage: fakeAnfrage(antwort) });
    expect(e.felder).toHaveLength(1);
    expect(e.felder[0]!.feld).toBe("gebaeude.bestandsgebaeude");
  });

  test("unbekannte Felder und unpassende Werte werden verworfen", async () => {
    const antwort = JSON.stringify([
      { feld: "kontonummer", wert: "DE123", beleg: { quelle: "freitext", zitat: "x" }, sicherheit: "hoch" },
      { feld: "massnahme.typ", wert: "pool", beleg: { quelle: "freitext", zitat: "Pool geplant" }, sicherheit: "hoch" },
      { feld: "massnahme.kosten_eur", wert: "keine Angabe", beleg: { quelle: "freitext", zitat: "x" }, sicherheit: "niedrig" },
    ]);
    const e = await extrahiereFall({ freitext: "Pool geplant", anfrage: fakeAnfrage(antwort) });
    expect(e.felder).toHaveLength(0);
  });

  test("Markdown-Zaun um das JSON wird toleriert", async () => {
    const antwort = '```json\n[{"feld":"standort.bundesland","wert":"by","beleg":{"quelle":"freitext","zitat":"in München"},"sicherheit":"mittel"}]\n```';
    const e = await extrahiereFall({ freitext: "in München", anfrage: fakeAnfrage(antwort) });
    expect(e.felder[0]?.wert).toBe("BY");
  });

  test("weder Dokumente noch Freitext → leeres Ergebnis mit Handlungs-Hinweis, kein Inferenz-Aufruf", async () => {
    let aufgerufen = false;
    const e = await extrahiereFall({
      // dokumente/ kann auf Nutzer-Maschinen gefüllt sein (z. B. Beispiel-Unterlagen) —
      // der Test injiziert deshalb einen leeren Kontext statt das echte Verzeichnis zu lesen.
      sammleKontext: async () => ({ kontext: "", verwendet: [] }),
      anfrage: async () => {
        aufgerufen = true;
        return "[]";
      },
    });
    expect(aufgerufen).toBe(false);
    expect(e.felder).toEqual([]);
    expect(e.hinweis).toContain("ingest:dokumente");
  });

  test("kaputtes JSON → verständlicher Fehler", async () => {
    await expect(extrahiereFall({ freitext: "x", anfrage: fakeAnfrage("Hier ist Ihre Antwort: 42") })).rejects.toThrow(/kein valides JSON/);
  });

  test("Vorschau zeigt exakt die nutzerbezogenen Inhalte vor externer Übertragung", async () => {
    const vorschau = await erstelleIntakeVorschau({
      freitext: "Mein Freitext",
      sammleKontext: async () => ({ kontext: "### Dokument: angebot.pdf\nPrivater Auszug", verwendet: ["angebot.pdf"] }),
    });
    expect(vorschau.empfaenger).toBe("Anthropic API");
    expect(vorschau.dokumente).toEqual(["angebot.pdf"]);
    expect(vorschau.uebertragener_inhalt).toContain("Mein Freitext");
    expect(vorschau.uebertragener_inhalt).toContain("Privater Auszug");
    expect(vorschau.zeichen).toBe(vorschau.uebertragener_inhalt.length);
  });
});

describe("KI-Intake — adversariale Szenarien Phase C (Forge)", () => {
  test("Zahl: deutsches Format '1.234,56' → 1234.56 und '2.500,00' → 2500; wert null → verworfen", async () => {
    const antwort = JSON.stringify([
      { feld: "massnahme.kosten_eur", wert: "1.234,56", beleg: { quelle: "angebot.pdf", zitat: "Summe 1.234,56 €" }, sicherheit: "hoch" },
      { feld: "antragsteller.haushaltseinkommen_eur", wert: "2.500,00", beleg: { quelle: "freitext", zitat: "2.500,00 monatlich" }, sicherheit: "mittel" },
      { feld: "gebaeude.alter_jahre", wert: null, beleg: { quelle: "freitext", zitat: "Baujahr unbekannt" }, sicherheit: "niedrig" },
    ]);
    const e = await extrahiereFall({ freitext: "x", anfrage: fakeAnfrage(antwort) });
    expect(e.felder.find((f) => f.feld === "massnahme.kosten_eur")?.wert).toBe(1234.56);
    expect(e.felder.find((f) => f.feld === "antragsteller.haushaltseinkommen_eur")?.wert).toBe(2500);
    expect(e.felder.some((f) => f.feld === "gebaeude.alter_jahre")).toBe(false);
    expect(e.nicht_gefunden).toContain("gebaeude.alter_jahre");
  });

  test("boolean-Koerzierung toleriert Groß-/Kleinschreibung + Whitespace ('Ja ', 'TRUE' → true; Forge-Fund, behoben)", async () => {
    const antwort = JSON.stringify([
      { feld: "massnahme.begonnen", wert: "ja", beleg: { quelle: "freitext", zitat: "bereits begonnen" }, sicherheit: "hoch" },
      { feld: "massnahme.ersetzt_fossile_heizung", wert: "true", beleg: { quelle: "freitext", zitat: "ersetzt Ölheizung" }, sicherheit: "hoch" },
      { feld: "antragsteller.selbstnutzend", wert: "TRUE", beleg: { quelle: "freitext", zitat: "selbst bewohnt" }, sicherheit: "hoch" },
      { feld: "gebaeude.bestandsgebaeude", wert: "Ja ", beleg: { quelle: "freitext", zitat: "Bestand" }, sicherheit: "hoch" },
      { feld: "antragsteller.isfp_vorhanden", wert: "NEIN", beleg: { quelle: "freitext", zitat: "kein Sanierungsfahrplan" }, sicherheit: "hoch" },
      { feld: "massnahme.bereits_gefoerdert", wert: "vielleicht", beleg: { quelle: "freitext", zitat: "unklar" }, sicherheit: "niedrig" },
    ]);
    const e = await extrahiereFall({ freitext: "x", anfrage: fakeAnfrage(antwort) });
    expect(e.felder.find((f) => f.feld === "massnahme.begonnen")?.wert).toBe(true);
    expect(e.felder.find((f) => f.feld === "massnahme.ersetzt_fossile_heizung")?.wert).toBe(true);
    expect(e.felder.find((f) => f.feld === "antragsteller.selbstnutzend")?.wert).toBe(true);
    expect(e.felder.find((f) => f.feld === "gebaeude.bestandsgebaeude")?.wert).toBe(true);
    expect(e.felder.find((f) => f.feld === "antragsteller.isfp_vorhanden")?.wert).toBe(false);
    expect(e.felder.some((f) => f.feld === "massnahme.bereits_gefoerdert")).toBe(false);
  });

  test("beleg.zitat nur Whitespace → verworfen (Beleg-Pflicht); unbekannte sicherheit → 'mittel'", async () => {
    const antwort = JSON.stringify([
      { feld: "massnahme.kosten_eur", wert: 25000, beleg: { quelle: "angebot.pdf", zitat: "   " }, sicherheit: "hoch" },
      { feld: "gebaeude.alter_jahre", wert: 40, beleg: { quelle: "freitext", zitat: "Gebäude ist 40 Jahre alt" }, sicherheit: "voll-sicher" },
    ]);
    const e = await extrahiereFall({ freitext: "Baujahr 1985", anfrage: fakeAnfrage(antwort) });
    expect(e.felder.some((f) => f.feld === "massnahme.kosten_eur")).toBe(false);
    const alter = e.felder.find((f) => f.feld === "gebaeude.alter_jahre");
    expect(alter?.wert).toBe(40);
    expect(alter?.sicherheit).toBe("mittel");
  });

  test("doppeltes Feld im Array → beide Vorschläge bleiben erhalten (IST: kein Dedup/last-wins), Reihenfolge stabil", async () => {
    const antwort = JSON.stringify([
      { feld: "massnahme.kosten_eur", wert: "10000", beleg: { quelle: "angebot-a.pdf", zitat: "10.000 €" }, sicherheit: "hoch" },
      { feld: "massnahme.kosten_eur", wert: "20000", beleg: { quelle: "angebot-b.pdf", zitat: "20.000 €" }, sicherheit: "mittel" },
    ]);
    const e = await extrahiereFall({ freitext: "x", anfrage: fakeAnfrage(antwort) });
    const treffer = e.felder.filter((f) => f.feld === "massnahme.kosten_eur");
    expect(treffer.map((t) => t.wert)).toEqual([10000, 20000]);
    expect(e.nicht_gefunden).not.toContain("massnahme.kosten_eur");
  });
});
