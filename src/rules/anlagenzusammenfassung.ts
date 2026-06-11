/**
 * § 24 EEG Anlagenzusammenfassung — deterministischer Entscheidungsbaum.
 *
 * Deterministisch prüfbar (Schritte 1, 2, 4):
 *  1. Gleichartige erneuerbare Energien?
 *  2. IBN innerhalb von 12 Kalendermonaten? (Ausnahme Biogas: zeitunabhängig)
 *  4. Ausnahmen Solarpaket I: Freifläche≠Gebäude (S. 3), Gebäude-PV an
 *     verschiedenen Netzverknüpfungspunkten (S. 4), Steckersolar ≤ 2 kW (S. 5)
 *
 * NICHT deterministisch (Schritt 3): "unmittelbare räumliche Nähe" — funktionaler
 * Begriff nach BGH XIII ZR 12/19 (gemeinsame technische Infrastruktur, nicht bloße
 * Entfernung; 600 m schließen Zusammenfassung nicht aus). Bei Erreichen dieses
 * Schritts gibt die Engine LLM_SUBSUMTION_ERFORDERLICH mit Pflicht-Kontext zurück.
 */

export interface AnlageZsf {
  id: string;
  energietraeger: "solar" | "wind" | "biomasse" | "wasser" | "geothermie";
  ibn_datum: string;
  leistung_kwp: number;
  anlagentyp?: "dach" | "freiflaeche" | "steckersolar" | "fassade" | "sonstig";
  /** Identifikatoren für deterministische Gleichheits-Checks (optional): */
  grundstueck_id?: string; // Flurstück (formeller Grundstücksbegriff, BGH XIII ZR 12/19)
  gebaeude_id?: string;
  netzverknuepfungspunkt_id?: string;
  selbe_biogasanlage?: boolean;
}

export type ZsfStatus = "ZUSAMMENZUFASSEN" | "NICHT_ZUSAMMENZUFASSEN" | "LLM_SUBSUMTION_ERFORDERLICH";

export interface ZsfErgebnis {
  status: ZsfStatus;
  pruefschritte: { schritt: string; ergebnis: string; norm: string }[];
  subsumtionsauftrag?: {
    frage: string;
    pflicht_kontext: string[];
    benoetigte_fakten: string[];
  };
  rechtsfolge_hinweis: string;
  quellen: string[];
}

function monateDiff(a: string, b: string): number {
  const [aj, am] = [Number(a.slice(0, 4)), Number(a.slice(5, 7))];
  const [bj, bm] = [Number(b.slice(0, 4)), Number(b.slice(5, 7))];
  return Math.abs((bj - aj) * 12 + (bm - am));
}

