/**
 * Phase-2-Tests: deterministische Engines gegen dokumentierte Szenarien aus dem
 * Research-Korpus (Clearingstelle FAQ 236, BGH XIII ZR 12/19, Final Report
 * eeg-jura-ki-usecases-400389).
 */
import { describe, expect, test } from "bun:test";
import { berechneSanktion52 } from "./sanktion52.ts";
import { berechneVerguetung } from "./verguetung.ts";
import { pruefeZusammenfassung, type AnlageZsf } from "./anlagenzusammenfassung.ts";
import { pruefeFristen } from "./fristen.ts";
import { pruefeSchwellen } from "./schwellen.ts";
import { vergleicheAusgefoerderteOptionen } from "./ausgefoerderte.ts";
import { klassifiziere, pruefeGuardrailAusgabe } from "./guardrailClassifier.ts";

describe("§52 Liability Radar", () => {
  test("3-MW-Eigenversorger, Doppelpflichtverstoß → 30.000 €/Monat (Kappung Abs. 5)", async () => {
    const r = await berechneSanktion52({
      leistung_kw: 3000,
      verstoesse: [
        { kategorie: "11", beginn: "2026-01-01" }, // MaStR fehlt
        { kategorie: "1", beginn: "2026-01-01" }, // §9-Verstoß
      ],
      stichtag: "2026-03-15",
    });
    expect(r.monatlich_laufend_eur).toBe(30_000);
    const jan = r.monate.find((m) => m.monat === "2026-01")!;
    expect(jan.betrag_eur).toBe(30_000); // 2×30.000 → gekappt auf 10 €/kW
    expect(jan.gekappt).toBe(true);
  });

  test("5-kWp-Ausgeförderte, MaStR-Verstoß → 50 €/Monat (Final-Report-Szenario)", async () => {
    const r = await berechneSanktion52({
      leistung_kw: 5,
      verstoesse: [{ kategorie: "11", beginn: "2026-01-10" }],
      stichtag: "2026-06-12",
    });
    expect(r.monatlich_laufend_eur).toBe(50);
    expect(r.exposure_gesamt_eur).toBe(6 * 50); // Jan–Jun (zeitweise = voller Monat)
  });

  test("Heilung Nr. 11 wirkt rückwirkend: 10 € → 2 €/kW", async () => {
    const r = await berechneSanktion52({
      leistung_kw: 100,
      verstoesse: [{ kategorie: "11", beginn: "2026-01-01", ende: "2026-03-31", geheilt: true }],
      stichtag: "2026-06-12",
    });
    expect(r.exposure_gesamt_eur).toBe(3 * 2 * 100); // 3 Monate à 2 €/kW
  });

  test("Verjährung § 52 Abs. 6: Verstoß 2023 ist am Stichtag 2026 verjährt", async () => {
    const r = await berechneSanktion52({
      leistung_kw: 10,
      verstoesse: [{ kategorie: "11", beginn: "2023-02-01", ende: "2023-04-30" }],
      stichtag: "2026-06-12",
    });
    expect(r.exposure_gesamt_eur).toBe(0);
    expect(r.exposure_verjaehrt_eur).toBeGreaterThan(0);
  });

  test("Volleinspeisungs-Verstoß Nr. 10: ganzes Kalenderjahr, reduzierter Satz", async () => {
    const r = await berechneSanktion52({
      leistung_kw: 10,
      verstoesse: [{ kategorie: "10", beginn: "2026-03-01", ende: "2026-03-31" }],
      stichtag: "2026-06-12",
    });
    expect(r.monate.length).toBe(12); // §52 Abs. 4 Nr. 3
    expect(r.monate[0]!.betrag_eur).toBe(2 * 10);
  });

  test("Heilungsersparnis > 0 bei laufendem heilbarem Verstoß", async () => {
    const r = await berechneSanktion52({
      leistung_kw: 750,
      verstoesse: [{ kategorie: "4", beginn: "2025-09-01" }],
      stichtag: "2026-06-12",
    });
    expect(r.heilungsersparnis_eur).toBeGreaterThan(0);
  });
});

