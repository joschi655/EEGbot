/**
 * Deterministische Programm-Fakten-Auskunft: Durchführer-Unterschiede (KfW vs. BAFA)
 * als nachschlagbare Daten statt Modellwissen — Antragstellung/Vollmacht,
 * Antragsberechtigte, förderfähige Nebenkosten, Praxis-Bearbeitungszeiten,
 * bekannte offene Auslegungsfragen und Richtlinien-Stand.
 * Arrays werden zu Maps normalisiert (posten/bereich als Schlüssel), damit
 * Benchmark-Goldpfade indexfrei und stabil bleiben.
 */
import type { Auslegungshinweis, Foerderprogramm } from "../schemas/program.ts";
import type { ProgrammauskunftInputContract } from "../schemas/rechner.ts";
import { ladeProgramme } from "./foerderMatcher.ts";

export interface ProgrammFakten {
  programm_id: string;
  name: string;
  traeger: string;
  antragstellung?: Foerderprogramm["antragstellung"];
  antragsberechtigte?: Foerderprogramm["antragsberechtigte"];
  nebenkosten: Record<string, { foerderfaehig: boolean; hinweis?: string }>;
  bearbeitungszeiten: Record<
    string,
    { praxis_monate_min?: number; kein_rechtsanspruch: true; hinweis: string; stand: string }
  >;
  auslegungshinweise: Auslegungshinweis[];
  richtlinie?: Foerderprogramm["richtlinie"];
  quellen: Foerderprogramm["quellen"];
  stand: string; // zuletzt_geprueft
}

export async function programmauskunft(
  input: ProgrammauskunftInputContract,
): Promise<Record<string, ProgrammFakten>> {
  const programme = await ladeProgramme();
  const ergebnis: Record<string, ProgrammFakten> = {};

  for (const id of input.programm_ids) {
    const p = programme.find((prog) => prog.id === id);
    if (!p) throw new Error(`Programm '${id}' nicht erfasst — verfügbare: ${programme.map((x) => x.id).join(", ")}`);

    const nebenkosten: ProgrammFakten["nebenkosten"] = {};
    for (const n of p.foerderfaehige_nebenkosten)
      nebenkosten[n.posten] = { foerderfaehig: n.foerderfaehig, hinweis: n.hinweis };

    const bearbeitungszeiten: ProgrammFakten["bearbeitungszeiten"] = {};
    for (const b of p.bearbeitungszeiten)
      bearbeitungszeiten[b.bereich] = {
        praxis_monate_min: b.praxis_monate_min,
        kein_rechtsanspruch: b.kein_rechtsanspruch,
        hinweis: b.hinweis,
        stand: b.stand,
      };

    ergebnis[p.id] = {
      programm_id: p.id,
      name: p.name,
      traeger: p.traeger,
      antragstellung: p.antragstellung,
      antragsberechtigte: p.antragsberechtigte,
      nebenkosten,
      bearbeitungszeiten,
      auslegungshinweise: p.auslegungshinweise,
      richtlinie: p.richtlinie,
      quellen: p.quellen,
      stand: p.zuletzt_geprueft,
    };
  }
  return ergebnis;
}
