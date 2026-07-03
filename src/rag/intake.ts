/**
 * KI-Intake: füllt die Fahrplan-Fall-Felder automatisch aus den NUTZER-
 * Dokumenten (dokumente/ → Extrakte) und optionalem Freitext — damit der
 * Nutzer möglichst wenig selbst ausfüllen muss.
 *
 * Arbeitsteilung (Guardrail-Story): Die KI SCHLÄGT Feldwerte VOR — mit
 * Beleg-Pflicht (Quelle + Zitat, sonst verworfen). Der Mensch bestätigt,
 * die deterministische Engine rechnet. Kein Vorschlag ohne Beleg.
 *
 * Die Inferenz ist injizierbar (`anfrage`): Tests laufen ohne API-Key;
 * produktiv wird die Anthropic-API genutzt (ANTHROPIC_API_KEY, z. B. in .env).
 */
import { ladeManifest, liesExtrakt } from "./dokumente.ts";
import { FELD_FRAGEN } from "../rules/fahrplan.ts";

export type FeldTyp = "boolean" | "zahl" | "text";

export interface KatalogEintrag {
  feld: string;
  frage: string;
  typ: FeldTyp;
  erlaubte_werte?: string[];
}

const TYPEN: Record<string, { typ: FeldTyp; erlaubte_werte?: string[] }> = {
  "massnahme.typ": {
    typ: "text",
    erlaubte_werte: ["waermepumpe", "daemmung", "fenster", "tueren", "lueftung", "solarthermie", "biomasseheizung", "fernwaermeanschluss", "heizungsoptimierung", "anlagentechnik"],
  },
  "massnahme.begonnen": { typ: "boolean" },
  "massnahme.ersetzt_fossile_heizung": { typ: "boolean" },
  "massnahme.wp_effizienzbonus_qualifiziert": { typ: "boolean" },
  "massnahme.kosten_eur": { typ: "zahl" },
  "massnahme.bereits_gefoerdert": { typ: "boolean" },
  "gebaeude.bestandsgebaeude": { typ: "boolean" },
  "gebaeude.alter_jahre": { typ: "zahl" },
  "antragsteller.selbstnutzend": { typ: "boolean" },
  "antragsteller.haushaltseinkommen_eur": { typ: "zahl" },
  "antragsteller.isfp_vorhanden": { typ: "boolean" },
  eigentumsform: { typ: "text", erlaubte_werte: ["eigentum", "miete", "weg"] },
  "standort.bundesland": { typ: "text", erlaubte_werte: ["BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"] },
  "standort.kommune": { typ: "text" },
  "standort.plz": { typ: "text" },
};

/** Alle Fahrplan-Felder mit Frage + Typinfo — Grundlage des Extraktions-Prompts. */
export const FELD_KATALOG: KatalogEintrag[] = Object.entries(FELD_FRAGEN).map(([feld, frage]) => ({
  feld,
  frage,
  typ: TYPEN[feld]?.typ ?? "text",
  erlaubte_werte: TYPEN[feld]?.erlaubte_werte,
}));

export interface IntakeVorschlag {
  feld: string;
  wert: string | number | boolean;
  beleg: { quelle: string; zitat: string };
  sicherheit: "hoch" | "mittel" | "niedrig";
}

export interface IntakeErgebnis {
  felder: IntakeVorschlag[];
  nicht_gefunden: string[];
  dokumente_verwendet: string[];
  hinweis?: string;
}

export type AnfrageFn = (system: string, user: string) => Promise<string>;

const MAX_ZEICHEN_PRO_DOKUMENT = 4000;
const MAX_ZEICHEN_GESAMT = 24000;

async function sammleDokumentKontext(): Promise<{ kontext: string; verwendet: string[] }> {
  const manifest = await ladeManifest();
  const verwendet: string[] = [];
  const teile: string[] = [];
  let gesamt = 0;
  for (const [quelle, eintrag] of Object.entries(manifest.dateien)) {
    if (!eintrag.extrakt || gesamt >= MAX_ZEICHEN_GESAMT) continue;
    try {
      const text = (await liesExtrakt(quelle)).slice(0, MAX_ZEICHEN_PRO_DOKUMENT);
      teile.push(`### Dokument: ${quelle}\n${text}`);
      verwendet.push(quelle);
      gesamt += text.length;
    } catch {
      // Extrakt nicht lesbar — Dokument überspringen, Intake bleibt nutzbar.
    }
  }
  return { kontext: teile.join("\n\n"), verwendet };
}

/** Default-Inferenz: Anthropic-API (claude-sonnet-5). Erwartet ANTHROPIC_API_KEY. */
export const anthropicAnfrage: AnfrageFn = async (system, user) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key)
    throw new Error(
      "KI-Vorbefüllung braucht einen Anthropic-API-Key: ANTHROPIC_API_KEY in .env (Repo-Wurzel) oder als Umgebungsvariable setzen. " +
        "Alternative ohne Key: das Repo in Claude Code öffnen — dort liest Claude die Unterlagen direkt (Skill „Unterlagen“).",
    );
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.INTAKE_MODEL ?? "claude-sonnet-5",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic-API-Fehler ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  return data.content.find((c) => c.type === "text")?.text ?? "";
};

