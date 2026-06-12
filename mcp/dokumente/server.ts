#!/usr/bin/env bun
/**
 * MCP-Server `eeg-dokumente` — Suche und Zugriff auf die EIGENEN Unterlagen
 * des Nutzers (dokumente/). Alles lokal; nichts verlässt den Rechner.
 *
 * Pläne/Fotos: `bilder_liste` liefert die Original-Pfade — die liest Claude
 * direkt mit dem Read-Tool (Vision). OCR-Extrakte dienen nur der Suche.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ladeManifest, liesExtrakt, sucheDokumente } from "../../src/rag/dokumente.ts";

const server = new McpServer({ name: "eeg-dokumente", version: "0.1.0" });
const json = (x: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(x, null, 1) }] });

server.registerTool(
  "suche_dokumente",
  {
    description:
      "BM25-Suche über die eigenen Unterlagen des Nutzers (dokumente/): Einspeisezusagen, Rechnungen, MaStR-Bescheide, Netzbetreiber-Briefe, Datenblätter, Pläne (OCR). Liefert Treffer-Chunks mit Quelldatei.",
    inputSchema: { query: z.string(), limit: z.number().int().min(1).max(20).optional() },
  },
  async ({ query, limit }) => json(await sucheDokumente(query, limit ?? 8)),
);

server.registerTool(
  "dokument_lesen",
  {
    description: "Vollständigen Markdown-Extrakt eines Nutzer-Dokuments lesen (Quell-Dateiname aus suche_dokumente oder dokumente_status).",
    inputSchema: { quelle: z.string().describe("Dateiname relativ zu dokumente/, z. B. 'einspeisezusage.pdf'") },
  },
  async ({ quelle }) => ({ content: [{ type: "text" as const, text: await liesExtrakt(quelle) }] }),
);

server.registerTool(
  "dokumente_status",
  {
    description: "Inventar der eingelesenen Nutzer-Dokumente: Typ, OCR ja/nein, Seiten, Hinweise (z. B. Scans ohne Textebene, nicht unterstützte Formate).",
    inputSchema: {},
  },
  async () => {
    const m = await ladeManifest();
    return json({
      stand: m.stand || "noch nie eingelesen — `bun run ingest:dokumente`",
      anzahl: Object.keys(m.dateien).length,
      dateien: Object.fromEntries(
        Object.entries(m.dateien).map(([k, v]) => [k, { typ: v.typ, ocr: v.ocr, seiten: v.seiten, zeichen: v.zeichen, hinweis: v.hinweis }]),
      ),
    });
  },
);

server.registerTool(
  "bilder_liste",
  {
    description:
      "Alle Bilder/Pläne/Fotos unter den Nutzer-Dokumenten mit Original-Pfad. Für inhaltliches Verständnis (Lageplan, Dachbelegung, Zählerschrank-Foto) das Original mit dem Read-Tool öffnen — Claude liest Bilder nativ.",
    inputSchema: {},
  },
  async () => {
    const m = await ladeManifest();
    const bilder = Object.entries(m.dateien)
      .filter(([, v]) => v.typ === "bild" && v.bild_pfad)
      .map(([quelle, v]) => ({ quelle, bild_pfad: v.bild_pfad, ocr_zeichen: v.zeichen }));
    return json({ anzahl: bilder.length, hinweis: "Originale mit Read-Tool öffnen für Vision-Analyse.", bilder });
  },
);

await server.connect(new StdioServerTransport());
