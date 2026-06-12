#!/usr/bin/env bun
/**
 * Catala ⇄ TypeScript Cross-Check.
 *
 * Rechnet identische Szenarien durch BEIDE Implementierungen:
 *  - die formale Catala-Spezifikation (`rules/*.catala_en`, via `clerk run`;
 *    die Dateien enthalten zusätzlich eigene `assertion`-Anker)
 *  - die ausführbare TS-Engine (`src/rules/`)
 * und vergleicht die Ergebnisse. Divergenz = Bug in einer der beiden Schichten.
 *
 * Catala ≥ 1.2 läuft über das Build-Tool `clerk` (kommt mit `opam install
 * catala`): beim ersten Lauf initialisiert `clerk start` die Stdlib unter
 * rules/_build (gitignored). Ohne installierte Toolchain laufen nur die
 * TS-Checks (Skip-Hinweis); mit `--require-catala` (CI) ist das ein Fehler.
 * Pfad-Override: $CLERK_BIN.
 */
import { berechneSanktion52 } from "../src/rules/sanktion52.ts";
import { pruefeZusammenfassung, type AnlageZsf } from "../src/rules/anlagenzusammenfassung.ts";

const REPO = new URL("..", import.meta.url).pathname;
const STICHTAG = "2026-06-12";
const requireCatala = process.argv.includes("--require-catala");

// ── Szenarien §52 — Spiegel der Test1..Test7 in rules/sanktion52.catala_en ──
// (Zusatzmonate greifen in der TS-Engine nur bei beendetem Verstoß → `ende` gesetzt)
const S52 = [
  { scope: "Test1", erwartet: 600, leistung: 10, kategorie: "11", geheilt: false, beginn: "2025-01-15", ende: "2025-06-15" },
  { scope: "Test2", erwartet: 120, leistung: 10, kategorie: "11", geheilt: true, beginn: "2025-01-15", ende: "2025-06-15" },
  { scope: "Test3", erwartet: 33, leistung: 5.5, kategorie: "9a", geheilt: false, beginn: "2025-03-01", ende: "2025-05-10" },
  { scope: "Test4", erwartet: 1000, leistung: 20, kategorie: "7", geheilt: false, beginn: "2025-02-01", ende: "2025-03-20" },
  { scope: "Test5", erwartet: 200, leistung: 10, kategorie: "9", geheilt: true, beginn: "2025-04-01", ende: "2025-04-25" },
  { scope: "Test6", erwartet: 192, leistung: 8, kategorie: "10", geheilt: false, beginn: "2025-05-01", ende: "2025-06-15" },
  { scope: "Test7", erwartet: 70, leistung: 1, kategorie: "12", geheilt: true, beginn: "2025-08-01", ende: "2025-08-20" },
] as const;

// ── Szenarien §24 — Spiegel der Test1_24..Test5_24 ──
const basisAnlage = (over: Partial<AnlageZsf>): AnlageZsf => ({
  id: "x",
  energietraeger: "solar",
  ibn_datum: "2024-03-01",
  leistung_kwp: 10,
  anlagentyp: "dach",
  grundstueck_id: "g1",
  gebaeude_id: "geb1",
  netzverknuepfungspunkt_id: "nvp1",
  ...over,
});
const S24 = [
  { scope: "Test1_24", erwartet: "ZUSAMMENZUFASSEN", a: basisAnlage({}), b: basisAnlage({ ibn_datum: "2024-09-01" }) },
  { scope: "Test2_24", erwartet: "NICHT_ZUSAMMENZUFASSEN", a: basisAnlage({ anlagentyp: "steckersolar", leistung_kwp: 0.8 }), b: basisAnlage({ ibn_datum: "2024-04-01" }) },
  { scope: "Test3_24", erwartet: "NICHT_ZUSAMMENZUFASSEN", a: basisAnlage({ ibn_datum: "2022-01-01" }), b: basisAnlage({ ibn_datum: "2024-09-01" }) },
  {
    scope: "Test4_24",
    erwartet: "LLM_SUBSUMTION_ERFORDERLICH",
    a: basisAnlage({ anlagentyp: "sonstig", grundstueck_id: "g1", gebaeude_id: undefined, netzverknuepfungspunkt_id: "nvp1" }),
    b: basisAnlage({ anlagentyp: "sonstig", ibn_datum: "2024-05-01", grundstueck_id: "g2", gebaeude_id: undefined, netzverknuepfungspunkt_id: "nvp2" }),
  },
  { scope: "Test5_24", erwartet: "NICHT_ZUSAMMENZUFASSEN", a: basisAnlage({ anlagentyp: "freiflaeche", gebaeude_id: undefined }), b: basisAnlage({ ibn_datum: "2024-04-01" }) },
] as const;

const CATALA_ERGEBNIS_MAP: Record<string, string> = {
  Zusammenzufassen: "ZUSAMMENZUFASSEN",
  NichtZusammenzufassen: "NICHT_ZUSAMMENZUFASSEN",
  SubsumtionErforderlich: "LLM_SUBSUMTION_ERFORDERLICH",
};

