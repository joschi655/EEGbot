/**
 * Deterministischer RDG/StBerG-Guardrail-Classifier.
 * Matcht Text (Nutzeranfrage oder geplante Antwort) gegen data/guardrails/policy.yaml.
 * Kein LLM — der Hook muss in < 100 ms entscheiden können.
 * Konfliktauflösung: rot > gelb > grün (strengste zutreffende Kategorie gewinnt).
 */
import { parse } from "yaml";
import { GuardrailPolicy, type GuardrailKategorie } from "../schemas/guardrail.ts";

let _policy: GuardrailPolicy | null = null;
export async function ladePolicy(): Promise<GuardrailPolicy> {
  if (_policy) return _policy;
  const pfad = new URL("../../data/guardrails/policy.yaml", import.meta.url).pathname;
  _policy = GuardrailPolicy.parse(parse(await Bun.file(pfad).text()));
  return _policy;
}

export interface GuardrailBefund {
  ampel: "gruen" | "gelb" | "rot";
  kategorien: { id: string; ampel: string; begruendung: string; treffer: string }[];
  eskalation_an?: string;
  ersatztext?: string;
  disclaimer: string;
}

export interface GuardrailAusgabePruefung {
  erlaubt: boolean;
  gruende: string[];
  korrekturhinweis?: string;
}

const RANG = { rot: 3, gelb: 2, gruen: 1 } as const;

export async function klassifiziere(text: string): Promise<GuardrailBefund> {
  const policy = await ladePolicy();
  const t = text.toLowerCase();
  const treffer: GuardrailBefund["kategorien"] = [];
  let strengste: GuardrailKategorie | null = null;

  for (const kat of policy.kategorien) {
    for (const muster of kat.muster) {
      const hit = kat.regex ? new RegExp(muster, "i").test(text) : t.includes(muster.toLowerCase());
      if (hit) {
        treffer.push({ id: kat.id, ampel: kat.ampel, begruendung: kat.begruendung, treffer: muster });
        if (!strengste || RANG[kat.ampel] > RANG[strengste.ampel]) strengste = kat;
        break; // pro Kategorie reicht ein Treffer
      }
    }
  }

  const ampel = strengste?.ampel ?? policy.default_ampel;
  return {
    ampel,
    kategorien: treffer,
    eskalation_an: strengste?.ampel === "rot" || strengste?.ampel === "gelb" ? strengste.eskalation_an : undefined,
    ersatztext: strengste?.ampel === "rot" ? strengste.ersatztext : undefined,
    disclaimer: policy.disclaimer,
  };
}

const ABLEHNUNG = /(?:kann|darf|werde|entwerfe|pr(?:ü|ue)fe).{0,100}\b(?:nicht|keine)\b|\b(?:keine|nicht)\s+(?:individuelle|verbindliche)\b/i;
const UNSICHERHEIT = /\b(?:unsicher|einzelfall|einzelfallpr(?:ü|ue)fung|auslegung|abw(?:ä|ae)gung|w(?:ü|ue)rdigung|abh(?:ä|ae)ng|nicht abschlie(?:ß|ss)end|kann variieren)\b/i;
const QUELLE = /(?:§\s*\d|\b(?:BGH|BVerfG|Clearingstelle|Fassung|Fundstelle|Aktenzeichen)\b|https?:\/\/)/i;
const DISCLAIMER = /(?:keine rechtsberatung|allgemeine rechtsinformation|§\s*2\s+RDG|rechtsinformation auf kategorie-ebene)/i;

function hatEskalationsziel(text: string, ziel?: string): boolean {
  const t = text.toLowerCase();
  if (ziel === "steuerberater") return /steuerberater|steuerberatung/.test(t);
  if (ziel === "energieberater") return /energieberater|fachplaner/.test(t);
  if (ziel === "anwalt") return /anwalt|rechtsanwalt|clearingstelle/.test(t);
  return /fachanwalt|anwalt|steuerberater|energieberater|clearingstelle|fachperson/.test(t);
}

/**
 * Zweite Guardrail-Stufe für den Claude-Code-Stop-Hook. Der Prompt-Befund legt
 * fest, welche Sicherungen die fertige Antwort enthalten muss. So bleibt der
 * schnelle lexikalische Classifier deterministisch, prüft aber nicht nur die
 * Anfrage, sondern verhindert auch das Ausliefern einer ungesicherten Antwort.
 */
export async function pruefeGuardrailAusgabe(
  promptBefund: GuardrailBefund,
  ausgabe: string,
): Promise<GuardrailAusgabePruefung> {
  if (promptBefund.ampel === "gruen") return { erlaubt: true, gruende: [] };

  const gruende: string[] = [];
  const ausgabeBefund = await klassifiziere(ausgabe);

  if (ausgabeBefund.ampel === "rot")
    gruende.push("Die Antwort wiederholt einen ROT-Trigger, statt ihn durch die freigegebene Kategorieinformation zu ersetzen.");

  if (promptBefund.ampel === "rot") {
    if (!ABLEHNUNG.test(ausgabe)) gruende.push("Die erforderliche klare Ablehnung der individuellen Rechts- oder Steuerleistung fehlt.");
    if (!hatEskalationsziel(ausgabe, promptBefund.eskalation_an))
      gruende.push(`Der vorgesehene Eskalationsweg (${promptBefund.eskalation_an ?? "Fachperson"}) fehlt.`);
  } else {
    if (!UNSICHERHEIT.test(ausgabe)) gruende.push("Die ausdrückliche Unsicherheits- oder Einzelfallkennzeichnung fehlt.");
    if (!QUELLE.test(ausgabe)) gruende.push("Eine Norm-, Fassungs- oder Fundstellenangabe fehlt.");
    if (!hatEskalationsziel(ausgabe, promptBefund.eskalation_an))
      gruende.push(`Die Eskalationsoption (${promptBefund.eskalation_an ?? "Fachperson"}) fehlt.`);
    if (!DISCLAIMER.test(ausgabe)) gruende.push("Der RDG-Disclaimer fehlt.");
  }

  if (gruende.length === 0) return { erlaubt: true, gruende: [] };

  const korrekturhinweis =
    promptBefund.ampel === "rot"
      ? `Schreibe die Antwort vollständig neu. Verwende als zulässigen Kern diesen geprüften Ersatztext:\n${promptBefund.ersatztext ?? "Lehne die individuelle Leistung ab und verweise an die genannte Fachperson."}\nNenne außerdem den Eskalationsweg, ohne die ROT-Trigger zu wiederholen.`
      : "Schreibe die Antwort vollständig neu: nur Kategorieinformation, Unsicherheit ausdrücklich kennzeichnen, Norm/Fassung oder Fundstelle nennen, passende Eskalationsoption und RDG-Disclaimer ergänzen.";

  return { erlaubt: false, gruende, korrekturhinweis };
}
