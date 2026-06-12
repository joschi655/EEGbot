#!/usr/bin/env bun
/**
 * Changefeed — Aktualitäts-Pipeline (cron-fähig):
 *  1. BGBl-RSS (recht.bund.de): neue Verkündungen mit EEG/EnWG/MsbG-Bezug
 *  2. QuantLaw-Delta: hat sich das Gesetzes-XML gegenüber dem lokalen Stand geändert?
 *  3. DIP Bundestag: laufende Gesetzesvorhaben (Frühwarnung)
 * Output: Konsolen-Report + Exit-Code 10, wenn `build:knowledge` nötig ist
 * (CI kann darauf ein Issue/PR triggern).
 */
import { readdirSync } from "node:fs";
import { ladeGesetzXml } from "./lib/gii.ts";

const KEYWORDS = /erneuerbare|energiewirtschaft|messstellen|kraft-wärme|solar|windenergie|eeg|enwg/i;
const heute = new Date().toISOString().slice(0, 10);
let updateNoetig = false;

console.log(`# Changefeed ${heute}\n`);

// 1) BGBl-RSS ------------------------------------------------------------------
try {
  const res = await fetch("https://www.recht.bund.de/rss/feeds/rss_bgbl-1.xml", { headers: { "user-agent": "eeg-kompass" } });
  if (res.ok) {
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
      const titel = m[1]!.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
      const datum = m[1]!.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
      return { titel, datum };
    });
    const relevant = items.filter((i) => KEYWORDS.test(i.titel)).slice(0, 10);
    console.log(`## BGBl-RSS (${items.length} Einträge, ${relevant.length} energierechtlich relevant)`);
    for (const r of relevant) console.log(`- ${r.datum}: ${r.titel}`);
    if (!relevant.length) console.log("- keine relevanten Neuverkündungen");
  } else console.log(`## BGBl-RSS: HTTP ${res.status} — übersprungen`);
} catch (e) {
  console.log(`## BGBl-RSS: nicht erreichbar (${e instanceof Error ? e.message : e})`);
}

// 2) QuantLaw-Delta -------------------------------------------------------------
console.log(`\n## QuantLaw-Delta (aktuelles XML vs. lokaler Snapshot)`);
const GESETZE_DIR = new URL("../knowledge/gesetze/", import.meta.url).pathname;
for (const slug of ["eeg_2014", "enwg_2005"]) {
  try {
    const lokal = readdirSync(`${GESETZE_DIR}${slug}`).filter((f) => f.endsWith(".json")).sort().pop();
    if (!lokal) {
      console.log(`- ${slug}: kein lokaler Stand — \`bun run build:knowledge\` ausführen`);
      updateNoetig = true;
      continue;
    }
    const remoteXml = await ladeGesetzXml(slug, heute);
    const remoteHash = Bun.hash(remoteXml).toString(16);
    const lokalJson = (await Bun.file(`${GESETZE_DIR}${slug}/${lokal}`).json()) as { normen: { enbez: string; absaetze: string[] }[] };
    // Vergleich über Norm-Anzahl + Gesamttext-Hash der lokalen Fassung als Heuristik
    const lokalText = lokalJson.normen.map((n) => n.absaetze.join("\n")).join("\n");
    const cachePfad = `${GESETZE_DIR}${slug}/.remote-hash`;
    const alterHash = (await Bun.file(cachePfad).exists()) ? await Bun.file(cachePfad).text() : "";
    if (alterHash && alterHash === remoteHash) {
      console.log(`- ${slug}: unverändert seit letztem Check (${lokal})`);
    } else {
      await Bun.write(cachePfad, remoteHash);
      if (alterHash) {
        console.log(`- ${slug}: REMOTE GEÄNDERT seit letztem Check → \`bun run build:knowledge\``);
        updateNoetig = true;
      } else {
        console.log(`- ${slug}: Hash-Baseline gesetzt (${lokal}, ${lokalJson.normen.length} Normen, lokal ${Math.round(lokalText.length / 1000)}k Zeichen)`);
      }
    }
  } catch (e) {
    console.log(`- ${slug}: Delta-Check fehlgeschlagen (${e instanceof Error ? e.message : e})`);
  }
}

// 3) DIP Bundestag ----------------------------------------------------------------
console.log(`\n## DIP Bundestag (laufende Vorhaben)`);
if (!process.env.DIP_API_KEY) {
  console.log("- übersprungen: DIP_API_KEY nicht gesetzt (kostenlosen Key holen: https://dip.bundestag.de/über-dip/hilfe/api)");
} else {
  try {
    const res = await fetch(
      `https://search.dip.bundestag.de/api/v1/vorgang?f.titel=Erneuerbare-Energien-Gesetz&rows=5&apikey=${process.env.DIP_API_KEY}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { documents?: { titel?: string; datum?: string; beratungsstand?: string }[] };
      for (const d of data.documents ?? []) console.log(`- ${d.datum}: ${d.titel} [${d.beratungsstand ?? "Stand unbekannt"}]`);
    } else console.log(`- DIP HTTP ${res.status} — Key prüfen`);
  } catch (e) {
    console.log(`- DIP nicht erreichbar (${e instanceof Error ? e.message : e})`);
  }
}

console.log(`\n${updateNoetig ? "→ Wissensbasis-Update nötig (Exit 10)." : "→ Kein Update nötig."}`);
process.exit(updateNoetig ? 10 : 0);
