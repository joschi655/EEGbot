/**
 * Deterministischer Förderfahrplan-Generator (Phase B, Lead-Feature).
 *
 * Kein Wärmepumpen-Skript, sondern ein generischer Interpreter über dem
 * Programm-Schema (`data/programs/*.json`): Reihenfolge, Warnungen und
 * Dokumenten-Checkliste werden aus den Programm-Feldern hergeleitet —
 * `antrag_vor_massnahmenbeginn` bestimmt die Schrittfolge, `ausschluesse`
 * liefern die Warntexte, `benoetigte_formulare` die Checkliste. Neue
 * Programme (auch regionale) bekommen damit Fahrpläne ohne Codeänderung.
 *
 * Fördersätze werden NICHT hier berechnet — das macht der foerderMatcher.
 * Hier stehen keine Zahlen; alle Werte kommen aus data/.
 */
import {
  ladeProgramme,
  ladeFormulare,
  matcheProgramme,
  pruefeKumulierung,
  referenzierteFelder,
  type ProgrammMatch,
} from "./foerderMatcher.ts";
import { feldWert } from "../lib/bedingung.ts";
import type { Foerderprogramm } from "../schemas/program.ts";
import type { Formular } from "../schemas/form.ts";

export interface FahrplanQuelle {
  bezeichnung: string;
  url?: string;
  fundstelle?: string;
}

export interface FahrplanDokument {
  id: string;
  name: string;
  aussteller: string;
  frist_hinweis?: string;
  /** Felder, die zwingend ein Mensch/Experte ausfüllt — ehrliche Tool-Grenze. */
  human_only_felder: string[];
}

export interface FahrplanSchritt {
  nr: number;
  phase: "vorbereitung" | "antrag" | "umsetzung" | "nachweis" | "steuer";
  titel: string;
  beschreibung: string;
  /** Rote Regel — z. B. „Antrag VOR Vertragsschluss". Nur für echte Fallstricke. */
  warnung?: string;
  dokumente: FahrplanDokument[];
  quellen: FahrplanQuelle[];
}

export interface FoerderEmpfehlung {
  programm_id: string;
  name: string;
  traeger: string;
  foerderart: string;
  foerdersatz_prozent?: number;
  saetze: ProgrammMatch["saetze"];
  hoechstkosten_eur?: number;
  kosten_angesetzt_eur?: number;
  /** Bei Zuschüssen: geschätzter Zuschuss. Bei steuerlich: geschätzte Steuerermäßigung. */
  betrag_eur_geschaetzt?: number;
  hinweis?: string;
}

export interface FoerderKombination {
  programme: [string, string];
  quote_summe_prozent: number;
  /** Bindender Richtlinien-Deckel (Minimum der beteiligten Programme), falls vorhanden. */
  gesamtquote_deckel_prozent?: number;
  deckel_aus_programm?: string;
  kombinierte_quote_prozent: number;
  /** Betragsdeckel (€) aus einer der Richtlinien — wird ausgewiesen, nicht verrechnet (Kosten oft unbekannt). */
  gesamtbetrag_deckel_eur?: number;
  hinweis?: string;
}

export interface Fahrplan {
  erstellt_am: string;
  fall: Record<string, unknown>;
  empfehlung: FoerderEmpfehlung | null;
  alternativen: FoerderEmpfehlung[];
  nicht_passend: { programm_id: string; name: string; gruende: string[] }[];
  entweder_oder: { programme: [string, string]; hinweis: string }[];
  /** Kombinierbare Zuschuss-Paare mit Gesamtquoten-Deckelung (Min-Deckel-Regel). */
  kombinationen: FoerderKombination[];
  isfp_weiche: { relevant: boolean; hinweis: string; quellen: FahrplanQuelle[] } | null;
  schritte: FahrplanSchritt[];
  offene_fragen: { feld: string; frage: string }[];
  warnungen: string[];
  disclaimer: string;
  /** Ältestes zuletzt_geprueft der beteiligten Programme — Freshness-Signal. */
  stand: string;
}

export const FAHRPLAN_DISCLAIMER =
  "Allgemeine Information und deterministische Berechnung nach veröffentlichten Programmwerten — " +
  "keine Rechts- oder Steuerberatung im Einzelfall (§ 2 RDG, StBerG). Verbindlich sind die " +
  "Programm-Merkblätter der Träger; bei streitigen Fragen: Clearingstelle EEG|KWKG, Fachanwalt oder Steuerberater.";

