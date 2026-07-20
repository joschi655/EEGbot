#!/usr/bin/env bun
/** MCP-Server `eeg-foerder` — Förder-Matcher, Kumulierung, Formularinventar. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formulareFuerFall, ladeFormulare, matcheProgramme, pruefeKumulierung } from "../../src/rules/foerderMatcher.ts";
import { erstelleFahrplan, renderFahrplanMarkdown } from "../../src/rules/fahrplan.ts";
import { programmauskunft } from "../../src/rules/programmauskunft.ts";

const server = new McpServer({ name: "eeg-foerder", version: "0.1.0" });
const json = (x: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(x, null, 1) }] });

server.registerTool(
  "programme_matchen",
  {
    description:
      "Deterministischer Förder-Matcher: strukturierter Fall → passende/unpassende Programme mit Gründen, Fördersätzen und fehlenden Angaben. Fall-Felder u. a.: massnahme.typ (waermepumpe|pv-anlage|daemmung|…), massnahme.begonnen, gebaeude.bestandsgebaeude, gebaeude.alter_jahre, eigentumsform, antragsteller.selbstnutzend, antragsteller.haushaltseinkommen_eur, antragsteller.isfp_vorhanden.",
    inputSchema: { fall: z.record(z.unknown()).describe("Strukturierter Fall (siehe Beschreibung)") },
  },
  async ({ fall }) => json(await matcheProgramme(fall)),
);

server.registerTool(
  "foerderfahrplan",
  {
    description:
      "DAS Lead-Tool: erzeugt aus einem strukturierten Fall den deterministischen Förderfahrplan — Programm-Empfehlung mit Boni, geordnete Schritte (Antrag VOR Auftrag!), Dokumenten-Checkliste (human_only ausgewiesen), iSFP-Weiche, Entweder-oder/Kombinationen mit Gesamtquoten-Deckel, offene Fragen, RDG-Disclaimer, Markdown. " +
      "Fall-Felder: massnahme.{typ,begonnen,ersetzt_fossile_heizung,wp_effizienzbonus_qualifiziert,kosten_eur,bereits_gefoerdert}, gebaeude.{bestandsgebaeude,alter_jahre}, antragsteller.{selbstnutzend,haushaltseinkommen_eur,isfp_vorhanden}, eigentumsform, standort.{bundesland,kommune,plz}. " +
      "Fehlende Felder crashen nicht — sie erscheinen als offene_fragen. Fülle den Fall bevorzugt aus den Nutzer-Unterlagen (eeg-dokumente-MCP) statt den Nutzer abzufragen.",
    inputSchema: { fall: z.record(z.unknown()).describe("Strukturierter Fall (siehe Beschreibung)") },
  },
  async ({ fall }) => {
    const fahrplan = await erstelleFahrplan(fall);
    return json({ fahrplan, markdown: renderFahrplanMarkdown(fahrplan) });
  },
);

server.registerTool(
  "programmauskunft",
  {
    description:
      "Deterministische Programm-Fakten je Durchführer (KfW vs. BAFA): Antragstellung/Vollmacht, Antragsberechtigte (z. B. Nießbraucher), förderfähige Nebenkosten (Fachplanung/Baubegleitung), Praxis-Bearbeitungszeiten und BEKANNTE OFFENE AUSLEGUNGSFRAGEN — jeweils mit Quelle + Stand. Bei Auslegungsfragen: Grundregel nennen, Grenze offenlegen, an verweis_an eskalieren; niemals Konditionen erfinden.",
    inputSchema: { programm_ids: z.array(z.string()).min(1).describe("Programm-IDs, z. B. ['kfw-458', 'bafa-beg-em']") },
  },
  async ({ programm_ids }) => json(await programmauskunft({ programm_ids })),
);

server.registerTool(
  "kumulierung_pruefen",
  {
    description: "Sind zwei Förderprogramme kombinierbar? (Kumulierungs-Matrix aus data/programs)",
    inputSchema: { programm_a: z.string(), programm_b: z.string() },
  },
  async ({ programm_a, programm_b }) => json(await pruefeKumulierung(programm_a, programm_b)),
);

server.registerTool(
  "formular_inventar",
  {
    description: "Alle erfassten Formulare (MaStR, Netzbetreiber, KfW, BAFA, WEG) mit Feldern, Vorbefüllbarkeit und Fehlerfallen — optional gefiltert auf einen Fall.",
    inputSchema: { fall: z.record(z.unknown()).optional() },
  },
  async ({ fall }) => json(fall ? await formulareFuerFall(fall) : await ladeFormulare()),
);

await server.connect(new StdioServerTransport());
