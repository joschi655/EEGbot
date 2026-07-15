#!/usr/bin/env bun
/**
 * Validiert alle data/-Artefakte gegen ihre zod-Schemas + Konsistenzregeln:
 *  - Parameter: Zeiträume lückenlos sortiert, keine Überlappung
 *  - Programme: referenzierte Formular-IDs existieren, Kumulierung symmetrisch
 *  - Workflows: Transitions zeigen auf existierende Schritte, Start existiert
 * Exit-Code ≠ 0 bei Fehlern ⇒ CI-Gate.
 */
import { readdirSync } from "node:fs";
import { parse } from "yaml";
import { Foerderprogramm, Formular, GuardrailPolicy, ParameterDatei, Workflow } from "../src/schemas/index.ts";

const ROOT = new URL("../data/", import.meta.url).pathname;
let fehler = 0;
const fail = (msg: string) => {
  console.error(`✗ ${msg}`);
  fehler++;
};
const ok = (msg: string) => console.log(`✓ ${msg}`);

function dateien(dir: string): string[] {
  try {
    return readdirSync(`${ROOT}${dir}`)
      .filter((f) => /\.(ya?ml|json)$/.test(f))
      .map((f) => `${ROOT}${dir}/${f}`);
  } catch {
    return [];
  }
}

async function lade(pfad: string): Promise<unknown> {
  const text = await Bun.file(pfad).text();
  return pfad.endsWith(".json") ? JSON.parse(text) : parse(text);
}

// --- Parameter ---------------------------------------------------------------
const parameterIds = new Set<string>();
for (const pfad of dateien("parameters")) {
  const name = pfad.split("/").pop()!;
  try {
    const p = ParameterDatei.parse(await lade(pfad));
    parameterIds.add(p.id);
    if (`${p.id}.yaml` !== name && `${p.id}.yml` !== name) fail(`${name}: id '${p.id}' ≠ Dateiname`);
    const sortiert = [...p.zeitraeume].sort((a, b) => a.gueltig_von.localeCompare(b.gueltig_von));
    for (let i = 1; i < sortiert.length; i++) {
      const prev = sortiert[i - 1]!;
      const cur = sortiert[i]!;
      if (!prev.gueltig_bis) fail(`${name}: Zeitraum ab ${prev.gueltig_von} ist offen, aber es folgt ${cur.gueltig_von}`);
      else if (prev.gueltig_bis >= cur.gueltig_von) fail(`${name}: Überlappung ${prev.gueltig_bis} / ${cur.gueltig_von}`);
    }
    if (p.id.startsWith("verguetung.solar.") && !sortiert.at(-1)?.gueltig_bis)
      fail(`${name}: letzter Vergütungszeitraum ist offen; amtlich veröffentlichte Halbjahressätze brauchen ein gueltig_bis (Freshness-Gate)`);
    ok(`parameters/${name}`);
  } catch (e) {
    fail(`parameters/${name}: ${e instanceof Error ? e.message : e}`);
  }
}

// --- Formulare ----------------------------------------------------------------
const formularIds = new Set<string>();
for (const pfad of dateien("forms")) {
  const name = pfad.split("/").pop()!;
  try {
    const f = Formular.parse(await lade(pfad));
    formularIds.add(f.id);
    for (const feld of f.felder)
      if (feld.ai_vorbefuellbar && feld.human_only) fail(`forms/${name}: Feld '${feld.id}' ist ai_vorbefuellbar UND human_only`);
    ok(`forms/${name}`);
  } catch (e) {
    fail(`forms/${name}: ${e instanceof Error ? e.message : e}`);
  }
}

// --- Programme ----------------------------------------------------------------
const programme: Foerderprogramm[] = [];
for (const pfad of dateien("programs")) {
  const name = pfad.split("/").pop()!;
  try {
    const p = Foerderprogramm.parse(await lade(pfad));
    programme.push(p);
    for (const formId of p.antragsweg.benoetigte_formulare)
      if (!formularIds.has(formId)) fail(`programs/${name}: Formular '${formId}' existiert nicht in data/forms/`);
    ok(`programs/${name}`);
  } catch (e) {
    fail(`programs/${name}: ${e instanceof Error ? e.message : e}`);
  }
}
// Kumulierung symmetrisch?
const progById = new Map(programme.map((p) => [p.id, p]));
for (const p of programme)
  for (const k of p.kumulierung) {
    const other = progById.get(k.programm_id);
    if (!other) continue; // Referenz auf noch nicht erfasstes Programm ist ok
    const rueck = other.kumulierung.find((r) => r.programm_id === p.id);
    if (rueck && rueck.kombinierbar !== k.kombinierbar)
      fail(`Kumulierung asymmetrisch: ${p.id}↔${k.programm_id}`);
  }

// --- Workflows ------------------------------------------------------------------
for (const pfad of dateien("workflows")) {
  const name = pfad.split("/").pop()!;
  try {
    const w = Workflow.parse(await lade(pfad));
    const schrittIds = new Set(w.schritte.map((s) => s.id));
    if (!schrittIds.has(w.start)) fail(`workflows/${name}: start '${w.start}' existiert nicht`);
    for (const s of w.schritte) {
      for (const t of s.weiter)
        if (t.zu !== "ende" && !schrittIds.has(t.zu)) fail(`workflows/${name}: Schritt '${s.id}' → unbekannt '${t.zu}'`);
      if (s.typ === "tool" && !s.tool) fail(`workflows/${name}: Schritt '${s.id}' typ=tool ohne tool`);
      if (s.typ === "agent" && !s.agent_aufgabe) fail(`workflows/${name}: Schritt '${s.id}' typ=agent ohne agent_aufgabe`);
      if (s.typ === "hinweis" && !s.hinweis_text) fail(`workflows/${name}: Schritt '${s.id}' typ=hinweis ohne hinweis_text`);
      if (s.typ === "eskalation" && !s.eskalation_an) fail(`workflows/${name}: Schritt '${s.id}' typ=eskalation ohne eskalation_an`);
    }
    // Erreichbarkeit: jeder Schritt muss vom Start aus über weiter-Kanten erreichbar sein
    // (Cato-Fund 03.07.2026: eingefügter Schritt war verwaist, Schema-Check allein sah es nicht).
    const erreicht = new Set<string>();
    const offen = [w.start];
    while (offen.length) {
      const k = offen.pop()!;
      if (erreicht.has(k) || k === "ende") continue;
      erreicht.add(k);
      offen.push(...(w.schritte.find((s) => s.id === k)?.weiter.map((t) => t.zu) ?? []));
    }
    for (const s of w.schritte)
      if (!erreicht.has(s.id)) fail(`workflows/${name}: Schritt '${s.id}' ist vom Start aus unerreichbar`);
    ok(`workflows/${name}`);
  } catch (e) {
    fail(`workflows/${name}: ${e instanceof Error ? e.message : e}`);
  }
}

// --- Guardrails -------------------------------------------------------------------
for (const pfad of dateien("guardrails")) {
  const name = pfad.split("/").pop()!;
  try {
    GuardrailPolicy.parse(await lade(pfad));
    ok(`guardrails/${name}`);
  } catch (e) {
    fail(`guardrails/${name}: ${e instanceof Error ? e.message : e}`);
  }
}

console.log(fehler === 0 ? "\nAlle data/-Artefakte valide." : `\n${fehler} Fehler.`);
process.exit(fehler === 0 ? 0 : 1);
