#!/usr/bin/env bun
/** Baut den Suchindex (knowledge/index/normen.json) aus dem Normgraphen. */
import { Database } from "bun:sqlite";
import { DB_PFAD } from "../src/graph/query.ts";
import { neuerIndex, speichereIndex, type NormChunk } from "../src/rag/suche.ts";

const db = new Database(DB_PFAD, { readonly: true });
const index = neuerIndex();

const rows = db
  .query<{ id: number; slug: string; jurabk: string; enbez: string; titel: string | null; text: string; fassung_von: string; fassung_bis: string | null }, []>(
    `SELECT e.id, e.slug, w.jurabk, e.enbez, e.titel, e.text, e.fassung_von, e.fassung_bis
     FROM expression e JOIN work w ON w.slug = e.slug`,
  )
  .all();

let chunks = 0;
for (const r of rows) {
  const absaetze = r.text.split("\n\n");
  const docs: NormChunk[] = absaetze.map((text, i) => ({
    id: `${r.id}:${i}`,
    slug: r.slug,
    jurabk: r.jurabk,
    enbez: r.enbez,
    titel: r.titel ?? "",
    absatz_nr: i + 1,
    text,
    fassung_von: r.fassung_von,
    fassung_bis: r.fassung_bis,
  }));
  index.addAll(docs);
  chunks += docs.length;
}

await speichereIndex(index);
console.log(`Suchindex: ${rows.length} Expressions → ${chunks} Absatz-Chunks → knowledge/index/normen.json`);
