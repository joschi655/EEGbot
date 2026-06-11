import { parse } from "yaml";
import { ParameterDatei } from "../schemas/parameter.ts";

const DATA_DIR = new URL("../../data/parameters/", import.meta.url).pathname;
const cache = new Map<string, ParameterDatei>();

export async function ladeParameter(id: string): Promise<ParameterDatei> {
  const hit = cache.get(id);
  if (hit) return hit;
  const file = Bun.file(`${DATA_DIR}${id}.yaml`);
  if (!(await file.exists())) throw new Error(`Parameter '${id}' nicht gefunden (data/parameters/${id}.yaml)`);
  const parsed = ParameterDatei.parse(parse(await file.text()));
  if (parsed.id !== id) throw new Error(`Parameter-ID '${parsed.id}' ≠ Dateiname '${id}'`);
  cache.set(id, parsed);
  return parsed;
}

export interface ParameterTreffer {
  wert: number | boolean | string;
  gueltig_von: string;
  gueltig_bis?: string;
  quelle: string;
}

/**
 * Kernfunktion des OpenFisca-Patterns: Parameterwert zum Stichtag.
 * Bei Leistungsstaffelung wird `leistung_kwp` benötigt; gestaffelte Tarife werden
 * NICHT gemittelt zurückgegeben — dafür gibt es `parameterStaffel`.
 */
export async function parameterWert(id: string, datum: string, leistung_kwp?: number): Promise<ParameterTreffer> {
  const p = await ladeParameter(id);
  const zeitraum = p.zeitraeume.find(
    (z) => z.gueltig_von <= datum && (!z.gueltig_bis || datum <= z.gueltig_bis),
  );
  if (!zeitraum)
    throw new Error(`Parameter '${id}': kein Gültigkeitszeitraum für ${datum}. Datenlücke — Zeitraum in data/parameters/${id}.yaml ergänzen.`);

  let wert: number | boolean | string;
  if (Array.isArray(zeitraum.wert)) {
    if (p.staffelung !== "leistung_kwp" || leistung_kwp === undefined)
      throw new Error(`Parameter '${id}' ist leistungsgestaffelt — leistung_kwp angeben.`);
    const stufe =
      zeitraum.wert.find((s) => s.bis_kwp !== undefined && leistung_kwp <= s.bis_kwp) ??
      zeitraum.wert.find((s) => s.bis_kwp === undefined);
    if (!stufe) throw new Error(`Parameter '${id}': keine Staffelstufe für ${leistung_kwp} kWp`);
    wert = stufe.wert;
  } else {
    wert = zeitraum.wert;
  }
  return {
    wert,
    gueltig_von: zeitraum.gueltig_von,
    gueltig_bis: zeitraum.gueltig_bis,
    quelle: zeitraum.quelle.fundstelle ?? zeitraum.quelle.bezeichnung,
  };
}

/** Volle Staffel zum Stichtag (für anteilige Mischvergütung nach Leistungsanteilen). */
export async function parameterStaffel(
  id: string,
  datum: string,
): Promise<{ stufen: { bis_kwp?: number; wert: number }[]; quelle: string }> {
  const p = await ladeParameter(id);
  const zeitraum = p.zeitraeume.find(
    (z) => z.gueltig_von <= datum && (!z.gueltig_bis || datum <= z.gueltig_bis),
  );
  if (!zeitraum) throw new Error(`Parameter '${id}': kein Gültigkeitszeitraum für ${datum}.`);
  if (!Array.isArray(zeitraum.wert)) throw new Error(`Parameter '${id}' ist nicht gestaffelt.`);
  return { stufen: zeitraum.wert, quelle: zeitraum.quelle.fundstelle ?? zeitraum.quelle.bezeichnung };
}