/** Fragen zu bekannten Fall-Feldern (Wortlaut aus data/workflows). */
export const FELD_FRAGEN: Record<string, string> = {
  "massnahme.typ": "Welche Maßnahme ist geplant (Wärmepumpe, Dämmung, …)?",
  "massnahme.begonnen": "Wurde schon ein Liefer-/Leistungsvertrag unterschrieben oder mit der Umsetzung begonnen?",
  "massnahme.ersetzt_fossile_heizung": "Ersetzt die Maßnahme eine funktionstüchtige Öl-/Gas-/Kohle-/Nachtspeicherheizung?",
  "massnahme.wp_effizienzbonus_qualifiziert": "Nutzt die Wärmepumpe ein natürliches Kältemittel oder Erd-/Wasserquelle?",
  "massnahme.kosten_eur": "Wie hoch sind die voraussichtlichen Kosten (Angebotssumme)?",
  "massnahme.bereits_gefoerdert": "Wurde dieselbe Maßnahme bereits über KfW/BAFA gefördert?",
  "gebaeude.bestandsgebaeude": "Bestandsgebäude oder Neubau?",
  "gebaeude.alter_jahre": "Wie alt ist das Gebäude (Jahre seit Baubeginn)?",
  "antragsteller.selbstnutzend": "Wohnen Sie selbst im Gebäude?",
  "antragsteller.haushaltseinkommen_eur": "Wie hoch ist das zu versteuernde Haushaltseinkommen (relevant für den Einkommensbonus)?",
  "antragsteller.isfp_vorhanden": "Liegt ein individueller Sanierungsfahrplan (iSFP) vor?",
  eigentumsform: "Sind Sie Eigentümer:in (Eigentum / Miete / WEG)?",
  "standort.bundesland": "In welchem Bundesland liegt das Gebäude? (für regionale Programme)",
  "standort.kommune": "In welcher Stadt/Gemeinde liegt das Gebäude? (für kommunale Programme)",
  "standort.plz": "Wie lautet die Postleitzahl? (für regionale Programme)",
};

const DENA_QUELLE: FahrplanQuelle = {
  bezeichnung: "Energieeffizienz-Expertenliste (dena)",
  url: "https://www.energie-effizienz-experten.de",
};

function zuEmpfehlung(m: ProgrammMatch, prog: Foerderprogramm | undefined, fall: Record<string, unknown>): FoerderEmpfehlung {
  const hoechstkosten = prog?.foerderfaehige_hoechstkosten_eur;
  const kosten = feldWert(fall, "massnahme.kosten_eur");
  const kostenZahl = typeof kosten === "number" && kosten > 0 ? kosten : undefined;
  const angesetzt = kostenZahl !== undefined ? Math.min(kostenZahl, hoechstkosten ?? kostenZahl) : undefined;

  let betrag: number | undefined;
  let hinweis: string | undefined;
  if (m.foerdersatz_prozent !== undefined && angesetzt !== undefined) {
    betrag = Math.round((angesetzt * m.foerdersatz_prozent) / 100);
    // Steuerlich: Deckel steht am Satz (max_eur), Ermäßigung verteilt sich über Jahre.
    if (m.foerderart === "steuerlich") {
      const maxEur = prog?.foerdersaetze.find((s) => s.max_eur !== undefined)?.max_eur;
      if (maxEur !== undefined) betrag = Math.min(betrag, maxEur);
      hinweis = "Steuerermäßigung über die Einkommensteuer (kein Auszahlungs-Zuschuss), Verteilung über mehrere Jahre — Details: Programm-/Gesetzesquelle.";
    }
  }

  return {
    programm_id: m.programm_id,
    name: m.name,
    traeger: prog?.traeger ?? "",
    foerderart: m.foerderart,
    foerdersatz_prozent: m.foerdersatz_prozent,
    saetze: m.saetze,
    hoechstkosten_eur: hoechstkosten,
    kosten_angesetzt_eur: angesetzt,
    betrag_eur_geschaetzt: betrag,
    hinweis,
  };
}

function dokument(f: Formular): FahrplanDokument {
  return {
    id: f.id,
    name: f.name,
    aussteller: f.aussteller,
    frist_hinweis: f.frist_hinweis,
    human_only_felder: f.felder.filter((x) => x.human_only).map((x) => x.bezeichnung),
  };
}

