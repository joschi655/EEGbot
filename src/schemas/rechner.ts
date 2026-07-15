import { z } from "zod";
import { VERSTOSS_KATEGORIEN } from "../rules/sanktion52.ts";

function istKalenderdatum(wert: string): boolean {
  const datum = new Date(`${wert}T00:00:00Z`);
  return !Number.isNaN(datum.getTime()) && datum.toISOString().slice(0, 10) === wert;
}

/** Striktes ISO-Kalenderdatum; weist z. B. 2026-02-30 zurück. */
export const RechnerDatum = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Erwartet YYYY-MM-DD")
  .refine(istKalenderdatum, "Ungültiges Kalenderdatum");

export const Einspeiseart = z.enum(["teileinspeisung", "volleinspeisung"]);
export const Anlagentyp = z.enum(["dach", "freiflaeche", "steckersolar", "fassade", "sonstig"]);
export const SolarVermarktungsformSchema = z.enum([
  "einspeiseverguetung",
  "marktpraemie",
  "mieterstromzuschlag",
  "keine_eeg_foerderung",
]);
export const VerstossKategorieSchema = z.enum(
  Object.keys(VERSTOSS_KATEGORIEN) as [keyof typeof VERSTOSS_KATEGORIEN, ...(keyof typeof VERSTOSS_KATEGORIEN)[]],
);

export const Sanktion52InputSchema = z
  .object({
    leistung_kw: z.number().positive(),
    verstoesse: z.array(
      z
        .object({
          kategorie: VerstossKategorieSchema,
          beginn: RechnerDatum,
          ende: RechnerDatum.optional(),
          geheilt: z.boolean().optional(),
        })
        .strict()
        .refine((v) => !v.ende || v.ende >= v.beginn, { message: "ende darf nicht vor beginn liegen", path: ["ende"] }),
    ),
    stichtag: RechnerDatum.optional(),
  })
  .strict();

export const VerguetungInputSchema = z
  .object({
    ibn_datum: RechnerDatum,
    leistung_kwp: z.number().positive(),
    einspeiseart: Einspeiseart,
  })
  .strict();

export const ZusammenfassungsAnlageSchema = z
  .object({
    id: z.string().min(1),
    energietraeger: z.enum(["solar", "wind", "biomasse", "wasser", "geothermie"]),
    ibn_datum: RechnerDatum,
    leistung_kwp: z.number().positive(),
    anlagentyp: Anlagentyp.optional(),
    grundstueck_id: z.string().optional(),
    gebaeude_id: z.string().optional(),
    netzverknuepfungspunkt_id: z.string().optional(),
    selbe_biogasanlage: z.boolean().optional(),
  })
  .strict();

export const AnlagenzusammenfassungInputSchema = z
  .object({ anlage_a: ZusammenfassungsAnlageSchema, anlage_b: ZusammenfassungsAnlageSchema })
  .strict();

export const FristenInputSchema = z
  .object({
    ibn_datum: RechnerDatum,
    mastr_registriert: z.boolean(),
    mastr_registrierung_datum: RechnerDatum.optional(),
    veraeusserungsform_gemeldet: z.boolean(),
    einspeiseart: Einspeiseart.optional(),
    /** Kalenderjahre, für die die jährliche Volleinspeisungs-Mitteilung bestätigt ist. */
    volleinspeisung_gemeldet_fuer_jahr: z.array(z.number().int().min(2000).max(2200)).default([]),
    stichtag: RechnerDatum.optional(),
  })
  .strict();

export const SchwellenInputSchema = z
  .object({
    leistung_kwp: z.number().positive(),
    wechselrichter_va: z.number().positive().optional(),
    anlagentyp: Anlagentyp.optional(),
    imsys_vorhanden: z.boolean().optional(),
    vermarktungsform: SolarVermarktungsformSchema.optional(),
    steuerungseinrichtung_vorhanden: z.boolean().optional(),
    ansteuerbarkeit_getestet: z.boolean().optional(),
    ibn_datum: RechnerDatum.optional(),
  })
  .strict();

export const AusgefoerderteInputSchema = z
  .object({
    ibn_datum: RechnerDatum,
    leistung_kwp: z.number().positive(),
    jahresertrag_kwh: z.number().positive().optional(),
    eigenverbrauchsanteil_prozent: z.number().min(0).max(100).optional(),
    strompreis_ct_kwh: z.number().positive().optional(),
    stichtag: RechnerDatum.optional(),
  })
  .strict();

const SolarspitzenInputObject = z
  .object({
    ibn_datum: RechnerDatum,
    leistung_kwp: z.number().positive(),
    anlagentyp: Anlagentyp.optional(),
    wechselrichter_va: z.number().positive().optional(),
    vermarktungsform: SolarVermarktungsformSchema,
    imsys_vorhanden: z.boolean(),
    imsys_einbau_datum: RechnerDatum.optional(),
    steuerungseinrichtung_vorhanden: z.boolean(),
    ansteuerbarkeit_getestet: z.boolean(),
    stichtag: RechnerDatum.optional(),
  })
  .strict();

export const SolarspitzenInputShape = SolarspitzenInputObject.shape;
export const SolarspitzenInputSchema = SolarspitzenInputObject.superRefine((v, ctx) => {
    if (v.imsys_einbau_datum && !v.imsys_vorhanden)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["imsys_einbau_datum"], message: "Einbaudatum setzt ein vorhandenes iMSys voraus" });
    if (v.ansteuerbarkeit_getestet && (!v.imsys_vorhanden || !v.steuerungseinrichtung_vorhanden))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ansteuerbarkeit_getestet"],
        message: "Erfolgreiche Testung setzt iMSys und Steuerungseinrichtung voraus",
      });
  });

export type Sanktion52InputContract = z.infer<typeof Sanktion52InputSchema>;
export type VerguetungInputContract = z.infer<typeof VerguetungInputSchema>;
export type FristenInputContract = z.infer<typeof FristenInputSchema>;
export type SchwellenInputContract = z.infer<typeof SchwellenInputSchema>;
export type AusgefoerderteInputContract = z.infer<typeof AusgefoerderteInputSchema>;
export type SolarspitzenInputContract = z.infer<typeof SolarspitzenInputSchema>;