function koerziere(wert: unknown, eintrag: KatalogEintrag): string | number | boolean | undefined {
  if (eintrag.typ === "boolean") {
    if (typeof wert === "boolean") return wert;
    if (typeof wert === "string") {
      const w = wert.toLowerCase().trim();
      if (w === "ja" || w === "true") return true;
      if (w === "nein" || w === "false") return false;
    }
    return undefined;
  }
  if (eintrag.typ === "zahl") {
    const n = typeof wert === "number" ? wert : typeof wert === "string" ? Number(wert.replace(/[.\s€]/g, "").replace(",", ".")) : NaN;
    return Number.isFinite(n) ? n : undefined;
  }
  if (typeof wert !== "string" || wert === "") return undefined;
  const w = wert.toLowerCase().trim();
  if (eintrag.erlaubte_werte) {
    const treffer = eintrag.erlaubte_werte.find((e) => e.toLowerCase() === w);
    return treffer;
  }
  return wert.trim();
}

function baueSystemPrompt(): string {
  return [
    "Du extrahierst Fall-Felder für einen deterministischen Förderrechner aus deutschen Unterlagen (Angebote, Bescheide, Datenblätter) und Freitext.",
    "Antworte AUSSCHLIESSLICH mit einem JSON-Array, ohne Erklärtext, ohne Markdown-Zaun.",
    'Format je Element: {"feld": "<pfad aus dem Katalog>", "wert": <passend zum typ>, "beleg": {"quelle": "<dokumentname oder freitext>", "zitat": "<wörtliche kurze Textstelle>"}, "sicherheit": "hoch"|"mittel"|"niedrig"}.',
    "Regeln: NUR Felder aus dem Katalog. NUR Werte, die durch ein wörtliches Zitat belegbar sind — nichts erraten, im Zweifel Feld weglassen.",
    "boolean als true/false; zahl als Zahl ohne Einheiten; bei erlaubte_werte exakt einen dieser Werte wählen.",
  ].join("\n");
}

export async function extrahiereFall(
  opts: {
    freitext?: string;
    anfrage?: AnfrageFn;
    /** Testbarkeit: Dokument-Kontext-Sammlung injizierbar (Default liest dokumente/.extrakte). */
    sammleKontext?: () => Promise<{ kontext: string; verwendet: string[] }>;
  } = {},
): Promise<IntakeErgebnis> {
  const { kontext, verwendet } = await (opts.sammleKontext ?? sammleDokumentKontext)().catch(() => ({ kontext: "", verwendet: [] as string[] }));
  const freitext = opts.freitext?.trim() ?? "";
  if (!kontext && !freitext) {
    return {
      felder: [],
      nicht_gefunden: FELD_KATALOG.map((k) => k.feld),
      dokumente_verwendet: [],
      hinweis:
        "Keine Unterlagen gefunden und kein Freitext angegeben. Unterlagen in dokumente/ ablegen und `bun run ingest:dokumente` ausführen — oder das Vorhaben kurz beschreiben.",
    };
  }

  const anfrage = opts.anfrage ?? anthropicAnfrage;
  const katalog = FELD_KATALOG.map((k) =>
    `- ${k.feld} (${k.typ}${k.erlaubte_werte ? `: ${k.erlaubte_werte.join("|")}` : ""}) — ${k.frage}`,
  ).join("\n");
  const user = [
    "## Feld-Katalog",
    katalog,
    freitext ? `\n## Freitext des Nutzers\n${freitext}` : "",
    kontext ? `\n## Unterlagen\n${kontext}` : "",
  ].join("\n");

  const antwort = await anfrage(baueSystemPrompt(), user);
  const json = antwort.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
  let roh: unknown;
  try {
    roh = JSON.parse(json);
  } catch {
    throw new Error(`KI-Antwort war kein valides JSON: ${antwort.slice(0, 200)}`);
  }
  if (!Array.isArray(roh)) throw new Error("KI-Antwort war kein JSON-Array.");

  const felder: IntakeVorschlag[] = [];
  for (const item of roh as Record<string, unknown>[]) {
    const eintrag = FELD_KATALOG.find((k) => k.feld === item.feld);
    if (!eintrag) continue; // unbekanntes Feld → verwerfen
    const beleg = item.beleg as { quelle?: unknown; zitat?: unknown } | undefined;
    if (!beleg || typeof beleg.quelle !== "string" || typeof beleg.zitat !== "string" || beleg.zitat.trim() === "")
      continue; // Beleg-Pflicht: ohne Quelle+Zitat kein Vorschlag
    const wert = koerziere(item.wert, eintrag);
    if (wert === undefined) continue;
    // Zitat-deckt-Wert-Check (Zahlen): der Beleg muss den Zahlenwert wörtlich
    // enthalten — ein existierendes, aber unpassendes Zitat reicht nicht.
    if (eintrag.typ === "zahl") {
      const zitatZiffern = beleg.zitat.replace(/\D/g, "");
      const wertZiffern = String(wert).replace(/\D/g, "");
      if (wertZiffern === "" || !zitatZiffern.includes(wertZiffern)) continue;
    }
    const sicherheit = item.sicherheit === "hoch" || item.sicherheit === "niedrig" ? item.sicherheit : "mittel";
    felder.push({ feld: eintrag.feld, wert, beleg: { quelle: beleg.quelle, zitat: beleg.zitat.slice(0, 300) }, sicherheit });
  }

  const gefunden = new Set(felder.map((f) => f.feld));
  return {
    felder,
    nicht_gefunden: FELD_KATALOG.map((k) => k.feld).filter((f) => !gefunden.has(f)),
    dokumente_verwendet: verwendet,
  };
}
