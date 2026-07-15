import { describe, expect, test } from "bun:test";
import { pruefeSolarspitzen, type SolarspitzenInput } from "./solarspitzen.ts";

const basis: SolarspitzenInput = {
  ibn_datum: "2025-03-01",
  leistung_kwp: 9.8,
  anlagentyp: "dach",
  vermarktungsform: "einspeiseverguetung",
  imsys_vorhanden: false,
  steuerungseinrichtung_vorhanden: false,
  ansteuerbarkeit_getestet: false,
  stichtag: "2026-07-15",
};

describe("Solarspitzen-Check", () => {
  test("neue 9,8-kWp-Einspeiseanlage ist bis zum erfolgreichen Test auf 60 % begrenzt", () => {
    const r = pruefeSolarspitzen(basis);
    expect(r.modus).toBe("solarspitzengesetz");
    expect(r.technische_vorgabe.einspeisebegrenzung_erforderlich).toBe(true);
    expect(r.technische_vorgabe.max_einspeisung_prozent).toBe(60);
    expect(r.technische_vorgabe.max_einspeisung_kw).toBe(5.88);
    expect(r.negative_preise.status).toBe("noch_ausgenommen");
  });

  test("vollständig getestete Anlage ist ungedrosselt; § 51 gilt nach Ablauf des iMSys-Einbaujahres", () => {
    const r = pruefeSolarspitzen({
      ...basis,
      imsys_vorhanden: true,
      imsys_einbau_datum: "2025-09-20",
      steuerungseinrichtung_vorhanden: true,
      ansteuerbarkeit_getestet: true,
    });
    expect(r.technische_vorgabe.status).toBe("steuerbar");
    expect(r.technische_vorgabe.max_einspeisung_kw).toBeNull();
    expect(r.negative_preise.status).toBe("gilt");
    expect(r.negative_preise.gilt_ab).toBe("2026-01-01");
    expect(r.negative_preise.verguetung_bei_negativpreis).toBe("null");
    expect(r.verlaengerung.anwendbar).toBe(true);
    expect(r.verlaengerung.aussage).toContain("Faktor 0,5");
  });

  test("iMSys-Einbau im laufenden Jahr verschiebt § 51 auf den nächsten Jahresanfang", () => {
    const r = pruefeSolarspitzen({
      ...basis,
      imsys_vorhanden: true,
      imsys_einbau_datum: "2026-01-10",
      steuerungseinrichtung_vorhanden: true,
      ansteuerbarkeit_getestet: false,
    });
    expect(r.negative_preise.status).toBe("noch_ausgenommen");
    expect(r.negative_preise.gilt_ab).toBe("2027-01-01");
  });

  test("Übergangsanlage unter 400 kW bleibt von alter Negativpreisregel ausgenommen", () => {
    const r = pruefeSolarspitzen({ ...basis, ibn_datum: "2024-06-01", leistung_kwp: 399 });
    expect(r.modus).toBe("uebergang_2023_2025");
    expect(r.technische_vorgabe.status).toBe("keine_neue_pflicht");
    expect(r.negative_preise.status).toBe("nicht_relevant");
  });

  test("Übergangsanlage ab 400 kW nutzt 2026 die Zwei-Stunden-Regel ohne Solar-Faktor", () => {
    const r = pruefeSolarspitzen({ ...basis, ibn_datum: "2024-06-01", leistung_kwp: 400 });
    expect(r.negative_preise.status).toBe("gilt");
    expect(r.negative_preise.ausloeseschwelle).toContain("2 aufeinanderfolgende Stunden");
    expect(r.verlaengerung.anwendbar).toBe(true);
    expect(r.verlaengerung.aussage).toContain("Faktor 0,5");
    expect(r.verlaengerung.aussage).toContain("nicht");
  });

  test("Steckersolar-Ausnahme und Kleinstanlagen-Ausnahme werden getrennt ausgewiesen", () => {
    const r = pruefeSolarspitzen({ ...basis, leistung_kwp: 1.5, anlagentyp: "steckersolar", wechselrichter_va: 800 });
    expect(r.technische_vorgabe.status).toBe("befreit");
    expect(r.negative_preise.status).toBe("noch_ausgenommen");
    expect(r.negative_preise.aussage).toContain("BNetzA");
  });

  test("zukünftige Inbetriebnahme wird als Vorschau statt als geltende Pflicht markiert", () => {
    const r = pruefeSolarspitzen({ ...basis, ibn_datum: "2027-01-01" });
    expect(r.modus).toBe("vorschau");
    expect(r.technische_vorgabe.status).toBe("vorschau");
    expect(r.negative_preise.status).toBe("vorschau");
  });

  test("ohne EEG-Förderung gibt es keinen §-51-Zahlungsentfall", () => {
    const r = pruefeSolarspitzen({ ...basis, vermarktungsform: "keine_eeg_foerderung" });
    expect(r.negative_preise.status).toBe("nicht_relevant");
    expect(r.verlaengerung.anwendbar).toBe(false);
  });

  test("große Altanlage verlangt historische Fassung statt pauschaler Antwort", () => {
    const r = pruefeSolarspitzen({ ...basis, ibn_datum: "2022-06-01", leistung_kwp: 500 });
    expect(r.negative_preise.status).toBe("altregime_pruefen");
    expect(r.warnungen.join(" ")).toContain("historische");
  });

  test("freiwilliger §-100-Abs.-47-Wechsel wird nur für Bestandsanlagen ausgewiesen", () => {
    const technik = {
      imsys_vorhanden: true,
      imsys_einbau_datum: "2026-01-10",
      steuerungseinrichtung_vorhanden: true,
      ansteuerbarkeit_getestet: true,
    };
    const bestand = pruefeSolarspitzen({ ...basis, ...technik, ibn_datum: "2024-06-01" });
    const neuanlage = pruefeSolarspitzen({ ...basis, ...technik });
    expect(bestand.freiwilliger_wechsel.grundsaetzlich_vorgesehen).toBe(true);
    expect(bestand.freiwilliger_wechsel.status).toBe("beihilferechtliche_genehmigung_pruefen");
    expect(neuanlage.freiwilliger_wechsel.grundsaetzlich_vorgesehen).toBe(false);
  });
});
