#!/usr/bin/env bun
/**
 * Lädt konfigurierte Gesetze in konfigurierten Snapshot-Ständen aus dem
 * QuantLaw-Archiv und schreibt normalisierte JSON-Fassungen nach
 * knowledge/gesetze/<slug>/<datum>.json.
 *
 * Snapshot-Auswahl (siehe docs/source-inventory.md):
 *  - 2020-06-01  frühester per API erreichbarer Stand (EEG 2017, spät)
 *  - 2021-01-02  EEG 2021 in Kraft / Fassung 31.12.2020
 *  - 2023-01-01  Fassung 31.12.2022 — Versteinerungs-Stichtag § 100 Abs. 1 EEG 2023
 *  - 2024-06-01  nach Solarpaket I (16.05.2024)
 *  - 2025-04-01  nach Solarspitzengesetz (25.02.2025)
 *  - heute       aktuelle Fassung
 *
 * Fassungen vor Juni 2019 (EEG 2000–2014) sind im QuantLaw-Archiv nicht
 * enthalten — Lücke dokumentiert; Quelle dafür sind die Arbeitsausgaben der
 * Clearingstelle (Folgearbeit, siehe docs/source-inventory.md).
 */
import { ladeGesetzXml, parseGesetz } from "./lib/gii.ts";

const heute = new Date().toISOString().slice(0, 10);
const SNAPSHOTS = ["2020-06-01", "2021-01-02", "2023-01-01", "2024-06-01", "2025-04-01", heute];

/** gii-Slugs. EEG läuft historisch unter eeg_2014. */
const GESETZE: { slug: string; alleSnapshots: boolean }[] = [
  { slug: "eeg_2014", alleSnapshots: true }, // EEG — volle Versionshistorie
  { slug: "enwg_2005", alleSnapshots: true }, // EnWG — §42b/42c/118 relevant
  { slug: "messbg", alleSnapshots: false }, // MsbG (gii-Slug "messbg") — nur aktuell
  { slug: "kwkg_2016", alleSnapshots: false },
  { slug: "windbg", alleSnapshots: false },
  { slug: "rdg", alleSnapshots: false },
];

const OUT = new URL("../knowledge/gesetze/", import.meta.url).pathname;

let fehler = 0;
for (const g of GESETZE) {
  const snapshots = g.alleSnapshots ? SNAPSHOTS : [heute];
  for (const datum of snapshots) {
    const ziel = `${OUT}${g.slug}/${datum}.json`;
    if (await Bun.file(ziel).exists()) {
      console.log(`• ${g.slug}@${datum} (cached)`);
      continue;
    }
    try {
      const xml = await ladeGesetzXml(g.slug, datum);
      const fassung = parseGesetz(xml, g.slug, datum);
      if (fassung.normen.length === 0) throw new Error("0 Normen geparst");
      await Bun.write(ziel, JSON.stringify(fassung, null, 1));
      console.log(`✓ ${g.slug}@${datum}: ${fassung.jurabk}, ${fassung.normen.length} Normen`);
    } catch (e) {
      fehler++;
      console.error(`✗ ${g.slug}@${datum}: ${e instanceof Error ? e.message : e}`);
    }
  }
}
process.exit(fehler > 0 ? 1 : 0);