/** Schrittfolge aus dem Programm-Schema herleiten (generisch, kein Programm-Skript). */
export function baueSchritte(prog: Foerderprogramm, formulare: Formular[]): FahrplanSchritt[] {
  const progQuellen: FahrplanQuelle[] = prog.quellen.map((q) => ({ bezeichnung: q.bezeichnung, url: q.url, fundstelle: q.fundstelle }));
  const docs = prog.antragsweg.benoetigte_formulare
    .map((id) => formulare.find((f) => f.id === id))
    .filter((f): f is Formular => Boolean(f));
  const docQuellen = (fs: Formular[]): FahrplanQuelle[] =>
    fs.flatMap((f) => f.quellen.map((q) => ({ bezeichnung: q.bezeichnung, url: q.url, fundstelle: q.fundstelle })));

  // Warntext für die Reihenfolge-Falle kommt aus den Programmdaten selbst:
  const beginnAusschluss = prog.ausschluesse.find((a) => JSON.stringify(a.bedingung).includes("massnahme.begonnen"));
  const fristenVorAntrag = prog.fristen.filter((f) => /vor antrag/i.test(f.beschreibung));
  const fristenDanach = prog.fristen.filter((f) => !/vor antrag/i.test(f.beschreibung));

  const schritte: FahrplanSchritt[] = [];
  let nr = 1;

  if (prog.antragsweg.antrag_vor_massnahmenbeginn) {
    schritte.push({
      nr: nr++,
      phase: "vorbereitung",
      titel: docs.length ? `Vorbereitung: ${docs.map((d) => d.name).join(" + ")}` : "Vorbereitung: Unterlagen zusammenstellen",
      beschreibung: [
        ...docs.map((d) => d.zweck),
        ...fristenVorAntrag.map((f) => `${f.bezeichnung}: ${f.beschreibung}`),
      ].join(" ") || "Programmvoraussetzungen und Unterlagen laut Merkblatt prüfen.",
      dokumente: docs.map(dokument),
      quellen: [...docQuellen(docs), ...progQuellen].slice(0, 4),
    });
    schritte.push({
      nr: nr++,
      phase: "antrag",
      titel: `Antrag stellen: ${prog.traeger}${prog.antragsweg.portal_url ? ` (${prog.antragsweg.portal_url})` : ""}`,
      beschreibung: `Antrag über ${prog.antragsweg.kanal} beim Träger ${prog.traeger} einreichen — zwingend VOR Vorhabensbeginn.`,
      warnung: beginnAusschluss?.grund ?? "Antrag zwingend VOR Maßnahmenbeginn stellen.",
      dokumente: [],
      quellen: progQuellen,
    });
    schritte.push({
      nr: nr++,
      phase: "umsetzung",
      titel: "Vertrag schließen und Maßnahme umsetzen",
      beschreibung:
        (prog.antragsweg.fachunternehmer_pflicht ? "Umsetzung durch ein Fachunternehmen ist Fördervoraussetzung. " : "") +
        "Erst nach Antragstellung den (unbedingten) Liefer-/Leistungsvertrag schließen und die Maßnahme durchführen.",
      dokumente: [],
      quellen: progQuellen,
    });
    schritte.push({
      nr: nr++,
      phase: "nachweis",
      titel: "Nachweis einreichen und Auszahlung erhalten",
      beschreibung: fristenDanach.length
        ? fristenDanach.map((f) => `${f.bezeichnung}: ${f.beschreibung}`).join(" ")
        : "Verwendungsnachweis laut Merkblatt einreichen — danach wird der Zuschuss ausgezahlt.",
      dokumente: [],
      quellen: progQuellen,
    });
  } else {
    // Nachgelagerte Programme (z. B. steuerlich): erst umsetzen, dann nachweisen.
    schritte.push({
      nr: nr++,
      phase: "umsetzung",
      titel: "Maßnahme durch Fachunternehmen umsetzen",
      beschreibung:
        (prog.antragsweg.fachunternehmer_pflicht ? "Ausführung durch ein Fachunternehmen ist Voraussetzung. " : "") +
        "Rechnungen aufbewahren und unbar bezahlen.",
      dokumente: [],
      quellen: progQuellen,
    });
    schritte.push({
      nr: nr++,
      phase: "nachweis",
      titel: docs.length ? `Nachweis: ${docs.map((d) => d.name).join(" + ")}` : "Nachweise zusammenstellen",
      beschreibung: docs.map((d) => d.zweck).join(" ") || "Nachweise laut Programmquelle zusammenstellen.",
      dokumente: docs.map(dokument),
      quellen: [...docQuellen(docs), ...progQuellen].slice(0, 4),
    });
    schritte.push({
      nr: nr++,
      phase: prog.antragsweg.kanal === "finanzamt" ? "steuer" : "antrag",
      titel: prog.antragsweg.kanal === "finanzamt" ? "Geltendmachung in der Steuererklärung" : `Einreichung: ${prog.traeger}`,
      beschreibung:
        docs.map((d) => d.frist_hinweis).filter(Boolean).join(" ") ||
        `Einreichung über ${prog.antragsweg.kanal} beim Träger ${prog.traeger}.`,
      dokumente: [],
      quellen: progQuellen,
    });
  }
  return schritte;
}

