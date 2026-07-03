#!/usr/bin/env bun
/**
 * fink Dev-Server — serviert die fink-App (ui/fink/ui_kits/app) und stellt
 * REST-Endpunkte bereit, die DIESELBEN Engine-Funktionen aufrufen wie die
 * MCP-Server. Nichts ist gemockt: /api/* rechnet echt.
 *
 * Start:  bun ui/server.ts   →  http://localhost:3475/app/
 * (Port 3475 = "FINK" auf der Telefontastatur, halbiert)
 *
 * Endpunkte:
 *   GET  /api/status                          Wissensbasis-/Index-Status
 *   POST /api/frage        {frage, stichtag?} BM25-Normsuche (+ Clearingstelle/Rechtsprechung falls Indizes da)
 *   POST /api/fahrplan     {fall}             Deterministischer Förderfahrplan (src/rules/fahrplan.ts) + Markdown
 *   POST /api/intake       {freitext?}        KI-Vorbefüllung aus dokumente/ + Freitext (braucht ANTHROPIC_API_KEY)
 *   GET  /api/norm         ?slug&enbez&datum  Norm-Fassung zum Stichtag
 *   GET  /api/cascade      ?slug&enbez&datum&tiefe   Querverweis-Kaskade
 *   GET  /api/uebergangsrecht ?ibn            §100-Resolver (Versteinerung)
 */
import { join } from "node:path";
import { crossRefs, normAtDate, oeffneGraph } from "../src/graph/query.ts";
import { resolveUebergangsrecht } from "../src/graph/uebergangsrecht.ts";
import { sucheNormen } from "../src/rag/suche.ts";
import { extrahiereFall } from "../src/rag/intake.ts";
import { netzbetreiberFuerPlz } from "../src/apis/netzbetreiber.ts";
import { erstelleFahrplan, renderFahrplanMarkdown } from "../src/rules/fahrplan.ts";

const REPO = new URL("..", import.meta.url).pathname;
const APP_DIR = join(REPO, "ui", "fink", "ui_kits", "app");
const FINK_DIR = join(REPO, "ui", "fink");
const PORT = Number(process.env.PORT ?? 3475);

const json = (x: unknown, status = 200) =>
  new Response(JSON.stringify(x, null, 1), { status, headers: { "content-type": "application/json; charset=utf-8" } });

