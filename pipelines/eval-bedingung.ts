#!/usr/bin/env bun
/**
 * CLI-Helper für den Workflow-Runner: wertet eine Workflow-Transition
 * deterministisch aus, statt das dem LLM zu überlassen.
 *
 *   bun run pipelines/eval-bedingung.ts '<bedingung-json>' '<fall-json>'
 *   → {"ergebnis": true|false}
 */
import { pruefeBedingung } from "../src/lib/bedingung.ts";

const [bedingungRaw, fallRaw] = [process.argv[2], process.argv[3]];
if (!bedingungRaw || !fallRaw) {
  console.error('Nutzung: eval-bedingung.ts \'{"feld":"x","op":"eq","wert":1}\' \'{"x":1}\'');
  process.exit(2);
}
console.log(JSON.stringify({ ergebnis: pruefeBedingung(JSON.parse(bedingungRaw), JSON.parse(fallRaw)) }));
