/**
 * Deterministische Graph-API (Pattern: "Deterministic Legal Agents",
 * arXiv 2510.06002): kleine, komponierbare Primitive statt freier LLM-Suche.
 */
import { Database } from "bun:sqlite";

export const DB_PFAD = new URL("../../knowledge/normgraph.sqlite", import.meta.url).pathname;

let _db: Database | null = null;
export function oeffneGraph(pfad: string = DB_PFAD): Database {
  if (_db) return _db;
  _db = new Database(pfad, { readonly: true });
  return _db;
}

export interface NormExpression {
  id: number;
  slug: string;
  jurabk: string;
  enbez: string;
  titel: string | null;
  text: string;
  fassung_von: string;
  fassung_bis: string | null;
}

/**
 * Norm in der zum Stichtag geltenden Textfassung.
 * Hinweis: fassung_von/bis sind Snapshot-Daten des QuantLaw-Archivs —
 * Genauigkeit = Snapshot-Raster (siehe pipelines/ingest-gesetze.ts).
 */
export function normAtDate(db: Database, slug: string, enbez: string, datum: string): NormExpression | null {
  return db
    .query<NormExpression, [string, string, string, string]>(
      `SELECT e.*, w.jurabk FROM expression e JOIN work w ON w.slug = e.slug
       WHERE e.slug = ? AND e.enbez = ? AND e.fassung_von <= ?
         AND (e.fassung_bis IS NULL OR e.fassung_bis > ?)
       ORDER BY e.fassung_von DESC LIMIT 1`,
    )
    .get(slug, enbez, datum, datum);
}

/** Alle Fassungen einer Norm (Versionshistorie). */
export function fassungen(db: Database, slug: string, enbez: string): NormExpression[] {
  return db
    .query<NormExpression, [string, string]>(
      `SELECT e.*, w.jurabk FROM expression e JOIN work w ON w.slug = e.slug
       WHERE e.slug = ? AND e.enbez = ? ORDER BY e.fassung_von`,
    )
    .all(slug, enbez);
}

export interface FassungsDiff {
  enbez: string;
  fassung_a: { von: string; bis: string | null };
  fassung_b: { von: string; bis: string | null };
  unveraendert: boolean;
  absaetze_a: string[];
  absaetze_b: string[];
  geaenderte_absaetze: number[]; // Indizes (b-Sicht), die in a fehlen oder abweichen
}

/** Absatzweiser Vergleich zweier Stichtags-Fassungen. */
export function diffFassungen(db: Database, slug: string, enbez: string, datumA: string, datumB: string): FassungsDiff | null {
  const a = normAtDate(db, slug, enbez, datumA);
  const b = normAtDate(db, slug, enbez, datumB);
  if (!a || !b) return null;
  const absA = a.text.split("\n\n");
  const absB = b.text.split("\n\n");
  const setA = new Set(absA);
  const geaendert = absB.map((t, i) => (setA.has(t) ? -1 : i)).filter((i) => i >= 0);
  return {
    enbez,
    fassung_a: { von: a.fassung_von, bis: a.fassung_bis },
    fassung_b: { von: b.fassung_von, bis: b.fassung_bis },
    unveraendert: a.id === b.id,
    absaetze_a: absA,
    absaetze_b: absB,
    geaenderte_absaetze: geaendert,
  };
}

export interface VerweisKante {
  ziel_slug: string | null;
  ziel_jurabk: string | null;
  ziel_enbez: string;
  ziel_absatz: string | null;
  kontext: string;
  tiefe: number;
  von_enbez: string;
}

/**
 * Querverweise einer Norm zum Stichtag, optional mehrstufig (Multi-Hop über
 * aufgelöste Ziele im selben Datenbestand). Zyklen werden über besucht-Set vermieden.
 */
export function crossRefs(db: Database, slug: string, enbez: string, datum: string, tiefe = 1): VerweisKante[] {
  const ergebnis: VerweisKante[] = [];
  const besucht = new Set<string>();
  let frontier: { slug: string; enbez: string }[] = [{ slug, enbez }];

  for (let t = 1; t <= tiefe && frontier.length; t++) {
    const naechste: { slug: string; enbez: string }[] = [];
    for (const knoten of frontier) {
      const key = `${knoten.slug}|${knoten.enbez}`;
      if (besucht.has(key)) continue;
      besucht.add(key);
      const expr = normAtDate(db, knoten.slug, knoten.enbez, datum);
      if (!expr) continue;
      const kanten = db
        .query<Omit<VerweisKante, "tiefe" | "von_enbez">, [number]>(
          `SELECT ziel_slug, ziel_jurabk, ziel_enbez, ziel_absatz, kontext
           FROM querverweis WHERE von_expression = ?`,
        )
        .all(expr.id);
      for (const k of kanten) {
        ergebnis.push({ ...k, tiefe: t, von_enbez: `${knoten.enbez} (${expr.jurabk})` });
        if (k.ziel_slug && !besucht.has(`${k.ziel_slug}|${k.ziel_enbez}`))
          naechste.push({ slug: k.ziel_slug, enbez: k.ziel_enbez });
      }
    }
    frontier = naechste;
  }
  return ergebnis;
}
