import type { Bedingung } from "../schemas/common.ts";

/** Liest einen Punktpfad ("anlage.leistung_kwp") aus einem Objekt. */
export function feldWert(obj: unknown, pfad: string): unknown {
  let cur: unknown = obj;
  for (const teil of pfad.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[teil];
  }
  return cur;
}

/**
 * Deterministischer Evaluator der Bedingungssprache.
 * `vor`/`nach` vergleichen ISO-Daten lexikografisch (YYYY-MM-DD ist sortierbar).
 * Fehlende Felder ⇒ Bedingung false (außer op=exists mit wert=false).
 */
export function pruefeBedingung(bedingung: Bedingung, fall: unknown): boolean {
  if ("alle" in bedingung) return bedingung.alle.every((b) => pruefeBedingung(b, fall));
  if ("eine" in bedingung) return bedingung.eine.some((b) => pruefeBedingung(b, fall));
  if ("nicht" in bedingung) return !pruefeBedingung(bedingung.nicht, fall);

  const ist = feldWert(fall, bedingung.feld);
  const soll = bedingung.wert;

  switch (bedingung.op) {
    case "exists":
      return soll === false ? ist === undefined : ist !== undefined;
    case "eq":
      return ist === soll;
    case "neq":
      return ist !== soll;
    case "in":
      return Array.isArray(soll) && soll.includes(ist as never);
    case "lt":
      return typeof ist === "number" && typeof soll === "number" && ist < soll;
    case "lte":
      return typeof ist === "number" && typeof soll === "number" && ist <= soll;
    case "gt":
      return typeof ist === "number" && typeof soll === "number" && ist > soll;
    case "gte":
      return typeof ist === "number" && typeof soll === "number" && ist >= soll;
    case "vor":
      return typeof ist === "string" && typeof soll === "string" && ist < soll;
    case "nach":
      return typeof ist === "string" && typeof soll === "string" && ist > soll;
  }
}
