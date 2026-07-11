/**
 * Optionsvergleich für ausgeförderte Ü20-Anlagen (Förderende: 20 Jahre + Rest
 * des IBN-Jahres, § 25 EEG). 66.000+ Anlagen verlassen allein 2026 die Förderung.
 *
 * Optionen (ökonomischer Vergleich, KEINE Rechtsberatung):
 *  1. Anschlussvergütung (Auffanglösung bis Ende 2032, Solarpaket I):
 *     Jahresmarktwert Solar minus Vermarktungskostenpauschale
 *  2. Umstellung auf Überschusseinspeisung + Eigenverbrauch
 *  3. Sonstige Direktvermarktung / PPA (ab nennenswerter Größe)
 *  4. Repowering (neuer 20-Jahres-Zeitraum)
 */
import { parameterWert } from "../lib/parameter.ts";

export interface AusgefoerderteInput {
  ibn_datum: string;
  leistung_kwp: number;
  jahresertrag_kwh?: number; // default: 950 kWh/kWp (konservativ)
  eigenverbrauchsanteil_prozent?: number; // bei Umstellung auf EV; default 30
  strompreis_ct_kwh?: number; // Haushaltsstrompreis; default 35
  stichtag?: string;
}

export interface OptionsErgebnis {
  option: string;
  jahresertrag_eur: number | null;
  annahmen: string[];
  hinweise: string[];
}

export interface AusgefoerderteErgebnis {
  foerderende: string;
  ist_ausgefoerdert: boolean;
  optionen: OptionsErgebnis[];
  warnungen: string[];
  quellen: string[];
}

// § 53 S. 1 Nr. 2 EEG: Verringerung um 0,4 ct/kWh für Solar (Wortlaut im Normgraph
// verifiziert 10.07.2026). Der in Fachdebatten kursierende Wert 0,715 ct/kWh ist der
// EMPIRISCHE ÜNB-Vermarktungskostenwert, keine gesetzliche Pauschale — nicht verwenden.
const VERMARKTUNGSKOSTENPAUSCHALE_CT = 0.4;

export async function vergleicheAusgefoerderteOptionen(input: AusgefoerderteInput): Promise<AusgefoerderteErgebnis> {
  const stichtag = input.stichtag ?? new Date().toISOString().slice(0, 10);
  const ibnJahr = Number(input.ibn_datum.slice(0, 4));
  const foerderende = `${ibnJahr + 20}-12-31`;
  const ausgefoerdert = foerderende < stichtag;

  const ertragKwh = input.jahresertrag_kwh ?? Math.round(input.leistung_kwp * 950);
  const evAnteil = (input.eigenverbrauchsanteil_prozent ?? 30) / 100;
  const strompreis = input.strompreis_ct_kwh ?? 35;

  const jw = await parameterWert("markt.jahresmarktwert_solar", stichtag);
  const anschlussSatz = Number(jw.wert) - VERMARKTUNGSKOSTENPAUSCHALE_CT;

  const optionen: OptionsErgebnis[] = [
    {
      option: "Anschlussvergütung (Volleinspeisung weiterlaufen lassen)",
      jahresertrag_eur: Math.round(ertragKwh * anschlussSatz) / 100,
      annahmen: [
        `Jahresmarktwert Solar ${jw.wert} ct/kWh (${jw.quelle}) minus Vermarktungskostenpauschale ${VERMARKTUNGSKOSTENPAUSCHALE_CT} ct`,
        `Jahresertrag ${ertragKwh} kWh`,
      ],
      hinweise: [
        "Auffanglösung verlängert bis 31.12.2032 (Solarpaket I).",
        "Keine Umbaukosten; aber ~0,1–0,3 ct/kWh über Marktniveau der sonstigen DV nur selten erreichbar.",
      ],
    },
    {
      option: "Umstellung auf Eigenverbrauch + Überschusseinspeisung",
      jahresertrag_eur:
        Math.round(ertragKwh * evAnteil * strompreis + ertragKwh * (1 - evAnteil) * anschlussSatz) / 100,
      annahmen: [
        `Eigenverbrauchsanteil ${Math.round(evAnteil * 100)} % zu vermiedenen ${strompreis} ct/kWh`,
        `Überschuss ${Math.round((1 - evAnteil) * 100)} % zur Anschlussvergütung ${anschlussSatz.toFixed(2)} ct/kWh`,
      ],
      hinweise: [
        "Umbau erforderlich (Zählerkonzept, ggf. Messkonzept-Änderung beim Netzbetreiber).",
        "Veräußerungsform-Wechsel dem Netzbetreiber nach § 21c melden — sonst § 52 Abs. 1 Nr. 9!",
        "Mit Speicher steigt der EV-Anteil typisch auf 50–70 % — Wirtschaftlichkeit separat prüfen.",
      ],
    },
    {
      option: "Sonstige Direktvermarktung / PPA",
      jahresertrag_eur: null,
      annahmen: [],
      hinweise: ["Für Kleinanlagen < 30 kWp wegen Dienstleistungsentgelten meist unwirtschaftlich; ab ~100 kWp prüfenswert (individuelles Angebot)."],
    },
    {
      option: "Repowering",
      jahresertrag_eur: null,
      annahmen: [],
      hinweise: ["Neue Module/neuer WR am selben Standort → neuer 20-Jahres-Vergütungszeitraum zum aktuellen Satz; Investitionsrechnung erforderlich (Installateur/Energieberater)."],
    },
  ];

  const warnungen = [
    "Die Anlage bleibt auch nach Förderende EE-Anlage i.S.d. EEG (BNetzA-FAQ): MaStR-Pflichten und § 52-Sanktionsregime gelten WEITER. Bei 5 kWp übersteigt die §52-Strafzahlung (50 €/Monat) die Jahres-Anschlussvergütung in ~4 Monaten.",
    "Betreiberwechsel (z. B. Hausverkauf) ist im MaStR zu melden.",
    "Dies ist ein ökonomischer Kategorienvergleich, keine individuelle Beratung; steuerliche Folgen → Steuerberater.",
  ];

  return {
    foerderende,
    ist_ausgefoerdert: ausgefoerdert,
    optionen,
    warnungen,
    quellen: [
      "§ 25 EEG (Vergütungsdauer)",
      "§ 21 Abs. 1 Nr. 3, Anlage 1 EEG (Anschlussvergütung ausgeförderte Anlagen, bis 2032 verlängert durch Solarpaket I)",
      "Clearingstelle EEG|KWKG FAQ-Bereich ausgeförderte Anlagen",
    ],
  };
}