async function sucheZusatz(indexName: string, query: string, limit = 5): Promise<unknown[]> {
  const pfad = join(REPO, "knowledge", "index", `${indexName}.json`);
  const file = Bun.file(pfad);
  if (!(await file.exists())) return [];
  const MiniSearch = (await import("minisearch")).default;
  const felder =
    indexName === "clearingstelle"
      ? { fields: ["titel", "text"], storeFields: ["url", "typ", "titel", "text"] }
      : { fields: ["az", "text"], storeFields: ["az", "gericht", "datum", "warum", "quelle_url", "text"] };
  const idx = MiniSearch.loadJSON(await file.text(), felder);
  let erg = idx.search(query, { fuzzy: 0.15, prefix: true, combineWith: "AND" });
  if (erg.length === 0) erg = idx.search(query, { fuzzy: 0.2, prefix: true, combineWith: "OR" });
  return erg.slice(0, limit);
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const p = url.pathname;

    try {
      // ── API ──
      if (p === "/api/status") {
        const stat = async (rel: string) => (await Bun.file(join(REPO, rel)).exists() ? "vorhanden" : "fehlt");
        return json({
          normgraph: await stat("knowledge/normgraph.sqlite"),
          normen_index: await stat("knowledge/index/normen.json"),
          clearingstelle: await stat("knowledge/index/clearingstelle.json"),
          rechtsprechung: await stat("knowledge/index/rechtsprechung.json"),
          dokumente: await stat("knowledge/index/dokumente.json"),
          hinweis: "fehlende Quellen: bun run build:knowledge bzw. ingest:<quelle>",
        });
      }

      if (p === "/api/frage" && req.method === "POST") {
        const { frage, stichtag } = (await req.json()) as { frage: string; stichtag?: string };
        if (!frage?.trim()) return json({ fehler: "frage fehlt" }, 400);
        const [normen, clearingstelle, rechtsprechung] = await Promise.all([
          sucheNormen(frage, { stichtag, limit: 6 }),
          sucheZusatz("clearingstelle", frage),
          sucheZusatz("rechtsprechung", frage),
        ]);
        return json({ frage, stichtag: stichtag ?? "aktuell", normen, clearingstelle, rechtsprechung });
      }

      if (p === "/api/intake" && req.method === "POST") {
        const { freitext } = (await req.json().catch(() => ({}))) as { freitext?: string };
        try {
          return json(await extrahiereFall({ freitext }));
        } catch (e) {
          return json({ fehler: e instanceof Error ? e.message : String(e) }, 400);
        }
      }

      if (p === "/api/fahrplan" && req.method === "POST") {
        const { fall } = (await req.json()) as { fall: Record<string, unknown> };
        if (!fall) return json({ fehler: "fall fehlt" }, 400);
        const fahrplan = await erstelleFahrplan(fall);
        // Rand-Anreicherung (Live-API bleibt außerhalb der puren Engine):
        // vermutlich zuständiger Verteilnetzbetreiber aus offenen MaStR-Daten.
        let netzbetreiber: unknown;
        const plz = (fall as { standort?: { plz?: unknown } }).standort?.plz;
        if (typeof plz === "string" && /^\d{5}$/.test(plz.trim())) {
          netzbetreiber = await netzbetreiberFuerPlz(plz).catch((e) => ({ fehler: e instanceof Error ? e.message : String(e) }));
        }
        return json({ fahrplan, netzbetreiber, markdown: renderFahrplanMarkdown(fahrplan) });
      }

      if (p === "/api/norm") {
        const slug = url.searchParams.get("slug") ?? "eeg_2014";
        const enbez = url.searchParams.get("enbez") ?? "";
        const datum = url.searchParams.get("datum") ?? new Date().toISOString().slice(0, 10);
        if (!enbez) return json({ fehler: "enbez fehlt (z. B. § 24)" }, 400);
        const norm = normAtDate(oeffneGraph(), slug, enbez, datum);
        return norm ? json(norm) : json({ fehler: `Keine Fassung von ${slug} ${enbez} zum ${datum} im Graphen.` }, 404);
      }

      if (p === "/api/cascade") {
        const slug = url.searchParams.get("slug") ?? "eeg_2014";
        const enbez = url.searchParams.get("enbez") ?? "";
        const datum = url.searchParams.get("datum") ?? new Date().toISOString().slice(0, 10);
        const tiefe = Math.min(Number(url.searchParams.get("tiefe") ?? 2), 3);
        if (!enbez) return json({ fehler: "enbez fehlt" }, 400);
        return json({ slug, enbez, datum, tiefe, kanten: crossRefs(oeffneGraph(), slug, enbez, datum, tiefe) });
      }

      if (p === "/api/uebergangsrecht") {
        const ibn = url.searchParams.get("ibn");
        if (!ibn) return json({ fehler: "ibn fehlt (YYYY-MM-DD)" }, 400);
        return json(await resolveUebergangsrecht(ibn));
      }

      // ── Statics: fink-App + Design-System ──
      if (p === "/" ) return Response.redirect("/app/", 302);
      if (p === "/app" || p === "/app/") return new Response(Bun.file(join(APP_DIR, "index.html")));
      if (p.startsWith("/app/")) {
        const f = Bun.file(join(APP_DIR, p.slice(5)));
        if (await f.exists()) return new Response(f);
      }
      // relative Pfade des Kits (../../styles.css, ../../_ds_bundle.js, assets/…)
      const kandidat = Bun.file(join(FINK_DIR, p.slice(1)));
      if (await kandidat.exists()) return new Response(kandidat);

      return json({ fehler: `Nicht gefunden: ${p}` }, 404);
    } catch (e) {
      return json({ fehler: e instanceof Error ? e.message : String(e) }, 500);
    }
  },
});

console.log(`fink Dev-Server läuft: http://localhost:${PORT}/app/  (API unter /api/*)`);
