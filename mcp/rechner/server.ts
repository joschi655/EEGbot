#!/usr/bin/env bun
/**
 * MCP-Server `eeg-rechner` — deterministische Engines. Der Agent rechnet NIE
 * selbst: Sätze, Sanktionen, Fristen und Schwellen kommen ausschließlich hier
 * heraus (Leitprinzip in CLAUDE.md).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { berechneSanktion52, VERSTOSS_KATEGORIEN } from "../../src/rules/sanktion52.ts";
import { berechneVerguetung } from "../../src/rules/verguetung.ts";
import { pruefeZusammenfassung } from "../../src/rules/anlagenzusammenfassung.ts";
import { pruefeFristen } from "../../src/rules/fristen.ts";
import { pruefeSchwellen } from "../../src/rules/schwellen.ts";
import { vergleicheAusgefoerderteOptionen } from "../../src/rules/ausgefoerderte.ts";
import {
  AusgefoerderteInputSchema,
  AnlagenzusammenfassungInputSchema,
  FristenInputSchema,
  Sanktion52InputSchema,
  SchwellenInputSchema,
  VerguetungInputSchema,
} from "../../src/schemas/rechner.ts";

const server = new McpServer({ name: "eeg-rechner", version: "0.1.0" });
const json = (x: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(x, null, 1) }] });
const fehlerAlsErgebnis = async (fn: () => Promise<unknown>) => {
  try {
    return json(await fn());
  } catch (e) {
    return json({ fehler: e instanceof Error ? e.message : String(e) });
  }
};

server.registerTool(
  "sanktion_52",
  {
    description:
      "§52 Liability Radar: Strafzahlungs-Exposure (10 €/kW/Monat), Heilungsersparnis, Verjährung, Kappung. Kategorien: " +
      Object.entries(VERSTOSS_KATEGORIEN).map(([k, v]) => `${k}=${v}`).join("; "),
    inputSchema: Sanktion52InputSchema.shape,
  },
  async (args) => fehlerAlsErgebnis(() => berechneSanktion52(args as Parameters<typeof berechneSanktion52>[0])),
);

server.registerTool(
  "verguetung_berechnen",
  {
    description: "Feste Einspeisevergütung (Gebäude-Solar, IBN ab 30.07.2022, ≤ 100 kWp) inkl. Mischvergütung und Förderende.",
    inputSchema: VerguetungInputSchema.shape,
  },
  async (args) => fehlerAlsErgebnis(() => berechneVerguetung(args)),
);

server.registerTool(
  "anlagenzusammenfassung_pruefen",
  {
    description:
      "§24-Entscheidungsbaum (deterministische Schritte 1/2/4). Kann LLM_SUBSUMTION_ERFORDERLICH zurückgeben — dann Subsumtionsauftrag mit BGH-Pflichtkontext beachten und Unsicherheit kennzeichnen.",
    inputSchema: AnlagenzusammenfassungInputSchema.shape,
  },
  async ({ anlage_a, anlage_b }) => json(pruefeZusammenfassung(anlage_a, anlage_b)),
);

server.registerTool(
  "fristen_pruefen",
  {
    description: "MaStR-Frist, Veräußerungsform-Meldung, Volleinspeisungs-Mitteilung — Deadlines, Status, Verstoßfolgen.",
    inputSchema: FristenInputSchema.shape,
  },
  async (args) => json(pruefeFristen(args)),
);

server.registerTool(
  "schwellen_pruefen",
  {
    description: "Leistungs-Schwellen: Steckersolar, vereinfachter Netzanschluss, 60%-Begrenzung ohne iMSys, Direktvermarktungs- und Ausschreibungspflicht.",
    inputSchema: SchwellenInputSchema.shape,
  },
  async (args) => json(pruefeSchwellen(args)),
);

server.registerTool(
  "ausgefoerderte_optionen",
  {
    description: "Ü20-Optionsvergleich: Anschlussvergütung vs. Eigenverbrauch vs. Direktvermarktung vs. Repowering (ökonomische Kategorien, inkl. §52-Warnungen).",
    inputSchema: AusgefoerderteInputSchema.shape,
  },
  async (args) => fehlerAlsErgebnis(() => vergleicheAusgefoerderteOptionen(args)),
);

await server.connect(new StdioServerTransport());
