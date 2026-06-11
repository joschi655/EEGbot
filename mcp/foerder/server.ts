#!/usr/bin/env bun
/** MCP-Server `eeg-foerder` — Förder-Matcher, Kumulierung, Formularinventar. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formulareFuerFall, ladeFormulare, matcheProgramme, pruefeKumulierung } from "../../src/rules/foerderMatcher.ts";

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
