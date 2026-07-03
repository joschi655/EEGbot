import { describe, expect, test } from "bun:test";
import { baueSchritte, berechneKombination, erstelleFahrplan, renderFahrplanMarkdown, FAHRPLAN_DISCLAIMER } from "./fahrplan.ts";
import { regionPasst } from "./foerderMatcher.ts";
import { Foerderprogramm } from "../schemas/program.ts";

const standardFall = () => ({
  massnahme: {
    typ: "waermepumpe",
    begonnen: false,
    ersetzt_fossile_heizung: true,
    wp_effizienzbonus_qualifiziert: true,
    kosten_eur: 42000,
    bereits_gefoerdert: false,
  },
  gebaeude: { bestandsgebaeude: true, alter_jahre: 30 },
  antragsteller: { selbstnutzend: true, haushaltseinkommen_eur: 38000, isfp_vorhanden: false },
  eigentumsform: "eigentum",
});

describe("erstelleFahrplan — Standardfall Wärmepumpe (Lead-Story)", () => {
  test("empfiehlt KfW 458 mit 70 % (Kappung aus 85) und 21.000 € am Höchstkosten-Deckel", async () => {
    const f = await erstelleFahrplan(standardFall());
    expect(f.empfehlung?.programm_id).toBe("kfw-458");
    expect(f.empfehlung?.foerdersatz_prozent).toBe(70);
    expect(f.empfehlung?.kosten_angesetzt_eur).toBe(30000); // 42.000 € gekappt
    expect(f.empfehlung?.betrag_eur_geschaetzt).toBe(21000);
  });

  test("Schritte sind lückenlos nummeriert und in Reihenfolge Vorbereitung → Antrag → Umsetzung → Nachweis", async () => {
    const f = await erstelleFahrplan(standardFall());
    expect(f.schritte.map((s) => s.nr)).toEqual([1, 2, 3, 4]);
    const phasen = f.schritte.map((s) => s.phase);
    expect(phasen.indexOf("antrag")).toBeGreaterThan(phasen.indexOf("vorbereitung"));
    expect(phasen.indexOf("umsetzung")).toBeGreaterThan(phasen.indexOf("antrag"));
    expect(phasen.indexOf("nachweis")).toBeGreaterThan(phasen.indexOf("umsetzung"));
  });

  test("BzA-Dokument hängt am Vorbereitungs-Schritt VOR dem Antrag; human_only-Felder ausgewiesen", async () => {
    const f = await erstelleFahrplan(standardFall());
    const vorbereitung = f.schritte.find((s) => s.phase === "vorbereitung");
    const bza = vorbereitung?.dokumente.find((d) => d.id === "kfw-bza");
    expect(bza).toBeDefined();
    expect(bza!.human_only_felder.length).toBeGreaterThan(0);
  });

  test("jeder Schritt trägt mindestens eine Quelle", async () => {
    const f = await erstelleFahrplan(standardFall());
    for (const s of f.schritte) expect(s.quellen.length).toBeGreaterThanOrEqual(1);
  });

  test("Antrag-Schritt trägt die Antrag-vor-Beginn-Warnung aus den Programmdaten", async () => {
    const f = await erstelleFahrplan(standardFall());
    const antrag = f.schritte.find((s) => s.phase === "antrag");
    expect(antrag?.warnung).toMatch(/VOR Vorhabensbeginn/i);
  });

  test("Entweder-oder KfW 458 vs. § 35c mit Normzitat; Anti: kein iSFP-Bonus versprochen", async () => {
    const f = await erstelleFahrplan(standardFall());
    const eo = f.entweder_oder.find((e) => e.programme.includes("kfw-458") && e.programme.includes("estg-35c"));
    expect(eo?.hinweis).toContain("§ 35c");
    // Anti-ISC: KfW 458 kennt keinen iSFP-Bonus — Weiche darf ihn nicht versprechen.
    expect(f.empfehlung?.saetze.some((s) => /isfp/i.test(s.bezeichnung))).toBe(false);
    expect(f.isfp_weiche?.relevant).toBe(false);
    expect(f.isfp_weiche?.hinweis).toContain("keinen iSFP-Bonus");
  });
});