describe("Vergütungsrechner", () => {
  test("8 kWp Teileinspeisung, IBN März 2024 → 8,11 ct/kWh", async () => {
    const r = await berechneVerguetung({ ibn_datum: "2024-03-01", leistung_kwp: 8, einspeiseart: "teileinspeisung" });
    expect(r.satz_ct_kwh).toBe(8.11);
    expect(r.foerderende).toBe("2044-12-31");
  });

  test("15 kWp → anteilige Mischvergütung über Staffelgrenze", async () => {
    const r = await berechneVerguetung({ ibn_datum: "2024-03-01", leistung_kwp: 15, einspeiseart: "teileinspeisung" });
    const erwartet = Math.round(((10 * 8.11 + 5 * 7.03) / 15) * 100) / 100;
    expect(r.satz_ct_kwh).toBe(erwartet);
    expect(r.stufen.length).toBe(2);
  });

  test("Volleinspeisung Okt 2022 ≤ 10 kWp → 13,0 ct/kWh + Mitteilungs-Hinweis", async () => {
    const r = await berechneVerguetung({ ibn_datum: "2022-10-15", leistung_kwp: 9.9, einspeiseart: "volleinspeisung" });
    expect(r.satz_ct_kwh).toBe(13.0);
    expect(r.hinweise.join(" ")).toMatch(/§ 48 Abs. 2a/);
  });

  test("IBN vor 30.07.2022 → deterministische Ablehnung statt Falschwert", async () => {
    expect(berechneVerguetung({ ibn_datum: "2021-05-01", leistung_kwp: 10, einspeiseart: "teileinspeisung" })).rejects.toThrow(/historische Vergütungssätze/);
  });

  test("> 100 kWp → Verweis auf Direktvermarktungspflicht", async () => {
    expect(berechneVerguetung({ ibn_datum: "2024-03-01", leistung_kwp: 150, einspeiseart: "teileinspeisung" })).rejects.toThrow(/Direktvermarktung/);
  });
});

describe("§24 Anlagenzusammenfassung", () => {
  const wea = (id: string, ibn: string, extras: Partial<AnlageZsf> = {}): AnlageZsf => ({
    id,
    energietraeger: "wind",
    ibn_datum: ibn,
    leistung_kwp: 2200,
    ...extras,
  });

  test("BGH XIII ZR 12/19 (Windpark Nateln): verschiedene Flurstücke, gemeinsame Infrastruktur → LLM-Subsumtion mit BGH-Pflichtkontext", () => {
    const r = pruefeZusammenfassung(
      wea("WEA9", "2015-12-01", { grundstueck_id: "flur-1" }),
      wea("WEA10", "2016-01-15", { grundstueck_id: "flur-2" }),
    );
    expect(r.status).toBe("LLM_SUBSUMTION_ERFORDERLICH");
    expect(r.subsumtionsauftrag!.pflicht_kontext.join(" ")).toMatch(/XIII ZR 12\/19/);
    expect(r.subsumtionsauftrag!.pflicht_kontext.join(" ")).toMatch(/funktionale/i);
  });

  test("Solar ≠ Wind → keine Zusammenfassung", () => {
    const r = pruefeZusammenfassung(wea("a", "2024-01-01"), { id: "b", energietraeger: "solar", ibn_datum: "2024-02-01", leistung_kwp: 30 });
    expect(r.status).toBe("NICHT_ZUSAMMENZUFASSEN");
  });

  test("IBN-Abstand > 12 Monate → keine Zusammenfassung", () => {
    const r = pruefeZusammenfassung(wea("a", "2020-01-01"), wea("b", "2022-06-01"));
    expect(r.status).toBe("NICHT_ZUSAMMENZUFASSEN");
  });

  test("Steckersolar-Ausnahme (Solarpaket I, S. 5)", () => {
    const r = pruefeZusammenfassung(
      { id: "bkw", energietraeger: "solar", ibn_datum: "2024-06-01", leistung_kwp: 0.8, anlagentyp: "steckersolar" },
      { id: "dach", energietraeger: "solar", ibn_datum: "2024-07-01", leistung_kwp: 10, anlagentyp: "dach" },
    );
    expect(r.status).toBe("NICHT_ZUSAMMENZUFASSEN");
    expect(r.pruefschritte[0]!.norm).toMatch(/S\. 5/);
  });

  test("Gebäude-PV an verschiedenen NVP → keine Zusammenfassung (S. 4)", () => {
    const r = pruefeZusammenfassung(
      { id: "a", energietraeger: "solar", ibn_datum: "2024-06-01", leistung_kwp: 20, anlagentyp: "dach", netzverknuepfungspunkt_id: "nvp-1" },
      { id: "b", energietraeger: "solar", ibn_datum: "2024-08-01", leistung_kwp: 20, anlagentyp: "dach", netzverknuepfungspunkt_id: "nvp-2" },
    );
    expect(r.status).toBe("NICHT_ZUSAMMENZUFASSEN");
  });

  test("Selbes Flurstück + 12-Monats-Fenster → zusammenzufassen", () => {
    const r = pruefeZusammenfassung(
      { id: "a", energietraeger: "solar", ibn_datum: "2024-06-01", leistung_kwp: 20, anlagentyp: "dach", grundstueck_id: "flur-9" },
      { id: "b", energietraeger: "solar", ibn_datum: "2024-09-01", leistung_kwp: 20, anlagentyp: "dach", grundstueck_id: "flur-9" },
    );
    expect(r.status).toBe("ZUSAMMENZUFASSEN");
    expect(r.rechtsfolge_hinweis).toMatch(/Windhund/);
  });
});

