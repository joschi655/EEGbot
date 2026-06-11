import { z } from "zod";
import { Bedingung, IsoDate, Quelle } from "./common.ts";

/**
 * Formularinventar (`data/forms/*.json|yaml`) — laut Research der höchste Hebel:
 * Es existiert KEINE maschinenlesbare Kanonisierung von MaStR-/KfW-/BAFA-/
 * Netzbetreiber-Formularen. Dieses Schema ist sie.
 */
export const FormularFeld = z.object({
  id: z.string(),
  bezeichnung: z.string(),
  pflicht: z.boolean(),
  /** Darf die KI dieses Feld aus Falldaten vorbefüllen? */
  ai_vorbefuellbar: z.boolean(),
  /** Nur durch Menschen/Sachverständige ausfüllbar (Unterschrift, Bescheinigung …) */
  human_only: z.boolean().default(false),
  fall_feld: z.string().optional(), // Mapping auf Fall-Feldpfad, falls vorbefüllbar
  haeufiger_fehler: z.string().optional(), // z. B. "IBN-Datum ≠ Zählersetzungsdatum!"
});

export const Formular = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // z. B. "mastr-anlagenregistrierung-solar"
  name: z.string(),
  aussteller: z.string(), // MaStR/BNetzA, KfW, BAFA, Netzbetreiber, WEG-Verwalter …
  einreichungskanal: z.enum(["online-portal", "pdf-upload", "schriftlich", "finanzierungspartner", "netzbetreiber-portal"]),
  zweck: z.string(),
  benoetigt_wenn: Bedingung.optional(),
  felder: z.array(FormularFeld),
  benoetigte_anhaenge: z.array(z.string()).default([]),
  frist_hinweis: z.string().optional(), // z. B. "1 Monat nach IBN, sonst §52-Sanktion"
  url: z.string().url().optional(),
  quellen: z.array(Quelle).default([]),
  zuletzt_geprueft: IsoDate,
});
export type Formular = z.infer<typeof Formular>;