describe("erstelleFahrplan — Abweichler-Szenarien", () => {
  test("Maßnahme schon beauftragt → KfW 458 raus (mit Grund), § 35c als verbleibender Pfad, Warnung gesetzt", async () => {
    const fall = standardFall();
    fall.massnahme.begonnen = true;
    const f = await erstelleFahrplan(fall);
    expect(f.empfehlung?.programm_id).toBe("estg-35c");
    expect(f.nicht_passend.some((n) => n.programm_id === "kfw-458")).toBe(true);
    expect(f.warnungen.some((w) => /begonnen|beauftragt/i.test(w))).toBe(true);
    // Steuerlicher Pfad: Umsetzung vor Nachweis vor Steuererklärung
    const phasen = f.schritte.map((s) => s.phase);
    expect(phasen).toEqual(["umsetzung", "nachweis", "steuer"]);
  });

  test("Vermieter (nicht selbstnutzend) → nur 30 % Grundförderung, § 35c nicht passend", async () => {
    const fall = standardFall();
    fall.antragsteller.selbstnutzend = false;
    const f = await erstelleFahrplan(fall);
    expect(f.empfehlung?.programm_id).toBe("kfw-458");
    expect(f.empfehlung?.foerdersatz_prozent).toBe(35); // 30 Grund + 5 Effizienz, keine personengebundenen Boni
    expect(f.empfehlung?.saetze.find((s) => /Klimageschwindigkeit/i.test(s.bezeichnung))?.zutreffend).toBe(false);
    expect(f.empfehlung?.saetze.find((s) => /Einkommensbonus/i.test(s.bezeichnung))?.zutreffend).toBe(false);
    expect([f.empfehlung?.programm_id, ...f.alternativen.map((a) => a.programm_id)]).not.toContain("estg-35c");
  });

  test("Neubau → KfW 458 mit benanntem Ausschlussgrund", async () => {
    const fall = standardFall();
    fall.gebaeude.bestandsgebaeude = false;
    const f = await erstelleFahrplan(fall);
    const kfw = f.nicht_passend.find((n) => n.programm_id === "kfw-458");
    expect(kfw?.gruende.join(" ")).toMatch(/Neubau/i);
  });

  test("leerer Fall → kein Crash, keine Empfehlung, offene Fragen mit Klartext-Fragen", async () => {
    const f = await erstelleFahrplan({});
    expect(f.empfehlung).toBeNull();
    expect(f.schritte).toEqual([]);
    expect(f.offene_fragen.length).toBeGreaterThan(3);
    expect(f.offene_fragen.every((o) => o.frage.length > 5)).toBe(true);
  });

  test("Dämmung ohne iSFP → BAFA BEG EM empfohlen, iSFP-Weiche relevant mit dena-Grenze", async () => {
    const fall = {
      massnahme: { typ: "daemmung", begonnen: false, kosten_eur: 20000, bereits_gefoerdert: false },
      gebaeude: { bestandsgebaeude: true, alter_jahre: 30 },
      antragsteller: { selbstnutzend: true, isfp_vorhanden: false },
      eigentumsform: "eigentum",
    };
    const f = await erstelleFahrplan(fall);
    expect(f.empfehlung?.programm_id).toBe("bafa-beg-em");
    expect(f.isfp_weiche?.relevant).toBe(true);
    expect(f.isfp_weiche?.hinweis).toContain("5");
    expect(f.isfp_weiche?.quellen.some((q) => q.url?.includes("energie-effizienz-experten"))).toBe(true);
  });
});

describe("renderFahrplanMarkdown", () => {
  test("Markdown enthält nummerierte Schritte, Quellen und den RDG-Disclaimer", async () => {
    const f = await erstelleFahrplan(standardFall());
    const md = renderFahrplanMarkdown(f);
    expect(md).toContain("### Schritt 1:");
    expect(md).toContain("### Schritt 4:");
    expect(md).toContain("*Quellen:");
    expect(md).toContain(FAHRPLAN_DISCLAIMER);
    expect(f.disclaimer).toBe(FAHRPLAN_DISCLAIMER);
  });
});

