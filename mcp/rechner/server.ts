#!/usr/bin/env bun
/**
 * MCP-Server `eeg-rechner` — deterministische Engines. Der Agent rechnet NIE
 * selbst: Sätze, Sanktionen, Fristen und Schwellen kommen ausschließlich hier
 * heraus (Leitprinzip in CLAUDE.md).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { berechneSanktion52, VERSTOSS_KATEGORIEN } from "../../src/rules/sanktion52.ts";
import { berechneVerguetung } from "../../src/rules/verguetung.ts";
import { pruefeZusammenfassung } from "../../src/rules/anlagenzusammenfassung.ts";
import { pruefeFristen } from "../../src/rules/fristen.ts";
import { pruefeSchwellen } from "../../src/rules/schwellen.ts";
import { vergleicheAusgefoerderteOptionen } from "../../src/rules/ausgefoerderte.ts";

const server = new McpServer({ name: "eeg-rechner", version: "0.1.0" });
const Datum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
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
    inputSchema: {
      leistung_kw: z.number().positive(),
      verstoesse: z.array(
        z.object({
          kategorie: z.enum(Object.keys(VERSTOSS_KATEGORIEN) as [string, ...string[]]),
          beginn: Datum,
          ende: Datum.optional(),
          geheilt: z.boolean().optional(),
        }),
      ),
      stichtag: Datum.optional(),
    },
  },
  async (args) => fehlerAlsErgebnis(() => berechneSanktion52(args as Parameters<typeof berechneSanktion52>[0])),
);

server.registerTool(
  "verguetung_berechnen",
  {
    description: "Feste Einspeisevergütung (Gebäude-Solar, IBN ab 30.07.2022, ≤ 100 kWp) inkl. Mischvergütung und Förderende.",
    inputSchema: {
      ibn_datum: Datum,
      leistung_kwp: z.number().positive(),
      einspeiseart: z.enum(["teileinspeisung", "volleinspeisung"]),
    },
  },
  async (args) => fehlerAlsErgebnis(() => berechneVerguetung(args)),
);

const AnlageSchema = z.object({
  id: z.string(),
  energietraeger: z.enum(["solar", "wind", "biomasse", "wasser", "geothermie"]),
  ibn_datum: Datum,
  leistung_kwp: z.number().positive(),
  anlagentyp: z.enum(["dach", "freiflaeche", "steckersolar", "fassade", "sonstig"]).optional(),
  grundstueck_id: z.string().optional(),
  gebaeude_id: z.string().optional(),
  netzverknuepfungspunkt_id: z.string().optional(),
  selbe_biogasanlage: z.boolean().optional(),
});

server.registerTool(
  "anlagenzusammenfassung_pruefen",
  {
    description:
      "§24-Entscheidungsbaum (deterministische Schritte 1/2/4). Kann LLM_SUBSUMTION_ERFORDERLICH zurückgeben — dann Subsumtionsauftrag mit BGH-Pflichtkontext beachten und Unsicherheit kennzeichnen.",
    inputSchema: { anlage_a: AnlageSchema, anlage_b: AnlageSchema },
  },
  async ({ anlage_a, anlage_b }) => json(pruefeZusammenfassung(anlage_a, anlage_b)),
);

server.registerTool(
  "fristen_pruefen",
  {
    description: "MaStR-Frist, Veräußerungsform-Meldung, Volleinspeisungs-Mitteilung — Deadlines, Status, Verstoßfolgen.",
    inputSchema: {
      ibn_datum: Datum,
      mastr_registriert: z.boolean(),
      mastr_registrierung_datum: Datum.optional(),
      veraeusserungsform_gemeldet: z.boolean(),
      einspeiseart: z.enum(["teileinspeisung", "volleinspeisung"]).optional(),
      stichtag: Datum.optional(),
    },
  },
  async (args) => json(pruefeFristen(args)),
);

server.registerTool(
  "schwellen_pruefen",
  {
    description: "Leistungs-Schwellen: Steckersolar, vereinfachter Netzanschluss, 60%-Begrenzung ohne iMSys, Direktvermarktungs- und Ausschreibungspflicht.",
    inputSchema: {
      leistung_kwp: z.number().positive(),
      wechselrichter_va: z.number().positive().optional(),
      anlagentyp: z.enum(["dach", "freiflaeche", "steckersolar", "fassade", "sonstig"]).optional(),
      imsys_vorhanden: z.boolean().optional(),
      ibn_datum: Datum.optional(),
    },
  },
  async (args) => json(pruefeSchwellen(args)),
);

server.registerTool(
  "ausgefoerderte_optionen",
  {
    description: "Ü20-Optionsvergleich: Anschlussvergütung vs. Eigenverbrauch vs. Direktvermarktung vs. Repowering (ökonomische Kategorien, inkl. §52-Warnungen).",
    inputSchema: {
      ibn_datum: Datum,
      leistung_kwp: z.number().positive(),
      jahresertrag_kwh: z.number().positive().optional(),
      eigenverbrauchsanteil_prozent: z.number().min(0).max(100).optional(),
      strompreis_ct_kwh: z.number().positive().optional(),
      stichtag: Datum.optional(),
    },
  },
  async (args) => fehlerAlsErgebnis(() => vergleicheAusgefoerderteOptionen(args)),
);

await server.connect(new StdioServerTransport());
