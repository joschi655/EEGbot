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
import { pruefeSolarspitzen } from "../src/rules/solarspitzen.ts";
import { vergleicheAusgefoerderteOptionen } from "../src/rules/ausgefoerderte.ts";
import { resolveUebergangsrecht } from "../src/graph/uebergangsrecht.ts";
import {
  AnlagenzusammenfassungInputSchema,
  AusgefoerderteInputSchema,
  FristenInputSchema,
  Sanktion52InputSchema,
  SchwellenInputSchema,
  SolarspitzenInputSchema,
  VerguetungInputSchema,
} from "../src/schemas/rechner.ts";

interface Frage {
  id: string;
  typ: "deterministisch" | "interpretativ";
  frage: string;
  engine?: string;
  input?: Record<string, unknown>;
  erwartet?: { pfad: string; wert: unknown };
  erwartet_fehler?: string;
  fehlermodell?: "falsche_fassung" | "falsche_schwelle" | "fehlende_eingabe";
  quelle?: string;
}

const fragen = parse(await Bun.file(new URL("./benchmark/fragen.yaml", import.meta.url).pathname).text()) as Frage[];

// Engine-Dispatch — "schwellen" liefert Array → für Vergleich auf Map reduziert
const ENGINES: Record<string, (input: Record<string, unknown>) => Promise<unknown>> = {
  sanktion52: (i) => berechneSanktion52(Sanktion52InputSchema.parse(i)),
  verguetung: (i) => berechneVerguetung(VerguetungInputSchema.parse(i)),
  zusammenfassung: async (i) => {
    const { anlage_a, anlage_b } = AnlagenzusammenfassungInputSchema.parse(i);
    return pruefeZusammenfassung(anlage_a, anlage_b);
  },
  fristen: async (i) => pruefeFristen(FristenInputSchema.parse(i)),
  schwellen: async (i) => {
    const befunde = pruefeSchwellen(SchwellenInputSchema.parse(i));
    return {
      direktvermarktung: befunde.find((b) => b.thema === "Direktvermarktungspflicht")?.zutreffend,
      steckersolar: befunde.find((b) => b.thema === "Steckersolargerät")?.zutreffend,
      befunde,
    };
  },
  solarspitzen: async (i) => pruefeSolarspitzen(SolarspitzenInputSchema.parse(i)),
  ausgefoerderte: (i) => vergleicheAusgefoerderteOptionen(AusgefoerderteInputSchema.parse(i)),
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
  if (!engine || (!f.erwartet && !f.erwartet_fehler)) {
    console.error(`✗ ${f.id}: unbekannte Engine '${f.engine}' oder kein Goldwert/Goldfehler`);
    fehlgeschlagen++;
    continue;
  }
  try {
    const ergebnis = await engine(f.input ?? {});
    if (f.erwartet_fehler) {
      console.error(`✗ ${f.id}: erwarteter Fehler '${f.erwartet_fehler}', Engine akzeptierte die Eingabe`);
      fehlgeschlagen++;
      continue;
    }
    const erwartet = f.erwartet;
    if (!erwartet) throw new Error("Interner Benchmarkfehler: Goldwert fehlt");
    const ist = feldWert(ergebnis, erwartet.pfad);
    const soll = erwartet.wert;
    const ok = typeof soll === "number" && typeof ist === "number" ? Math.abs(ist - soll) < 0.005 : ist === soll;
    if (ok) {
      console.log(`✓ ${f.id}: ${f.frage.slice(0, 70)}…`);
      bestanden++;
    } else {
      console.error(`✗ ${f.id}: erwartet ${JSON.stringify(soll)} an '${erwartet.pfad}', erhalten ${JSON.stringify(ist)}`);
      fehlgeschlagen++;
    }
  } catch (e) {
    const meldung = e instanceof Error ? e.message : String(e);
    if (f.erwartet_fehler && meldung.includes(f.erwartet_fehler)) {
      console.log(`✓ ${f.id}: erwartete Ablehnung (${f.fehlermodell ?? "Fehlermodell"})`);
      bestanden++;
    } else {
      console.error(`✗ ${f.id}: Engine-Fehler — ${meldung}`);
      fehlgeschlagen++;
    }
  }
}

console.log(`\nDeterministisch: ${bestanden}/${bestanden + fehlgeschlagen} bestanden`);
console.log(`Interpretativ (manuelle Bewertung anhand der Kriterien in fragen.yaml): ${interpretativ.length} Fragen — ${interpretativ.map((f) => f.id).join(", ")}`);
process.exit(fehlgeschlagen ? 1 : 0);
