#!/usr/bin/env bun
/**
 * MCP-Server `eeg-daten` — Live-Zugriff auf öffentliche Energie-APIs:
 *  - MaStR-Anlagensuche (offizielle Web-Suche-API des Registers)
 *  - SMARD-Marktdaten (BNetzA)
 *  - DIP Bundestag (laufende Gesetzesvorhaben)
 *  - Ausschreibungstermine (statisch aus EEG §-Terminen)
 * Alle Tools degradieren mit verständlicher Fehlermeldung, wenn offline.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "eeg-daten", version: "0.1.0" });
const json = (x: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(x, null, 1) }] });
const fehler = (e: unknown) => json({ fehler: e instanceof Error ? e.message : String(e), hinweis: "Live-API nicht erreichbar — später erneut versuchen." });

server.registerTool(
  "mastr_anlage_suchen",
  {
    description:
      "Sucht öffentliche Anlagendaten im Marktstammdatenregister (offene Daten, DL-DE-BY-2.0). Suche per MaStR-Nummer (SEE…) oder Ort/PLZ. Nützlich für §52-Check: ist die Anlage registriert?",
    inputSchema: { suchbegriff: z.string().describe("MaStR-Nr. (SEE…), PLZ oder Ortsname"), max: z.number().int().min(1).max(25).default(5) },
  },
  async ({ suchbegriff, max }) => {
    try {
      // Öffentliche Filter-API der MaStR-Weboberfläche (inoffiziell dokumentiert via bundesAPI/marktstammdaten-api)
      const url =
        `https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetErweiterteOeffentlicheEinheitStromerzeugung` +
        `?sort=InbetriebnahmeDatum-desc&page=1&pageSize=${max}&filter=${encodeURIComponent(suchbegriff)}`;
      const res = await fetch(url, { headers: { "user-agent": "eeg-kompass (open source)" } });
      if (!res.ok) throw new Error(`MaStR HTTP ${res.status}`);
      const data = (await res.json()) as { Data?: unknown[] };
      return json({ quelle: "Marktstammdatenregister (DL-DE-BY-2.0, Namensnennung BNetzA)", treffer: data.Data ?? [] });
    } catch (e) {
      return fehler(e);
    }
  },
);

server.registerTool(
  "netzbetreiber_fuer_plz",
  {
    description:
      "Vermutlich zuständiger Verteilnetzbetreiber (VNB) für eine PLZ — Heuristik über die Anschluss-Netzbetreiber registrierter MaStR-Einheiten (DL-DE-BY-2.0, © BNetzA). Liefert Verteilung + Stichprobe, KEINE amtliche Gebietsauskunft. VERWENDEN, sobald standort.plz im Fall vorliegt (Fahrplan-Schritt 'Anmeldung beim Netzbetreiber'); Ergebnis im Output ausdrücklich als Heuristik ('vermutlich zuständig') ausweisen.",
    inputSchema: { plz: z.string().describe("5-stellige Postleitzahl") },
  },
  async ({ plz }) => {
    try {
      const { netzbetreiberFuerPlz } = await import("../../src/apis/netzbetreiber.ts");
      return json(await netzbetreiberFuerPlz(plz));
    } catch (e) {
      return fehler(e);
    }
  },
);

server.registerTool(
  "marktwerte",
  {
    description: "Jahres-/Monatsmarktwert Solar aus lokalen Parametern (data/parameters/markt.jahresmarktwert_solar.yaml) — Basis der Ü20-Anschlussvergütung.",
    inputSchema: { stichtag: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() },
  },
  async ({ stichtag }) => {
    const { parameterWert } = await import("../../src/lib/parameter.ts");
    try {
      const w = await parameterWert("markt.jahresmarktwert_solar", stichtag ?? new Date().toISOString().slice(0, 10));
      return json(w);
    } catch (e) {
      return fehler(e);
    }
  },
);

server.registerTool(
  "gesetzesvorhaben",
  {
    description: "Laufende Gesetzgebungsverfahren zum EEG/EnWG aus dem DIP des Bundestags (Frühwarnung vor Novellen). Benötigt DIP_API_KEY (kostenlos: dip.bundestag.de/über-dip/hilfe/api).",
    inputSchema: { suchbegriff: z.string().default("Erneuerbare-Energien-Gesetz"), max: z.number().int().min(1).max(20).default(5) },
  },
  async ({ suchbegriff, max }) => {
    if (!process.env.DIP_API_KEY)
      return json({ fehler: "DIP_API_KEY nicht gesetzt", hinweis: "Kostenlosen API-Key beantragen: https://dip.bundestag.de/über-dip/hilfe/api — dann als Umgebungsvariable DIP_API_KEY setzen." });
    try {
      const url = `https://search.dip.bundestag.de/api/v1/vorgang?f.titel=${encodeURIComponent(suchbegriff)}&rows=${max}&apikey=${process.env.DIP_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`DIP HTTP ${res.status}`);
      const data = (await res.json()) as { documents?: { titel?: string; datum?: string; vorgangstyp?: string; beratungsstand?: string }[] };
      return json(
        (data.documents ?? []).map((d) => ({ titel: d.titel, datum: d.datum, typ: d.vorgangstyp, stand: d.beratungsstand })),
      );
    } catch (e) {
      return fehler(e);
    }
  },
);

server.registerTool(
  "ausschreibungstermine",
  {
    description: "BNetzA-Gebotstermine Solar (statisch aus EEG; Volumina/Höchstwerte je Runde auf der BNetzA-Seite prüfen).",
    inputSchema: { jahr: z.number().int().min(2024).max(2030).optional() },
  },
  async ({ jahr }) => {
    const j = jahr ?? new Date().getFullYear();
    return json({
      jahr: j,
      segment_1_freiflaeche: [`${j}-03-01`, `${j}-07-01`, `${j}-12-01`],
      segment_2_gebaeude: [`${j}-02-01`, `${j}-06-01`, `${j}-10-01`],
      gebuehr_je_gebot_eur: 624,
      quelle: "§ 28a EEG (Gebotstermine); BNetzA-Ausschreibungsseiten für Volumina/Höchstwerte",
      url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/start.html",
    });
  },
);

await server.connect(new StdioServerTransport());
