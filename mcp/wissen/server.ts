#!/usr/bin/env bun
/**
 * MCP-Server `eeg-wissen` — versionsgenauer Zugriff auf den temporalen
 * Normgraphen + lexikalische Suche. Alle Antworten tragen Fassungsfenster,
 * damit der Agent Norm + Fassung zitieren kann (Quellenpflicht, CLAUDE.md).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { crossRefs, diffFassungen, fassungen, normAtDate, oeffneGraph } from "../../src/graph/query.ts";
import { resolveUebergangsrecht } from "../../src/graph/uebergangsrecht.ts";
import { sucheNormen } from "../../src/rag/suche.ts";

const server = new McpServer({ name: "eeg-wissen", version: "0.1.0" });
const db = oeffneGraph();

const Slug = z.enum(["eeg_2014", "enwg_2005", "messbg", "kwkg_2016", "windbg", "rdg"]).describe("Gesetz (gii-Slug); EEG = eeg_2014");
const Datum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Stichtag YYYY-MM-DD");
const Enbez = z.string().describe('Norm-Bezeichnung, z. B. "§ 24" oder "Anlage 1"');

const json = (x: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(x, null, 1) }] });

server.registerTool(
  "norm_at_date",
  {
    description:
      "Volltext einer Norm in der zum Stichtag geltenden Fassung. IMMER hierüber zitieren, nie aus Modellwissen. Fassungsfenster = Snapshot-Raster des Archivs.",
    inputSchema: { slug: Slug, enbez: Enbez, datum: Datum },
  },
  async ({ slug, enbez, datum }) => {
    const n = normAtDate(db, slug, enbez, datum);
    if (!n) return json({ gefunden: false, hinweis: `${enbez} ${slug} existiert zum ${datum} nicht im Graphen (ggf. spätere Einfügung oder Fassung vor 2020).` });
    return json({ gefunden: true, jurabk: n.jurabk, enbez: n.enbez, titel: n.titel, fassung_von: n.fassung_von, fassung_bis: n.fassung_bis, text: n.text });
  },
);

server.registerTool(
  "fassungen",
  { description: "Versionshistorie einer Norm (alle im Graphen bekannten Textfassungen).", inputSchema: { slug: Slug, enbez: Enbez } },
  async ({ slug, enbez }) =>
    json(fassungen(db, slug, enbez).map((f) => ({ fassung_von: f.fassung_von, fassung_bis: f.fassung_bis, titel: f.titel, zeichen: f.text.length }))),
);

server.registerTool(
  "diff_fassungen",
  {
    description: "Absatzweiser Vergleich einer Norm zwischen zwei Stichtagen (was hat eine Novelle geändert?).",
    inputSchema: { slug: Slug, enbez: Enbez, datum_a: Datum, datum_b: Datum },
  },
  async ({ slug, enbez, datum_a, datum_b }) => {
    const d = diffFassungen(db, slug, enbez, datum_a, datum_b);
    if (!d) return json({ gefunden: false });
    return json({ ...d, absaetze_a: undefined, absaetze_b: d.geaenderte_absaetze.map((i) => d.absaetze_b[i]) });
  },
);

server.registerTool(
  "cross_refs",
  {
    description: "Querverweise einer Norm (Graph-Kanten), optional mehrstufig (tiefe ≤ 3). Für Verweisketten-Navigation.",
    inputSchema: { slug: Slug, enbez: Enbez, datum: Datum, tiefe: z.number().int().min(1).max(3).default(1) },
  },
  async ({ slug, enbez, datum, tiefe }) => json(crossRefs(db, slug, enbez, datum, tiefe)),
);

server.registerTool(
  "resolve_uebergangsrecht",
  {
    description:
      "Deterministische §100-Kaskade: Welche EEG-Fassung gilt für eine Anlage (Vergütungsregime) + Normenkette + Durchbrechungen. Kernprimitiv für Bestandsanlagen.",
    inputSchema: { ibn_datum: Datum.describe("Inbetriebnahmedatum der Anlage (erstmalige Stromerzeugung, NICHT Zählersetzung)") },
  },
  async ({ ibn_datum }) => json(await resolveUebergangsrecht(ibn_datum)),
);

server.registerTool(
  "suche_norm",
  {
    description: "Lexikalische Suche über Norm-Absätze aller Gesetze im Graphen. Optional stichtagsgenau (sonst: nur aktuell geltende Fassungen).",
    inputSchema: {
      query: z.string(),
      stichtag: Datum.optional(),
      slug: Slug.optional(),
      limit: z.number().int().min(1).max(20).default(8),
    },
  },
  async ({ query, stichtag, slug, limit }) => json(await sucheNormen(query, { stichtag, slug, limit })),
);

await server.connect(new StdioServerTransport());
