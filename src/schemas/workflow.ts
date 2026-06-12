import { z } from "zod";
import { Bedingung, Quelle } from "./common.ts";

/**
 * Workflow-Schema (`data/workflows/*.yaml`) — State-Machines, die der generische
 * Workflow-Runner-Skill interpretiert. Workflows sind DATEN, kein Code:
 * Neue Fall-Typen = neue YAML-Datei, kein neuer Skill.
 *
 * Schritt-Typen spiegeln die deterministisch/agentisch-Trennung:
 *  - `tool`        : deterministischer MCP-Aufruf (Rechner, Matcher, Wissen)
 *  - `nutzer_input`: Frage(n) an den Nutzer, füllt Fall-Felder
 *  - `agent`       : LLM-Aufgabe (Erklärung, Subsumtion, Dokumententwurf) — IMMER
 *                    mit Guardrail-Pflicht
 *  - `eskalation`  : Übergabe an Fachperson (Eskalations-Agent paketiert den Fall)
 *  - `hinweis`     : statischer, vorformulierter Hinweistext (RDG-sicher)
 */
export const WorkflowSchritt = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  titel: z.string(),
  typ: z.enum(["tool", "nutzer_input", "agent", "eskalation", "hinweis"]),

  /** typ=tool: MCP-Server + Tool + Mapping Fall-Felder → Tool-Args */
  tool: z
    .object({
      server: z.enum(["eeg-wissen", "eeg-rechner", "eeg-foerder", "eeg-daten"]),
      name: z.string(),
      args_aus_fall: z.record(z.string()).default({}), // toolArg -> Fall-Feldpfad
      ergebnis_feld: z.string().optional(), // wohin im Fall das Ergebnis geschrieben wird
    })
    .optional(),

  /** typ=nutzer_input: benötigte Fall-Felder (Intake-Pattern: nur fehlende fragen) */
  benoetigte_felder: z.array(z.object({ feld: z.string(), frage: z.string(), hinweis: z.string().optional() })).optional(),

  /** typ=agent: Aufgabenbeschreibung + Pflicht-Kontext aus dem Wissens-Layer */
  agent_aufgabe: z
    .object({
      beschreibung: z.string(),
      subsumtion: z.boolean().default(false), // true ⇒ Unsicherheits-Kennzeichnung Pflicht
      pflicht_quellen: z.array(z.string()).default([]), // z. B. ["BGH XIII ZR 12/19"]
    })
    .optional(),

  /** typ=hinweis: vorformulierter Text (darf Platzhalter {fall.x} enthalten) */
  hinweis_text: z.string().optional(),

  /** typ=eskalation */
  eskalation_an: z.enum(["anwalt", "steuerberater", "energieberater", "installateur", "netzbetreiber", "clearingstelle", "weg_verwalter"]).optional(),

  /** Transitions: erste zutreffende Bedingung gewinnt; `sonst` als Fallback. */
  weiter: z
    .array(z.object({ wenn: Bedingung.optional(), zu: z.string() }))
    .default([]),
});

export const Workflow = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titel: z.string(),
  beschreibung: z.string(),
  /** Wann dieser Workflow den Fall übernimmt (Routing durch Intake). */
  zustaendig_wenn: Bedingung,
  start: z.string(),
  schritte: z.array(WorkflowSchritt).min(1),
  quellen: z.array(Quelle).default([]),
});
export type Workflow = z.infer<typeof Workflow>;
export type WorkflowSchritt = z.infer<typeof WorkflowSchritt>;