/**
 * Gesamtquoten-Deckelung bei Kumulierung (pure, testbar): Summe der Quoten,
 * gedeckelt am Minimum der vorhandenen Richtlinien-Deckel
 * (`kumulierung_gesamtquote_max_prozent`). Nur für addierbare Zuschussquoten —
 * steuerliche Programme und Kredite bilden keine Quoten-Kombination.
 */
export function berechneKombination(
  a: { programm_id: string; quote_prozent?: number; deckel_prozent?: number; deckel_betrag_eur?: number; foerderart: string },
  b: { programm_id: string; quote_prozent?: number; deckel_prozent?: number; deckel_betrag_eur?: number; foerderart: string },
): FoerderKombination | null {
  const addierbar = (x: typeof a) =>
    (x.foerderart === "zuschuss" || x.foerderart === "bonus") && typeof x.quote_prozent === "number" && x.quote_prozent > 0;
  if (!addierbar(a) || !addierbar(b)) return null;

  const summe = (a.quote_prozent as number) + (b.quote_prozent as number);
  const deckelKandidaten = [
    { wert: a.deckel_prozent, aus: a.programm_id },
    { wert: b.deckel_prozent, aus: b.programm_id },
  ].filter((d): d is { wert: number; aus: string } => typeof d.wert === "number");
  const bindend = deckelKandidaten.length ? deckelKandidaten.reduce((m, d) => (d.wert < m.wert ? d : m)) : undefined;
  const kombiniert = bindend ? Math.min(summe, bindend.wert) : summe;

  // Betragsdeckel (€) wird ausgewiesen statt verrechnet — die tatsächlichen
  // Kosten sind hier nicht bekannt; stilles Weglassen wäre eine falsche Zahl.
  const betragKandidaten = [
    { wert: a.deckel_betrag_eur, aus: a.programm_id },
    { wert: b.deckel_betrag_eur, aus: b.programm_id },
  ].filter((d): d is { wert: number; aus: string } => typeof d.wert === "number");
  const betragsdeckel = betragKandidaten.length ? betragKandidaten.reduce((m, d) => (d.wert < m.wert ? d : m)) : undefined;

  const hinweise: string[] = [];
  if (bindend && kombiniert < summe) hinweise.push(`Richtlinien-Deckel: Gesamtförderquote max. ${bindend.wert} % (${bindend.aus}).`);
  if (betragsdeckel)
    hinweise.push(
      `Zusätzlich Betragsdeckel: Gesamtförderung max. ${betragsdeckel.wert.toLocaleString("de-DE")} € (${betragsdeckel.aus}) — bei der Zuschuss-Schätzung berücksichtigen.`,
    );

  return {
    programme: [a.programm_id, b.programm_id],
    quote_summe_prozent: summe,
    gesamtquote_deckel_prozent: bindend?.wert,
    deckel_aus_programm: bindend?.aus,
    kombinierte_quote_prozent: kombiniert,
    gesamtbetrag_deckel_eur: betragsdeckel?.wert,
    hinweis: hinweise.length ? hinweise.join(" ") : undefined,
  };
}

