/**
 * Lexikalische Suche (BM25-artig via MiniSearch) über Absatz-Chunks des
 * Normgraphen. Hierarchisches Chunking: Gesetz → § → Absatz; Metadaten je
 * Chunk (slug, enbez, Fassungsfenster) ermöglichen versionsgenaue Treffer.
 *
 * Hybrid-Erweiterung (Vektor): bewusst als Interface vorgesehen —
 * `Embedder` implementieren (z. B. jina-embeddings-v2-base-de lokal via
 * transformers.js) und in `sucheNormen` reranken. Lexikalisch ist für
 * juristische Texte die Basis (Paragraphennummern, Fachbegriffe exakt).
 */
import MiniSearch from "minisearch";

export interface NormChunk {
  id: string; // expressionId:absatzIndex
  slug: string;
  jurabk: string;
  enbez: string;
  titel: string;
  absatz_nr: number;
  text: string;
  fassung_von: string;
  fassung_bis: string | null;
}

export interface Embedder {
  embed(texte: string[]): Promise<number[][]>;
}

const INDEX_PFAD = new URL("../../knowledge/index/normen.json", import.meta.url).pathname;
const FELDER = { fields: ["text", "titel", "enbez"], storeFields: ["slug", "jurabk", "enbez", "titel", "absatz_nr", "text", "fassung_von", "fassung_bis"] };

export function neuerIndex(): MiniSearch<NormChunk> {
  return new MiniSearch<NormChunk>(FELDER);
}

export async function speichereIndex(index: MiniSearch<NormChunk>): Promise<void> {
  await Bun.write(INDEX_PFAD, JSON.stringify(index.toJSON()));
}

let _index: MiniSearch<NormChunk> | null = null;
export async function ladeIndex(): Promise<MiniSearch<NormChunk>> {
  if (_index) return _index;
  const file = Bun.file(INDEX_PFAD);
  if (!(await file.exists()))
    throw new Error("Suchindex fehlt — `bun run build:knowledge` ausführen.");
  _index = MiniSearch.loadJSON<NormChunk>(await file.text(), FELDER);
  return _index;
}

export interface SuchTreffer extends NormChunk {
  score: number;
}

/**
 * Sucht Norm-Absätze, optional gefiltert auf die zum Stichtag geltende Fassung.
 * Ohne Stichtag: nur aktuell geltende Fassungen (fassung_bis = null).
 */
export async function sucheNormen(query: string, opts?: { stichtag?: string; slug?: string; limit?: number }): Promise<SuchTreffer[]> {
  const index = await ladeIndex();
  const stichtag = opts?.stichtag;
  // Erst strikt (alle Begriffe), bei 0 Treffern locker (BM25-Ranking über OR)
  let ergebnisse = index.search(query, { fuzzy: 0.15, prefix: true, combineWith: "AND" });
  if (ergebnisse.length === 0) ergebnisse = index.search(query, { fuzzy: 0.2, prefix: true, combineWith: "OR" });
  const treffer: SuchTreffer[] = [];
  for (const r of ergebnisse) {
    const c = r as unknown as NormChunk & { score: number };
    if (opts?.slug && c.slug !== opts.slug) continue;
    if (stichtag) {
      if (!(c.fassung_von <= stichtag && (c.fassung_bis === null || c.fassung_bis > stichtag))) continue;
    } else if (c.fassung_bis !== null) continue;
    treffer.push({ ...c, score: r.score });
    if (treffer.length >= (opts?.limit ?? 8)) break;
  }
  return treffer;
}
