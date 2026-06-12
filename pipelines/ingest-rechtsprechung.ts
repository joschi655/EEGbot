#!/usr/bin/env bun
/**
 * Ingestion der EEG-Kernrechtsprechung über die Open-Legal-Data-API
 * (https://de.openlegaldata.io — CC-Lizenz, amtliche Texte § 5 UrhG).
 *
 * Zwei Wellen:
 * 1. KERNURTEILE — die in der Wissensbasis als tragend identifizierten
 *    BGH-Entscheidungen (Anlagenbegriff, Übergangsrecht, §52, Kundenanlage,
 *    Smartlaw/RDG), gezielt per Aktenzeichen.
 * 2. BREITENSUCHE — Volltextsuche "Erneuerbare-Energien-Gesetz" (BGH + OLG),
 *    begrenzt via OLD_MAX_SEITEN (Default 3 Seiten à 10).
 *
 * Output: knowledge/rechtsprechung.sqlite + BM25-Index. Lokal, .gitignored.
 */
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import MiniSearch from "minisearch";

const REPO = new URL("..", import.meta.url).pathname;
const DB_PFAD = `${REPO}knowledge/rechtsprechung.sqlite`;
const INDEX_PFAD = `${REPO}knowledge/index/rechtsprechung.json`;
const API = "https://de.openlegaldata.io/api";
const MAX_SEITEN = Number(process.env.OLD_MAX_SEITEN ?? 3);

/** Tragende Entscheidungen aus der Recherche-Wissensbasis. */
const KERNURTEILE: { az: string; warum: string }[] = [
  { az: "XIII ZR 12/19", warum: "Anlagenbegriff / räumliche Nähe §24 (funktionaler Test)" },
  { az: "XIII ZR 3/24", warum: "§100-Versteinerung: IBN-Datum bestimmt EEG-Fassung (Normenkette bis EEG 2004)" },
  { az: "XIII ZR 5/19", warum: "Anlagenzusammenfassung / Vergütungskürzung" },
  { az: "XIII ZR 17/19", warum: "Anlagenbegriff Solar" },
  { az: "XIII ZR 1/21", warum: "Meldepflichten / Sanktion" },
  { az: "XIII ZR 4/21", warum: "Meldepflichten / Sanktion" },
  { az: "EnVR 83/20", warum: "Kundenanlage §3 Nr. 24a EnWG" },
  { az: "I ZR 113/20", warum: "Smartlaw: Software ist keine Rechtsdienstleistung (RDG-Positionierung)" },
];

interface OldCase {
  id: number;
  slug: string;
  court: { name: string; slug: string };
  file_number: string;
  date: string;
  type: string;
  content: string;
}

function htmlZuText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&sect;/g, "§").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&ouml;/g, "ö").replace(/&auml;/g, "ä").replace(/&uuml;/g, "ü").replace(/&szlig;/g, "ß")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function apiGet(pfad: string): Promise<unknown> {
  const res = await fetch(`${API}${pfad}`, { headers: { accept: "application/json", "user-agent": "EEGbot (open source)" } });
  if (!res.ok) throw new Error(`Open Legal Data HTTP ${res.status} für ${pfad}`);
  return res.json();
}

async function main() {
  mkdirSync(`${REPO}knowledge/index`, { recursive: true });
  const db = new Database(DB_PFAD, { create: true });
  db.run(`CREATE TABLE IF NOT EXISTS urteil (
    id INTEGER PRIMARY KEY, az TEXT NOT NULL, gericht TEXT NOT NULL, datum TEXT NOT NULL,
    typ TEXT, warum TEXT, text TEXT NOT NULL, quelle_url TEXT NOT NULL, geladen TEXT NOT NULL)`);
  const upsert = db.prepare(
    `INSERT INTO urteil (id, az, gericht, datum, typ, warum, text, quelle_url, geladen) VALUES (?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET text=excluded.text, warum=COALESCE(excluded.warum, urteil.warum), geladen=excluded.geladen`,
  );
  const jetzt = new Date().toISOString();

  // Welle 1: Kernurteile per Aktenzeichen
  let kern = 0;
  for (const { az, warum } of KERNURTEILE) {
    try {
      const data = (await apiGet(`/cases/?file_number=${encodeURIComponent(az)}&format=json`)) as { results: OldCase[] };
      if (!data.results.length) {
        console.log(`⚠ ${az}: nicht in Open Legal Data — ggf. via openJur/dejure manuell nachladen`);
        continue;
      }
      for (const eintrag of data.results) {
        // Listen-Endpunkt liefert keinen Volltext → Detail nachladen
        const c = (await apiGet(`/cases/${eintrag.id}/?format=json`)) as OldCase;
        upsert.run(c.id, c.file_number, c.court.name, c.date, c.type ?? null, warum, htmlZuText(c.content ?? ""), `https://de.openlegaldata.io/case/${c.slug}`, jetzt);
        kern++;
        console.log(`✓ ${c.court.slug.toUpperCase()} ${c.file_number} (${c.date}) — ${warum}`);
      }
    } catch (e) {
      console.error(`✗ ${az}: ${e instanceof Error ? e.message : e}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  // Welle 2: Breitensuche EEG
  let breite = 0;
  try {
    for (let seite = 1; seite <= MAX_SEITEN; seite++) {
      const data = (await apiGet(`/cases/search/?text=Erneuerbare-Energien-Gesetz&page=${seite}&format=json`)) as { results?: OldCase[] };
      if (!data.results?.length) break;
      for (const eintrag of data.results) {
        const c = (await apiGet(`/cases/${eintrag.id}/?format=json`)) as OldCase;
        if (!c.content || c.content.length < 500) continue;
        upsert.run(c.id, c.file_number, c.court?.name ?? "?", c.date, c.type ?? null, null, htmlZuText(c.content), `https://de.openlegaldata.io/case/${c.slug}`, jetzt);
        breite++;
        await new Promise((r) => setTimeout(r, 250));
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  } catch (e) {
    console.error(`Breitensuche abgebrochen (Kernurteile sind unabhängig davon geladen): ${e instanceof Error ? e.message : e}`);
  }
  console.log(`Urteile: ${kern} Kernurteile + ${breite} aus Breitensuche`);

  // BM25-Index (Chunking ~900 Zeichen)
  const index = new MiniSearch({ fields: ["az", "text"], storeFields: ["az", "gericht", "datum", "warum", "quelle_url", "text"] });
  const alle = db.query<{ id: number; az: string; gericht: string; datum: string; warum: string | null; quelle_url: string; text: string }, []>(
    "SELECT id, az, gericht, datum, warum, quelle_url, text FROM urteil",
  ).all();
  let chunks = 0;
  for (const u of alle) {
    const teile = u.text.match(/[\s\S]{1,900}(?:\n|$)/g) ?? [];
    teile.forEach((t, i) => {
      if (t.trim().length < 80) return;
      index.add({ id: `${u.id}#${i}`, az: u.az, gericht: u.gericht, datum: u.datum, warum: u.warum, quelle_url: u.quelle_url, text: t.trim() });
      chunks++;
    });
  }
  await Bun.write(INDEX_PFAD, JSON.stringify(index.toJSON()));
  console.log(`Index: ${alle.length} Urteile → ${chunks} Chunks → knowledge/index/rechtsprechung.json`);
  db.close();
}

await main();
