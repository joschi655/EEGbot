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
