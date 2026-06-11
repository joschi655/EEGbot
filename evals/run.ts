#!/usr/bin/env bun
/**
 * Benchmark-Runner: führt die deterministischen Fragen aus evals/benchmark/
 * fragen.yaml gegen die Engines aus und vergleicht mit den Goldwerten.
 * Interpretative Fragen werden gelistet (manuelle Bewertung / LLM-Judge-Roadmap).
 */
import { parse } from "yaml";
import { feldWert } from "../src/lib/bedingung.ts";
import { berechneSanktion52 } from "../src/rules/sanktion52.ts";
import { berechneVerguetung } from "../src/rules/verguetung.ts";
import { pruefeZusammenfassung } from "../src/rules/anlagenzusammenfassung.ts";
import { pruefeFristen } from "../src/rules/fristen.ts";
import { pruefeSchwellen } from "../src/rules/schwellen.ts";
import { vergleicheAusgefoerderteOptionen } from "../src/rules/ausgefoerderte.ts";
import { resolveUebergangsrecht } from "../src/graph/uebergangsrecht.ts";

interface Frage {
  id: string;
  typ: "deterministisch" | "interpretativ";
  frage: string;
  engine?: string;
  input?: Record<string, unknown>;
  erwartet?: { pfad: string; wert: unknown };
  quelle?: string;
}

const fragen = parse(await Bun.file(new URL("./benchmark/fragen.yaml", import.meta.url).pathname).text()) as Frage[];

// Engine-Dispatch — "schwellen" liefert Array → für Vergleich auf Map reduziert
const ENGINES: Record<string, (input: Record<string, unknown>) => Promise<unknown>> = {
  sanktion52: (i) => berechneSanktion52(i as never),
  verguetung: (i) => berechneVerguetung(i as never),
  zusammenfassung: async (i) => pruefeZusammenfassung((i as never)["anlage_a"], (i as never)["anlage_b"]),
  fristen: async (i) => pruefeFristen(i as never),
  schwellen: async (i) => {
    const befunde = pruefeSchwellen(i as never);
    return {
      direktvermarktung: befunde.find((b) => b.thema === "Direktvermarktungspflicht")?.zutreffend,
      steckersolar: befunde.find((b) => b.thema === "Steckersolargerät")?.zutreffend,
      befunde,
    };
  },
  ausgefoerderte: (i) => vergleicheAusgefoerderteOptionen(i as never),
  uebergangsrecht: (i) => resolveUebergangsrecht((i as never)["ibn_datum"], (i as never)["stichtag"]),
};

let bestanden = 0;
let fehlgeschlagen = 0;
const interpretativ: Frage[] = [];

for (const f of fragen) {
  if (f.typ === "interpretativ") {
    interpretativ.push(f);
    continue;
  }
  const engine = ENGINES[f.engine ?? ""];
  if (!engine || !f.erwartet) {
    console.error(`✗ ${f.id}: unbekannte Engine '${f.engine}' oder kein Goldwert`);
    fehlgeschlagen++;
    continue;
  }
  try {
    const ergebnis = await engine(f.input ?? {});
    const ist = feldWert(ergebnis, f.erwartet.pfad);
    const soll = f.erwartet.wert;
    const ok = typeof soll === "number" && typeof ist === "number" ? Math.abs(ist - soll) < 0.005 : ist === soll;
    if (ok) {
      console.log(`✓ ${f.id}: ${f.frage.slice(0, 70)}…`);
      bestanden++;
    } else {
      console.error(`✗ ${f.id}: erwartet ${JSON.stringify(soll)} an '${f.erwartet.pfad}', erhalten ${JSON.stringify(ist)}`);
      fehlgeschlagen++;
    }
  } catch (e) {
    console.error(`✗ ${f.id}: Engine-Fehler — ${e instanceof Error ? e.message : e}`);
    fehlgeschlagen++;
  }
}

console.log(`\nDeterministisch: ${bestanden}/${bestanden + fehlgeschlagen} bestanden`);
console.log(`Interpretativ (manuelle Bewertung anhand der Kriterien in fragen.yaml): ${interpretativ.length} Fragen — ${interpretativ.map((f) => f.id).join(", ")}`);
process.exit(fehlgeschlagen ? 1 : 0);
