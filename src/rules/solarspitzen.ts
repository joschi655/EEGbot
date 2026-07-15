/**
 * Solarspitzen-Check — technische Übergangspflichten (§ 9 EEG) und
 * Vergütungsfolgen negativer Spotmarktpreise (§§ 51, 51a EEG).
 *
 * Bewusste Grenze: Für Bestandsanlagen vor 2023 mit mindestens 400 kW wird
 * wegen der mehrfach gestaffelten historischen §-51-Fassungen kein
 * scheinpräzises Ergebnis erzeugt. Der aktuelle Solarspitzen-Pfad ab
 * 25.02.2025 und der Übergangspfad 2023–24.02.2025 sind deterministisch.
 */

export type SolarVermarktungsform =
  | "einspeiseverguetung"
  | "marktpraemie"
  | "mieterstromzuschlag"
  | "keine_eeg_foerderung";

export interface SolarspitzenInput {
  ibn_datum: string;
  leistung_kwp: number;
  anlagentyp?: "dach" | "freiflaeche" | "steckersolar" | "fassade" | "sonstig";
  wechselrichter_va?: number;
  vermarktungsform: SolarVermarktungsform;
  imsys_vorhanden: boolean;
  imsys_einbau_datum?: string;
  steuerungseinrichtung_vorhanden: boolean;
  ansteuerbarkeit_getestet: boolean;
  stichtag?: string;
}

export interface SolarspitzenErgebnis {
  modus: "solarspitzengesetz" | "uebergang_2023_2025" | "bestand" | "vorschau";
  technische_vorgabe: {
    status: "befreit" | "begrenzt" | "zwischenloesung" | "steuerbar" | "keine_neue_pflicht" | "vorschau";
    einspeisebegrenzung_erforderlich: boolean | null;
    max_einspeisung_prozent: number | null;
    max_einspeisung_kw: number | null;
    fernsteuerbarkeit_erforderlich: boolean | null;
    aussage: string;
    handlung: string | null;
  };
  negative_preise: {
    status: "gilt" | "noch_ausgenommen" | "nicht_relevant" | "altregime_pruefen" | "vorschau";
    gilt_ab: string | null;
    verguetung_bei_negativpreis: "null" | "unveraendert" | "nicht_bestimmbar";
    ausloeseschwelle: string;
    aussage: string;
  };
  verlaengerung: {
    anwendbar: boolean | null;
    aussage: string;
  };
  freiwilliger_wechsel: {
    grundsaetzlich_vorgesehen: boolean;
    bonus_ct_kwh: number | null;
    status: "nicht_relevant" | "beihilferechtliche_genehmigung_pruefen";
    aussage: string;
  };
  warnungen: string[];
  rechenweg: string[];
  parameterstand: {
    rechtsstand: string;
    kleinstanlagen_festlegung: string;
    freiwilliger_wechsel: string;
  };
  normen: string[];
  quellen: { bezeichnung: string; fundstelle: string; url: string }[];
}

const SOLARSPITZEN_START = "2025-02-25";
const UEBERGANG_START = "2023-01-01";
const RECHTSSTAND = "2026-07-15";

const gefoerdert = (form: SolarVermarktungsform) => form !== "keine_eeg_foerderung";
const begrenzungsForm = (form: SolarVermarktungsform) =>
  form === "einspeiseverguetung" || form === "mieterstromzuschlag";

function folgejahrErster(datum: string): string {
  return `${Number(datum.slice(0, 4)) + 1}-01-01`;
}

function altAusloeseschwelle(stichtag: string): string {
  const jahr = Number(stichtag.slice(0, 4));
  if (jahr <= 2023) return "mindestens 4 aufeinanderfolgende Stunden mit negativem Spotmarktpreis";
  if (jahr <= 2025) return "mindestens 3 aufeinanderfolgende Stunden mit negativem Spotmarktpreis";
  if (jahr === 2026) return "mindestens 2 aufeinanderfolgende Stunden mit negativem Spotmarktpreis";
  return "mindestens 1 Stunde mit negativem Spotmarktpreis";
}