/** iSFP-Weiche: rein datengetrieben — gibt es ein erreichbares Programm mit iSFP-konditioniertem Bonus-Satz? */
function baueIsfpWeiche(
  matches: ProgrammMatch[],
  programme: Foerderprogramm[],
  fall: Record<string, unknown>,
): Fahrplan["isfp_weiche"] {
  if (feldWert(fall, "antragsteller.isfp_vorhanden") === true) {
    return { relevant: false, hinweis: "iSFP liegt bereits vor — zutreffende iSFP-Boni sind in den Fördersätzen berücksichtigt.", quellen: [DENA_QUELLE] };
  }
  for (const p of programme) {
    const isfpSatz = p.foerdersaetze.find((s) => s.bedingung && JSON.stringify(s.bedingung).includes("isfp_vorhanden"));
    if (!isfpSatz) continue;
    const match = matches.find((m) => m.programm_id === p.id);
    const erreichbar = match ? match.passt || match.fehlende_felder.length > 0 : false;
    const quellen: FahrplanQuelle[] = [...p.quellen.map((q) => ({ bezeichnung: q.bezeichnung, url: q.url, fundstelle: q.fundstelle })), DENA_QUELLE];
    if (erreichbar) {
      return {
        relevant: true,
        hinweis:
          `Ein individueller Sanierungsfahrplan (iSFP) erhöht den Fördersatz in „${p.name}" um ${isfpSatz.satz_prozent} Prozentpunkte (${isfpSatz.bezeichnung}). ` +
          "Die Erstellung kann nur ein gelisteter Energieeffizienz-Experte übernehmen — das liegt außerhalb dieses Tools (dena-Expertenliste).",
        quellen,
      };
    }
    return {
      relevant: false,
      hinweis:
        `Für die aktuell geplante Maßnahme gibt es keinen iSFP-Bonus. Der iSFP-Bonus (${isfpSatz.satz_prozent} Prozentpunkte) gilt in „${p.name}" — ` +
        "relevant, falls Sie zusätzlich Maßnahmen an der Gebäudehülle (Dämmung, Fenster, …) planen. Erstellung nur durch gelistete Energieeffizienz-Experten (dena-Expertenliste).",
      quellen,
    };
  }
  return null;
}

