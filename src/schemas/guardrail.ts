import { z } from "zod";

/**
 * Guardrail-Policy (`data/guardrails/policy.yaml`) — deterministische RDG/StBerG-Ampel.
 * Der Classifier (src/rules/guardrailClassifier.ts) matcht Anfrage/Antwort gegen
 * Kategorien; der Hook blockt Rot hart. Gelb ⇒ Compliance-Agent prüft.
 */
export const GuardrailKategorie = z.object({
  id: z.string(),
  ampel: z.enum(["gruen", "gelb", "rot"]),
  beschreibung: z.string(),
  /** Trigger: einfache Substring-/Regex-Muster (deterministisch, kein LLM). */
  muster: z.array(z.string()).min(1),
  regex: z.boolean().default(false),
  begruendung: z.string(), // warum diese Einstufung (RDG §2, StBerG, …)
  eskalation_an: z
    .enum(["anwalt", "steuerberater", "energieberater", "clearingstelle", "netzbetreiber"])
    .optional(),
  ersatztext: z.string().optional(), // was stattdessen gesagt werden darf (rot)
});

export const GuardrailPolicy = z.object({
  version: z.string(),
  default_ampel: z.enum(["gruen", "gelb"]).default("gruen"),
  disclaimer: z.string(), // Standard-Disclaimer für nutzergerichtete Outputs
  kategorien: z.array(GuardrailKategorie).min(1),
});
export type GuardrailPolicy = z.infer<typeof GuardrailPolicy>;
export type GuardrailKategorie = z.infer<typeof GuardrailKategorie>;
