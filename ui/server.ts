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
 *   POST /api/intake/vorschau {freitext?}     Lokal: zeigt die später übertragenen Inhalte
 *   POST /api/intake       {freitext?, einwilligung_externe_uebertragung:true}
 *                                                KI-Vorbefüllung (braucht ANTHROPIC_API_KEY)
 *   GET  /api/norm         ?slug&enbez&datum  Norm-Fassung zum Stichtag
 *   GET  /api/cascade      ?slug&enbez&datum&tiefe   Querverweis-Kaskade
 *   GET  /api/uebergangsrecht ?ibn            §100-Resolver (Versteinerung)
 *   GET  /api/sanktion52                      Verstoß-Kategorien (füttert das Formular)
 *   POST /api/sanktion52   {leistung_kw, verstoesse[], stichtag?}   §52-Exposure
 *   POST /api/verguetung   {ibn_datum, leistung_kwp, einspeiseart}  Einspeisevergütung
 *   POST /api/fristen      {ibn_datum, mastr_registriert, veraeusserungsform_gemeldet, …}
 *   POST /api/schwellen    {leistung_kwp, …}                        Leistungs-Schwellen
 *   POST /api/solarspitzen {ibn_datum, leistung_kwp, technik, …}    §9/§51-Solarspitzen-Check
 *   POST /api/ue20         {ibn_datum, leistung_kwp, …}             Ü20-Optionsvergleich
 */
import { join, resolve, sep } from "node:path";
import { crossRefs, normAtDate, oeffneGraph } from "../src/graph/query.ts";
import { resolveUebergangsrecht } from "../src/graph/uebergangsrecht.ts";
import { sucheNormen } from "../src/rag/suche.ts";
import { erstelleIntakeVorschau, extrahiereFall } from "../src/rag/intake.ts";
import { netzbetreiberFuerPlz } from "../src/apis/netzbetreiber.ts";
import { erstelleFahrplan, renderFahrplanMarkdown } from "../src/rules/fahrplan.ts";
import { berechneSanktion52, VERSTOSS_KATEGORIEN } from "../src/rules/sanktion52.ts";
import { berechneVerguetung } from "../src/rules/verguetung.ts";
import { pruefeFristen } from "../src/rules/fristen.ts";
import { pruefeSchwellen } from "../src/rules/schwellen.ts";
import { pruefeSolarspitzen } from "../src/rules/solarspitzen.ts";
import { vergleicheAusgefoerderteOptionen } from "../src/rules/ausgefoerderte.ts";
import { FachlicherFehler } from "../src/lib/fehler.ts";
import {
  AusgefoerderteInputSchema,
  FristenInputSchema,
  Sanktion52InputSchema,
  SchwellenInputSchema,
  SolarspitzenInputSchema,
  VerguetungInputSchema,
} from "../src/schemas/rechner.ts";
import { z } from "zod";

const REPO = new URL("..", import.meta.url).pathname;
const APP_DIR = join(REPO, "ui", "fink", "ui_kits", "app");
const FINK_DIR = join(REPO, "ui", "fink");
const PORT = Number(process.env.PORT ?? 3475);
// Öffentliche Instanz bindet per systemd auf 127.0.0.1 (nur der Cloudflare-Tunnel
// spricht mit dem Prozess); lokal bleibt 0.0.0.0 für LAN-Demos.
const HOST = process.env.HOST ?? "0.0.0.0";

/**
 * Lokale UMD-Builds statt CDN: Die Demo muss ohne Netz laufen (Pitch-Härtung).
 * Quellen sind die per bun installierten Pakete — kein Binärblob im Repo.
 */
const VENDOR: Record<string, string> = {
  "react.js": "node_modules/react/umd/react.development.js",
  "react-dom.js": "node_modules/react-dom/umd/react-dom.development.js",
  "babel.js": "node_modules/@babel/standalone/babel.min.js",
  "lucide.js": "node_modules/lucide/dist/umd/lucide.min.js",
  "d3.js": "node_modules/d3/dist/d3.min.js",
};

