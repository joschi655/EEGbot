#!/usr/bin/env bun
/**
 * Ingestion der Clearingstelle EEG|KWKG: Häufige Rechtsfragen (FAQ) + von dort
 * referenzierte Voten/Empfehlungen/Hinweise.
 *
 * Discovery: FAQ-Detailseiten sind numerisch enumerierbar
 * (`/haeufige-rechtsfrage/<N>`, Stand 2026 bis ~320). Die Facetten-Suche der
 * Website ist WAF-geschützt (403) — die Detailseiten selbst sind frei abrufbar.
 * Aus jeder FAQ werden verlinkte Verfahren (`/votv/...`, `/empfv/...`,
 * `/hinwv/...`) mitgeladen (Tiefe 1).
 *
 * WICHTIG (Lizenz): Der Clearingstelle-Korpus ist KEIN amtliches Werk und wird
 * NICHT redistribuiert. Diese Pipeline baut die Wissensbasis nur LOKAL auf
 * (`knowledge/` ist .gitignored). Höflichkeitsregeln: 400 ms Delay, ehrlicher
 * User-Agent, Abbruch bei wiederholten 403.
 */
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import MiniSearch from "minisearch";

const REPO = new URL("..", import.meta.url).pathname;
const DB_PFAD = `${REPO}knowledge/clearingstelle.sqlite`;
const INDEX_PFAD = `${REPO}knowledge/index/clearingstelle.json`;
const BASIS = "https://www.clearingstelle-eeg-kwkg.de";
const MAX_FAQ_ID = Number(process.env.CS_MAX_FAQ_ID ?? 330);
const DELAY_MS = 400;
const UA = "Mozilla/5.0 (kompatibel; EEGbot Open Source; +https://github.com/joschi655/EEGbot) AppleWebKit/537.36";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function htmlZuText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(p|div|h[1-6]|li|br|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&ouml;/g, "ö").replace(/&auml;/g, "ä").replace(/&uuml;/g, "ü")
    .replace(/&Ouml;/g, "Ö").replace(/&Auml;/g, "Ä").replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß").replace(/&sect;/g, "§").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extrahiereHauptinhalt(html: string): { titel: string; text: string } {
  const roherTitel: string = html.match(/<title>([^<]*)/)?.[1] ?? "";
  const titel = htmlZuText(roherTitel.split("|")[0] ?? "").trim();
  // Drupal: Hauptinhalt in <main> bzw. node__content
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return { titel, text: htmlZuText(main) };
}

function extrahiereVerfahrensLinks(html: string): string[] {
  const links = new Set<string>();
  for (const m of html.matchAll(/href="(\/(?:votv|empfv|hinwv)\/[a-z0-9/_-]+)"/gi)) if (m[1]) links.add(m[1]);
  return [...links];
}

async function hole(url: string): Promise<{ status: number; html: string }> {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" }, redirect: "follow" });
  return { status: res.status, html: res.ok ? await res.text() : "" };
}

async function main() {
  mkdirSync(`${REPO}knowledge/index`, { recursive: true });
  const db = new Database(DB_PFAD, { create: true });
  db.run(`CREATE TABLE IF NOT EXISTS eintrag (
    url TEXT PRIMARY KEY, typ TEXT NOT NULL, titel TEXT NOT NULL,
    text TEXT NOT NULL, referenzen TEXT NOT NULL, geladen TEXT NOT NULL)`);
  const upsert = db.prepare(
    `INSERT INTO eintrag (url, typ, titel, text, referenzen, geladen) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET titel=excluded.titel, text=excluded.text, referenzen=excluded.referenzen, geladen=excluded.geladen`,
  );
  const jetzt = new Date().toISOString();

  let faqGeladen = 0, fehler403 = 0;
  const verfahrenUrls = new Set<string>();
  // Re-Run-freundlich: schon geladene FAQs überspringen (Website drosselt nach
  // ~200 Requests mit 403 — mehrere Läufe vervollständigen den Korpus).
  const vorhandene = new Set(
    db.query<{ url: string }, []>("SELECT url FROM eintrag WHERE typ='faq'").all().map((r) => r.url),
  );

  for (let id = 1; id <= MAX_FAQ_ID; id++) {
    const url = `${BASIS}/haeufige-rechtsfrage/${id}`;
    if (vorhandene.has(url) && process.env.CS_REFRESH !== "1") continue;
    try {
      const { status, html } = await hole(url);
      if (status === 403) {
        if (++fehler403 >= 3) {
          console.error("Mehrfach 403 — Website blockiert automatisierten Zugriff gerade. Später erneut versuchen.");
          break;
        }
        await sleep(3000);
        continue;
      }
      fehler403 = 0;
      if (status !== 200) continue;
      const { titel, text } = extrahiereHauptinhalt(html);
      if (!titel || text.length < 100) continue;
      for (const v of extrahiereVerfahrensLinks(html)) verfahrenUrls.add(v);
      upsert.run(url, "faq", `FAQ ${id}: ${titel}`, text, JSON.stringify(extrahiereVerfahrensLinks(html)), jetzt);
      faqGeladen++;
      if (faqGeladen % 25 === 0) console.log(`… ${faqGeladen} FAQ geladen (zuletzt #${id})`);
    } catch (e) {
      console.error(`✗ FAQ ${id}: ${e instanceof Error ? e.message : e}`);
    }
    await sleep(DELAY_MS);
  }
  console.log(`FAQ: ${faqGeladen} geladen, ${verfahrenUrls.size} referenzierte Verfahren entdeckt`);

  let verfahrenGeladen = 0;
  for (const pfad of verfahrenUrls) {
    try {
      const { status, html } = await hole(BASIS + pfad);
      if (status !== 200) continue;
      const { titel, text } = extrahiereHauptinhalt(html);
      if (!titel || text.length < 100) continue;
      const typ = pfad.startsWith("/votv") ? "votum" : pfad.startsWith("/empfv") ? "empfehlung" : "hinweis";
      upsert.run(BASIS + pfad, typ, titel, text, "[]", jetzt);
      verfahrenGeladen++;
    } catch (e) {
      console.error(`✗ ${pfad}: ${e instanceof Error ? e.message : e}`);
    }
    await sleep(DELAY_MS);
  }
  console.log(`Verfahren (Voten/Empfehlungen/Hinweise): ${verfahrenGeladen} geladen`);

  // BM25-Index
  const index = new MiniSearch({ fields: ["titel", "text"], storeFields: ["url", "typ", "titel", "text"] });
  const alle = db.query<{ url: string; typ: string; titel: string; text: string }, []>("SELECT url, typ, titel, text FROM eintrag").all();
  let chunks = 0;
  for (const e of alle) {
    const absaetze = e.text.split(/\n\s*\n/).filter((a) => a.trim().length > 60);
    let buffer = "";
    let i = 0;
    for (const a of absaetze) {
      buffer += a + "\n\n";
      if (buffer.length > 900) {
        index.add({ id: `${e.url}#${i}`, url: e.url, typ: e.typ, titel: e.titel, text: buffer.trim() });
        chunks++; i++; buffer = "";
      }
    }
    if (buffer.trim()) { index.add({ id: `${e.url}#${i}`, url: e.url, typ: e.typ, titel: e.titel, text: buffer.trim() }); chunks++; }
  }
  await Bun.write(INDEX_PFAD, JSON.stringify(index.toJSON()));
  console.log(`Index: ${alle.length} Einträge → ${chunks} Chunks → knowledge/index/clearingstelle.json`);
  db.close();
}

await main();
