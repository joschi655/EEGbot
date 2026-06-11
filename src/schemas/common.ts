import { z } from "zod";

/** ISO-Datum YYYY-MM-DD */
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Erwartet YYYY-MM-DD");

/** Quellenangabe — jede materielle Daten-Behauptung braucht eine. */
export const Quelle = z.object({
  bezeichnung: z.string(),
  url: z.string().url().optional(),
  fundstelle: z.string().optional(), // z. B. "§ 52 Abs. 1 Nr. 1 EEG 2023" oder "Clearingstelle FAQ 236"
  abgerufen_am: IsoDate.optional(),
});
export type Quelle = z.infer<typeof Quelle>;

/**
 * Bedingungssprache für deterministische Regeln (Förder-Matcher, Workflow-Transitions,
 * Guardrail-Kategorien). Bewusst klein gehalten: auswertbar ohne LLM.
 * Feldpfade beziehen sich auf den strukturierten Fall (siehe FallSchema).
 */
export type Bedingung =
  | { alle: Bedingung[] }
  | { eine: Bedingung[] }
  | { nicht: Bedingung }
  | {
      feld: string;
      op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in" | "exists" | "vor" | "nach";
      wert?: unknown;
    };

export const Bedingung: z.ZodType<Bedingung> = z.lazy(() =>
  z.union([
    z.object({ alle: z.array(Bedingung) }),
    z.object({ eine: z.array(Bedingung) }),
    z.object({ nicht: Bedingung }),
    z.object({
      feld: z.string(),
      op: z.enum(["eq", "neq", "lt", "lte", "gt", "gte", "in", "exists", "vor", "nach"]),
      wert: z.unknown().optional(),
    }),
  ]),
);

/**
 * Strukturierter Fall — Output des Intake-Skills, Input für alle Engines.
 * Bewusst offen (passthrough): Workflows dürfen eigene Felder definieren,
 * die Kernfelder sind aber typisiert.
 */
export const Fall = z
  .object({
    fall_typ: z.string(), // z. B. "balkonkraftwerk", "pv-dach", "ausgefoerderte", "waermepumpe"
    plz: z.string().optional(),
    bundesland: z.string().optional(),
    eigentumsform: z.enum(["eigentum", "miete", "weg", "sonstig"]).optional(),
    anlage: z
      .object({
        energietraeger: z.enum(["solar", "wind", "biomasse", "wasser", "geothermie", "sonstig"]).optional(),
        leistung_kwp: z.number().nonnegative().optional(),
        wechselrichter_va: z.number().nonnegative().optional(),
        ibn_datum: IsoDate.optional(),
        anlagentyp: z.enum(["dach", "freiflaeche", "steckersolar", "fassade", "sonstig"]).optional(),
        veraeusserungsform: z
          .enum(["einspeiseverguetung", "direktvermarktung", "sonstige_direktvermarktung", "volleinspeisung", "ueberschusseinspeisung", "unbekannt"])
          .optional(),
        mastr_registriert: z.boolean().optional(),
        mastr_registrierung_datum: IsoDate.optional(),
        speicher_vorhanden: z.boolean().optional(),
        imsys_vorhanden: z.boolean().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough();
export type Fall = z.infer<typeof Fall>;
