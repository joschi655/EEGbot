/**
 * Deterministische Auflösung des EEG-Übergangsrechts (§ 100-Kaskade).
 * Datengetrieben aus data/uebergangsrecht.yaml — Logik und Rechtsstand sind
 * getrennt, Updates an der Kette erfordern keinen Code-Change.
 */
import { parse } from "yaml";

interface FassungEintrag {
  id: string;
  bezeichnung: string;
  ibn_von: string;
  ibn_bis: string | null;
  uebergangsnorm?: string;
  snapshot_verfuegbar?: string;
}
interface Durchbrechung {
  norm: string;
  thema: string;
  hinweis: string;
}
interface UebergangsrechtDaten {
  fassungen: FassungEintrag[];
  durchbrechungen: Durchbrechung[];
}

let _daten: UebergangsrechtDaten | null = null;
export async function ladeUebergangsrecht(): Promise<UebergangsrechtDaten> {
  if (_daten) return _daten;
  const pfad = new URL("../../data/uebergangsrecht.yaml", import.meta.url).pathname;
  _daten = parse(await Bun.file(pfad).text()) as UebergangsrechtDaten;
  return _daten;
}

export interface UebergangsrechtErgebnis {
  /** Fassung, deren Vergütungsregime für die Anlage gilt (Versteinerung). */
  verguetungsregime: { id: string; bezeichnung: string };
  /** Normenkette von der aktuellen Fassung zurück zum Regime (BGH-Stil). */
  normenkette: string[];
  /** Durchbrechungen, die trotz Versteinerung gelten (agentisch zu vertiefen). */
  durchbrechungen: Durchbrechung[];
  /** Ist der Volltext dieser Fassung im lokalen Normgraph verfügbar? */
  volltext_verfuegbar: boolean;
  hinweise: string[];
}

export async function resolveUebergangsrecht(ibnDatum: string, stichtag?: string): Promise<UebergangsrechtErgebnis> {
  const daten = await ladeUebergangsrecht();
  const heute = stichtag ?? new Date().toISOString().slice(0, 10);

  const regime = daten.fassungen.find(
    (f) => f.ibn_von <= ibnDatum && (f.ibn_bis === null || ibnDatum <= f.ibn_bis),
  );
  if (!regime)
    throw new Error(
      `IBN-Datum ${ibnDatum} liegt vor dem EEG 2000 (01.04.2000) — Altanlagen vor EEG sind nicht modelliert.`,
    );

  const aktuell = daten.fassungen.find((f) => f.ibn_bis === null || heute <= f.ibn_bis) ?? daten.fassungen[daten.fassungen.length - 1]!;

  // Kette: aktuelle Fassung → … → Regime-Fassung, jeweils über die Übergangsnorm
  const kette: string[] = [];
  const idxAktuell = daten.fassungen.findIndex((f) => f.id === aktuell.id);
  const idxRegime = daten.fassungen.findIndex((f) => f.id === regime.id);
  for (let i = idxAktuell; i > idxRegime; i--) {
    const f = daten.fassungen[i]!;
    if (f.uebergangsnorm) kette.push(f.uebergangsnorm);
  }
  kette.push(`→ Vergütungsregime: ${regime.bezeichnung} (Fassung bei IBN ${ibnDatum})`);

  const hinweise: string[] = [
    "Versteinerung nach § 100 Abs. 1 EEG 2023: maßgeblich ist die bei Inbetriebnahme geltende Fassung (BGH XIII ZR 3/24).",
  ];
  const volltext = Boolean(regime.snapshot_verfuegbar);
  if (!volltext)
    hinweise.push(
      `Volltext der Fassung ${regime.bezeichnung} ist im lokalen Normgraphen nicht enthalten (QuantLaw-Archiv beginnt 2019). ` +
        `Quelle: Arbeitsausgabe der Clearingstelle (clearingstelle-eeg-kwkg.de).`,
    );

  return {
    verguetungsregime: { id: regime.id, bezeichnung: regime.bezeichnung },
    normenkette: kette,
    durchbrechungen: daten.durchbrechungen,
    volltext_verfuegbar: volltext,
    hinweise,
  };
}
