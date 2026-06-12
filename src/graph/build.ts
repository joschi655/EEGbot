/**
 * Temporaler Normgraph (SAT-Graph-RAG-Pattern, arXiv 2505.00039):
 *  - Work          = das Gesetz als abstrakte Einheit (eeg_2014, enwg_2005 …)
 *  - Expression    = eine Norm in einer konkreten Textfassung mit Gültigkeits-
 *                    fenster (aus aufeinanderfolgenden Snapshots kollabiert:
 *                    neuer Knoten nur bei Textänderung)
 *  - Querverweis   = extrahierte "§ X Abs. Y [Gesetz]"-Kante je Expression
 *
 * Storage: bun:sqlite — kein externer Graph-Server, Traversierung über
 * rekursive CTEs bzw. einfache Joins.
 */
import { Database } from "bun:sqlite";
import type { GesetzFassung } from "../../pipelines/lib/gii.ts";

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS work (
  slug TEXT PRIMARY KEY,
  jurabk TEXT NOT NULL,
  langtitel TEXT
);
CREATE TABLE IF NOT EXISTS expression (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES work(slug),
  enbez TEXT NOT NULL,            -- "§ 24", "Anlage 1"
  titel TEXT,
  text TEXT NOT NULL,             -- Absaetze durch Leerzeile getrennt
  text_hash TEXT NOT NULL,
  fassung_von TEXT NOT NULL,      -- Snapshot-Datum (erste Sichtung dieses Texts)
  fassung_bis TEXT,               -- letzter Snapshot vor Änderung; NULL = aktuell
  UNIQUE(slug, enbez, fassung_von)
);
CREATE INDEX IF NOT EXISTS idx_expr_lookup ON expression(slug, enbez, fassung_von);
CREATE TABLE IF NOT EXISTS querverweis (
  von_expression INTEGER NOT NULL REFERENCES expression(id),
  ziel_slug TEXT,                 -- NULL = nicht aufgelöst (externes/unbekanntes Gesetz)
  ziel_jurabk TEXT,               -- wie im Text genannt ("EnWG", "EEG 2021", …)
  ziel_enbez TEXT NOT NULL,       -- "§ 51"
  ziel_absatz TEXT,
  kontext TEXT                    -- ±80 Zeichen um die Fundstelle
);
CREATE INDEX IF NOT EXISTS idx_qv_von ON querverweis(von_expression);
CREATE INDEX IF NOT EXISTS idx_qv_ziel ON querverweis(ziel_slug, ziel_enbez);
`;

/** Bekannte Gesetzes-Nennungen → Work-Slug (für Querverweis-Auflösung). */
const GESETZ_ALIASE: [RegExp, string][] = [
  [/Erneuerbare-Energien-Gesetz(es)?|EEG(\s?\d{4})?/i, "eeg_2014"],
  [/Energiewirtschaftsgesetz(es)?|EnWG/i, "enwg_2005"],
  [/Messstellenbetriebsgesetz(es)?|MsbG/i, "messbg"],
  [/Kraft-Wärme-Kopplungsgesetz(es)?|KWKG/i, "kwkg_2016"],
  [/Windenergieflächenbedarfsgesetz(es)?|WindBG/i, "windbg"],
  [/Rechtsdienstleistungsgesetz(es)?|RDG/i, "rdg"],
];

export interface RohVerweis {
  ziel_slug: string | null;
  ziel_jurabk: string | null;
  ziel_enbez: string;
  ziel_absatz: string | null;
  kontext: string;
}

/**
 * Extrahiert Paragraphen-Verweise aus Normtext.
 * Muster: "§ 21b Absatz 1 Nummer 2", "§ 9 Abs. 1 und 2", "§§ 100 bis 104",
 * optional gefolgt von einer Gesetzesnennung ("… des Energiewirtschaftsgesetzes").
 * Ohne Nennung gilt der Verweis als gesetzesintern (eigener Slug).
 */
export function extrahiereVerweise(text: string, eigenerSlug: string): RohVerweis[] {
  const verweise: RohVerweis[] = [];
  const re = /§§?\s*(\d+[a-z]?)((?:\s*(?:,|und|bis|oder)\s*\d+[a-z]?)*)\s*((?:Absatz|Abs\.)\s*\d+[a-z]?(?:\s*(?:Satz|S\.)\s*\d+)?)?/g;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    const nach = text.slice(idx, idx + 160);
    const kontext = text.slice(Math.max(0, idx - 80), idx + 80).trim();

    // Gesetzesnennung im Nachlauf? (z. B. "… des Energiewirtschaftsgesetzes")
    let zielSlug: string | null = eigenerSlug;
    let zielJurabk: string | null = null;
    const nennung = nach.match(/des\s+([A-ZÄÖÜ][\wäöüß-]+gesetz(?:es)?(?:\s+\d{4})?)|(?:EEG|EnWG|MsbG|KWKG|WindBG|RDG)(?:\s?\d{4})?/);
    if (nennung && (nennung.index ?? 99) < 120) {
      const genannt = nennung[0];
      zielJurabk = genannt;
      zielSlug = null;
      for (const [alias, slug] of GESETZ_ALIASE)
        if (alias.test(genannt)) {
          zielSlug = slug;
          break;
        }
    }

    const absatz = m[3] ? m[3].replace(/Abs\./, "Absatz").replace(/\s+/g, " ").trim() : null;
    // Erste Nummer immer; Aufzählungen ("§§ 100 bis 104") als Einzelverweise
    const nummern = [m[1]!, ...(m[2] ?? "").split(/,|und|bis|oder/).map((s) => s.trim()).filter((s) => /^\d+[a-z]?$/.test(s))];
    for (const nr of nummern)
      verweise.push({ ziel_slug: zielSlug, ziel_jurabk: zielJurabk, ziel_enbez: `§ ${nr}`, ziel_absatz: absatz, kontext });
  }
  return verweise;
}

function hash(text: string): string {
  return Bun.hash(text).toString(16);
}

/**
 * Baut den Graphen aus allen Fassungs-JSONs eines Gesetzes (chronologisch sortiert).
 * Kollabierung: gleicher Text über mehrere Snapshots = eine Expression;
 * Textänderung schließt die alte Expression (fassung_bis) und öffnet eine neue.
 */
export function ingestFassungen(db: Database, fassungen: GesetzFassung[]): void {
  if (!fassungen.length) return;
  const sortiert = [...fassungen].sort((a, b) => a.snapshot.localeCompare(b.snapshot));
  const erste = sortiert[0]!;

  db.run(`INSERT OR REPLACE INTO work (slug, jurabk, langtitel) VALUES (?, ?, ?)`, [
    erste.slug,
    sortiert[sortiert.length - 1]!.jurabk,
    sortiert[sortiert.length - 1]!.langtitel,
  ]);

  const insertExpr = db.prepare(
    `INSERT INTO expression (slug, enbez, titel, text, text_hash, fassung_von, fassung_bis)
     VALUES (?, ?, ?, ?, ?, ?, NULL) RETURNING id`,
  );
  const schliesse = db.prepare(`UPDATE expression SET fassung_bis = ? WHERE id = ?`);
  const insertQv = db.prepare(
    `INSERT INTO querverweis (von_expression, ziel_slug, ziel_jurabk, ziel_enbez, ziel_absatz, kontext)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  /** je enbez: aktuell offene Expression */
  const offen = new Map<string, { id: number; hash: string; seitSnapshot: string }>();

  for (const fassung of sortiert) {
    const gesehen = new Set<string>();
    for (const norm of fassung.normen) {
      gesehen.add(norm.enbez);
      const text = norm.absaetze.join("\n\n");
      const h = hash(text);
      const aktuell = offen.get(norm.enbez);
      if (aktuell?.hash === h) continue; // unverändert

      if (aktuell) schliesse.run(fassung.snapshot, aktuell.id); // Text geändert → alte schließen
      const row = insertExpr.get(fassung.slug, norm.enbez, norm.titel, text, h, fassung.snapshot) as { id: number };
      offen.set(norm.enbez, { id: row.id, hash: h, seitSnapshot: fassung.snapshot });

      for (const v of extrahiereVerweise(text, fassung.slug))
        insertQv.run(row.id, v.ziel_slug, v.ziel_jurabk, v.ziel_enbez, v.ziel_absatz, v.kontext);
    }
    // Normen, die in dieser Fassung weggefallen sind → schließen
    for (const [enbez, expr] of offen)
      if (!gesehen.has(enbez)) {
        schliesse.run(fassung.snapshot, expr.id);
        offen.delete(enbez);
      }
  }
}
