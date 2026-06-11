import { z } from "zod";
import { IsoDate, Quelle } from "./common.ts";

/**
 * Datierte Parameter (OpenFisca-Pattern, portiert nach YAML+TS):
 * Jeder Parameter ist eine Zeitreihe von Gültigkeitszeiträumen. Engines fragen
 * IMMER mit Stichtag ab (`parameterWert(id, datum)`), nie "den aktuellen Wert".
 * Bestehende Zeiträume werden nie editiert — Änderungen hängen einen neuen
 * Zeitraum an (Auditierbarkeit).
 */
export const ParameterZeitraum = z.object({
  gueltig_von: IsoDate,
  gueltig_bis: IsoDate.optional(), // offen = bis heute gültig
  /** Skalarer Wert ODER leistungsgestaffelte Tabelle (z. B. Vergütungssätze) */
  wert: z.union([
    z.number(),
    z.boolean(),
    z.string(),
    z.array(
      z.object({
        bis_kwp: z.number().positive().optional(), // offen = darüber
        wert: z.number(),
      }),
    ),
  ]),
  quelle: Quelle,
  hinweis: z.string().optional(),
});

export const ParameterDatei = z.object({
  id: z.string().regex(/^[a-z0-9_.]+$/),
  beschreibung: z.string(),
  einheit: z.string(), // z. B. "ct/kWh", "EUR/kW/Monat", "kWp", "monate"
  /** Dimension, falls Tabellenwert: was bedeutet bis_kwp? */
  staffelung: z.enum(["keine", "leistung_kwp"]).default("keine"),
  zeitraeume: z.array(ParameterZeitraum).min(1),
});
export type ParameterDatei = z.infer<typeof ParameterDatei>;
