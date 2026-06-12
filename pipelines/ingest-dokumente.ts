#!/usr/bin/env bun
/**
 * Ingestion der NUTZER-Dokumente (`dokumente/`): PDFs, Scans, Fotos, Pläne,
 * Word-Dateien, Textdateien — alles, was zum eigenen Fall gehört.
 *
 * - PDF mit Textebene  → Volltext via unpdf (pure JS, kein Python/Binary)
 * - PDF ohne Textebene → Rasterung via `pdftoppm` (poppler, optional) + OCR;
 *                        ohne poppler: klarer Hinweis statt stillem Scheitern
 * - Bilder (png/jpg/jpeg/webp/bmp/tif) → OCR via tesseract.js (deu+eng)
 *                        UND Registrierung als `bild` fürs Claude-Vision-Routing
 *                        (Pläne/Fotos liest Claude direkt mit dem Read-Tool —
 *                        OCR liefert nur die Beschriftungen für die Suche)
 * - HEIC (iPhone-Fotos) → auf macOS automatische Konvertierung via `sips`
 * - DOCX → Textextraktion aus word/document.xml (via `unzip`)
 * - TXT/MD/CSV → direkt übernommen
 *
 * Output:
 * - dokumente/.extrakte/<name>.md  — Markdown-Extrakt mit Frontmatter
 * - dokumente/.extrakte/manifest.json — Hash-Manifest (idempotent: unveränderte
 *   Dateien werden übersprungen)
 * - knowledge/index/dokumente.json — BM25-Suchindex (MiniSearch)
 *
 * Alles bleibt LOKAL — dokumente/ und knowledge/ sind .gitignored.
 */
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import MiniSearch from "minisearch";

const REPO = new URL("..", import.meta.url).pathname;
const DOK_DIR = join(REPO, "dokumente");
const EXTRAKT_DIR = join(DOK_DIR, ".extrakte");
const MANIFEST_PFAD = join(EXTRAKT_DIR, "manifest.json");
const INDEX_PFAD = join(REPO, "knowledge", "index", "dokumente.json");

const BILD_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"]);
const TEXT_EXT = new Set([".txt", ".md", ".csv"]);

interface ManifestEintrag {
  hash: string;
  typ: "pdf" | "bild" | "text" | "docx" | "uebersprungen";
  extrakt: string | null;
  bild_pfad?: string; // relativ zum Repo — fürs Vision-Routing
  ocr: boolean;
  seiten?: number;
  zeichen: number;
  hinweis?: string;
}
type Manifest = { stand: string; dateien: Record<string, ManifestEintrag> };

function sha256(buf: ArrayBuffer): string {
  const h = new Bun.CryptoHasher("sha256");
  h.update(buf);
  return h.digest("hex");
}

function sammleDateien(dir: string, basis: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    if (name === "README.md" && dir === basis) continue;
    const voll = join(dir, name);
    if (statSync(voll).isDirectory()) out.push(...sammleDateien(voll, basis));
    else out.push(voll);
  }
  return out;
}

async function befehlVorhanden(cmd: string): Promise<boolean> {
  const p = Bun.spawn(["which", cmd], { stdout: "pipe", stderr: "ignore" });
  return (await p.exited) === 0;
}

// --- OCR (lazy: Worker nur starten, wenn wirklich ein Bild/Scan da ist) ---
let _ocrWorker: import("tesseract.js").Worker | null = null;
async function ocr(bildPfad: string): Promise<string> {
  if (!_ocrWorker) {
    const { createWorker } = await import("tesseract.js");
    // Expliziter workerPath: bun löst den Worker sonst aus dem Install-Cache,
    // wo `regenerator-runtime` nicht auffindbar ist.
    const workerPath = join(REPO, "node_modules", "tesseract.js", "src", "worker-script", "node", "index.js");
    const cachePath = join(REPO, ".cache", "tesseract"); // Sprachdaten (~30 MB) landen im gitignorten Cache
    mkdirSync(cachePath, { recursive: true });
    _ocrWorker = await createWorker(["deu", "eng"], 1, { workerPath, cachePath });
  }
  const { data } = await _ocrWorker.recognize(bildPfad);
  return data.text;
}

