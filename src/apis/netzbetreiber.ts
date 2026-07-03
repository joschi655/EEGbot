/**
 * PLZ → zuständiger Verteilnetzbetreiber (VNB) — deterministische HEURISTIK
 * über offene MaStR-Daten: Für die PLZ registrierte Stromerzeugungseinheiten
 * tragen ihren Anschluss-Netzbetreiber (`NetzbetreiberNamen`); der häufigste
 * Netzbetreiber der Stichprobe ist mit hoher Wahrscheinlichkeit der
 * gebietszuständige VNB (Gebietsmonopol im Verteilnetz).
 *
 * Grenzen ehrlich ausgewiesen: Es ist eine Stichproben-Heuristik, keine
 * amtliche Gebietsauskunft (die existiert nicht als offene API). An
 * PLZ-Gebietsgrenzen können mehrere VNB erscheinen — deshalb liefern wir
 * die Verteilung mit, nicht nur den Spitzenreiter.
 *
 * Live-API bleibt außerhalb der puren Fahrplan-Engine — Aufrufer sind die
 * Ränder (ui/server.ts, MCP eeg-daten), mit try/catch und Timeout.
 * Datenquelle: Marktstammdatenregister, DL-DE-BY-2.0 (© Bundesnetzagentur).
 */

export interface NetzbetreiberTreffer {
  name: string;
  mastr_nr?: string;
  anzahl: number;
  anteil_prozent: number;
}

export interface NetzbetreiberErgebnis {
  plz: string;
  netzbetreiber: NetzbetreiberTreffer[];
  stichprobe: number;
  quelle: string;
  hinweis: string;
}

export type FetchFn = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

const MASTR_URL =
  "https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetErweiterteOeffentlicheEinheitStromerzeugung";
const STICHPROBE_MAX = 50;

const defaultFetch: FetchFn = async (url) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    return await fetch(url, { headers: { "user-agent": "eegbot (open source)" }, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
};

/** "SWM Infrastruktur GmbH ＆ Co. KG (SNB969473762610)" → Name + MaStR-Nr., HTML-/Fullwidth-bereinigt. */
function parseNetzbetreiber(roh: string): { name: string; mastr_nr?: string } {
  const bereinigt = roh
    .replace(/<[^>]*>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("＆", "&")
    .trim();
  const m = bereinigt.match(/^(.*?)\s*\((SNB[A-Z0-9]+)\)\s*$/);
  return m ? { name: m[1]!.trim(), mastr_nr: m[2] } : { name: bereinigt };
}

// In-Flight-Promise cachen (nicht erst das Ergebnis): nebenläufige Erstaufrufe
// derselben PLZ teilen sich EINE Anfrage (Cato-Fund). Fehler entfernen den
// Eintrag wieder — kein Cache-Poisoning.
const _cache = new Map<string, Promise<NetzbetreiberErgebnis>>();

export function netzbetreiberFuerPlz(
  plz: string,
  opts: { fetchFn?: FetchFn } = {},
): Promise<NetzbetreiberErgebnis> {
  const sauber = plz.trim();
  if (!/^\d{5}$/.test(sauber)) return Promise.reject(new Error(`Ungültige PLZ „${plz}" — erwartet werden 5 Ziffern.`));
  const laufend = _cache.get(sauber);
  if (laufend) return laufend;
  const versprechen = _hole(sauber, opts).catch((e) => {
    _cache.delete(sauber);
    throw e;
  });
  _cache.set(sauber, versprechen);
  return versprechen;
}

async function _hole(sauber: string, opts: { fetchFn?: FetchFn }): Promise<NetzbetreiberErgebnis> {
  const fetchFn = opts.fetchFn ?? defaultFetch;
  const url =
    `${MASTR_URL}?sort=InbetriebnahmeDatum-desc&page=1&pageSize=${STICHPROBE_MAX}` +
    `&filter=${encodeURIComponent(`Postleitzahl~eq~'${sauber}'`)}`;

  let data: { Data?: Record<string, unknown>[] };
  try {
    const res = await fetchFn(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = (await res.json()) as { Data?: Record<string, unknown>[] };
  } catch (e) {
    throw new Error(
      `Marktstammdatenregister nicht erreichbar (${e instanceof Error ? e.message : e}) — Netzbetreiber-Auskunft später erneut versuchen; der Fahrplan funktioniert auch ohne.`,
    );
  }

  const zaehler = new Map<string, { name: string; mastr_nr?: string; anzahl: number }>();
  let stichprobe = 0;
  const einheiten = Array.isArray(data.Data) ? data.Data : [];
  for (const einheit of einheiten) {
    const roh = einheit.NetzbetreiberNamen;
    if (typeof roh !== "string") continue;
    const nb = parseNetzbetreiber(roh);
    // Leerheit NACH der HTML-Bereinigung prüfen — sonst zählt "<br/>" als Phantom-Treffer.
    if (nb.name === "") continue;
    stichprobe++;
    const schluessel = nb.mastr_nr ?? nb.name;
    const eintrag = zaehler.get(schluessel);
    if (eintrag) eintrag.anzahl++;
    else zaehler.set(schluessel, { ...nb, anzahl: 1 });
  }

  const netzbetreiber = [...zaehler.values()]
    .sort((a, b) => b.anzahl - a.anzahl)
    .map((nb) => ({ ...nb, anteil_prozent: stichprobe ? Math.round((nb.anzahl / stichprobe) * 100) : 0 }));

  const ergebnis: NetzbetreiberErgebnis = {
    plz: sauber,
    netzbetreiber,
    stichprobe,
    quelle: "Marktstammdatenregister (DL-DE-BY-2.0, © Bundesnetzagentur)",
    hinweis:
      netzbetreiber.length === 0
        ? "Keine registrierten Einheiten mit Netzbetreiber-Angabe in dieser PLZ gefunden — Netzbetreiber bitte über die letzte Stromrechnung oder den Vermieter klären."
        : "Heuristik über die Anschluss-Netzbetreiber registrierter Anlagen in dieser PLZ — vermutlich zuständig, keine amtliche Gebietsauskunft. An PLZ-Grenzen können mehrere Netzbetreiber vorkommen.",
  };
  return ergebnis;
}

/** Nur für Tests: Prozess-Cache leeren. */
export function _leereNetzbetreiberCache(): void {
  _cache.clear();
}
