/**
 * Zugriff auf das gesetze-im-internet-XML-Format über das QuantLaw-Archiv
 * (github.com/QuantLaw/gesetze-im-internet, Branch `data`, tägliche Snapshots
 * seit 10.06.2019). Einheitlicher Codepfad für historische UND aktuelle
 * Fassungen: Snapshot-Datum → Commit → Roh-XML.
 *
 * Wichtig: Snapshot-Datum = Archivierungsdatum, nicht juristisches
 * Inkrafttretensdatum. Für Stichtags-Logik (§ 100 EEG) werden Snapshots
 * unmittelbar NACH dem Stichtag verwendet (z. B. 2023-01-01 für die am
 * 31.12.2022 geltende Fassung).
 */
import { XMLParser } from "fast-xml-parser";

const REPO = "QuantLaw/gesetze-im-internet";
const CACHE_DIR = new URL("../../.cache/quantlaw/", import.meta.url).pathname;

async function ghJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "eeg-kompass",
      ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`);
  return res.json();
}

/** Commit-SHA des data-Branch-Standes zum Stichtag (letzter Commit ≤ Datum 23:59). */
export async function snapshotSha(datum: string, pfad?: string): Promise<string> {
  const p = pfad ? `&path=${encodeURIComponent(pfad)}` : "";
  const commits = (await ghJson(
    `https://api.github.com/repos/${REPO}/commits?sha=data&until=${datum}T23:59:59Z&per_page=1${p}`,
  )) as { sha: string }[];
  if (!commits.length) throw new Error(`Kein QuantLaw-Snapshot ≤ ${datum} (Archiv beginnt 2019-06-10)`);
  return commits[0]!.sha;
}

/** XML-Dateiname(n) eines Gesetzes im Snapshot (i. d. R. genau eine BJNR-Datei). */
async function xmlDateien(sha: string, slug: string): Promise<string[]> {
  const entries = (await ghJson(
    `https://api.github.com/repos/${REPO}/contents/data/items/${slug}?ref=${sha}`,
  )) as { name: string }[];
  return entries.map((e) => e.name).filter((n) => n.endsWith(".xml"));
}

/** Lädt das Roh-XML eines Gesetzes zum Snapshot (mit lokalem Cache). */
export async function ladeGesetzXml(slug: string, datum: string): Promise<string> {
  const cachePfad = `${CACHE_DIR}${slug}/${datum}.xml`;
  const cached = Bun.file(cachePfad);
  if (await cached.exists()) return cached.text();

  const sha = await snapshotSha(datum, `data/items/${slug}`);
  const dateien = await xmlDateien(sha, slug);
  if (!dateien.length) throw new Error(`Keine XML-Datei für '${slug}' im Snapshot ${datum}`);
  const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/data/items/${slug}/${dateien[0]}`);
  if (!res.ok) throw new Error(`Raw-Fetch ${res.status} für ${slug}@${datum}`);
  const xml = await res.text();
  await Bun.write(cachePfad, xml);
  return xml;
}

export interface Norm {
  enbez: string; // "§ 24", "§ 100", "Anlage 1", "Inhaltsübersicht"
  titel: string;
  absaetze: string[]; // Klartext je Absatz/Block
}
export interface GesetzFassung {
  slug: string;
  jurabk: string; // amtliche Abkürzung, z. B. "EEG 2023"
  langtitel: string;
  snapshot: string; // YYYY-MM-DD
  normen: Norm[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  preserveOrder: false,
  trimValues: true,
});

/** Extrahiert rekursiv allen Text aus einem geparsten XML-Teilbaum. */
function textAus(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textAus).filter(Boolean).join(" ");
  if (typeof node === "object") {
    return Object.entries(node as Record<string, unknown>)
      .filter(([k]) => !k.startsWith("@_"))
      .map(([, v]) => textAus(v))
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function alsArray<T>(x: T | T[] | undefined): T[] {
  return x === undefined ? [] : Array.isArray(x) ? x : [x];
}

/** Parst das gii-Norm-XML-Format in eine strukturierte Fassung. */
export function parseGesetz(xml: string, slug: string, snapshot: string): GesetzFassung {
  const doc = parser.parse(xml) as { dokumente?: { norm?: unknown } };
  const normenRoh = alsArray(doc.dokumente?.norm) as Record<string, unknown>[];

  let jurabk = "";
  let langtitel = "";
  const normen: Norm[] = [];

  for (const n of normenRoh) {
    const meta = (n.metadaten ?? {}) as Record<string, unknown>;
    if (!jurabk && meta.jurabk) jurabk = textAus(meta.jurabk);
    if (!langtitel && meta.langue) langtitel = textAus(meta.langue);

    const enbez = meta.enbez ? textAus(meta.enbez) : "";
    if (!enbez || !/^(§|Anlage)/.test(enbez)) continue; // Rahmen-Norm, Inhaltsübersicht etc.

    const titel = meta.titel ? textAus(meta.titel) : "";
    const textdaten = (n.textdaten ?? {}) as Record<string, unknown>;
    const text = (textdaten.text ?? {}) as Record<string, unknown>;
    const content = (text.Content ?? {}) as Record<string, unknown>;
    const absaetze = alsArray(content.P)
      .map((p) => textAus(p).replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 0);
    if (!absaetze.length) {
      const flach = textAus(content).replace(/\s+/g, " ").trim();
      if (flach) absaetze.push(flach);
    }
    normen.push({ enbez, titel, absaetze });
  }
  return { slug, jurabk, langtitel, snapshot, normen };
}