describe("erstelleFahrplan — adversariale Szenarien (Forge)", () => {
  test("Kosten unter Höchstkosten (12.000 €) → angesetzt = 12.000 €, Betrag 8.400 € bei 70 %", async () => {
    const fall = standardFall();
    fall.massnahme.kosten_eur = 12000;

    const f = await erstelleFahrplan(fall);
    const md = renderFahrplanMarkdown(f);

    expect(f.empfehlung?.programm_id).toBe("kfw-458");
    expect(f.empfehlung?.foerdersatz_prozent).toBe(70);
    expect(f.empfehlung?.hoechstkosten_eur).toBe(30000);
    expect(f.empfehlung?.kosten_angesetzt_eur).toBe(12000);
    expect(f.empfehlung?.betrag_eur_geschaetzt).toBe(8400);
    expect(md).toContain("Geschätzt:");
  });

  test("kosten_eur = 0 oder negativ → kein erfundener Betrag, kein NaN", async () => {
    const nullKostenFall = standardFall();
    nullKostenFall.massnahme.kosten_eur = 0;

    const mitNullKosten = await erstelleFahrplan(nullKostenFall);
    const md = renderFahrplanMarkdown(mitNullKosten);

    expect(mitNullKosten.empfehlung?.programm_id).toBe("kfw-458");
    expect(mitNullKosten.empfehlung?.foerdersatz_prozent).toBe(70);
    expect(mitNullKosten.empfehlung?.kosten_angesetzt_eur).toBeUndefined();
    expect(mitNullKosten.empfehlung?.betrag_eur_geschaetzt).toBeUndefined();
    expect(md).not.toContain("Geschätzt:");

    const negativeKostenFall = standardFall();
    negativeKostenFall.massnahme.kosten_eur = -5000;

    const mitNegativenKosten = await erstelleFahrplan(negativeKostenFall);

    expect(mitNegativenKosten.empfehlung?.programm_id).toBe("kfw-458");
    expect(mitNegativenKosten.empfehlung?.foerdersatz_prozent).toBe(70);
    expect(mitNegativenKosten.empfehlung?.kosten_angesetzt_eur).toBeUndefined();
    expect(mitNegativenKosten.empfehlung?.betrag_eur_geschaetzt).toBeUndefined();
  });

  test("Einkommensbonus an der lte-Grenze: 40.000 € greift (70 %), 40.001 € fällt weg (55 %)", async () => {
    const grenzfall = standardFall();
    grenzfall.antragsteller.haushaltseinkommen_eur = 40000;

    const mitBonus = await erstelleFahrplan(grenzfall);

    expect(mitBonus.empfehlung?.saetze.find((s) => /Einkommensbonus/i.test(s.bezeichnung))?.zutreffend).toBe(true);
    expect(mitBonus.empfehlung?.foerdersatz_prozent).toBe(70);

    const knappDrueber = standardFall();
    knappDrueber.antragsteller.haushaltseinkommen_eur = 40001;

    const ohneBonus = await erstelleFahrplan(knappDrueber);

    expect(ohneBonus.empfehlung?.saetze.find((s) => /Einkommensbonus/i.test(s.bezeichnung))?.zutreffend).toBe(false);
    expect(ohneBonus.empfehlung?.foerdersatz_prozent).toBe(55);
  });

  test("unbekannter Maßnahmentyp 'pool' → keine Empfehlung, kein Crash (§ 35c-Typ-Gate aus Abs. 1 S. 3 greift)", async () => {
    const fall = standardFall();
    fall.massnahme.typ = "pool";

    const f = await erstelleFahrplan(fall);
    const ids = [f.empfehlung?.programm_id, ...f.alternativen.map((a) => a.programm_id)];

    // Forge-Fund: estg-35c.json hatte kein eligibility-Typ-Gate — ein Pool bekam
    // 20 % Steuerermäßigung empfohlen. Behoben per Maßnahmenliste (§ 35c Abs. 1 S. 3 EStG).
    expect(f.empfehlung).toBeNull();
    expect(ids).not.toContain("kfw-458");
    expect(ids).not.toContain("bafa-beg-em");
    expect(ids).not.toContain("estg-35c");
  });

  test("bereits_gefoerdert=true → § 35c wegen Doppelförderung ausgeschlossen, KfW 458 bleibt Empfehlung", async () => {
    const fall = standardFall();
    fall.massnahme.bereits_gefoerdert = true;

    const f = await erstelleFahrplan(fall);
    const estg = f.nicht_passend.find((n) => n.programm_id === "estg-35c");

    expect(f.empfehlung?.programm_id).toBe("kfw-458");
    expect(estg).toBeDefined();
    expect(estg?.gruende.join(" ")).toMatch(/Doppelförderung|§ 35c Abs\. 3/i);
  });

  test("nur massnahme.typ gesetzt → keine Empfehlung, offene_fragen nennen die fehlenden Felder mit Klartext", async () => {
    const f = await erstelleFahrplan({ massnahme: { typ: "waermepumpe" } });
    const offeneFelder = f.offene_fragen.map((o) => o.feld);

    expect(f.empfehlung).toBeNull();
    expect(f.schritte).toEqual([]);
    expect(offeneFelder).toContain("gebaeude.bestandsgebaeude");
    expect(offeneFelder).toContain("massnahme.begonnen");
    expect(offeneFelder).toContain("antragsteller.selbstnutzend");
    expect(offeneFelder).toContain("eigentumsform");
    expect(offeneFelder).toContain("gebaeude.alter_jahre");
    expect(offeneFelder).toContain("massnahme.kosten_eur");
    expect(offeneFelder).not.toContain("massnahme.typ");
    expect(f.offene_fragen.find((o) => o.feld === "gebaeude.bestandsgebaeude")?.frage).toBe("Bestandsgebäude oder Neubau?");
    expect(f.offene_fragen.find((o) => o.feld === "eigentumsform")?.frage).toBe(
      "Sind Sie Eigentümer:in (Eigentum / Miete / WEG)?",
    );
  });

  test("renderFahrplanMarkdown bei leerem Fall → Disclaimer und 'Keine Zuschuss-Empfehlung', keine Schritte", async () => {
    const f = await erstelleFahrplan({});
    const md = renderFahrplanMarkdown(f);

    expect(md).toContain("## Kein passendes Programm gefunden");
    expect(md).toContain(FAHRPLAN_DISCLAIMER);
    expect(md).not.toContain("### Schritt 1:");
  });

  test("Maßnahme begonnen UND bereits gefördert → Warnung nennt § 35c NICHT als verbleibenden Weg (Forge-Fund, behoben)", async () => {
    const fall = standardFall();
    fall.massnahme.begonnen = true;
    fall.massnahme.bereits_gefoerdert = true;

    const f = await erstelleFahrplan(fall);

    // Korrekt wäre: nur ein steuerlicher Match mit passt=true darf als verbleibender Weg erwähnt werden.
    expect(f.nicht_passend.some((n) => n.programm_id === "estg-35c")).toBe(true);
    expect(f.warnungen.some((w) => /§\s?35c|Verbleibender Weg/i.test(w))).toBe(false);
  });
});

