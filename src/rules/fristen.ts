/**
 * Fristen-Engine — reine Datumsarithmetik mit Norm-Quellen.
 * Deckt die drei teuersten Fehlerquellen ab (Research: ~700.000 betroffene
 * Haushalte allein bei der Veräußerungsform-Meldung).
 */

export interface FristErgebnis {
  bezeichnung: string;
  deadline: string;
  status: "offen" | "ueberschritten" | "erledigt";
  folge_bei_verstoss: string;
  norm: string;
  tage_verbleibend?: number;
}

function tageBis(deadline: string, heute: string): number {
  return Math.floor((Date.parse(deadline) - Date.parse(heute)) / 86_400_000);
}
function plusMonate(datum: string, n: number): string {
  const d = new Date(datum + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}

export interface FristenInput {
  ibn_datum: string;
  mastr_registriert: boolean;
  mastr_registrierung_datum?: string;
  veraeusserungsform_gemeldet: boolean;
  einspeiseart?: "teileinspeisung" | "volleinspeisung";
  stichtag?: string;
}

export function pruefeFristen(input: FristenInput): FristErgebnis[] {
  const heute = input.stichtag ?? new Date().toISOString().slice(0, 10);
  const ergebnisse: FristErgebnis[] = [];

  // 1) MaStR-Registrierung: 1 Monat nach IBN (§ 5 MaStRV)
  const mastrDeadline = plusMonate(input.ibn_datum, 1);
  ergebnisse.push({
    bezeichnung: "MaStR-Registrierung der Anlage",
    deadline: mastrDeadline,
    status: input.mastr_registriert
      ? "erledigt"
      : mastrDeadline < heute
        ? "ueberschritten"
        : "offen",
    folge_bei_verstoss:
      "Strafzahlung § 52 Abs. 1 Nr. 11 EEG (10 €/kW/Monat; nach Nachholung rückwirkend 2 €/kW/Monat, § 52 Abs. 3). Zweistufig registrieren: ERST Marktakteur, DANN Anlage.",
    norm: "§ 5 MaStRV i.V.m. § 52 Abs. 1 Nr. 11 EEG 2023",
    tage_verbleibend: input.mastr_registriert ? undefined : tageBis(mastrDeadline, heute),
  });

  // 2) Veräußerungsform-Meldung an den Netzbetreiber (§ 21b, § 21c EEG)
  ergebnisse.push({
    bezeichnung: "Zuordnung zur Veräußerungsform an Netzbetreiber melden",
    deadline: input.ibn_datum,
    status: input.veraeusserungsform_gemeldet ? "erledigt" : "ueberschritten",
    folge_bei_verstoss:
      "Ohne Zuordnung behandelt der Netzbetreiber den Strom als unentgeltliche Abnahme (0 ct/kWh, § 21b Abs. 4 Nr. 2 EEG) — nicht rückwirkend heilbar; zusätzlich § 52 Abs. 1 Nr. 9 möglich. SEPARATE Meldung, unabhängig von MaStR!",
    norm: "§ 21b, § 21c EEG 2023",
  });

  // 3) Volleinspeisung: jährliche Mitteilung bis 30.11. fürs Folgejahr
  if (input.einspeiseart === "volleinspeisung") {
    const jahr = Number(heute.slice(0, 4));
    const deadline = `${jahr}-11-30`;
    ergebnisse.push({
      bezeichnung: "Volleinspeisungs-Mitteilung für das Folgejahr (Textform)",
      deadline,
      status: deadline < heute ? "ueberschritten" : "offen",
      folge_bei_verstoss:
        "Verlust des Volleinspeisungszuschlags; § 52 Abs. 1 Nr. 10 (2 €/kW/Monat, ganzes Kalenderjahr, § 52 Abs. 4 Nr. 3). Starre Frist, Textform § 126b BGB (Clearingstelle Hinweis 2024/14-II).",
      norm: "§ 48 Abs. 2a EEG 2023",
      tage_verbleibend: tageBis(deadline, heute),
    });
  }

  return ergebnisse;
}
