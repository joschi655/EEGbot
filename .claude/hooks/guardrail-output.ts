#!/usr/bin/env bun
/**
 * Stop-Hook: prüft die fertige Antwort gegen den Befund des zuletzt
 * eingereichten Nutzerprompts. Bei ROT/GELB verhindert `decision: block` das
 * Beenden des Turns und gibt Claude einen deterministischen Korrekturauftrag.
 */
import { pruefeGuardrailAusgabe } from "../../src/rules/guardrailClassifier.ts";
import { ladeGuardrailBefund, loescheGuardrailBefund } from "./guardrail-state.ts";

const input = (await Bun.stdin.json()) as {
  session_id?: string;
  last_assistant_message?: string;
  stop_hook_active?: boolean;
};

const befund = await ladeGuardrailBefund(input.session_id);
if (!befund) process.exit(0);

const pruefung = await pruefeGuardrailAusgabe(befund, input.last_assistant_message ?? "");
if (pruefung.erlaubt) {
  await loescheGuardrailBefund(input.session_id);
  process.exit(0);
}

const korrekturrunde = input.stop_hook_active
  ? "Die vorige Korrektur war noch nicht compliant. Gib jetzt ausschließlich eine kurze, sichere Neufassung aus."
  : "Die Antwort darf in dieser Form nicht ausgeliefert werden.";

console.log(
  JSON.stringify({
    decision: "block",
    reason: `${korrekturrunde}\n- ${pruefung.gruende.join("\n- ")}\n\n${pruefung.korrekturhinweis ?? "Formuliere compliant neu."}`,
  }),
);