async function extrahierePdf(pfad: string): Promise<{ text: string; seiten: number; ocrGenutzt: boolean; hinweis?: string }> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const buf = await Bun.file(pfad).arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  // Textebene vorhanden?
  if (text.trim().length >= 40 * Math.max(1, totalPages) || text.trim().length > 400)
    return { text, seiten: totalPages, ocrGenutzt: false };

  // Scan ohne Textebene → Rasterung + OCR, wenn poppler da ist
  if (await befehlVorhanden("pdftoppm")) {
    const tmp = join("/tmp", `eegbot-ocr-${Date.now()}`);
    mkdirSync(tmp, { recursive: true });
    const p = Bun.spawn(["pdftoppm", "-png", "-r", "200", pfad, join(tmp, "seite")], { stderr: "ignore" });
    await p.exited;
    const seitenBilder = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
    let ocrText = "";
    for (const sb of seitenBilder) ocrText += (await ocr(join(tmp, sb))) + "\n\n";
    return { text: ocrText, seiten: totalPages, ocrGenutzt: true };
  }
  return {
    text: text.trim(),
    seiten: totalPages,
    ocrGenutzt: false,
    hinweis: "Scan ohne Textebene — für OCR `brew install poppler` (pdftoppm) installieren oder Seiten als PNG/JPG exportieren und erneut ablegen.",
  };
}

