import { describe, expect, test } from "bun:test";
import {
  FristenInputSchema,
  RechnerDatum,
  VerguetungInputSchema,
} from "./rechner.ts";

describe("gemeinsame Rechner-Contracts", () => {
  test("weist ungültige Kalenderdaten zurück", () => {
    expect(RechnerDatum.safeParse("2026-02-30").success).toBe(false);
    expect(RechnerDatum.safeParse("15.07.2026").success).toBe(false);
    expect(RechnerDatum.safeParse("2024-02-29").success).toBe(true);
  });

  test("weist ungültige Einspeiseart und nichtpositive Leistung zurück", () => {
    expect(VerguetungInputSchema.safeParse({ ibn_datum: "2026-07-15", leistung_kwp: 9.8, einspeiseart: "irgendwas" }).success).toBe(false);
    expect(VerguetungInputSchema.safeParse({ ibn_datum: "2026-07-15", leistung_kwp: 0, einspeiseart: "teileinspeisung" }).success).toBe(false);
  });

  test("Fristen-Contract ergänzt leere Meldejahre deterministisch", () => {
    const r = FristenInputSchema.parse({
      ibn_datum: "2026-01-31",
      mastr_registriert: false,
      veraeusserungsform_gemeldet: true,
    });
    expect(r.volleinspeisung_gemeldet_fuer_jahr).toEqual([]);
  });
});