describe("Generischer Schema-Interpreter — trägt regionale Programme (Phase-C-Vorgriff)", () => {
  test("synthetisches Landesprogramm (Bayern/München) → valides Schema + vollständiger 4-Schritte-Fahrplan ohne Codeänderung", () => {
    // De-Risking laut Advisor: Wenn ein regionales Programm Schema-Erweiterungen
    // bräuchte, wollen wir das VOR Phase C wissen. Regionale Gates (Bundesland),
    // Antragsfenster (fristen.datum) und Budget-Stopp (status: "ausgesetzt")
    // drückt das bestehende Schema bereits aus.
    const synthetisch = Foerderprogramm.parse({
      id: "by-muenchen-waerme-synthetisch",
      name: "SYNTHETISCH — Landeshauptstadt München Wärmewende-Zuschuss (Test-Fixture)",
      traeger: "Landeshauptstadt München",
      foerderart: "zuschuss",
      status: "aktiv",
      beschreibung: "Synthetische Test-Fixture für den Phase-C-Vorgriff — kein echtes Programm.",
      eligibility: {
        alle: [
          { feld: "standort.bundesland", op: "eq", wert: "BY" },
          { feld: "massnahme.typ", op: "eq", wert: "waermepumpe" },
        ],
      },
      foerdersaetze: [{ bezeichnung: "Grundförderung", satz_prozent: 10 }],
      antragsweg: { kanal: "online-portal", antrag_vor_massnahmenbeginn: true, fachunternehmer_pflicht: false, benoetigte_formulare: [] },
      fristen: [{ bezeichnung: "Antragsfenster", beschreibung: "Antrag bis Stichtag einreichen.", datum: "2026-12-31" }],
      quellen: [{ bezeichnung: "synthetische Test-Fixture (Phase-C-Vorgriff)" }],
      zuletzt_geprueft: "2026-07-03",
    });

    const schritte = baueSchritte(synthetisch, []);
    expect(schritte.map((s) => s.phase)).toEqual(["vorbereitung", "antrag", "umsetzung", "nachweis"]);
    expect(schritte.map((s) => s.nr)).toEqual([1, 2, 3, 4]);
    expect(schritte.every((s) => s.quellen.length >= 1)).toBe(true);
    expect(schritte.find((s) => s.phase === "antrag")?.warnung).toMatch(/VOR Maßnahmenbeginn/i);
  });
});

