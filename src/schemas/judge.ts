import { z } from "zod";

/**
 * Session-LLM-Judge-Ergebnisse (`evals/benchmark/judge-ergebnisse.json`).
 * Der Judge läuft in einer Claude-Code-Session (Skill "Benchmark", kein API-Key):
 * je interpretativer Frage beantwortet ein frischer Subagent die Frage, der Judge
 * bewertet strikt binär gegen die bewertungskriterien aus fragen.yaml.
 * evals/run.ts liest die Datei, wenn vorhanden, und berichtet die Ergebnisse;
 * fragen_yaml_sha256 erkennt veraltete Läufe.
 */
export const JudgeKriterium = z.object({
  kriterium: z.string(), // Wortlaut aus bewertungskriterien
  erfuellt: z.boolean(),
  kommentar: z.string().optional(),
});
export type JudgeKriterium = z.infer<typeof JudgeKriterium>;

export const JudgeErgebnis = z.object({
  id: z.string().regex(/^b\d{2}$/),
  kriterien: z.array(JudgeKriterium).min(1),
  bestanden: z.boolean(), // alle Kriterien erfüllt
  ampel_beobachtet: z.enum(["gruen", "gelb", "rot"]),
  antwort_auszug: z.string().max(2000),
  kommentar: z.string().optional(),
});
export type JudgeErgebnis = z.infer<typeof JudgeErgebnis>;

export const JudgeErgebnisse = z.object({
  version: z.literal(1),
  erstellt_am: z.string(), // ISO-Datetime
  fragen_yaml_sha256: z.string().length(64),
  bot_beschreibung: z.string(), // Setup des Bot-under-test (Modell, Session-Art)
  ergebnisse: z.array(JudgeErgebnis),
});
export type JudgeErgebnisse = z.infer<typeof JudgeErgebnisse>;