describe("Fristen & Schwellen", () => {
  test("MaStR-Frist: IBN 15.04. → Deadline 15.05., danach überschritten", () => {
    const r = pruefeFristen({ ibn_datum: "2026-04-15", mastr_registriert: false, veraeusserungsform_gemeldet: false, stichtag: "2026-06-12" });
    const mastr = r.find((f) => f.bezeichnung.includes("MaStR"))!;
    expect(mastr.deadline).toBe("2026-05-15");
    expect(mastr.status).toBe("ueberschritten");
    const vf = r.find((f) => f.bezeichnung.includes("Veräußerungsform"))!;
    expect(vf.folge_bei_verstoss).toMatch(/0 ct\/kWh/);
  });

  test("MaStR-Monatsfrist folgt § 188 Abs. 3 BGB an Monatsenden und im Schaltjahr", () => {
    const basis = { mastr_registriert: false, veraeusserungsform_gemeldet: true };
    expect(pruefeFristen({ ...basis, ibn_datum: "2024-01-31", stichtag: "2024-02-01" })[0]!.deadline).toBe("2024-02-29");
    expect(pruefeFristen({ ...basis, ibn_datum: "2023-01-31", stichtag: "2023-02-01" })[0]!.deadline).toBe("2023-02-28");
    expect(pruefeFristen({ ...basis, ibn_datum: "2024-02-29", stichtag: "2024-03-01" })[0]!.deadline).toBe("2024-03-29");
  });

  test("bestätigte jährliche Volleinspeisungs-Mitteilung ist erledigt", () => {
    const frist = pruefeFristen({
      ibn_datum: "2023-05-10",
      mastr_registriert: true,
      veraeusserungsform_gemeldet: true,
      einspeiseart: "volleinspeisung",
      volleinspeisung_gemeldet_fuer_jahr: [2027],
      stichtag: "2026-12-15",
    }).find((f) => f.bezeichnung.includes("2027"));
    expect(frist?.status).toBe("erledigt");
    expect(frist?.tage_verbleibend).toBeUndefined();
  });

  test("Schwellen: 0,8-kW-Balkonkraftwerk und 120-kWp-Gewerbedach", () => {
    const bkw = pruefeSchwellen({ leistung_kwp: 0.8, wechselrichter_va: 800, anlagentyp: "steckersolar" });
    expect(bkw.find((s) => s.thema === "Steckersolargerät")!.zutreffend).toBe(true);
    const gross = pruefeSchwellen({ leistung_kwp: 120, anlagentyp: "dach" });
    expect(gross.find((s) => s.thema === "Direktvermarktungspflicht")!.zutreffend).toBe(true);
    expect(gross.find((s) => s.thema === "Steckersolargerät")!.zutreffend).toBe(false);
  });
});