describe("Region-Layer — regionPasst (Phase C)", () => {
  const programmMit = (region: unknown) =>
    Foerderprogramm.parse({
      id: "region-test",
      name: "SYNTHETISCH — Region-Test",
      traeger: "Test",
      foerderart: "zuschuss",
      status: "aktiv",
      beschreibung: "Fixture",
      eligibility: { feld: "massnahme.typ", op: "eq", wert: "waermepumpe" },
      foerdersaetze: [{ bezeichnung: "Grundförderung", satz_prozent: 10 }],
      antragsweg: { kanal: "online-portal", antrag_vor_massnahmenbeginn: true, benoetigte_formulare: [] },
      quellen: [{ bezeichnung: "Fixture" }],
      zuletzt_geprueft: "2026-07-03",
      ...(region ? { region } : {}),
    });

  test("ohne region → bundesweit, passt immer", () => {
    const r = regionPasst(programmMit(null), {});
    expect(r.ergebnis).toBe(true);
    expect(r.geltungsbereich).toBe("bundesweit");
  });

  test("Bundesland-Match und -Mismatch", () => {
    const p = programmMit({ bundeslaender: ["BY", "BW"] });
    expect(regionPasst(p, { standort: { bundesland: "BY" } }).ergebnis).toBe(true);
    const nein = regionPasst(p, { standort: { bundesland: "NW" } });
    expect(nein.ergebnis).toBe(false);
    expect(nein.geltungsbereich).toContain("BY");
  });

  test("PLZ-Präfix: 80331 passt auf 80/81, 90402 nicht", () => {
    const p = programmMit({ plz_praefixe: ["80", "81"] });
    expect(regionPasst(p, { standort: { plz: "80331" } }).ergebnis).toBe(true);
    expect(regionPasst(p, { standort: { plz: "90402" } }).ergebnis).toBe(false);
  });

  test("definierte Dimension ohne Standort-Angabe → unbekannt mit dimensionsgenauem fehlenden Feld", () => {
    const p = programmMit({ bundeslaender: ["BY"], kommunen: ["München"] });
    const r = regionPasst(p, { standort: { bundesland: "BY" } });
    expect(r.ergebnis).toBe("unbekannt");
    expect(r.fehlende_felder).toEqual(["standort.kommune"]);
  });

  test("AND über Dimensionen: BY+Nürnberg scheitert an der Kommune (Mismatch schlägt unbekannt)", () => {
    const p = programmMit({ bundeslaender: ["BY"], kommunen: ["München"] });
    expect(regionPasst(p, { standort: { bundesland: "BY", kommune: "Nürnberg" } }).ergebnis).toBe(false);
    expect(regionPasst(p, { standort: { bundesland: "BY", kommune: "münchen" } }).ergebnis).toBe(true);
  });

  test("Anti: bundesweite Bestandsprogramme erzeugen keine standort-fehlende_felder", async () => {
    const f = await erstelleFahrplan(standardFall());
    expect(f.offene_fragen.some((o) => o.feld.startsWith("standort."))).toBe(false);
  });
});

