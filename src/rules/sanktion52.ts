/**
 * § 52 Liability Radar — deterministische Berechnung der EEG-Strafzahlungen.
 *
 * Mechanik (§ 52 EEG 2023, aktuelle Fassung, Volltext im Normgraph):
 *  - Abs. 2: 10 €/kW installierter Leistung je Kalendermonat des Verstoßes
 *            (auch bei nur zeitweisem Verstoß im Monat: voller Monat)
 *  - Abs. 3: Verringerung auf 2 €/kW/Monat bei Nr. 1, 3, 4, 11 nach Heilung —
 *            RÜCKWIRKEND bis Verstoßbeginn; bei Nr. 9a und 10 generell 2 €
 *  - Abs. 3 S. 2: Defekt-Klausel (Verstöße Nr. 1, 3, 4, 8 ab 2024 durch
 *            Gerätedefekt): Verstoßmonat + Folgemonat entfallen (Beweislast Betreiber)
 *  - Abs. 4: Zusatzmonate — Nr. 7: +3, Nr. 9: +1, Nr. 10: ganzes Kalenderjahr,
 *            Nr. 12: +6
 *  - Abs. 5: Kappung: Summe aller Verstöße ≤ 10 €/kW/Monat
 *  - Abs. 6: Verjährung mit Ablauf des zweiten Kalenderjahres nach dem Verstoß
 *
 * Diese Engine rechnet; sie bewertet NICHT, ob ein Verstoß vorliegt — das ist
 * Sachverhalts-/ggf. Subsumtionsfrage (Workflow bzw. Agent).
 */
import { parameterWert } from "../lib/parameter.ts";

export const VERSTOSS_KATEGORIEN = {
  "1": "Verstoß gegen § 9 Abs. 1/2 (technische Ausstattung, Steuerbarkeit)",
  "2": "Verstoß gegen § 9 Abs. 5",
  "3": "Verstoß gegen § 9 Abs. 8",
  "4": "Verstoß gegen § 10b (Direktvermarktung: Fernsteuerbarkeit)",
  "5": "Ausfallvergütung über Höchstdauer (§ 21 Abs. 1 S. 1 Nr. 3)",
  "6": "Einspeisevergütung trotz Verstoß gegen § 21 Abs. 2",
  "7": "Verstoß gegen § 21b Abs. 2 S. 1 2. Hs.",
  "8": "Keine viertelstündliche Messung/Bilanzierung (§ 21b Abs. 3)",
  "9": "Veräußerungsform-Zuordnung/-Wechsel nicht nach § 21c übermittelt",
  "9a": "Verstoß gegen § 37 Abs. 1a / § 48 Abs. 6",
  "10": "Volleinspeisungs-Mitteilung verletzt (§ 48 Abs. 2a)",
  "11": "MaStR-Registrierung fehlt und keine Meldung nach § 71 Abs. 1 Nr. 1",
  "12": "Verstoß gegen § 80 (Doppelvermarktungsverbot)",
} as const;
export type VerstossKategorie = keyof typeof VERSTOSS_KATEGORIEN;

const HEILBAR_RUECKWIRKEND = new Set<VerstossKategorie>(["1", "3", "4", "11"]);
const PAUSCHAL_REDUZIERT = new Set<VerstossKategorie>(["9a", "10"]);
const ZUSATZMONATE: Partial<Record<VerstossKategorie, number>> = { "7": 3, "9": 1, "12": 6 };
const GANZES_KALENDERJAHR = new Set<VerstossKategorie>(["10"]);

export interface Verstoss {
  kategorie: VerstossKategorie;
  beginn: string; // YYYY-MM-DD (Beginn des Verstoßes)
  ende?: string; // YYYY-MM-DD; offen = dauert an
  geheilt?: boolean; // Pflicht inzwischen erfüllt?
}

export interface Sanktion52Input {
  leistung_kw: number;
  verstoesse: Verstoss[];
  stichtag?: string; // Berechnungsdatum, default heute
}

export interface MonatsPosten {
  monat: string; // YYYY-MM
  betrag_eur: number;
  kategorien: VerstossKategorie[];
  gekappt: boolean;
  verjaehrt: boolean;
}

