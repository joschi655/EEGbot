/**
 * Suche über die NUTZER-Dokumente (dokumente/ → Extrakte → BM25-Index).
 * Gegenstück zu suche.ts (Normen) — eigener lokaler Index, eigene Quelle.
 * Zurückgegebene Chunks können vom MCP-Client an dessen Modellanbieter
 * übertragen werden; lokal ist die Speicherung/Suche, nicht die Inferenz.
 */
import MiniSearch from "minisearch";
import { join } from "node:path";

const REPO = new URL("../..", import.meta.url).pathname;
const INDEX_PFAD = join(REPO, "knowledge", "index", "dokumente.json");
const MANIFEST_PFAD = join(REPO, "dokumente", ".extrakte", "manifest.json");
const EXTRAKT_DIR = join(REPO, "dokumente", ".extrakte");

const FELDER = {
  fields: ["text", "quelle"],
  storeFields: ["quelle", "typ", "chunk_nr", "text", "bild_pfad"],
};

export interface DokumentChunk {
  id: string;
  quelle: string;
  typ: string;
  chunk_nr: number;
  text: string;
  bild_pfad?: string;
  score: number;
}

export interface ManifestEintrag {
  hash: string;
  typ: string;
  extrakt: string | null;
  bild_pfad?: string;
  ocr: boolean;
  seiten?: number;
  zeichen: number;
  hinweis?: string;
}

let _index: MiniSearch | null = null;
async function ladeIndex(): Promise<MiniSearch> {
  if (_index) return _index;
  const file = Bun.file(INDEX_PFAD);
  if (!(await file.exists()))
    throw new Error("Dokumenten-Index fehlt — Unterlagen in dokumente/ ablegen und `bun run ingest:dokumente` ausführen.");
  _index = MiniSearch.loadJSON(await file.text(), FELDER);
  return _index;
}

export async function sucheDokumente(query: string, limit = 8): Promise<DokumentChunk[]> {
  const index = await ladeIndex();
  let ergebnisse = index.search(query, { fuzzy: 0.15, prefix: true, combineWith: "AND" });
  if (ergebnisse.length === 0) ergebnisse = index.search(query, { fuzzy: 0.2, prefix: true, combineWith: "OR" });
  return ergebnisse.slice(0, limit).map((r) => ({ ...(r as unknown as DokumentChunk), score: r.score }));
}

export async function ladeManifest(): Promise<{ stand: string; dateien: Record<string, ManifestEintrag> }> {
  const file = Bun.file(MANIFEST_PFAD);
  if (!(await file.exists())) return { stand: "", dateien: {} };
  return file.json();
}

/** Liest den vollständigen Markdown-Extrakt eines Dokuments (per Quell-Dateiname). */
export async function liesExtrakt(quelle: string): Promise<string> {
  const manifest = await ladeManifest();
  const eintrag = manifest.dateien[quelle];
  if (!eintrag) throw new Error(`Unbekanntes Dokument: ${quelle}. Vorhanden: ${Object.keys(manifest.dateien).join(", ") || "(keine)"}`);
  if (!eintrag.extrakt) throw new Error(`Kein Extrakt für ${quelle}: ${eintrag.hinweis ?? "übersprungen"}`);
  return Bun.file(join(EXTRAKT_DIR, eintrag.extrakt)).text();
}