describe("Gesamtquoten-Deckelung — berechneKombination (Phase C)", () => {
  const z = (id: string, quote?: number, deckel?: number, art = "zuschuss") =>
    ({ programm_id: id, quote_prozent: quote, deckel_prozent: deckel, foerderart: art });

  test("Summe ohne Deckel: 70 + 10 → 80", () => {
    const k = berechneKombination(z("bund", 70), z("land", 10));
    expect(k?.quote_summe_prozent).toBe(80);
    expect(k?.kombinierte_quote_prozent).toBe(80);
    expect(k?.gesamtquote_deckel_prozent).toBeUndefined();
  });

  test("Deckel greift: Summe 80, Landes-Deckel 75 → 75 mit Hinweis und Quell-Programm", () => {
    const k = berechneKombination(z("bund", 70), z("land", 10, 75));
    expect(k?.kombinierte_quote_prozent).toBe(75);
    expect(k?.gesamtquote_deckel_prozent).toBe(75);
    expect(k?.deckel_aus_programm).toBe("land");
    expect(k?.hinweis).toContain("75 %");
  });

  test("beide Programme mit Deckel → Minimum bindet", () => {
    const k = berechneKombination(z("bund", 70, 90), z("land", 10, 75));
    expect(k?.kombinierte_quote_prozent).toBe(75);
    expect(k?.deckel_aus_programm).toBe("land");
  });

  test("steuerlich/kredit oder fehlende Quote → keine Kombination", () => {
    expect(berechneKombination(z("bund", 70), z("steuer", 20, undefined, "steuerlich"))).toBeNull();
    expect(berechneKombination(z("bund", 70), z("kredit", undefined, undefined, "kredit"))).toBeNull();
    expect(berechneKombination(z("bund", 70), z("land", 0))).toBeNull();
  });

  test("Integration: aktueller Datenbestand liefert keine False-Positive-Kombinationen", async () => {
    const f = await erstelleFahrplan(standardFall());
    expect(f.kombinationen).toEqual([]);
    const md = renderFahrplanMarkdown(f);
    expect(md).not.toContain("Kombinierbar:");
  });
});

