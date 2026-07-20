import { z } from "zod";
import { Bedingung, IsoDate, Quelle } from "./common.ts";

/**
 * Förderprogramm-Schema (`data/programs/*.json|yaml`).
 * Maschinenlesbare Kanonisierung von KfW-/BAFA-/Landes-Programmen —
 * Grundlage des deterministischen Förder-Matchers.
 */
/** Amtliche Bundesland-Kürzel — Vokabular für data/programs region.bundeslaender. */
export const Bundesland = z.enum(["BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"]);
export type Bundesland = z.infer<typeof Bundesland>;

/**
 * Bekannte offene Auslegungsfrage eines Programms — strukturierte "known unknowns".
 * Das Tool benennt, was es NICHT weiß: Grundregel ist belegbar, die Reichweite im
 * Einzelfall nicht. Antworten dazu müssen die Grenze kennzeichnen und verweisen
 * (Compliance-Skill nutzt diese Einträge als Formulierungsgrundlage).
 */
export const Auslegungshinweis = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  thema: z.string(),
  frage: z.string(), // die offene Praxisfrage in Laienformulierung
  grundregel: z.string(), // was belegbar gilt
  offene_frage: z.string(), // was ungeregelt/auslegungsbedürftig ist
  verweis_an: z
    .array(z.enum(["bafa", "kfw", "energieeffizienz_experte", "clearingstelle", "anwalt", "steuerberater"]))
    .min(1),
  /** Optionaler Fall-Trigger für künftiges Matcher-Surfacing — derzeit ungenutzt. */
  bedingung: Bedingung.optional(),
  quelle: Quelle.optional(),
  stand: IsoDate,
});
export type Auslegungshinweis = z.infer<typeof Auslegungshinweis>;

export const Foerderprogramm = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // z. B. "kfw-458"
  name: z.string(),
  traeger: z.string(), // KfW, BAFA, Land, Kommune, Netzbetreiber
  foerderart: z.enum(["zuschuss", "kredit", "steuerlich", "verguetung", "bonus"]),
  status: z.enum(["aktiv", "ausgesetzt", "beendet"]),
  beschreibung: z.string(),

  /**
   * Regionale Zuständigkeit — fehlt = bundesweit. AND-Semantik über die
   * definierten Dimensionen (Kommunalprogramm: Land UND Kommune müssen passen);
   * innerhalb einer Dimension genügt ein Listentreffer. Geprüft gegen
   * fall.standort.{bundesland,kommune,plz}.
   */
  region: z
    .object({
      bundeslaender: z.array(Bundesland).optional(),
      kommunen: z.array(z.string()).optional(), // z. B. "München"
      plz_praefixe: z.array(z.string().regex(/^\d{1,5}$/)).optional(),
    })
    .optional(),

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
  /**
   * Richtlinien-Deckel bei Kumulierung: Summe ALLER Förderquoten darf diesen
   * Wert nicht übersteigen (z. B. „max. 90 % der förderfähigen Kosten").
   * Bei Kombination mehrerer Programme bindet das Minimum der vorhandenen Deckel.
   * Quellenpflichtig aus dem Richtlinientext.
   */
  kumulierung_gesamtquote_max_prozent: z.number().optional(),
  /** Richtlinien-Deckel als BETRAG: Summe aller Fördermittel max. X € (manche Landes-/Kommunalrichtlinien deckeln in €, nicht in Prozent). */
  kumulierung_gesamtbetrag_max_eur: z.number().optional(),

  antragsweg: z.object({
    kanal: z.enum(["online-portal", "finanzierungspartner", "finanzamt", "netzbetreiber", "schriftlich"]),
    portal_url: z.string().url().optional(),
    antrag_vor_massnahmenbeginn: z.boolean(),
    fachunternehmer_pflicht: z.boolean().default(false),
    benoetigte_formulare: z.array(z.string()).default([]), // Form-IDs aus data/forms/
  }),

  fristen: z.array(z.object({ bezeichnung: z.string(), beschreibung: z.string(), datum: IsoDate.optional() })).default([]),

  /** Wer reicht den Antrag ein — Durchführer-Fakt (KfW 458: nur selbst via "Meine KfW"; BAFA: EEE per Vollmacht). */
  antragstellung: z
    .object({
      antragsteller_persoenlich_erforderlich: z.boolean(),
      vollmacht_durch_eee_moeglich: z.boolean(),
      hinweis: z.string().optional(),
      quelle: Quelle.optional(),
    })
    .optional(),

  /** Antragsberechtigte Rollen — explizite Negative erwünscht (Nießbraucher: KfW nein, BAFA ja). */
  antragsberechtigte: z
    .object({
      eigentuemer: z.boolean().optional(),
      niessbrauchsberechtigter: z.boolean().optional(),
      mieter: z.boolean().optional(),
      weg: z.boolean().optional(),
      hinweis: z.string().optional(),
      quelle: Quelle.optional(),
    })
    .optional(),

  /** Förderfähige Nebenkosten als eigene Posten (Fachplanung/Baubegleitung: BAFA ja, KfW 458 nein). */
  foerderfaehige_nebenkosten: z
    .array(
      z.object({
        posten: z.enum(["fachplanung_baubegleitung", "sonstiges"]),
        foerderfaehig: z.boolean(),
        hinweis: z.string().optional(),
        quelle: Quelle.optional(),
      }),
    )
    .default([]),

  /** Praxis-Bearbeitungszeiten je Bereich — Planungsgröße, kein Rechtsanspruch. */
  bearbeitungszeiten: z
    .array(
      z.object({
        bereich: z.string(), // z. B. "gebaeudenetze"
        praxis_monate_min: z.number().optional(),
        kein_rechtsanspruch: z.literal(true), // erzwingt die ehrliche Kennzeichnung
        hinweis: z.string(),
        quelle: Quelle,
        stand: IsoDate,
      }),
    )
    .default([]),

  /** Bekannte offene Auslegungsfragen des Programms. */
  auslegungshinweise: z.array(Auslegungshinweis).default([]),

  /**
   * Minimale Richtlinien-Versionierung (kein Snapshot-System): welche Fassung die
   * Daten abbilden und ab wann eine Novelle gilt. validate:data warnt, sobald
   * naechste_fassung_gueltig_ab erreicht ist und der Verifikations-Marker noch offen ist.
   */
  richtlinie: z
    .object({
      fassung: z.string(), // z. B. "BEG EM (Heizungsförderung), Stand 2024"
      gueltig_ab: IsoDate,
      naechste_fassung_gueltig_ab: IsoDate.optional(),
      hinweis: z.string().optional(), // "… VOR finaler Nutzung verifizieren" (analog BGBl.-Marker)
    })
    .optional(),

  quellen: z.array(Quelle).min(1),
  zuletzt_geprueft: IsoDate,
});
export type Foerderprogramm = z.infer<typeof Foerderprogramm>;
