#!/usr/bin/env bun
/**
 * Benchmark-Runner: führt die deterministischen Fragen aus evals/benchmark/
 * fragen.yaml gegen die Engines aus und vergleicht mit den Goldwerten.
 * Zusätzlich: RDG-Ampel-Autotest (klassifiziere(frage) vs. ampel_erwartung —
 * "Die Klassifikation ist der eigentliche Test") und Ingestion der Session-Judge-
 * Ergebnisse (evals/benchmark/judge-ergebnisse.json, Skill "Benchmark").
 * Interpretative Fragen ohne Judge-Lauf werden gelistet (manuelle Bewertung).
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
import { klassifiziere } from "../src/rules/guardrailClassifier.ts";
import { programmauskunft } from "../src/rules/programmauskunft.ts";
import { JudgeErgebnisse } from "../src/schemas/judge.ts";
import {
  AnlagenzusammenfassungInputSchema,
  AusgefoerderteInputSchema,
  FristenInputSchema,
  ProgrammauskunftInputSchema,
  Sanktion52InputSchema,
  SchwellenInputSchema,
  SolarspitzenInputSchema,
  VerguetungInputSchema,
} from "../src/schemas/rechner.ts";

interface Goldwert {
  pfad: string;
  wert: unknown;
}

interface Frage {
  id: string;
  typ: "deterministisch" | "interpretativ";
  pruefung?: "schema" | "auslegung" | "rdg_grenze";
  ampel_erwartung?: "gruen" | "gelb" | "rot";
  frage: string;
  engine?: string;
  input?: Record<string, unknown>;
  erwartet?: Goldwert | Goldwert[];
  erwartet_fehler?: string;
  fehlermodell?: "falsche_fassung" | "falsche_schwelle" | "fehlende_eingabe";
  gold_antwort?: string;
  bewertungskriterien?: string[];
  quelle?: string;
}

const fragenPfad = new URL("./benchmark/fragen.yaml", import.meta.url).pathname;
const fragen = parse(await Bun.file(fragenPfad).text()) as Frage[];

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
  programmauskunft: (i) => programmauskunft(ProgrammauskunftInputSchema.parse(i)),
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
  const erwartetLeer = Array.isArray(f.erwartet) && f.erwartet.length === 0;
  if (!engine || erwartetLeer || (!f.erwartet && !f.erwartet_fehler)) {
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
    if (!f.erwartet) throw new Error("Interner Benchmarkfehler: Goldwert fehlt");
    const goldwerte = Array.isArray(f.erwartet) ? f.erwartet : [f.erwartet];
    const abweichung = goldwerte.find((g) => {
      const ist = feldWert(ergebnis, g.pfad);
      return typeof g.wert === "number" && typeof ist === "number" ? Math.abs(ist - g.wert) >= 0.005 : ist !== g.wert;
    });
    if (!abweichung) {
      console.log(`✓ ${f.id}: ${f.frage.slice(0, 70)}…`);
      bestanden++;
    } else {
      console.error(
        `✗ ${f.id}: erwartet ${JSON.stringify(abweichung.wert)} an '${abweichung.pfad}', erhalten ${JSON.stringify(feldWert(ergebnis, abweichung.pfad))}`,
      );
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

// ── RDG-Ampel-Autotest ────────────────────────────────────────────────────
// Deterministisch und flake-frei: Classifier + Policy + Fragetexte liegen im Repo.
// Ein Mismatch heißt immer, dass Policy, Fragetext oder Erwartung inkonsistent
// geändert wurden — genau das soll CI stoppen.
let ampelOk = 0;
let ampelFehler = 0;
for (const f of fragen) {
  if (!f.ampel_erwartung) {
    console.error(`✗ Ampel ${f.id}: ampel_erwartung fehlt`);
    ampelFehler++;
    continue;
  }
  const befund = await klassifiziere(f.frage);
  if (befund.ampel === f.ampel_erwartung) {
    ampelOk++;
  } else {
    const treffer = befund.kategorien.length
      ? ` (Treffer: ${befund.kategorien.map((k) => `${k.id}:'${k.treffer}'`).join(", ")})`
      : " (kein Muster)";
    console.error(`✗ Ampel ${f.id}: erwartet ${f.ampel_erwartung}, klassifiziert ${befund.ampel}${treffer}`);
    ampelFehler++;
  }
}
console.log(`Ampel-Autotest: ${ampelOk}/${fragen.length} korrekt`);
fehlgeschlagen += ampelFehler;

// ── Interpretativ: Session-Judge-Ergebnisse (optional, kein API-Key) ──────
// Erzeugt vom Skill "Benchmark" in einer Claude-Code-Session. Failt CI nur mit
// EEGBOT_JUDGE_STRICT=1 (Pre-Pitch-Gate) — LLM-erzeugt, session-abhängig, optional.
const strict = process.env["EEGBOT_JUDGE_STRICT"] === "1";
const judgePfad = new URL("./benchmark/judge-ergebnisse.json", import.meta.url).pathname;
if (await Bun.file(judgePfad).exists()) {
  try {
    const judge = JudgeErgebnisse.parse(JSON.parse(await Bun.file(judgePfad).text()));
    const hasher = new Bun.CryptoHasher("sha256");
    hasher.update(await Bun.file(fragenPfad).text());
    const stale = judge.fragen_yaml_sha256 !== hasher.digest("hex");
    console.log(
      `\n── Interpretativ (Judge-Session vom ${judge.erstellt_am}, sha ${stale ? "✗ VERALTET" : "✓"}) ──`,
    );
    if (stale) console.warn("⚠ judge-ergebnisse.json passt nicht zum aktuellen fragen.yaml — Ergebnisse nur informativ.");
    let judgeBestanden = 0;
    let judgeFehler = 0;
    let judgeOffen = 0;
    for (const f of interpretativ) {
      const erg = judge.ergebnisse.find((e) => e.id === f.id);
      if (!erg) {
        console.log(`∅ ${f.id}: kein Judge-Ergebnis`);
        judgeOffen++;
        continue;
      }
      const erfuellt = erg.kriterien.filter((k) => k.erfuellt).length;
      const ampelHinweis = f.ampel_erwartung
        ? ` · Ampel beobachtet: ${erg.ampel_beobachtet} (erwartet ${f.ampel_erwartung})`
        : "";
      if (erg.bestanden) {
        console.log(`✓ ${f.id}: ${erfuellt}/${erg.kriterien.length} Kriterien${ampelHinweis}`);
        judgeBestanden++;
      } else {
        const verletzt = erg.kriterien.filter((k) => !k.erfuellt).map((k) => `"${k.kriterium}"`).join(", ");
        console.error(`✗ ${f.id}: ${erfuellt}/${erg.kriterien.length} Kriterien — verletzt: ${verletzt}${ampelHinweis}`);
        judgeFehler++;
      }
    }
    console.log(`Interpretativ: ${judgeBestanden}/${interpretativ.length} bestanden, ${judgeOffen} offen`);
    if (strict) fehlgeschlagen += judgeFehler + judgeOffen + (stale ? 1 : 0);
  } catch (e) {
    console.error(`✗ judge-ergebnisse.json unlesbar: ${e instanceof Error ? e.message : e}`);
    if (strict) fehlgeschlagen++;
  }
} else {
  console.log(
    `Interpretativ (kein Judge-Lauf — Skill "Benchmark" ausführen oder manuell bewerten): ${interpretativ.length} Fragen — ${interpretativ.map((f) => f.id).join(", ")}`,
  );
  if (strict) fehlgeschlagen += interpretativ.length;
}

process.exit(fehlgeschlagen ? 1 : 0);