export function pruefeSolarspitzen(input: SolarspitzenInput): SolarspitzenErgebnis {
  const stichtag = input.stichtag ?? new Date().toISOString().slice(0, 10);
  const zukunft = input.ibn_datum > stichtag;
  const neu = input.ibn_datum >= SOLARSPITZEN_START;
  const uebergang = input.ibn_datum >= UEBERGANG_START && input.ibn_datum < SOLARSPITZEN_START;
  const vollSteuerbar = input.imsys_vorhanden && input.steuerungseinrichtung_vorhanden && input.ansteuerbarkeit_getestet;
  const steckerAusnahme =
    input.anlagentyp === "steckersolar" &&
    input.leistung_kwp <= 2 &&
    input.wechselrichter_va !== undefined &&
    input.wechselrichter_va <= 800;
  const rechenweg: string[] = [];
  const warnungen: string[] = [];

  let modus: SolarspitzenErgebnis["modus"] = zukunft
    ? "vorschau"
    : neu
      ? "solarspitzengesetz"
      : uebergang
        ? "uebergang_2023_2025"
        : "bestand";

  let technische_vorgabe: SolarspitzenErgebnis["technische_vorgabe"];
  if (zukunft) {
    technische_vorgabe = {
      status: "vorschau",
      einspeisebegrenzung_erforderlich: null,
      max_einspeisung_prozent: null,
      max_einspeisung_kw: null,
      fernsteuerbarkeit_erforderlich: null,
      aussage: "Die Anlage ist zum Stichtag noch nicht in Betrieb. Das Ergebnis ist nur eine Vorschau nach heutigem Rechtsstand.",
      handlung: "Vor Inbetriebnahme Rechts- und Technikstand erneut prüfen.",
    };
    rechenweg.push(`IBN ${input.ibn_datum} liegt nach dem Stichtag ${stichtag}: nur Vorschau.`);
  } else if (steckerAusnahme) {
    technische_vorgabe = {
      status: "befreit",
      einspeisebegrenzung_erforderlich: false,
      max_einspeisung_prozent: null,
      max_einspeisung_kw: null,
      fernsteuerbarkeit_erforderlich: false,
      aussage: "Steckersolargerät bis 2 kW Modulleistung und 800 VA Wechselrichter: Ausnahme von § 9 Abs. 1 und Abs. 2 Satz 1 Nr. 3 EEG.",
      handlung: null,
    };
    rechenweg.push("Steckersolar-Ausnahme geprüft: ≤ 2 kW und ≤ 800 VA.");
  } else if (!neu) {
    technische_vorgabe = {
      status: "keine_neue_pflicht",
      einspeisebegrenzung_erforderlich: null,
      max_einspeisung_prozent: null,
      max_einspeisung_kw: null,
      fernsteuerbarkeit_erforderlich: null,
      aussage:
        "Die neue 60-%-Begrenzung gilt nicht für diese Bestandsanlage. Fortgeltende frühere §-9-Pflichten (z. B. 70-%-Altregel oder vorhandene Fernsteuertechnik) werden dadurch nicht automatisch aufgehoben.",
      handlung: "Vorhandene Alttechnik nicht allein aufgrund dieses Checks entfernen; das individuelle Bestandsregime gesondert prüfen.",
    };
    rechenweg.push(`IBN vor ${SOLARSPITZEN_START}: § 9 Abs. 2 Nr. 2b/3 mit 60 % ist nicht neu anzuwenden (§ 100 Abs. 3b EEG).`);
  } else if (vollSteuerbar) {
    technische_vorgabe = {
      status: "steuerbar",
      einspeisebegrenzung_erforderlich: false,
      max_einspeisung_prozent: null,
      max_einspeisung_kw: null,
      fernsteuerbarkeit_erforderlich: false,
      aussage: "iMSys und Steuerungseinrichtung sind vorhanden und die Ansteuerbarkeit wurde erfolgreich getestet; die §-9-Zwischenpflichten sind beendet.",
      handlung: null,
    };
    rechenweg.push("iMSys + Steuerungseinrichtung + erfolgreicher Netzbetreiber-Test: Zwischenpflichten nach § 9 Abs. 2 beendet.");
  } else {
    const begrenzung = input.leistung_kwp < 100 && begrenzungsForm(input.vermarktungsform);
    const fernsteuerbar = input.leistung_kwp >= 25;
    const maxKw = begrenzung ? Math.round(input.leistung_kwp * 0.6 * 1000) / 1000 : null;
    const fehlend = [
      !input.imsys_vorhanden ? "intelligentes Messsystem" : null,
      !input.steuerungseinrichtung_vorhanden ? "Steuerungseinrichtung" : null,
      !input.ansteuerbarkeit_getestet ? "erfolgreicher Ansteuerbarkeitstest des Netzbetreibers" : null,
    ].filter(Boolean);
    technische_vorgabe = {
      status: begrenzung ? "begrenzt" : "zwischenloesung",
      einspeisebegrenzung_erforderlich: begrenzung,
      max_einspeisung_prozent: begrenzung ? 60 : null,
      max_einspeisung_kw: maxKw,
      fernsteuerbarkeit_erforderlich: fernsteuerbar,
      aussage: begrenzung
        ? `Bis zur vollständigen technischen Ausstattung und erfolgreichen Testung ist die Wirkleistungseinspeisung auf 60 % begrenzt${maxKw == null ? "." : ` — hier maximal ${maxKw.toLocaleString("de-DE")} kW.`}${fernsteuerbar ? " Zusätzlich ist eine fernsteuerbare Zwischenlösung erforderlich." : ""}`
        : fernsteuerbar
          ? "Keine 60-%-Begrenzung in dieser Vermarktungsform; bis zum erfolgreichen Test bleibt aber die fernsteuerbare Zwischenlösung erforderlich."
          : "Für diese Vermarktungsform und Leistung greift keine 60-%-Zwischenbegrenzung.",
      handlung: fehlend.length > 0 ? `Noch offen: ${fehlend.join(", ")}.` : null,
    };
    rechenweg.push(`IBN ab ${SOLARSPITZEN_START}; vollständige Ansteuerbarkeit: nein.`);
    rechenweg.push(`Vermarktungsform ${input.vermarktungsform}, Leistung ${input.leistung_kwp} kW → 60-%-Begrenzung ${begrenzung ? "ja" : "nein"}.`);
    if (fernsteuerbar) rechenweg.push("Leistung ab 25 kW → fernsteuerbare Zwischenlösung bis zum erfolgreichen Test erforderlich.");
  }

  let negative_preise: SolarspitzenErgebnis["negative_preise"];
  let verlaengerung: SolarspitzenErgebnis["verlaengerung"];
  if (zukunft) {
    negative_preise = {
      status: "vorschau",
      gilt_ab: null,
      verguetung_bei_negativpreis: "nicht_bestimmbar",
      ausloeseschwelle: "Rechtsstand bei tatsächlicher Inbetriebnahme erneut prüfen",
      aussage: "Für eine zukünftige Anlage wird keine verbindliche Vergütungsfolge behauptet.",
    };
    verlaengerung = { anwendbar: null, aussage: "Erst nach Inbetriebnahme und anwendbarem §-51-Regime bestimmbar." };
  } else if (!gefoerdert(input.vermarktungsform)) {
    negative_preise = {
      status: "nicht_relevant",
      gilt_ab: null,
      verguetung_bei_negativpreis: "unveraendert",
      ausloeseschwelle: "keine",
      aussage: "Ohne EEG-Zahlungsanspruch kann § 51 keinen anzulegenden Wert auf null setzen.",
    };
    verlaengerung = { anwendbar: false, aussage: "Ohne Verringerung nach § 51 gibt es keine Verlängerung nach § 51a." };
    rechenweg.push("Keine EEG-Förderung → §§ 51 und 51a sind für die Zahlung nicht relevant.");
  } else if (neu) {
    if (input.leistung_kwp < 2) {
      negative_preise = {
        status: "noch_ausgenommen",
        gilt_ab: null,
        verguetung_bei_negativpreis: "unveraendert",
        ausloeseschwelle: "erst nach einer Festlegung der Bundesnetzagentur nach § 85 Abs. 2 Nr. 12 EEG",
        aussage: "Anlagen unter 2 kW sind bis zum Ablauf des Kalenderjahres der noch ausstehenden BNetzA-Festlegung ausgenommen (Quellenstand 15.07.2026).",
      };
      verlaengerung = { anwendbar: false, aussage: "Solange § 51 nicht greift, entsteht kein §-51a-Zeitkontingent." };
      rechenweg.push("Leistung < 2 kW → zusätzliche Kleinstanlagen-Ausnahme nach § 51 Abs. 2 Nr. 2.");
    } else if (input.leistung_kwp < 100 && !input.imsys_vorhanden) {
      negative_preise = {
        status: "noch_ausgenommen",
        gilt_ab: null,
        verguetung_bei_negativpreis: "unveraendert",
        ausloeseschwelle: "jede negative Viertelstunde nach Ende der iMSys-Ausnahme",
        aussage: "Unter 100 kW greift § 51 erst nach Ablauf des Kalenderjahres, in dem das intelligente Messsystem eingebaut wurde.",
      };
      verlaengerung = { anwendbar: false, aussage: "Noch keine Verringerung nach § 51; daher aktuell keine Verlängerung nach § 51a." };
      rechenweg.push("Leistung < 100 kW und kein iMSys → §-51-Ausnahme nach Abs. 2 Nr. 1.");
    } else if (input.leistung_kwp < 100 && !input.imsys_einbau_datum) {
      negative_preise = {
        status: "noch_ausgenommen",
        gilt_ab: null,
        verguetung_bei_negativpreis: "nicht_bestimmbar",
        ausloeseschwelle: "jede negative Viertelstunde nach Ende des iMSys-Einbaujahres",
        aussage: "Ein iMSys ist angegeben, aber das Einbaudatum fehlt. Ohne Einbaujahr lässt sich der Beginn von § 51 nicht bestimmen.",
      };
      verlaengerung = { anwendbar: null, aussage: "iMSys-Einbaudatum ergänzen, um die Anwendbarkeit von § 51a zu bestimmen." };
      warnungen.push("Das iMSys-Einbaudatum fehlt; die Negativpreisfolge ist deshalb nicht abschließend bestimmbar.");
      rechenweg.push("Leistung < 100 kW und iMSys vorhanden, aber Einbaujahr unbekannt.");
    } else {
      const giltAb = input.leistung_kwp < 100 ? folgejahrErster(input.imsys_einbau_datum!) : input.ibn_datum;
      const gilt = stichtag >= giltAb;
      negative_preise = {
        status: gilt ? "gilt" : "noch_ausgenommen",
        gilt_ab: giltAb,
        verguetung_bei_negativpreis: gilt ? "null" : "unveraendert",
        ausloeseschwelle: "jede Viertelstunde mit negativem Spotmarktpreis",
        aussage: gilt
          ? "In jeder negativen Spotmarktpreis-Viertelstunde verringert sich der anzulegende Wert auf null. Das ist kein vollständiger Erlösverlust, wenn daneben ein positiver Vermarktungserlös entsteht."
          : `Die iMSys-Ausnahme läuft bis 31.12.${Number(giltAb.slice(0, 4)) - 1}; § 51 gilt ab ${giltAb}.`,
      };
      verlaengerung = gilt
        ? {
            anwendbar: true,
            aussage:
              "Die betroffenen Viertelstunden verlängern den Förderzeitraum. Bei Solar werden sie mit Faktor 0,5 in Volllastviertelstunden umgerechnet; ein exaktes Enddatum erfordert die veröffentlichte §-51-Zeitreihe.",
          }
        : { anwendbar: false, aussage: "Während der Ausnahme entsteht noch kein §-51a-Zeitkontingent." };
      rechenweg.push(`§ 51 gilt ab ${giltAb}; Vergleich mit Stichtag ${stichtag} → ${gilt ? "anwendbar" : "noch ausgenommen"}.`);
    }
  } else if (uebergang) {
    const gilt = input.leistung_kwp >= 400;
    negative_preise = {
      status: gilt ? "gilt" : "nicht_relevant",
      gilt_ab: gilt ? input.ibn_datum : null,
      verguetung_bei_negativpreis: gilt ? "null" : "unveraendert",
      ausloeseschwelle: gilt ? altAusloeseschwelle(stichtag) : "Anlagen unter 400 kW sind nach der weitergeltenden Fassung ausgenommen",
      aussage: gilt
        ? `Für diese Übergangsanlage gilt § 51 in der Fassung vom 24.02.2025: ${altAusloeseschwelle(stichtag)}.`
        : "Die Anlage bleibt wegen ihrer Leistung unter 400 kW von der alten Negativpreisregel ausgenommen (§ 100 Abs. 46 EEG).",
    };
    verlaengerung = gilt
      ? { anwendbar: true, aussage: "§ 51a Abs. 1 in der Fassung vom 24.02.2025 gilt; der neue Solar-Faktor 0,5 aus Abs. 2 gilt für diese Anlage nicht." }
      : { anwendbar: false, aussage: "Ohne Verringerung nach der alten §-51-Fassung keine Verlängerung." };
    rechenweg.push(`IBN 2023 bis 24.02.2025 → § 100 Abs. 46; 400-kW-Schwelle ${gilt ? "erreicht" : "nicht erreicht"}.`);
  } else if (input.leistung_kwp < 400) {
    negative_preise = {
      status: "nicht_relevant",
      gilt_ab: null,
      verguetung_bei_negativpreis: "unveraendert",
      ausloeseschwelle: "unterhalb der sicher ausschließbaren historischen Leistungsschwellen",
      aussage: "Die neue §-51-Regel gilt nicht automatisch; bei dieser Bestandsanlage unter 400 kW greift auch keine der hier relevanten historischen Großanlagenschwellen.",
    };
    verlaengerung = { anwendbar: false, aussage: "Ohne Vergütungsverringerung bei negativen Preisen keine Verlängerung." };
    rechenweg.push("IBN vor 2023 und Leistung < 400 kW → neue Solarspitzen-Regel nicht anwendbar, historische Großanlagenschwelle sicher nicht erreicht.");
  } else {
    negative_preise = {
      status: "altregime_pruefen",
      gilt_ab: null,
      verguetung_bei_negativpreis: "nicht_bestimmbar",
      ausloeseschwelle: "abhängig von der bei Inbetriebnahme geltenden und über § 100 fortgeltenden EEG-Fassung",
      aussage: "Bestandsanlage vor 2023 mit mindestens 400 kW: Die konkrete historische §-51-Fassung muss über das Übergangsrecht bestimmt werden.",
    };
    verlaengerung = { anwendbar: null, aussage: "Erst nach Bestimmung der historischen §-51-Fassung berechenbar." };
    warnungen.push("Für diese große Bestandsanlage ist eine historische §-51-Prüfung erforderlich; EEGbot behauptet hier bewusst keinen pauschalen Schwellenwert.");
    rechenweg.push("IBN vor 2023 und Leistung ≥ 400 kW → historische Fassung erforderlich.");
  }

  const wechselMoeglich =
    !zukunft &&
    input.ibn_datum < SOLARSPITZEN_START &&
    input.imsys_vorhanden &&
    gefoerdert(input.vermarktungsform) &&
    negative_preise.status !== "gilt";
  const freiwilliger_wechsel: SolarspitzenErgebnis["freiwilliger_wechsel"] = wechselMoeglich
    ? {
        grundsaetzlich_vorgesehen: true,
        bonus_ct_kwh: 0.6,
        status: "beihilferechtliche_genehmigung_pruefen",
        aussage:
          "§ 100 Abs. 47 sieht eine freiwillige Unterwerfung unter §§ 51/51a mit +0,6 ct/kWh vor. Die Anwendung steht unter dem Genehmigungsvorbehalt des § 101 EEG; vor Erklärung aktuellen Genehmigungsstand beim Netzbetreiber prüfen.",
      }
    : {
        grundsaetzlich_vorgesehen: false,
        bonus_ct_kwh: null,
        status: "nicht_relevant",
        aussage: "Kein freiwilliger Wechsel in diesem Ergebnis ausgewiesen.",
      };

  if (stichtag > RECHTSSTAND)
    warnungen.push(`Der Stichtag liegt nach dem verifizierten Quellenstand ${RECHTSSTAND}; zwischenzeitliche Änderungen oder Festlegungen prüfen.`);

  return {
    modus,
    technische_vorgabe,
    negative_preise,
    verlaengerung,
    freiwilliger_wechsel,
    warnungen,
    rechenweg,
    parameterstand: {
      rechtsstand: RECHTSSTAND,
      kleinstanlagen_festlegung: "Keine Festlegung nach § 85 Abs. 2 Nr. 12 aufgefunden; BNetzA-Quellenstand 15.07.2026",
      freiwilliger_wechsel: "Genehmigungsvorbehalt nach § 101 EEG; Clearingstelle-Prüfstand 15.06.2026",
    },
    normen: ["§ 9 EEG 2023", "§ 51 EEG 2023", "§ 51a EEG 2023", "§ 100 Abs. 3b, 46 und 47 EEG 2023", "§ 101 EEG 2023"],
    quellen: [
      { bezeichnung: "EEG 2023", fundstelle: "§ 9 Technische Vorgaben", url: "https://www.gesetze-im-internet.de/eeg_2014/__9.html" },
      { bezeichnung: "EEG 2023", fundstelle: "§ 51 Negative Preise", url: "https://www.gesetze-im-internet.de/eeg_2014/__51.html" },
      { bezeichnung: "EEG 2023", fundstelle: "§ 51a Verlängerung", url: "https://www.gesetze-im-internet.de/eeg_2014/__51a.html" },
      { bezeichnung: "EEG 2023", fundstelle: "§ 100 Übergangsbestimmungen", url: "https://www.gesetze-im-internet.de/eeg_2014/__100.html" },
      { bezeichnung: "Clearingstelle EEG|KWKG", fundstelle: "FAQ 264, geprüft 15.06.2026", url: "https://www.clearingstelle-eeg-kwkg.de/haeufige-rechtsfrage/264" },
      { bezeichnung: "Netztransparenz", fundstelle: "Negativer Spotmarktpreis — Übersichtstabellen", url: "https://www.netztransparenz.de/de-de/Erneuerbare-Energien-und-Umlagen/EEG/Transparenzanforderungen/Marktpr%C3%A4mie/Negativer-Spotmarktpreis-%C3%9Cbersichtstabellen" },
    ],
  };
}