describe("Phase C — regionPasst / berechneKombination / kombinationen — adversariale Szenarien (Forge)", () => {
  const regionProgramm = (region: unknown) =>
    Foerderprogramm.parse({
      id: "region-adv-test",
      name: "SYNTHETISCH — Region-Adversarial",
      traeger: "Test",
      foerderart: "zuschuss",
      status: "aktiv",
      beschreibung: "Fixture",
      eligibility: { feld: "massnahme.typ", op: "eq", wert: "waermepumpe" },
      foerdersaetze: [{ bezeichnung: "Grundförderung", satz_prozent: 10 }],
      antragsweg: { kanal: "online-portal", antrag_vor_massnahmenbeginn: true, benoetigte_formulare: [] },
      quellen: [{ bezeichnung: "Fixture" }],
      zuletzt_geprueft: "2026-07-03",
      ...(region ? { region } : {}),
    });

  const z = (id: string, quote?: number, deckel?: number, art = "zuschuss") =>
    ({ programm_id: id, quote_prozent: quote, deckel_prozent: deckel, foerderart: art });

  test("leeres region-Objekt {} verhält sich wie bundesweit; plz_praefix '8' matcht '80331', nicht '10115'", () => {
    const r = regionPasst(regionProgramm({}), {});
    expect(r.ergebnis).toBe(true);
    expect(r.geltungsbereich).toBe("bundesweit");
    expect(r.fehlende_felder).toEqual([]);

    const plz = regionProgramm({ plz_praefixe: ["8"] });
    expect(regionPasst(plz, { standort: { plz: "80331" } }).ergebnis).toBe(true);
    expect(regionPasst(plz, { standort: { plz: "10115" } }).ergebnis).toBe(false);
  });

  test("AND über 3 Dimensionen: passt + fehlt + mismatch → false gewinnt (fehlende_felder leer); leere Arrays = bundesweit", () => {
    const p = regionProgramm({ bundeslaender: ["BY"], kommunen: ["München"], plz_praefixe: ["80"] });
    const r = regionPasst(p, { standort: { bundesland: "BY", kommune: "Nürnberg" } });
    expect(r.ergebnis).toBe(false);
    expect(r.fehlende_felder).toEqual([]);
    expect(r.geltungsbereich).toContain("BY");
    expect(r.geltungsbereich).toContain("München");
    expect(r.geltungsbereich).toContain("80");

    const leer = regionPasst(regionProgramm({ bundeslaender: [], kommunen: [] }), {});
    expect(leer.ergebnis).toBe(true);
    expect(leer.geltungsbereich).toBe("bundesweit");
  });

  test("berechneKombination: Deckel höher/gleich Summe greift nicht — kombiniert=summe, kein Hinweis, Deckel-Felder dennoch gesetzt (IST)", () => {
    const hoeher = berechneKombination(z("bund", 70, 90), z("land", 10));
    expect(hoeher?.quote_summe_prozent).toBe(80);
    expect(hoeher?.kombinierte_quote_prozent).toBe(80);
    expect(hoeher?.hinweis).toBeUndefined();
    expect(hoeher?.gesamtquote_deckel_prozent).toBe(90);
    expect(hoeher?.deckel_aus_programm).toBe("bund");

    const gleich = berechneKombination(z("bund", 70, 80), z("land", 10));
    expect(gleich?.kombinierte_quote_prozent).toBe(80);
    expect(gleich?.hinweis).toBeUndefined();
    expect(gleich?.gesamtquote_deckel_prozent).toBe(80);
  });

  test("berechneKombination: Deckel 0 kappt auf 0 (0 ist kein Falsy-Skip); beide ohne Quote → null; bonus+bonus addierbar", () => {
    const nullDeckel = berechneKombination(z("bund", 70, 0), z("land", 10));
    expect(nullDeckel?.quote_summe_prozent).toBe(80);
    expect(nullDeckel?.kombinierte_quote_prozent).toBe(0);
    expect(nullDeckel?.gesamtquote_deckel_prozent).toBe(0);
    expect(nullDeckel?.deckel_aus_programm).toBe("bund");
    expect(nullDeckel?.hinweis).toContain("0 %");

    expect(berechneKombination(z("bund", undefined), z("land", undefined))).toBeNull();

    const bonus = berechneKombination(z("a", 25, undefined, "bonus"), z("b", 15, undefined, "bonus"));
    expect(bonus?.kombinierte_quote_prozent).toBe(40);
  });

  test("erstelleFahrplan.kombinationen: zwei passende, aber kombinierbar=false (kfw-458 + § 35c) → []; nur ein passendes Programm → []", async () => {
    const beide = await erstelleFahrplan(standardFall());
    const passendIds = [beide.empfehlung?.programm_id, ...beide.alternativen.map((a) => a.programm_id)];
    expect(passendIds).toContain("kfw-458");
    expect(passendIds).toContain("estg-35c");
    expect(beide.kombinationen).toEqual([]);

    const fall = standardFall();
    fall.eigentumsform = "miete";
    const eins = await erstelleFahrplan(fall);
    expect(eins.empfehlung?.programm_id).toBe("kfw-458");
    expect(eins.alternativen).toEqual([]);
    expect(eins.kombinationen).toEqual([]);
  });
});
