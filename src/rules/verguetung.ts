/**
 * Vergütungsrechner — feste Einspeisevergütung für Gebäude-Solaranlagen.
 * Versteinerung: Satz richtet sich nach IBN-Datum (Zeitfenster der Parameter-
 * Tabelle); der Satz gilt 20 Jahre + Inbetriebnahmejahr-Rest (§ 25 EEG).
 * Mischvergütung: Staffel "bis einschließlich" anteilig nach Leistungsanteilen.
 *
 * Bewusste Grenze: IBN vor 30.07.2022 → kein Wert, sondern Verweis (deterministische
 * Ablehnung statt plausibler Falschwert); historische Sätze folgen als Daten-Erweiterung.
 */
import { parameterStaffel } from "../lib/parameter.ts";

export interface VerguetungInput {
  ibn_datum: string;
  leistung_kwp: number;
  einspeiseart: "teileinspeisung" | "volleinspeisung";
}

export interface VerguetungErgebnis {
  satz_ct_kwh: number; // gewichteter Mischsatz
  stufen: { von_kwp: number; bis_kwp: number; satz_ct_kwh: number; anteil_kwp: number }[];
  foerderende: string; // 31.12. des 20. Jahres nach IBN-Jahr
  hinweise: string[];
  quelle: string;
}

export async function berechneVerguetung(input: VerguetungInput): Promise<VerguetungErgebnis> {
  const { ibn_datum, leistung_kwp, einspeiseart } = input;
  if (leistung_kwp <= 0) throw new Error("leistung_kwp muss > 0 sein");
  if (ibn_datum < "2022-07-30")
    throw new Error(
      `IBN ${ibn_datum} liegt vor dem 30.07.2022 — historische Vergütungssätze sind noch nicht als Parameter erfasst. ` +
        `Vergütungsregime über resolve_uebergangsrecht bestimmen und Satz aus der Fassung bei IBN ermitteln (norm_at_date).`,
    );
  if (leistung_kwp > 100)
    throw new Error(
      "Feste Einspeisevergütung nur bis 100 kWp (§ 21 Abs. 1 EEG); ab 100 kWp Direktvermarktungspflicht — anzulegender Wert statt fester Vergütung.",
    );

  const id = einspeiseart === "volleinspeisung" ? "verguetung.solar.volleinspeisung" : "verguetung.solar.teileinspeisung";
  const { stufen, quelle } = await parameterStaffel(id, ibn_datum);

  // anteilige Mischvergütung über die Staffel
  let rest = leistung_kwp;
  let von = 0;
  let summe = 0;
  const detail: VerguetungErgebnis["stufen"] = [];
  for (const stufe of stufen) {
    const bis = stufe.bis_kwp ?? Infinity;
    const anteil = Math.max(0, Math.min(rest, bis - von));
    if (anteil > 0) {
      summe += anteil * stufe.wert;
      detail.push({ von_kwp: von, bis_kwp: Math.min(bis, leistung_kwp), satz_ct_kwh: stufe.wert, anteil_kwp: anteil });
      rest -= anteil;
    }
    von = bis;
    if (rest <= 0) break;
  }

  const ibnJahr = Number(ibn_datum.slice(0, 4));
  const hinweise: string[] = [
    "Vergütungsdauer: 20 Jahre zzgl. Rest des Inbetriebnahmejahres (§ 25 EEG).",
    "IBN-Datum = erstmalige Stromerzeugung, NICHT Zählersetzung (Clearingstelle 2021/28-IX).",
  ];
  if (einspeiseart === "volleinspeisung")
    hinweise.push(
      "Volleinspeisung erfordert Mitteilung an den Netzbetreiber VOR IBN bzw. jährlich bis 30.11. in Textform (§ 48 Abs. 2a) — Verstoß ist § 52-bewehrt (Nr. 10).",
    );

  return {
    satz_ct_kwh: Math.round((summe / leistung_kwp) * 100) / 100,
    stufen: detail,
    foerderende: `${ibnJahr + 20}-12-31`,
    hinweise,
    quelle,
  };
}