export interface Sanktion52Ergebnis {
  exposure_gesamt_eur: number; // nicht verjährt, nach Kappung
  exposure_verjaehrt_eur: number; // informativ: wäre fällig gewesen, aber § 52 Abs. 6
  monatlich_laufend_eur: number; // aktuelle monatliche Belastung bei ungeheilten Verstößen
  heilungsersparnis_eur: number; // Differenz heute heilen vs. weiter ungeheilt (12-Monats-Projektion)
  monate: MonatsPosten[];
  hinweise: string[];
  quellen: string[];
  parameterstand: {
    stichtag: string;
    regelsatz_eur_kw_monat: number;
    heilungssatz_eur_kw_monat: number;
    gueltig_von: string;
    gueltig_bis?: string;
  };
}

const monatVon = (d: string) => d.slice(0, 7);
function monateZwischen(von: string, bis: string): string[] {
  const res: string[] = [];
  let [j, m] = [Number(von.slice(0, 4)), Number(von.slice(5, 7))];
  const [je, me] = [Number(bis.slice(0, 4)), Number(bis.slice(5, 7))];
  while (j < je || (j === je && m <= me)) {
    res.push(`${j}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) (m = 1), j++;
  }
  return res;
}
function plusMonate(monat: string, n: number): string {
  let [j, m] = [Number(monat.slice(0, 4)), Number(monat.slice(5, 7)) + n];
  while (m > 12) (m -= 12), j++;
  return `${j}-${String(m).padStart(2, "0")}`;
}

/** Verjährung § 52 Abs. 6 S. 3: mit Ablauf des zweiten Kalenderjahres nach dem Verstoß. */
function istVerjaehrt(verstossMonat: string, stichtag: string): boolean {
  const verstossJahr = Number(verstossMonat.slice(0, 4));
  return Number(stichtag.slice(0, 4)) > verstossJahr + 2;
}

export async function berechneSanktion52(input: Sanktion52Input): Promise<Sanktion52Ergebnis> {
  const stichtag = input.stichtag ?? new Date().toISOString().slice(0, 10);
  if (input.leistung_kw <= 0) throw new Error("leistung_kw muss > 0 sein");

  const satz = await parameterWert("sanktion.52.satz", stichtag);
  const heilSatz = await parameterWert("sanktion.52.heilung_satz", stichtag);
  const voll = Number(satz.wert) * input.leistung_kw;
  const reduziert = Number(heilSatz.wert) * input.leistung_kw;

  const hinweise: string[] = [];
  // je Monat: Liste der Verstoß-Beträge (für Kappung Abs. 5)
  const proMonat = new Map<string, { betrag: number; kategorie: VerstossKategorie }[]>();

  for (const v of input.verstoesse) {
    if (v.beginn < "2023-01-01")
      hinweise.push(
        `Verstoß ${v.kategorie}: Beginn vor 01.01.2023 — § 52-Zahlungsregime gilt erst ab EEG 2023; ` +
          `frühere Zeiträume unterliegen dem alten Sanktionssystem (Vergütungskürzung) und sind hier NICHT berechnet.`,
      );
    const beginn = v.beginn < "2023-01-01" ? "2023-01-01" : v.beginn;
    const ende = v.ende ?? stichtag;
    let monate = monateZwischen(monatVon(beginn), monatVon(ende));

    // Abs. 4 Zusatzmonate / ganzes Kalenderjahr
    if (GANZES_KALENDERJAHR.has(v.kategorie)) {
      const jahre = new Set(monate.map((m) => m.slice(0, 4)));
      monate = [...jahre].flatMap((j) => monateZwischen(`${j}-01`, `${j}-12`));
    }
    const zusatz = ZUSATZMONATE[v.kategorie];
    if (zusatz && v.ende) {
      const letzter = monate[monate.length - 1]!;
      for (let i = 1; i <= zusatz; i++) monate.push(plusMonate(letzter, i));
    }

    const reduziertAnwendbar =
      PAUSCHAL_REDUZIERT.has(v.kategorie) || (v.geheilt === true && HEILBAR_RUECKWIRKEND.has(v.kategorie));
    const betrag = reduziertAnwendbar ? reduziert : voll;
    for (const m of monate) {
      const liste = proMonat.get(m) ?? [];
      liste.push({ betrag, kategorie: v.kategorie });
      proMonat.set(m, liste);
    }
    if (v.geheilt && !HEILBAR_RUECKWIRKEND.has(v.kategorie) && !PAUSCHAL_REDUZIERT.has(v.kategorie))
      hinweise.push(
        `Verstoß ${v.kategorie}: Heilung verringert die Zahlung NICHT rückwirkend (§ 52 Abs. 3 gilt nur für Nr. 1, 3, 4, 11 bzw. 9a/10).`,
      );
  }

  const monatsListe: MonatsPosten[] = [...proMonat.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monat, posten]) => {
      const roh = posten.reduce((s, p) => s + p.betrag, 0);
      const gekappt = roh > voll;
      const betrag = Math.min(roh, voll); // Abs. 5
      return { monat, betrag_eur: betrag, kategorien: posten.map((p) => p.kategorie), gekappt, verjaehrt: istVerjaehrt(monat, stichtag) };
    });

  const exposure = monatsListe.filter((m) => !m.verjaehrt).reduce((s, m) => s + m.betrag_eur, 0);
  const verjaehrtSumme = monatsListe.filter((m) => m.verjaehrt).reduce((s, m) => s + m.betrag_eur, 0);

  // laufende monatliche Belastung: ungeheilte, andauernde Verstöße
  const laufend = input.verstoesse.filter((v) => !v.ende && !v.geheilt);
  const monatlichLaufend = Math.min(
    laufend.reduce((s, v) => s + (PAUSCHAL_REDUZIERT.has(v.kategorie) ? reduziert : voll), 0),
    laufend.length ? voll : 0,
  );

  // Heilungsersparnis: 12-Monats-Projektion ungeheilt vs. Heilung heute
  // (rückwirkende Reduktion Nr. 1/3/4/11 + Stopp künftiger Monate)
  let ersparnis = 0;
  for (const v of laufend) {
    const kuenftig = 12 * (PAUSCHAL_REDUZIERT.has(v.kategorie) ? reduziert : voll);
    let rueckwirkend = 0;
    if (HEILBAR_RUECKWIRKEND.has(v.kategorie)) {
      const monate = monateZwischen(monatVon(v.beginn < "2023-01-01" ? "2023-01-01" : v.beginn), monatVon(stichtag)).filter(
        (m) => !istVerjaehrt(m, stichtag),
      ).length;
      rueckwirkend = monate * (voll - reduziert);
    }
    ersparnis += kuenftig + rueckwirkend;
  }

  if (monatsListe.some((m) => m.verjaehrt))
    hinweise.push("Teile der Exposure sind nach § 52 Abs. 6 S. 3 verjährt (Ablauf des zweiten Kalenderjahres nach Verstoß) — Einrede erforderlich.");
  hinweise.push(
    "Defekt-Klausel § 52 Abs. 3 S. 2 (Geräte-Defekt, Nr. 1/3/4/8, ab 2024: Verstoßmonat + Folgemonat entfallen) ist NICHT automatisch berücksichtigt — Beweislast beim Betreiber.",
  );

  return {
    exposure_gesamt_eur: exposure,
    exposure_verjaehrt_eur: verjaehrtSumme,
    monatlich_laufend_eur: monatlichLaufend,
    heilungsersparnis_eur: ersparnis,
    monate: monatsListe,
    hinweise,
    quellen: [
      `§ 52 Abs. 1–6 EEG 2023 (Satz: ${satz.quelle})`,
      "§ 100 Abs. 9 EEG 2023 (Geltung für Bestandsanlagen)",
      "Clearingstelle EEG|KWKG FAQ 236 (Eigenversorger-Bestandsanlagen)",
    ],
    parameterstand: {
      stichtag,
      regelsatz_eur_kw_monat: Number(satz.wert),
      heilungssatz_eur_kw_monat: Number(heilSatz.wert),
      gueltig_von: satz.gueltig_von,
      gueltig_bis: satz.gueltig_bis,
    },
  };
}