export async function erstelleFahrplan(fall: Record<string, unknown>): Promise<Fahrplan> {
  const [matches, programme, formulare] = await Promise.all([matcheProgramme(fall), ladeProgramme(), ladeFormulare()]);
  const progVon = (id: string) => programme.find((p) => p.id === id);

  const passende = matches.filter((m) => m.passt);
  // Empfehlung: direkter Zuschuss vor Steuerermäßigung (§ 35c ist laut Programm-
  // beschreibung die "Alternative zu KfW/BAFA": wirkt nur bei Steuerlast, verteilt
  // über Jahre), innerhalb der Art der höchste Satz; Kredite sind Ergänzung.
  const rang = (m: ProgrammMatch) => (m.foerderart === "steuerlich" ? 1 : 0);
  const empfehlungsMatch =
    passende
      .filter((m) => m.foerderart !== "kredit")
      .sort((a, b) => rang(a) - rang(b) || (b.foerdersatz_prozent ?? 0) - (a.foerdersatz_prozent ?? 0))[0] ?? null;
  const empfehlung = empfehlungsMatch ? zuEmpfehlung(empfehlungsMatch, progVon(empfehlungsMatch.programm_id), fall) : null;
  const alternativen = passende
    .filter((m) => m !== empfehlungsMatch)
    .map((m) => zuEmpfehlung(m, progVon(m.programm_id), fall));

  const nicht_passend = matches
    .filter((m) => !m.passt && m.ausschluss_gruende.length > 0)
    .map((m) => ({ programm_id: m.programm_id, name: m.name, gruende: m.ausschluss_gruende }));

  // Offene Fragen: fehlende Felder aller Programme + ggf. fehlende Kostenangabe.
  const fehlend = new Set<string>(matches.flatMap((m) => m.fehlende_felder));
  if (feldWert(fall, "massnahme.kosten_eur") === undefined) fehlend.add("massnahme.kosten_eur");
  // Bonus-Potenzial gezielt nachfragen: NUR Sätze, die der Matcher als
  // "unbekannt" markiert hat (Bedingung noch offen) — bereits entschiedene
  // Sätze (true/false) erzeugen keine Rückfrage (Cato: semantisch statt
  // syntaktisch, sonst Fragen-Spam für längst ausgeschlossene Boni).
  for (const e of [empfehlungsMatch, ...passende.filter((m) => m !== empfehlungsMatch)]) {
    if (!e) continue;
    const p = progVon(e.programm_id);
    if (!p) continue;
    p.foerdersaetze.forEach((s, i) => {
      if (!s.bedingung || e.saetze[i]?.zutreffend !== "unbekannt") return;
      for (const feld of referenzierteFelder(s.bedingung)) {
        if (feldWert(fall, feld) === undefined) fehlend.add(feld);
      }
    });
  }
  const offene_fragen = [...fehlend].map((feld) => ({
    feld,
    frage: FELD_FRAGEN[feld] ?? `Bitte Angabe zu „${feld}" ergänzen.`,
  }));

  // Entweder-oder: Kumulierungsverbote zwischen den erreichbaren Programmen.
  const relevanteIds = [empfehlung, ...alternativen].filter(Boolean).map((e) => (e as FoerderEmpfehlung).programm_id);
  const alleIds = [...new Set([...relevanteIds, ...matches.map((m) => m.programm_id)])];
  const entweder_oder: Fahrplan["entweder_oder"] = [];
  for (let i = 0; i < alleIds.length; i++) {
    for (let j = i + 1; j < alleIds.length; j++) {
      if (!relevanteIds.includes(alleIds[i]!) && !relevanteIds.includes(alleIds[j]!)) continue;
      const k = await pruefeKumulierung(alleIds[i]!, alleIds[j]!);
      if (k.kombinierbar === false) {
        entweder_oder.push({ programme: [alleIds[i]!, alleIds[j]!], hinweis: k.hinweis ?? "Nicht kombinierbar." });
      }
    }
  }

  // Kombinierbare Zuschuss-Paare unter den passenden Programmen (mit Min-Deckel).
  const kombinationen: FoerderKombination[] = [];
  for (let i = 0; i < passende.length; i++) {
    for (let j = i + 1; j < passende.length; j++) {
      const k = await pruefeKumulierung(passende[i]!.programm_id, passende[j]!.programm_id);
      if (k.kombinierbar !== true) continue;
      const seite = (m: ProgrammMatch) => ({
        programm_id: m.programm_id,
        quote_prozent: m.foerdersatz_prozent,
        deckel_prozent: progVon(m.programm_id)?.kumulierung_gesamtquote_max_prozent,
        deckel_betrag_eur: progVon(m.programm_id)?.kumulierung_gesamtbetrag_max_eur,
        foerderart: m.foerderart,
      });
      const kombi = berechneKombination(seite(passende[i]!), seite(passende[j]!));
      if (kombi) kombinationen.push({ ...kombi, hinweis: kombi.hinweis ?? k.hinweis });
    }
  }

  const warnungen: string[] = [];
  if (feldWert(fall, "massnahme.begonnen") === true) {
    // Nur ein tatsächlich passendes steuerliches Programm als verbleibenden Weg
    // nennen — sonst (z. B. Doppelförderungsverbot) wäre der Hinweis irreführend.
    const steuerlich = matches.find((m) => m.foerderart === "steuerlich" && m.passt);
    warnungen.push(
      "Die Maßnahme wurde bereits begonnen/beauftragt — Zuschussprogramme mit Vor-Beginn-Antrag scheiden damit aus." +
        (steuerlich
          ? ` Verbleibender Weg: ${steuerlich.name} (läuft über die Steuererklärung, kennt keinen Vor-Beginn-Antrag).`
          : ""),
    );
  }

  const schritte = empfehlung ? baueSchritte(progVon(empfehlung.programm_id)!, formulare) : [];
  const beteiligt = [empfehlung, ...alternativen]
    .filter(Boolean)
    .map((e) => progVon((e as FoerderEmpfehlung).programm_id)?.zuletzt_geprueft)
    .filter((d): d is string => Boolean(d));
  const stand = beteiligt.length ? beteiligt.sort()[0]! : programme.map((p) => p.zuletzt_geprueft).sort()[0] ?? "";

  return {
    erstellt_am: new Date().toISOString().slice(0, 10),
    fall,
    empfehlung,
    alternativen,
    nicht_passend,
    entweder_oder,
    kombinationen,
    isfp_weiche: baueIsfpWeiche(matches, programme, fall),
    schritte,
    offene_fragen,
    warnungen,
    disclaimer: FAHRPLAN_DISCLAIMER,
    stand,
  };
}

