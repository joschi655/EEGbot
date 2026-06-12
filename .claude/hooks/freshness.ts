#!/usr/bin/env bun
/**
 * SessionStart-Hook: Freshness-Check der Wissensbasis.
 * Warnt, wenn knowledge/normgraph.sqlite fehlt oder älter als 30 Tage ist —
 * Antworten zu kürzlich geänderten Normen tragen dann einen Aktualitätsvorbehalt.
 */
import { statSync } from "node:fs";

const pfad = new URL("../../knowledge/normgraph.sqlite", import.meta.url).pathname;
let meldung = "";
try {
  const alterTage = Math.floor((Date.now() - statSync(pfad).mtimeMs) / 86_400_000);
  if (alterTage > 30)
    meldung = `[FRESHNESS] Die lokale Wissensbasis ist ${alterTage} Tage alt. EEG/EnWG ändern sich mehrmals jährlich — \`bun run build:knowledge\` ausführen und bis dahin Antworten zu möglichen Novellen-Themen mit Aktualitätsvorbehalt versehen.`;
} catch {
  meldung =
    "[FRESHNESS] Wissensbasis fehlt (knowledge/normgraph.sqlite). Vor inhaltlicher Arbeit `bun run build:knowledge` ausführen — ohne Normgraph keine versionsgenauen Zitate.";
}
if (meldung) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: meldung } }));
process.exit(0);
