#!/usr/bin/env bun
/** Baut knowledge/normgraph.sqlite aus den Fassungs-JSONs in knowledge/gesetze/. */
import { Database } from "bun:sqlite";
import { readdirSync, rmSync } from "node:fs";
import { SCHEMA, ingestFassungen } from "../src/graph/build.ts";
import type { GesetzFassung } from "./lib/gii.ts";

const GESETZE_DIR = new URL("../knowledge/gesetze/", import.meta.url).pathname;
const DB_PFAD = new URL("../knowledge/normgraph.sqlite", import.meta.url).pathname;

rmSync(DB_PFAD, { force: true }); // idempotent: immer frisch bauen
const db = new Database(DB_PFAD);
db.run("PRAGMA journal_mode = WAL");
db.run(SCHEMA);

let slugs: string[] = [];
try {
  slugs = readdirSync(GESETZE_DIR).filter((d) => !d.startsWith("."));
} catch {
  console.error("knowledge/gesetze/ ist leer — zuerst `bun run ingest:gesetze` ausführen.");
  process.exit(1);
}

for (const slug of slugs) {
  const dateien = readdirSync(`${GESETZE_DIR}${slug}`).filter((f) => f.endsWith(".json"));
  const fassungen: GesetzFassung[] = [];
  for (const f of dateien) fassungen.push((await Bun.file(`${GESETZE_DIR}${slug}/${f}`).json()) as GesetzFassung);
  db.transaction(() => ingestFassungen(db, fassungen))();
  const n = db.query<{ c: number }, [string]>("SELECT COUNT(*) c FROM expression WHERE slug = ?").get(slug)!.c;
  console.log(`✓ ${slug}: ${fassungen.length} Snapshots → ${n} Expressions`);
}

const stats = db.query<{ e: number; q: number }, []>(
  "SELECT (SELECT COUNT(*) FROM expression) e, (SELECT COUNT(*) FROM querverweis) q",
).get()!;
console.log(`\nNormgraph: ${stats.e} Expressions, ${stats.q} Querverweise → knowledge/normgraph.sqlite`);
db.close();
