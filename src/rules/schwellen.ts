/**
 * Schwellenwert-Checker — welche Pflichten-Klasse gilt für eine Anlage?
 * Jede Schwelle mit Norm-Quelle; Werte hier kodiert (Änderungs-Anker:
 * data/parameters/schwellen.yaml, vom Changefeed überwacht).
 */

export interface SchwellenInput {
  leistung_kwp: number;
  wechselrichter_va?: number;
  anlagentyp?: "dach" | "freiflaeche" | "steckersolar" | "fassade" | "sonstig";
  imsys_vorhanden?: boolean;
  vermarktungsform?: "einspeiseverguetung" | "marktpraemie" | "mieterstromzuschlag" | "keine_eeg_foerderung";
  steuerungseinrichtung_vorhanden?: boolean;
  ansteuerbarkeit_getestet?: boolean;
  ibn_datum?: string;
}

export interface SchwellenBefund {
  thema: string;
  zutreffend: boolean;
  aussage: string;
  norm: string;
}

export function pruefeSchwellen(input: SchwellenInput): SchwellenBefund[] {
  const b: SchwellenBefund[] = [];
  const kw = input.leistung_kwp;
  const vollSteuerbar =
    input.imsys_vorhanden === true &&
    input.steuerungseinrichtung_vorhanden === true &&
    input.ansteuerbarkeit_getestet === true;
  const begrenzungsForm = input.vermarktungsform === "einspeiseverguetung" || input.vermarktungsform === "mieterstromzuschlag";

  b.push({
    thema: "Steckersolargerät",
    zutreffend: kw <= 2 && (input.wechselrichter_va === undefined || input.wechselrichter_va <= 800),
    aussage:
      "≤ 2 kW Modulleistung und ≤ 800 VA Wechselrichter: vereinfachte MaStR-Registrierung, keine Anlagenzusammenfassung (§ 24 Abs. 1 S. 5), Schuko-Stecker zulässig.",
    norm: "§ 8 Abs. 5a EEG; § 24 Abs. 1 S. 5 EEG (Solarpaket I)",
  });
  b.push({
    thema: "Vereinfachtes Netzanschlussverfahren",
    zutreffend: kw <= 30,
    aussage: "≤ 30 kW: digitales Netzanschlussportal des Netzbetreibers nutzbar (Pflicht der NB seit 01.01.2025).",
    norm: "§ 8 Abs. 7 EEG",
  });
  b.push({
    thema: "Monatsfrist-Fiktion Netzanschluss",
    zutreffend: kw <= 10.8,
    aussage: "≤ 10,8 kW: reagiert der Netzbetreiber nicht binnen 1 Monat auf das Netzanschlussbegehren, darf über den Hausanschluss angeschlossen werden.",
    norm: "§ 8 Abs. 5 EEG",
  });
  b.push({
    thema: "Wirkleistungsbegrenzung (Solarspitzengesetz)",
    zutreffend: kw < 100 && begrenzungsForm && !vollSteuerbar && (input.ibn_datum ?? "0000") >= "2025-02-25",
    aussage:
      "Neuanlagen < 100 kW in Einspeisevergütung oder Mieterstrom: Begrenzung auf 60 % bis iMSys, Steuerungseinrichtung und erfolgreicher Ansteuerbarkeitstest vollständig vorliegen. Details im Solarspitzen-Check.",
    norm: "§ 9 EEG i.d.F. Solarspitzengesetz (in Kraft 25.02.2025)",
  });
  b.push({
    thema: "Direktvermarktungspflicht",
    zutreffend: kw > 100,
    aussage:
      "> 100 kW: Pflicht zur Direktvermarktung (Marktprämie statt fester Vergütung); Fernsteuerbarkeit nach § 10b erforderlich — Verstoß ist § 52 Abs. 1 Nr. 4-bewehrt.",
    norm: "§ 21 Abs. 1, § 10b EEG 2023",
  });
  b.push({
    thema: "Ausschreibungspflicht Freifläche",
    zutreffend: input.anlagentyp === "freiflaeche" && kw > 1000,
    aussage: "Freiflächenanlagen > 1 MW: Teilnahme an BNetzA-Ausschreibungen erforderlich (Gebotstermine Segment 1: 1. März / 1. Juli / 1. Dezember).",
    norm: "§ 22 EEG 2023",
  });
  b.push({
    thema: "Ausschreibungspflicht Dach (Segment 2)",
    zutreffend: input.anlagentyp !== "freiflaeche" && kw > 1000,
    aussage: "Gebäudeanlagen > 1 MW: Ausschreibungspflicht im 2. Segment (Gebotstermine 1. Februar / 1. Juni / 1. Oktober).",
    norm: "§ 22 EEG 2023",
  });
  return b;
}
