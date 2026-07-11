#!/usr/bin/env bun
/**
 * EEG-2027-Zeitmaschine — erzeugt aus dem letzten echten Gesetzes-Snapshot und
 * den kuratierten Entwurfs-Änderungen (data/entwuerfe/eeg-2027-refe.json) einen
 * VOLLSTÄNDIGEN Entwurfs-Snapshot knowledge/gesetze/eeg_2014/2027-01-01.json.
 *
 * Vollständig ist Pflicht: die Ingestion (src/graph/build.ts) schließt Normen,
 * die in einem Snapshot fehlen — ein Teil-Snapshot würde alle nicht kuratierten
 * Normen zum 01.01.2027 „beenden". Unveränderte Normen behalten identischen
 * Text und kollabieren daher in dieselbe Expression (kein neues Gültigkeitsende).
 *
 * Der Entwurf ist KEIN geltendes Recht: jede geänderte/neue/aufgehobene Norm
 * trägt den ENTWURF-Marker in Titel und erstem Absatz (sinngemäße Wiedergabe,
 * kein amtlicher Wortlaut). Aufgehobene Normen bleiben als Tombstone abfragbar.
 *
 * Danach: bun run build:eeg2027 baut Graph + Index neu — Stichtags-Queries mit
 * Datum ≥ 2027-01-01 sehen den Entwurf, Queries für heute weiterhin das
 * geltende Recht (normAtDate/sucheNormen sind stichtagsbasiert).
 */
import { readdirSync } from "node:fs";
import type { GesetzFassung, Norm } from "./lib/gii.ts";

interface EntwurfAenderung {
  enbez: string;
  aktion: "ersetzen" | "neu" | "aufheben";
  titel?: string;
  absaetze?: string[];
  quelle: string;
}
interface EntwurfDatei {
  stand: string;
  snapshot: string;
  hinweis: string;
  quellen: { bezeichnung: string; url: string }[];
  aenderungen: EntwurfAenderung[];
}

const GESETZ_DIR = new URL("../knowledge/gesetze/eeg_2014/", import.meta.url).pathname;
const ENTWURF_PFAD = new URL("../data/entwuerfe/eeg-2027-refe.json", import.meta.url).pathname;

const entwurf = (await Bun.file(ENTWURF_PFAD).json()) as EntwurfDatei;

// Basis: letzter echter Snapshot (Entwurfs-Datei selbst ausgenommen)
let basisDateien: string[] = [];
try {
  basisDateien = readdirSync(GESETZ_DIR)
    .filter((f) => f.endsWith(".json") && f !== `${entwurf.snapshot}.json`)
    .sort();
} catch {
  console.error("knowledge/gesetze/eeg_2014/ fehlt — zuerst `bun run ingest:gesetze` ausführen.");
  process.exit(1);
}
if (basisDateien.length === 0) {
  console.error("Kein Basis-Snapshot gefunden — zuerst `bun run ingest:gesetze` ausführen.");
  process.exit(1);
}
const basisDatei = basisDateien[basisDateien.length - 1]!;
const basis = (await Bun.file(`${GESETZ_DIR}${basisDatei}`).json()) as GesetzFassung;

const marker = (quelle: string) =>
  `⚠️ ENTWURF — KEIN GELTENDES RECHT. Sinngemäße Wiedergabe nach ${entwurf.stand}; ` +
  `kein amtlicher Wortlaut. Quelle: ${quelle}.`;

const normen = new Map<string, Norm>(basis.normen.map((n) => [n.enbez, n]));
let fehler = 0;

for (const a of entwurf.aenderungen) {
  const vorhanden = normen.has(a.enbez);
  if (a.aktion === "neu" && vorhanden) {
    console.error(`✗ ${a.enbez}: aktion "neu", existiert aber schon im Basis-Snapshot ${basis.snapshot}`);
    fehler++;
    continue;
  }
  if (a.aktion !== "neu" && !vorhanden) {
    console.error(`✗ ${a.enbez}: aktion "${a.aktion}", fehlt aber im Basis-Snapshot ${basis.snapshot}`);
    fehler++;
    continue;
  }

  if (a.aktion === "aufheben") {
    normen.set(a.enbez, {
      enbez: a.enbez,
      titel: `[ENTWURF EEG 2027] (aufgehoben) ${normen.get(a.enbez)!.titel}`.trim(),
      absaetze: [marker(a.quelle), "(aufgehoben durch Artikel 1 EEG 2027 — Referentenentwurf; sinngemäß)"],
    });
  } else {
    if (!a.absaetze?.length || !a.titel) {
      console.error(`✗ ${a.enbez}: aktion "${a.aktion}" braucht titel + absaetze`);
      fehler++;
      continue;
    }
    normen.set(a.enbez, {
      enbez: a.enbez,
      titel: `[ENTWURF EEG 2027] ${a.titel}`,
      absaetze: [marker(a.quelle), ...a.absaetze],
    });
  }
  console.log(`✓ ${a.enbez} (${a.aktion})`);
}

if (fehler > 0) process.exit(1);

// §-Normen numerisch einsortieren, damit neue §§ (20a/20b) an plausibler Stelle liegen
const kern = (e: string) => {
  const m = e.match(/^§ (\d+)([a-z]?)/);
  return m ? [Number(m[1]), m[2] ?? ""] as const : ([Number.MAX_SAFE_INTEGER, e] as const);
};
const sortiert = [...normen.values()].sort((a, b) => {
  const [na, sa] = kern(a.enbez);
  const [nb, sb] = kern(b.enbez);
  return na - nb || sa.localeCompare(sb);
});

const fassung: GesetzFassung = { ...basis, snapshot: entwurf.snapshot, normen: sortiert };
const ziel = `${GESETZ_DIR}${entwurf.snapshot}.json`;
await Bun.write(ziel, JSON.stringify(fassung, null, 1));
console.log(
  `\nEntwurfs-Snapshot geschrieben: ${ziel}\n` +
    `Basis: ${basis.snapshot} (${basis.normen.length} Normen) → Entwurf: ${sortiert.length} Normen ` +
    `(${entwurf.aenderungen.length} kuratierte Änderungen)\n` +
    `Jetzt Graph + Index neu bauen: bun run build:eeg2027`,
);
