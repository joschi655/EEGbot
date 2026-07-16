#!/usr/bin/env bun
/**
 * UserPromptSubmit-Hook: deterministische RDG/StBerG-Ampel.
 * Liest das Hook-Event von stdin, klassifiziert den Prompt gegen
 * data/guardrails/policy.yaml und injiziert Handlungsanweisungen als Kontext.
 * Rot wird NICHT stillschweigend geblockt — Claude erhält die verbindliche
 * Anweisung, den Ersatztext zu verwenden (transparent für den Nutzer).
 */
import { klassifiziere } from "../../src/rules/guardrailClassifier.ts";
import { speichereGuardrailBefund } from "./guardrail-state.ts";

const input = (await Bun.stdin.json()) as { prompt?: string; session_id?: string };
const prompt = input.prompt ?? "";
if (!prompt.trim()) process.exit(0);

const befund = await klassifiziere(prompt);
await speichereGuardrailBefund(input.session_id, befund);

let kontext = "";
if (befund.ampel === "rot") {
  kontext =
    `[GUARDRAIL ROT — RDG/StBerG] Kategorie: ${befund.kategorien.map((k) => k.id).join(", ")}. ` +
    `${befund.kategorien[0]?.begruendung ?? ""}\n` +
    `VERBINDLICH: Beantworte die Anfrage NICHT inhaltlich. Verwende stattdessen sinngemäß diesen Ersatztext und biete das Eskalations-Paket an:\n"${befund.ersatztext ?? ""}"`;
} else if (befund.ampel === "gelb") {
  kontext =
    `[GUARDRAIL GELB] Kategorie: ${befund.kategorien.map((k) => k.id).join(", ")}. ` +
    `Kategorie-Information ist erlaubt; Einzelfall-Würdigung nur mit ausdrücklicher Unsicherheits-Kennzeichnung, Quellenangabe (Norm + Fassung) und Eskalationsoption (${befund.eskalation_an ?? "Fachperson"}). Disclaimer anfügen.`;
}

if (kontext)
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: kontext } }));
process.exit(0);
