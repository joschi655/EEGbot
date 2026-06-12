import { describe, expect, test } from "bun:test";
import { formulareFuerFall, matcheProgramme, pruefeKumulierung } from "./foerderMatcher.ts";

describe("Förder-Matcher", () => {
  const waermepumpenFall = {
    fall_typ: "waermepumpe",
    eigentumsform: "eigentum",
    massnahme: { typ: "waermepumpe", begonnen: false, ersetzt_fossile_heizung: true, wp_effizienzbonus_qualifiziert: false },
    gebaeude: { bestandsgebaeude: true, alter_jahre: 30 },
    antragsteller: { selbstnutzend: true, haushaltseinkommen_eur: 35000, isfp_vorhanden: false },
  };

  test("Wärmepumpe, selbstnutzend, Einkommen 35k: KfW 458 passt mit 70 % (Kappung aus 30+20+30)", async () => {
    const matches = await matcheProgramme(waermepumpenFall);
    const kfw = matches.find((m) => m.programm_id === "kfw-458")!;
    expect(kfw.passt).toBe(true);
    expect(kfw.foerdersatz_prozent).toBe(70); // 80 → Kappung auf max 70
  });

  test("Maßnahme bereits begonnen → KfW 458 mit benanntem Ausschlussgrund", async () => {
    const matches = await matcheProgramme({
      ...waermepumpenFall,
      massnahme: { ...waermepumpenFall.massnahme, begonnen: true },
    });
    const kfw = matches.find((m) => m.programm_id === "kfw-458")!;
    expect(kfw.passt).toBe(false);
    expect(kfw.ausschluss_gruende[0]).toMatch(/VOR Vorhabensbeginn/);
  });

  test("Fehlende Angaben werden benannt statt geraten", async () => {
    const matches = await matcheProgramme({ massnahme: { typ: "waermepumpe" } });
    const kfw = matches.find((m) => m.programm_id === "kfw-458")!;
    expect(kfw.passt).toBe(false);
    expect(kfw.fehlende_felder.length).toBeGreaterThan(0);
  });

  test("Kumulierung: KfW 458 + §35c nicht kombinierbar (auch in Gegenrichtung)", async () => {
    expect((await pruefeKumulierung("kfw-458", "estg-35c")).kombinierbar).toBe(false);
    expect((await pruefeKumulierung("estg-35c", "kfw-458")).kombinierbar).toBe(false);
    expect((await pruefeKumulierung("kfw-458", "bafa-beg-em")).kombinierbar).toBe(true);
  });

  test("Formulare für Mieter-Balkonkraftwerk enthalten WEG-Zustimmung + MaStR", async () => {
    const formulare = await formulareFuerFall({
      eigentumsform: "miete",
      anlage: { energietraeger: "solar", anlagentyp: "steckersolar", mastr_registriert: false },
    });
    const ids = formulare.map((f) => f.id);
    expect(ids).toContain("weg-zustimmung-balkonkraftwerk");
    expect(ids).toContain("mastr-anlagenregistrierung-solar");
  });
});
