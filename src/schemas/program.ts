import { z } from "zod";
import { Bedingung, IsoDate, Quelle } from "./common.ts";

/**
 * Förderprogramm-Schema (`data/programs/*.json|yaml`).
 * Maschinenlesbare Kanonisierung von KfW-/BAFA-/Landes-Programmen —
 * Grundlage des deterministischen Förder-Matchers.
 */
export const Foerderprogramm = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // z. B. "kfw-458"
  name: z.string(),
  traeger: z.string(), // KfW, BAFA, Land, Kommune, Netzbetreiber
  foerderart: z.enum(["zuschuss", "kredit", "steuerlich", "verguetung", "bonus"]),
  status: z.enum(["aktiv", "ausgesetzt", "beendet"]),
  beschreibung: z.string(),

  /** Deterministische Eligibility: Bedingung über den strukturierten Fall. */
  eligibility: Bedingung,
  /** Harte Ausschlüsse — separat, damit der Matcher Ablehnungsgründe benennen kann. */
  ausschluesse: z.array(z.object({ grund: z.string(), bedingung: Bedingung })).default([]),

  foerdersaetze: z.array(
    z.object({
      bezeichnung: z.string(), // z. B. "Basisförderung", "Klimageschwindigkeits-Bonus"
      satz_prozent: z.number().optional(),
      betrag_eur: z.number().optional(),
      max_eur: z.number().optional(),
      bedingung: Bedingung.optional(),
    }),
  ),
  max_foerdersatz_prozent: z.number().optional(),
  /** Förderfähige Höchstkosten in € (z. B. KfW 458: 30.000 € erste Wohneinheit) — kappt die Zuschuss-Schätzung. */
  foerderfaehige_hoechstkosten_eur: z.number().optional(),

  /** Kumulierbarkeit: Programm-IDs + ob kombinierbar. Matrix wird daraus abgeleitet. */
  kumulierung: z.array(
    z.object({ programm_id: z.string(), kombinierbar: z.boolean(), hinweis: z.string().optional() }),
  ).default([]),

  antragsweg: z.object({
    kanal: z.enum(["online-portal", "finanzierungspartner", "finanzamt", "netzbetreiber", "schriftlich"]),
    portal_url: z.string().url().optional(),
    antrag_vor_massnahmenbeginn: z.boolean(),
    fachunternehmer_pflicht: z.boolean().default(false),
    benoetigte_formulare: z.array(z.string()).default([]), // Form-IDs aus data/forms/
  }),

  fristen: z.array(z.object({ bezeichnung: z.string(), beschreibung: z.string(), datum: IsoDate.optional() })).default([]),
  quellen: z.array(Quelle).min(1),
  zuletzt_geprueft: IsoDate,
});
export type Foerderprogramm = z.infer<typeof Foerderprogramm>;