async function findeClerk(): Promise<string[] | null> {
  if (process.env.CLERK_BIN) return process.env.CLERK_BIN.split(" ");
  const p = Bun.spawn(["which", "clerk"], { stdout: "pipe", stderr: "ignore" });
  if ((await p.exited) === 0) return ["clerk"];
  return null;
}

let clerkInitialisiert = false;
async function clerkRun(bin: string[], datei: string, scope: string): Promise<string> {
  const rulesDir = `${REPO}rules`;
  if (!clerkInitialisiert) {
    const init = Bun.spawn([...bin, "start"], { cwd: rulesDir, stdout: "ignore", stderr: "pipe" });
    if ((await init.exited) !== 0)
      throw new Error(`clerk start fehlgeschlagen:\n${await new Response(init.stderr).text()}`);
    clerkInitialisiert = true;
  }
  const p = Bun.spawn([...bin, "run", datei, "--scope", scope], { cwd: rulesDir, stdout: "pipe", stderr: "pipe" });
  const [out, err] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text()]);
  if ((await p.exited) !== 0)
    throw new Error(`clerk run --scope=${scope} fehlgeschlagen (inkl. assertion-Verstöße):\n${err || out}`);
  return out + "\n" + err; // clerk schreibt Ergebnisse je nach Version auf stdout oder stderr
}

function parseWert(output: string, name: string): string {
  const m = output.match(new RegExp(`${name}\\s*=\\s*([^\\s│]+)`));
  if (!m?.[1]) throw new Error(`Konnte '${name} = …' nicht aus Catala-Output parsen:\n${output.slice(0, 500)}`);
  // Catala formatiert Dezimalzahlen mit Tausender-Komma (1,000.0) — Punkt ist Dezimaltrenner
  return m[1].replace(/[;]$/, "").replaceAll(",", "");
}

let fehler = 0;
const ok = (s: string) => console.log(`✓ ${s}`);
const fail = (s: string) => {
  console.error(`✗ ${s}`);
  fehler++;
};

const catalaBin = await findeClerk();
if (!catalaBin) {
  const msg = "Catala-Toolchain (clerk) nicht gefunden (PATH/CLERK_BIN) — Spezifikations-Seite wird übersprungen.";
  if (requireCatala) {
    console.error(`✗ ${msg} (--require-catala gesetzt)`);
    process.exit(1);
  }
  console.log(`⚠ ${msg} TS-Seite wird trotzdem gegen die erwarteten Werte geprüft.`);
}

// ── §52 ──
for (const s of S52) {
  const ts = await berechneSanktion52({
    leistung_kw: s.leistung,
    stichtag: STICHTAG,
    verstoesse: [{ kategorie: s.kategorie, beginn: s.beginn, ende: s.ende, geheilt: s.geheilt }],
  });
  const tsWert = Math.round(ts.exposure_gesamt_eur * 100) / 100;
  if (Math.abs(tsWert - s.erwartet) > 0.005) fail(`§52 ${s.scope}: TS=${tsWert} ≠ erwartet ${s.erwartet}`);
  else ok(`§52 ${s.scope}: TS = ${tsWert} €`);

  if (catalaBin) {
    const out = await clerkRun(catalaBin, "sanktion52.catala_en", s.scope);
    const catalaWert = Number(parseWert(out, "exposure"));
    if (Math.abs(catalaWert - tsWert) > 0.005) fail(`§52 ${s.scope}: Catala=${catalaWert} ≠ TS=${tsWert} — SPEZIFIKATIONS-DIVERGENZ`);
    else ok(`§52 ${s.scope}: Catala = TS = ${catalaWert} €`);
  }
}

// ── §24 ──
for (const s of S24) {
  const ts = pruefeZusammenfassung(s.a, s.b);
  if (ts.status !== s.erwartet) fail(`§24 ${s.scope}: TS=${ts.status} ≠ erwartet ${s.erwartet}`);
  else ok(`§24 ${s.scope}: TS = ${ts.status}`);

  if (catalaBin) {
    const out = await clerkRun(catalaBin, "anlagenzusammenfassung_24.catala_en", s.scope);
    const roh = parseWert(out, "erg");
    const catalaStatus = CATALA_ERGEBNIS_MAP[roh] ?? roh;
    if (catalaStatus !== ts.status) fail(`§24 ${s.scope}: Catala=${catalaStatus} ≠ TS=${ts.status} — SPEZIFIKATIONS-DIVERGENZ`);
    else ok(`§24 ${s.scope}: Catala = TS = ${catalaStatus}`);
  }
}

console.log(
  fehler === 0
    ? `\nCross-Check bestanden${catalaBin ? " (Catala-Spezifikation ⇄ TS-Engine deckungsgleich)" : " (nur TS-Seite — Catala nicht installiert)"}`
    : `\n${fehler} Divergenz(en) — Spezifikation und Engine auseinandergelaufen.`,
);
process.exit(fehler === 0 ? 0 : 1);
