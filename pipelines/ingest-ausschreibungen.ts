#!/usr/bin/env bun
/**
 * Ausschreibungs-Pipeline: BNetzA-Gebotstermine + Höchstwerte (Solar 1.
 * Segment) für den Deadline-Tracker.
 *
 * Die gesetzlichen Gebotstermine stehen im EEG (§ 28a: 1. März, 1. Juli,
 * 1. Dezember für Solar 1. Segment) — die sind deterministisch generierbar.
 * Die BNetzA-Seite liefert zusätzlich Höchstwerte und Verschiebungen; sie wird
 * defensiv gescrapt und Ergebnisse landen in knowledge/ausschreibungen.json.
 */
import { mkdirSync } from "node:fs";

const REPO = new URL("..", import.meta.url).pathname;
const ZIEL = `${REPO}knowledge/ausschreibungen.json`;
const UA = "Mozilla/5.0 (kompatibel; EEGbot Open Source) AppleWebKit/537.36";

/** §28a EEG 2023: Gebotstermine Solar 1. Segment — deterministisch. */
function gesetzlicheTermine(abJahr: number, jahre = 2): { termin: string; segment: string; rechtsgrundlage: string }[] {
  const termine: { termin: string; segment: string; rechtsgrundlage: string }[] = [];
  for (let j = abJahr; j < abJahr + jahre; j++)
    for (const md of ["03-01", "07-01", "12-01"])
      termine.push({ termin: `${j}-${md}`, segment: "Solar 1. Segment (Freifläche)", rechtsgrundlage: "§ 28a Abs. 1 EEG 2023" });
  return termine;
}

async function scrapeHoechstwerte(): Promise<string[]> {
  const urls = [
    "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/Solaranlagen1/start.html",
    "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/start.html",
  ];
  const funde: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA } });
      if (!res.ok) continue;
      const html = await res.text();
      // Höchstwert-Angaben (ct/kWh) aus dem Fließtext ziehen
      for (const m of html.matchAll(/H&ouml;chstwert[^<.]{0,160}?([0-9]+,[0-9]+)\s*(?:ct|Cent)/gi))
        funde.push(m[0].replace(/<[^>]+>/g, "").replace(/&ouml;/g, "ö").trim());
      if (funde.length) break;
    } catch {
      /* offline → gesetzliche Termine reichen */
    }
  }
  return funde;
}

async function main() {
  mkdirSync(`${REPO}knowledge`, { recursive: true });
  const jahr = new Date().getFullYear();
  const termine = gesetzlicheTermine(jahr).filter((t) => t.termin >= new Date().toISOString().slice(0, 10));
  const hoechstwerte = await scrapeHoechstwerte();
  const out = {
    stand: new Date().toISOString(),
    naechste_gebotstermine: termine,
    hoechstwerte_bnetza: hoechstwerte.length ? hoechstwerte : ["BNetzA-Seite nicht erreichbar/parsebar — Höchstwert auf bundesnetzagentur.de prüfen"],
    hinweis: "Termine deterministisch aus § 28a EEG 2023; Höchstwerte gescrapt (defensiv). Realisierungsfristen: § 35a EEG.",
  };
  await Bun.write(ZIEL, JSON.stringify(out, null, 1));
  console.log(`Nächste Gebotstermine: ${termine.map((t) => t.termin).join(", ")}`);
  console.log(`Höchstwert-Funde: ${hoechstwerte.length || "0 (Seite nicht parsebar — Hinweis hinterlegt)"}`);
  console.log(`→ knowledge/ausschreibungen.json`);
}

await main();
