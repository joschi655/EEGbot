/**
 * Deterministischer Förder-Matcher: Fall → passende/unpassende Programme mit
 * benannten Gründen, berechneten Fördersätzen und Kumulierungs-Matrix.
 * Der Eligibility-Agent ERKLÄRT nur — gematcht wird hier.
 */
import { readdirSync } from "node:fs";
import { parse } from "yaml";
import { Foerderprogramm } from "../schemas/program.ts";
import { Formular } from "../schemas/form.ts";
import { pruefeBedingung, feldWert } from "../lib/bedingung.ts";

const PROGRAMS_DIR = new URL("../../data/programs/", import.meta.url).pathname;
const FORMS_DIR = new URL("../../data/forms/", import.meta.url).pathname;

let _programme: Foerderprogramm[] | null = null;
export async function ladeProgramme(): Promise<Foerderprogramm[]> {
  if (_programme) return _programme;
  const out: Foerderprogramm[] = [];
  for (const f of readdirSync(PROGRAMS_DIR).filter((f) => /\.(json|ya?ml)$/.test(f))) {
    const text = await Bun.file(`${PROGRAMS_DIR}${f}`).text();
    out.push(Foerderprogramm.parse(f.endsWith(".json") ? JSON.parse(text) : parse(text)));
  }
  _programme = out;
  return out;
}

let _formulare: Formular[] | null = null;
export async function ladeFormulare(): Promise<Formular[]> {
  if (_formulare) return _formulare;
  const out: Formular[] = [];
  for (const f of readdirSync(FORMS_DIR).filter((f) => /\.(json|ya?ml)$/.test(f))) {
    const text = await Bun.file(`${FORMS_DIR}${f}`).text();
    out.push(Formular.parse(f.endsWith(".json") ? JSON.parse(text) : parse(text)));
  }
  _formulare = out;
  return out;
}

export interface ProgrammMatch {
  programm_id: string;
  name: string;
  foerderart: string;
  passt: boolean;
  ausschluss_gruende: string[];
  fehlende_felder: string[]; // Eligibility nicht prüfbar, weil Fall-Feld fehlt
  foerdersatz_prozent?: number; // Summe zutreffender Sätze, gekappt
  saetze: { bezeichnung: string; satz_prozent?: number; zutreffend: boolean | "unbekannt" }[];
  antragsweg: { kanal: string; antrag_vor_massnahmenbeginn: boolean; formulare: string[] };
  hinweise: string[];
}

/** Felder, die eine Bedingung referenziert (rekursiv). */
function referenzierteFelder(b: unknown): string[] {
  if (b == null || typeof b !== "object") return [];
  const o = b as Record<string, unknown>;
  if (typeof o.feld === "string") return [o.feld];
  return Object.values(o).flatMap(referenzierteFelder);
}

export async function matcheProgramme(fall: Record<string, unknown>): Promise<ProgrammMatch[]> {
  const programme = await ladeProgramme();
  const ergebnisse: ProgrammMatch[] = [];

  for (const p of programme) {
    if (p.status !== "aktiv") continue;
    const fehlend = referenzierteFelder(p.eligibility).filter((f) => feldWert(fall, f) === undefined);
    const eligible = fehlend.length === 0 ? pruefeBedingung(p.eligibility, fall) : false;
    const ausschluesse = p.ausschluesse.filter((a) => pruefeBedingung(a.bedingung, fall)).map((a) => a.grund);

    const saetze = p.foerdersaetze.map((s) => {
      const satzFehlend = s.bedingung ? referenzierteFelder(s.bedingung).some((f) => feldWert(fall, f) === undefined) : false;
      return {
        bezeichnung: s.bezeichnung,
        satz_prozent: s.satz_prozent,
        zutreffend: !s.bedingung ? true : satzFehlend ? ("unbekannt" as const) : pruefeBedingung(s.bedingung, fall),
      };
    });
    const summe = saetze.filter((s) => s.zutreffend === true).reduce((acc, s) => acc + (s.satz_prozent ?? 0), 0);
    const gekappt = p.max_foerdersatz_prozent ? Math.min(summe, p.max_foerdersatz_prozent) : summe;

    const hinweise: string[] = [];
    if (fehlend.length) hinweise.push(`Eligibility nicht abschließend prüfbar — fehlende Angaben: ${fehlend.join(", ")}`);
    if (p.antragsweg.antrag_vor_massnahmenbeginn) hinweise.push("Antrag zwingend VOR Maßnahmenbeginn.");
    if (p.antragsweg.fachunternehmer_pflicht) hinweise.push("Umsetzung durch Fachunternehmen erforderlich.");

    ergebnisse.push({
      programm_id: p.id,
      name: p.name,
      foerderart: p.foerderart,
      passt: eligible && ausschluesse.length === 0,
      ausschluss_gruende: ausschluesse,
      fehlende_felder: fehlend,
      foerdersatz_prozent: p.foerderart === "zuschuss" || p.foerderart === "steuerlich" ? gekappt : undefined,
      saetze,
      antragsweg: { kanal: p.antragsweg.kanal, antrag_vor_massnahmenbeginn: p.antragsweg.antrag_vor_massnahmenbeginn, formulare: p.antragsweg.benoetigte_formulare },
      hinweise,
    });
  }
  // passende zuerst, dann nach Fördersatz
  return ergebnisse.sort((a, b) => Number(b.passt) - Number(a.passt) || (b.foerdersatz_prozent ?? 0) - (a.foerdersatz_prozent ?? 0));
}

export interface KumulierungsPruefung {
  programm_a: string;
  programm_b: string;
  kombinierbar: boolean | "unbekannt";
  hinweis?: string;
}

export async function pruefeKumulierung(a: string, b: string): Promise<KumulierungsPruefung> {
  const programme = await ladeProgramme();
  const pa = programme.find((p) => p.id === a);
  if (!pa) return { programm_a: a, programm_b: b, kombinierbar: "unbekannt", hinweis: `Programm '${a}' nicht erfasst` };
  const regel = pa.kumulierung.find((k) => k.programm_id === b);
  if (!regel) {
    const pb = programme.find((p) => p.id === b);
    const rueck = pb?.kumulierung.find((k) => k.programm_id === a);
    if (rueck) return { programm_a: a, programm_b: b, kombinierbar: rueck.kombinierbar, hinweis: rueck.hinweis };
    return { programm_a: a, programm_b: b, kombinierbar: "unbekannt", hinweis: "Keine Kumulierungsregel erfasst — im Programm-Merkblatt prüfen." };
  }
  return { programm_a: a, programm_b: b, kombinierbar: regel.kombinierbar, hinweis: regel.hinweis };
}

/** Formulare, die für den Fall einschlägig sind (benoetigt_wenn-Bedingung). */
export async function formulareFuerFall(fall: Record<string, unknown>): Promise<Formular[]> {
  const formulare = await ladeFormulare();
  return formulare.filter((f) => !f.benoetigt_wenn || pruefeBedingung(f.benoetigt_wenn, fall));
}