describe("Ausgeförderte Ü20", () => {
  test("IBN 2005, 5 kWp: ausgefördert, EV-Option schlägt Anschlussvergütung, §52-Warnung enthalten", async () => {
    const r = await vergleicheAusgefoerderteOptionen({ ibn_datum: "2005-06-01", leistung_kwp: 5, stichtag: "2026-06-12" });
    expect(r.ist_ausgefoerdert).toBe(true);
    expect(r.foerderende).toBe("2025-12-31");
    const anschluss = r.optionen[0]!.jahresertrag_eur!;
    const ev = r.optionen[1]!.jahresertrag_eur!;
    expect(ev).toBeGreaterThan(anschluss);
    expect(anschluss).toBeCloseTo((5 * 950 * (4.508 - 0.4)) / 100, 0); // ~195 €
    expect(r.warnungen.join(" ")).toMatch(/§52|§ 52/);
  });

  test("noch geförderte Anlage liefert nur klaren Vorschau-Horizont", async () => {
    const r = await vergleicheAusgefoerderteOptionen({ ibn_datum: "2023-05-10", leistung_kwp: 9.8, stichtag: "2026-07-15" });
    expect(r.ist_ausgefoerdert).toBe(false);
    expect(r.modus).toBe("vorschau");
    expect(r.optionen).toEqual([]);
    expect(r.warnungen[0]).toContain("Vorschau");
    expect(r.quellen[0]?.bezeichnung).not.toBeUndefined();
  });
});

describe("Guardrail-Classifier (RDG-Ampel)", () => {
  test("Rot: 'Soll ich den Netzbetreiber verklagen?' → blockieren + Clearingstelle-Ersatztext", async () => {
    const r = await klassifiziere("Soll ich den Netzbetreiber verklagen, weil er meine Vergütung kürzt?");
    expect(r.ampel).toBe("rot");
    expect(r.ersatztext).toMatch(/Clearingstelle/);
    expect(r.eskalation_an).toBe("anwalt");
  });

  test("Rot: individuelle Steuergestaltung", async () => {
    const r = await klassifiziere("Wie kann ich die PV-Anlage in der Steuererklärung absetzen?");
    expect(r.ampel).toBe("rot");
    expect(r.eskalation_an).toBe("steuerberater");
  });

  test("Gelb: Einzelfall-Subsumtion räumliche Nähe", async () => {
    const r = await klassifiziere("Gilt die unmittelbare räumliche Nähe in meinem Fall mit 400m Abstand?");
    expect(r.ampel).toBe("gelb");
  });

  test("Grün: einfache Rechtsinformation", async () => {
    const r = await klassifiziere("Wie melde ich mein Balkonkraftwerk im MaStR an?");
    expect(r.ampel).toBe("gruen");
    expect(r.disclaimer.length).toBeGreaterThan(50);
  });

  test("Stop-Prüfung blockiert eine inhaltliche ROT-Antwort", async () => {
    const prompt = await klassifiziere("Soll ich den Netzbetreiber verklagen?");
    const r = await pruefeGuardrailAusgabe(
      prompt,
      "Sie sollten Klage erheben und zunächst mit einer einstweiligen Verfügung Druck machen.",
    );
    expect(r.erlaubt).toBe(false);
    expect(r.gruende.join(" ")).toMatch(/ROT-Trigger|Ablehnung|Eskalationsweg/);
  });

  test("Stop-Prüfung akzeptiert den freigegebenen ROT-Ersatz mit Eskalation", async () => {
    const prompt = await klassifiziere("Soll ich den Netzbetreiber verklagen?");
    const r = await pruefeGuardrailAusgabe(
      prompt,
      `${prompt.ersatztext} Für die verbindliche Einzelfallprüfung wenden Sie sich an die Clearingstelle oder einen Fachanwalt.`,
    );
    expect(r).toEqual({ erlaubt: true, gruende: [] });
  });

  test("Stop-Prüfung verlangt bei GELB Unsicherheit, Quelle, Eskalation und Disclaimer", async () => {
    const prompt = await klassifiziere("Gilt das für mich in meinem konkreten Fall?");
    const unsicher = await pruefeGuardrailAusgabe(prompt, "Ja, das gilt eindeutig für Sie.");
    expect(unsicher.erlaubt).toBe(false);
    expect(unsicher.gruende).toHaveLength(4);

    const abgesichert = await pruefeGuardrailAusgabe(
      prompt,
      "Die Einordnung hängt von der Würdigung des Einzelfalls ab. Maßgeblich ist § 24 EEG in der einschlägigen Fassung. Eine verbindliche Prüfung kann ein Fachanwalt oder die Clearingstelle übernehmen. Das ist allgemeine Rechtsinformation, keine Rechtsberatung im Einzelfall (§ 2 RDG).",
    );
    expect(abgesichert).toEqual({ erlaubt: true, gruende: [] });
  });
});