const json = (x: unknown, status = 200) =>
  new Response(JSON.stringify(x, null, 1), { status, headers: { "content-type": "application/json; charset=utf-8" } });

const validierungsFehler = (issues: z.ZodIssue[]) =>
  issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");

class JsonRequestFehler extends Error {}

async function requestJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new JsonRequestFehler("Ungültiges JSON im Request-Body.");
  }
}

/** Gemeinsamer REST-Adapter: JSON 400, Contract 422, Fachablehnung 422, Bug 500. */
export const engineResponse = async <T>(req: Request, schema: z.ZodType<T>, fn: (input: T) => unknown) => {
  let body: unknown;
  try {
    body = await requestJson(req);
  } catch {
    return json({ fehler: "Ungültiges JSON im Request-Body." }, 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ fehler: validierungsFehler(parsed.error.issues) }, 422);
  try {
    return json(await fn(parsed.data));
  } catch (e) {
    if (e instanceof FachlicherFehler) return json({ fehler: e.message }, 422);
    console.error("Unerwarteter Engine-Fehler", e);
    return json({ fehler: "Interner Serverfehler. Details wurden serverseitig protokolliert." }, 500);
  }
};

const IntakeVorschauSchema = z.object({ freitext: z.string().max(20_000).optional() }).strict();
const IntakeRequestSchema = IntakeVorschauSchema.extend({
  einwilligung_externe_uebertragung: z.literal(true, {
    errorMap: () => ({ message: "Ausdrückliche Einwilligung zur externen Übertragung fehlt" }),
  }),
}).strict();

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