export function pruefeZusammenfassung(a: AnlageZsf, b: AnlageZsf): ZsfErgebnis {
  const schritte: ZsfErgebnis["pruefschritte"] = [];
  const quellen = ["§ 24 Abs. 1 EEG 2023 i.d.F. Solarpaket I (16.05.2024)", "BGH, Urt. v. 14.07.2020 — XIII ZR 12/19 (Windpark Nateln)"];
  const fertig = (status: ZsfStatus, extra?: Partial<ZsfErgebnis>): ZsfErgebnis => ({
    status,
    pruefschritte: schritte,
    rechtsfolge_hinweis:
      "Rechtsfolge bei Zusammenfassung: Leistungsaddition nur für den zuletzt in Betrieb gesetzten Generator (Windhundprinzip, Clearingstelle FAQ 150/175); Schwellenwerte (z. B. § 51 Abs. 3, Vergütungsstaffeln) können sich verschieben.",
    quellen,
    ...extra,
  });

  // Schritt 4 zuerst, da harte Ausschlüsse (Solarpaket I) jede weitere Prüfung erübrigen
  if (a.anlagentyp === "steckersolar" || b.anlagentyp === "steckersolar") {
    schritte.push({ schritt: "Ausnahme Steckersolar", ergebnis: "Steckersolargeräte bleiben unberücksichtigt", norm: "§ 24 Abs. 1 S. 5 EEG (seit 16.05.2024)" });
    return fertig("NICHT_ZUSAMMENZUFASSEN");
  }
  const istGebaeude = (x: AnlageZsf) => x.anlagentyp === "dach" || x.anlagentyp === "fassade";
  if ((a.anlagentyp === "freiflaeche" && istGebaeude(b)) || (b.anlagentyp === "freiflaeche" && istGebaeude(a))) {
    schritte.push({ schritt: "Ausnahme Freifläche/Gebäude", ergebnis: "Keine Zusammenfassung Freifläche mit Gebäudeanlage", norm: "§ 24 Abs. 1 S. 3 EEG" });
    return fertig("NICHT_ZUSAMMENZUFASSEN");
  }
  if (
    istGebaeude(a) && istGebaeude(b) &&
    a.netzverknuepfungspunkt_id && b.netzverknuepfungspunkt_id &&
    a.netzverknuepfungspunkt_id !== b.netzverknuepfungspunkt_id
  ) {
    schritte.push({ schritt: "Ausnahme verschiedene NVP (Gebäude-PV)", ergebnis: "Verschiedene Netzverknüpfungspunkte → keine Zusammenfassung", norm: "§ 24 Abs. 1 S. 4 EEG (seit 16.05.2024)" });
    return fertig("NICHT_ZUSAMMENZUFASSEN");
  }

  // Schritt 1: gleichartige erneuerbare Energien
  if (a.energietraeger !== b.energietraeger) {
    schritte.push({ schritt: "Gleichartigkeit", ergebnis: `${a.energietraeger} ≠ ${b.energietraeger}`, norm: "§ 24 Abs. 1 S. 1 EEG" });
    return fertig("NICHT_ZUSAMMENZUFASSEN");
  }
  schritte.push({ schritt: "Gleichartigkeit", ergebnis: "gleiche Energiequelle", norm: "§ 24 Abs. 1 S. 1 EEG" });

  // Schritt 2: 12-Monats-Frist (Ausnahme Biogas)
  const biogasAusnahme = a.energietraeger === "biomasse" && a.selbe_biogasanlage && b.selbe_biogasanlage;
  if (biogasAusnahme) {
    schritte.push({ schritt: "12-Monats-Frist", ergebnis: "Biogas aus derselben Erzeugungsanlage: zeitunabhängige Zusammenfassung", norm: "§ 24 Abs. 1 S. 2 EEG" });
  } else if (monateDiff(a.ibn_datum, b.ibn_datum) > 12) {
    schritte.push({ schritt: "12-Monats-Frist", ergebnis: `IBN-Abstand ${monateDiff(a.ibn_datum, b.ibn_datum)} Monate > 12`, norm: "§ 24 Abs. 1 S. 1 Nr. 4 EEG" });
    return fertig("NICHT_ZUSAMMENZUFASSEN");
  } else {
    schritte.push({ schritt: "12-Monats-Frist", ergebnis: "innerhalb 12 Kalendermonaten", norm: "§ 24 Abs. 1 S. 1 Nr. 4 EEG" });
  }

  // Schritt 3: räumliche Kriterien — deterministische Teile
  if (a.gebaeude_id && b.gebaeude_id && a.gebaeude_id === b.gebaeude_id) {
    schritte.push({ schritt: "Räumlich: selbes Gebäude", ergebnis: "identisches Gebäude", norm: "§ 24 Abs. 1 S. 1 Nr. 1 EEG, § 3 Nr. 23 EEG" });
    return fertig("ZUSAMMENZUFASSEN");
  }
  if (a.grundstueck_id && b.grundstueck_id && a.grundstueck_id === b.grundstueck_id) {
    schritte.push({ schritt: "Räumlich: selbes Grundstück", ergebnis: "identisches Flurstück (formeller Grundstücksbegriff)", norm: "§ 24 Abs. 1 S. 1 Nr. 1 EEG; BGH XIII ZR 12/19" });
    return fertig("ZUSAMMENZUFASSEN");
  }

  // Verbleibender Auffangtatbestand: "sonst in unmittelbarer räumlicher Nähe" — LLM/Jurist
  schritte.push({ schritt: "Räumlich: unmittelbare räumliche Nähe", ergebnis: "unbestimmter Rechtsbegriff — nicht deterministisch entscheidbar", norm: "§ 24 Abs. 1 S. 1 Nr. 2 EEG" });
  return fertig("LLM_SUBSUMTION_ERFORDERLICH", {
    subsumtionsauftrag: {
      frage: "Befinden sich die Anlagen 'sonst in unmittelbarer räumlicher Nähe' i.S.d. § 24 Abs. 1 S. 1 Nr. 2 EEG?",
      pflicht_kontext: [
        "BGH XIII ZR 12/19 (Windpark Nateln): FUNKTIONALE Prüfung — maßgeblich ist gemeinsame technische Infrastruktur (Umspannwerk, Netzverknüpfungspunkt), nicht bloße Entfernung; 600 m Abstand schließen Zusammenfassung nicht aus; Indizienkatalog der Empfehlung 2008/49 ist VERWORFEN.",
        "Clearingstelle Votum 2022/14-II (neue Spruchpraxis nach BGH)",
        "Clearingstelle FAQ 150 (Gebäude-PV), FAQ 202 (Betriebsgelände)",
      ],
      benoetigte_fakten: [
        "Gemeinsames Umspannwerk / gemeinsamer Netzverknüpfungspunkt?",
        "Zusammenhängendes Areal / gemeinsames Betriebsgelände?",
        "Gemeinsame Zuwegung oder technische Einrichtungen?",
        "Entfernung (nur als Indiz, nicht allein maßgeblich)",
      ],
    },
  });
}