async function extrahiereDocx(pfad: string): Promise<string> {
  if (!(await befehlVorhanden("unzip"))) throw new Error("`unzip` nicht gefunden — für .docx benötigt.");
  const p = Bun.spawn(["unzip", "-p", pfad, "word/document.xml"], { stdout: "pipe", stderr: "ignore" });
  const xml = await new Response(p.stdout).text();
  await p.exited;
  // Absätze erhalten, Tags entfernen
  return xml
    .replace(/<w:p[ >]/g, "\n<w:p ")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** HEIC → JPG (nur macOS via sips); gibt neuen Pfad oder null zurück. */
async function konvertiereHeic(pfad: string): Promise<string | null> {
  if (process.platform !== "darwin" || !(await befehlVorhanden("sips"))) return null;
  const ziel = join("/tmp", basename(pfad).replace(/\.heic$/i, ".jpg"));
  const p = Bun.spawn(["sips", "-s", "format", "jpeg", pfad, "--out", ziel], { stdout: "ignore", stderr: "ignore" });
  return (await p.exited) === 0 ? ziel : null;
}

function frontmatter(felder: Record<string, unknown>): string {
  const zeilen = Object.entries(felder)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${zeilen.join("\n")}\n---\n\n`;
}

async function main() {
  mkdirSync(EXTRAKT_DIR, { recursive: true });
  mkdirSync(join(REPO, "knowledge", "index"), { recursive: true });

  const manifest: Manifest = (await Bun.file(MANIFEST_PFAD).exists())
    ? await Bun.file(MANIFEST_PFAD).json()
    : { stand: "", dateien: {} };

  const dateien = sammleDateien(DOK_DIR, DOK_DIR).filter((f) => !f.startsWith(EXTRAKT_DIR));
  if (dateien.length === 0) {
    console.log(`Keine Dokumente in ${relative(REPO, DOK_DIR)}/ — PDFs, Fotos, Scans, Pläne einfach dort ablegen und erneut ausführen.`);
  }

  let neu = 0, uebersprungen = 0;
  for (const pfad of dateien) {
    const rel = relative(DOK_DIR, pfad);
    const ext = extname(pfad).toLowerCase();
    const buf = await Bun.file(pfad).arrayBuffer();
    const hash = sha256(buf);
    if (manifest.dateien[rel]?.hash === hash) {
      uebersprungen++;
      continue;
    }

    const extraktName = rel.replace(/[\/\\]/g, "__").replace(/\.[^.]+$/, "") + ".md";
    const extraktPfad = join(EXTRAKT_DIR, extraktName);
    try {
      if (ext === ".pdf") {
        const { text, seiten, ocrGenutzt, hinweis } = await extrahierePdf(pfad);
        await Bun.write(
          extraktPfad,
          frontmatter({ quelle: rel, typ: "pdf", seiten, ocr: ocrGenutzt, hinweis }) + text.trim(),
        );
        manifest.dateien[rel] = { hash, typ: "pdf", extrakt: extraktName, ocr: ocrGenutzt, seiten, zeichen: text.length, hinweis };
        console.log(`✓ PDF  ${rel} (${seiten} S., ${ocrGenutzt ? "OCR" : "Textebene"}${hinweis ? ", " + hinweis : ""})`);
      } else if (BILD_EXT.has(ext) || ext === ".heic") {
        let bildPfad = pfad;
        if (ext === ".heic") {
          const konvertiert = await konvertiereHeic(pfad);
          if (!konvertiert) {
            manifest.dateien[rel] = { hash, typ: "uebersprungen", extrakt: null, ocr: false, zeichen: 0, hinweis: "HEIC nicht konvertierbar (kein macOS/sips) — bitte als JPG/PNG exportieren." };
            console.log(`⚠ HEIC ${rel} — bitte als JPG/PNG exportieren`);
            continue;
          }
          bildPfad = konvertiert;
        }
        const text = await ocr(bildPfad);
        await Bun.write(
          extraktPfad,
          frontmatter({ quelle: rel, typ: "bild", ocr: true, bild_pfad: relative(REPO, pfad), hinweis: "Für Pläne/Fotos: Claude liest das Originalbild direkt (Read-Tool) — dieser OCR-Extrakt dient nur der Suche." }) + text.trim(),
        );
        manifest.dateien[rel] = { hash, typ: "bild", extrakt: extraktName, bild_pfad: relative(REPO, pfad), ocr: true, zeichen: text.length };
        console.log(`✓ BILD ${rel} (OCR ${text.trim().length} Zeichen, Original fürs Vision-Lesen registriert)`);
      } else if (ext === ".docx") {
        const text = await extrahiereDocx(pfad);
        await Bun.write(extraktPfad, frontmatter({ quelle: rel, typ: "docx", ocr: false }) + text);
        manifest.dateien[rel] = { hash, typ: "docx", extrakt: extraktName, ocr: false, zeichen: text.length };
        console.log(`✓ DOCX ${rel}`);
      } else if (TEXT_EXT.has(ext)) {
        const text = await Bun.file(pfad).text();
        await Bun.write(extraktPfad, frontmatter({ quelle: rel, typ: "text", ocr: false }) + text);
        manifest.dateien[rel] = { hash, typ: "text", extrakt: extraktName, ocr: false, zeichen: text.length };
        console.log(`✓ TEXT ${rel}`);
      } else {
        manifest.dateien[rel] = { hash, typ: "uebersprungen", extrakt: null, ocr: false, zeichen: 0, hinweis: `Format ${ext} nicht unterstützt (unterstützt: pdf, png/jpg/webp/tif, heic, docx, txt/md/csv).` };
        console.log(`⚠ SKIP ${rel} (${ext})`);
        continue;
      }
      neu++;
    } catch (e) {
      manifest.dateien[rel] = { hash, typ: "uebersprungen", extrakt: null, ocr: false, zeichen: 0, hinweis: `Extraktion fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}` };
      console.error(`✗ FEHLER ${rel}: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (_ocrWorker) await _ocrWorker.terminate();

  // Entfernte Dateien aus dem Manifest räumen
  for (const rel of Object.keys(manifest.dateien))
    if (!dateien.some((f) => relative(DOK_DIR, f) === rel)) delete manifest.dateien[rel];

  manifest.stand = new Date().toISOString();
  await Bun.write(MANIFEST_PFAD, JSON.stringify(manifest, null, 1));

  // --- BM25-Index über alle Extrakte (Chunking: Absätze, ~800 Zeichen) ---
  const index = new MiniSearch({
    fields: ["text", "quelle"],
    storeFields: ["quelle", "typ", "chunk_nr", "text", "bild_pfad"],
  });
  let chunks = 0;
  for (const [rel, e] of Object.entries(manifest.dateien)) {
    if (!e.extrakt) continue;
    const inhalt = await Bun.file(join(EXTRAKT_DIR, e.extrakt)).text();
    const body = inhalt.replace(/^---[\s\S]*?---\n/, "");
    const absaetze: string[] = [];
    let aktuell = "";
    for (const abs of body.split(/\n\s*\n/)) {
      if ((aktuell + abs).length > 800 && aktuell) {
        absaetze.push(aktuell.trim());
        aktuell = "";
      }
      aktuell += abs + "\n\n";
    }
    if (aktuell.trim()) absaetze.push(aktuell.trim());
    absaetze.forEach((text, i) => {
      index.add({ id: `${rel}:${i}`, quelle: rel, typ: e.typ, chunk_nr: i, text, bild_pfad: e.bild_pfad });
      chunks++;
    });
  }
  await Bun.write(INDEX_PFAD, JSON.stringify(index.toJSON()));

  console.log(`\nDokumente: ${neu} neu/aktualisiert, ${uebersprungen} unverändert übersprungen`);
  console.log(`Index: ${chunks} Chunks → ${relative(REPO, INDEX_PFAD)}`);
}

await main();