export async function handleRequest(req: Request): Promise<Response> {
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
        const { frage, stichtag } = (await requestJson(req)) as { frage: string; stichtag?: unknown };
        if (!frage?.trim()) return json({ fehler: "frage fehlt" }, 400);
        // Nur wohlgeformte Stichtage durchreichen — alles andere fällt auf "heute" zurück.
        const st = typeof stichtag === "string" && /^\d{4}-\d{2}-\d{2}$/.test(stichtag.trim()) ? stichtag.trim() : undefined;
        const [normen, clearingstelle, rechtsprechung] = await Promise.all([
          sucheNormen(frage, { stichtag: st, limit: 6 }),
          sucheZusatz("clearingstelle", frage),
          sucheZusatz("rechtsprechung", frage),
        ]);
        return json({ frage, stichtag: st ?? "aktuell", normen, clearingstelle, rechtsprechung });
      }

      if ((p === "/api/intake" || p === "/api/intake/vorschau") && req.method === "POST") {
        // Öffentliche Instanz (fink.aiwerke.de): Intake ruft die Anthropic-API mit
        // Server-Key auf — ungeschützt wäre das ein offener Kosten-Endpunkt.
        if (process.env.EEGBOT_PUBLIC === "1")
          return json(
            { fehler: "KI-Intake ist auf der öffentlichen Demo deaktiviert. Lokal verfügbar: git clone → bun run setup (siehe README) — dort läuft er ohne API-Key direkt in Claude Code." },
            403,
          );
        if (p === "/api/intake/vorschau")
          return engineResponse(req, IntakeVorschauSchema, ({ freitext }) => erstelleIntakeVorschau({ freitext }));
        return engineResponse(req, IntakeRequestSchema, ({ freitext, einwilligung_externe_uebertragung }) =>
          extrahiereFall({ freitext, einwilligung_externe_uebertragung }),
        );
      }

      if (p === "/api/fahrplan" && req.method === "POST") {
        const { fall } = (await requestJson(req)) as { fall: Record<string, unknown> };
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

      // ── B2C-Rechner: dieselben Engines wie mcp/rechner/server.ts, dünn verdrahtet ──
      if (p === "/api/sanktion52") {
        if (req.method === "GET") return json({ kategorien: VERSTOSS_KATEGORIEN });
        return engineResponse(req, Sanktion52InputSchema, berechneSanktion52);
      }
      if (p === "/api/verguetung" && req.method === "POST") {
        return engineResponse(req, VerguetungInputSchema, berechneVerguetung);
      }
      if (p === "/api/fristen" && req.method === "POST") {
        return engineResponse(req, FristenInputSchema, pruefeFristen);
      }
      if (p === "/api/schwellen" && req.method === "POST") {
        return engineResponse(req, SchwellenInputSchema, pruefeSchwellen);
      }
      if (p === "/api/solarspitzen" && req.method === "POST") {
        return engineResponse(req, SolarspitzenInputSchema, pruefeSolarspitzen);
      }
      if (p === "/api/ue20" && req.method === "POST") {
        return engineResponse(req, AusgefoerderteInputSchema, vergleicheAusgefoerderteOptionen);
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

      // Norm-Graph zum Stichtag: Knoten = Normen, Kanten = Querverweise der
      // geltenden Expressions (aggregiert je enbez-Paar). Optionaler Fall-Modus:
      // ?fall=§ 52,§ 100&tiefe=2 markiert die crossRefs-Umgebung der Seeds.
      if (p === "/api/graph") {
        const slug = url.searchParams.get("slug") ?? "eeg_2014";
        const roh = url.searchParams.get("stichtag")?.trim() ?? "";
        const stichtag = /^\d{4}-\d{2}-\d{2}$/.test(roh) ? roh : new Date().toISOString().slice(0, 10);
        const db = oeffneGraph();

        const exprs = db
          .query<{ id: number; enbez: string; titel: string | null; fassung_von: string }, [string, string, string]>(
            `SELECT id, enbez, titel, fassung_von FROM expression
             WHERE slug = ? AND fassung_von <= ? AND (fassung_bis IS NULL OR fassung_bis > ?)`,
          )
          .all(slug, stichtag, stichtag);
        // Robustheit wie normAtDate (ORDER BY fassung_von DESC LIMIT 1): sollte je
        // enbez mehr als ein Fenster greifen, gewinnt deterministisch das jüngste —
        // und nur dessen Querverweise zählen (sonst doppelte Kanten/Grad-Inflation).
        const proEnbez = new Map<string, (typeof exprs)[number]>();
        for (const e of exprs) {
          const alt = proEnbez.get(e.enbez);
          if (!alt || e.fassung_von > alt.fassung_von) proEnbez.set(e.enbez, e);
        }
        const kanonisch = new Set([...proEnbez.values()].map((e) => e.id));

        const qv = db
          .query<{ vid: number; von: string; ziel_slug: string | null; ziel_enbez: string }, [string, string, string]>(
            `SELECT q.von_expression vid, e.enbez von, q.ziel_slug, q.ziel_enbez FROM querverweis q
             JOIN expression e ON e.id = q.von_expression
             WHERE e.slug = ? AND e.fassung_von <= ? AND (e.fassung_bis IS NULL OR e.fassung_bis > ?)`,
          )
          .all(slug, stichtag, stichtag)
          .filter((k) => kanonisch.has(k.vid));

        const kanten = new Map<string, number>();
        const grad = new Map<string, number>();
        const extern = new Map<string, number>();
        for (const k of qv) {
          if (k.ziel_slug === slug && proEnbez.has(k.ziel_enbez)) {
            if (k.von === k.ziel_enbez) continue; // Selbstverweise tragen nichts
            const key = `${k.von}|${k.ziel_enbez}`;
            kanten.set(key, (kanten.get(key) ?? 0) + 1);
            grad.set(k.von, (grad.get(k.von) ?? 0) + 1);
            grad.set(k.ziel_enbez, (grad.get(k.ziel_enbez) ?? 0) + 1);
          } else {
            extern.set(k.von, (extern.get(k.von) ?? 0) + 1);
          }
        }

        let highlight: string[] | undefined;
        const fall = url.searchParams.get("fall");
        if (fall) {
          const tiefe = Math.min(Math.max(1, Number(url.searchParams.get("tiefe") ?? 2) || 2), 3);
          const seeds = fall.split(",").map((s) => s.trim()).filter(Boolean);
          const menge = new Set(seeds.filter((s) => proEnbez.has(s)));
          for (const seed of seeds)
            for (const kante of crossRefs(db, slug, seed, stichtag, tiefe))
              if (kante.ziel_slug === slug && proEnbez.has(kante.ziel_enbez)) menge.add(kante.ziel_enbez);
          // markiere: Normen zusätzlich hervorheben, OHNE ihre Umgebung zu expandieren
          // (z. B. § 100 — als Hub würde er mit Tiefe 1 das halbe Gesetz aufleuchten lassen).
          for (const m of (url.searchParams.get("markiere") ?? "").split(",").map((s) => s.trim()).filter(Boolean))
            if (proEnbez.has(m)) menge.add(m);
          highlight = [...menge];
        }

        return json({
          slug,
          stichtag,
          nodes: [...proEnbez.values()].map((e) => ({
            enbez: e.enbez,
            titel: (e.titel ?? "").replace(/^\[ENTWURF EEG 2027\]\s*/, ""),
            entwurf: (e.titel ?? "").startsWith("[ENTWURF"),
            grad: grad.get(e.enbez) ?? 0,
            extern: extern.get(e.enbez) ?? 0,
          })),
          edges: [...kanten.entries()].map(([key, n]) => {
            const [von, nach] = key.split("|");
            return { von, nach, n };
          }),
          highlight,
        });
      }

      // ── Statics: fink-App + Design-System ──
      if (p === "/favicon.ico" || p === "/favicon.svg")
        return new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1213BE"/><text x="16" y="23" font-family="system-ui" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">E</text></svg>',
          { headers: { "content-type": "image/svg+xml" } },
        );
      if (p.startsWith("/vendor/")) {
        const rel = VENDOR[p.slice("/vendor/".length)];
        if (rel) {
          const f = Bun.file(join(REPO, rel));
          if (await f.exists())
            return new Response(f, { headers: { "content-type": "text/javascript; charset=utf-8" } });
          return json({ fehler: `Vendor-Datei fehlt — bun install ausführen (${rel})` }, 500);
        }
      }
      if (p === "/" ) return Response.redirect("/app/", 302);
      if (p === "/app" || p === "/app/") return new Response(Bun.file(join(APP_DIR, "index.html")));
      if (p.startsWith("/app/")) {
        const f = Bun.file(join(APP_DIR, p.slice(5)));
        if (await f.exists()) return new Response(f);
      }
      // relative Pfade des Kits (../../styles.css, ../../_ds_bundle.js, assets/…).
      // Defense-in-Depth: expliziter Containment-Check statt Vertrauen auf URL-Normalisierung.
      const kandidatPfad = resolve(join(FINK_DIR, p.slice(1)));
      if (!kandidatPfad.startsWith(resolve(FINK_DIR) + sep)) return json({ fehler: `Nicht gefunden: ${p}` }, 404);
      const kandidat = Bun.file(kandidatPfad);
      if (await kandidat.exists()) return new Response(kandidat);

      return json({ fehler: `Nicht gefunden: ${p}` }, 404);
    } catch (e) {
      if (e instanceof JsonRequestFehler) return json({ fehler: e.message }, 400);
      console.error("Unerwarteter HTTP-Fehler", e);
      return json({ fehler: "Interner Serverfehler. Details wurden serverseitig protokolliert." }, 500);
    }
}

if (import.meta.main) {
  Bun.serve({ port: PORT, hostname: HOST, fetch: handleRequest });
  console.log(`fink Dev-Server läuft: http://localhost:${PORT}/app/  (API unter /api/*)`);
}