const eur = (n: number) => `${n.toLocaleString("de-DE")} €`;

export function renderFahrplanMarkdown(f: Fahrplan): string {
  const z: string[] = [];
  z.push(`# Förderfahrplan (Stand der Programmdaten: ${f.stand})`, "");

  for (const w of f.warnungen) z.push(`> ⚠️ **${w}**`, "");

  if (f.empfehlung) {
    const e = f.empfehlung;
    z.push(`## Passendes Programm: ${e.name}`, "");
    if (e.foerdersatz_prozent !== undefined) {
      z.push(`**Fördersatz: ${e.foerdersatz_prozent} %**${e.hoechstkosten_eur ? ` (förderfähige Kosten bis ${eur(e.hoechstkosten_eur)})` : ""}`, "");
      for (const s of e.saetze) {
        const status = s.zutreffend === true ? "✓" : s.zutreffend === "unbekannt" ? "?" : "—";
        z.push(`- ${status} ${s.bezeichnung}${s.satz_prozent !== undefined ? `: ${s.satz_prozent} %` : ""}`);
      }
      z.push("");
    }
    if (e.betrag_eur_geschaetzt !== undefined && e.kosten_angesetzt_eur !== undefined) {
      z.push(`Geschätzt: **${eur(e.betrag_eur_geschaetzt)}** (bei angesetzten Kosten von ${eur(e.kosten_angesetzt_eur)}).${e.hinweis ? ` ${e.hinweis}` : ""}`, "");
    } else if (e.hinweis) {
      z.push(e.hinweis, "");
    }
  } else {
    z.push("## Kein passendes Programm gefunden", "", "Auf Basis der Angaben passt derzeit kein erfasstes Programm — siehe offene Fragen und Ausschlussgründe.", "");
  }

  for (const eo of f.entweder_oder) {
    z.push(`> ⚖️ **Entweder-oder:** ${eo.programme[0]} vs. ${eo.programme[1]} — ${eo.hinweis}`, "");
  }

  for (const k of f.kombinationen) {
    z.push(
      `> ➕ **Kombinierbar:** ${k.programme[0]} + ${k.programme[1]} — zusammen ${k.kombinierte_quote_prozent} %` +
        (k.kombinierte_quote_prozent < k.quote_summe_prozent
          ? ` statt ${k.quote_summe_prozent} % (${k.hinweis ?? "Richtlinien-Deckel"})`
          : k.hinweis
            ? ` — ${k.hinweis}`
            : ""),
      "",
    );
  }

  if (f.isfp_weiche) z.push(`> 🧭 **iSFP-Weiche:** ${f.isfp_weiche.hinweis}`, "");

  if (f.schritte.length) {
    z.push("## Ihr Fahrplan", "");
    for (const s of f.schritte) {
      z.push(`### Schritt ${s.nr}: ${s.titel}`, "", s.beschreibung, "");
      if (s.warnung) z.push(`> 🔴 ${s.warnung}`, "");
      for (const d of s.dokumente) {
        z.push(`- 📄 **${d.name}** (Aussteller: ${d.aussteller})${d.frist_hinweis ? ` — ${d.frist_hinweis}` : ""}`);
        if (d.human_only_felder.length) z.push(`  - 👤 Nur durch Experten/Fachunternehmen: ${d.human_only_felder.join(", ")}`);
      }
      if (s.dokumente.length) z.push("");
      z.push(`*Quellen: ${s.quellen.map((q) => (q.url ? `[${q.bezeichnung}](${q.url})` : q.fundstelle ? `${q.bezeichnung} (${q.fundstelle})` : q.bezeichnung)).join(" · ")}*`, "");
    }
  }

  if (f.offene_fragen.length) {
    z.push("## Offene Fragen (für ein vollständiges Ergebnis)", "");
    for (const o of f.offene_fragen) z.push(`- ${o.frage} (\`${o.feld}\`)`);
    z.push("");
  }

  if (f.nicht_passend.length) {
    z.push("## Nicht passend (mit Grund)", "");
    for (const n of f.nicht_passend) z.push(`- **${n.name}**: ${n.gruende.join("; ")}`);
    z.push("");
  }

  z.push("---", "", `*${f.disclaimer}*`);
  return z.join("\n");
}
