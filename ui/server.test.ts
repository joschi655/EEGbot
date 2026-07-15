import { describe, expect, test } from "bun:test";
import { engineResponse, handleRequest } from "./server.ts";
import { z } from "zod";

const post = (path: string, body: string) =>
  new Request(`http://localhost${path}`, { method: "POST", headers: { "content-type": "application/json" }, body });

describe("REST-Fehlervertrag", () => {
  test("kaputtes JSON ist 400, nicht 500", async () => {
    const res = await handleRequest(post("/api/verguetung", "{"));
    expect(res.status).toBe(400);
    expect((await res.json()).fehler).toContain("Ungültiges JSON");
  });

  test("kaputtes JSON ist auch außerhalb der Rechner-Routen 400", async () => {
    const res = await handleRequest(post("/api/fahrplan", "{"));
    expect(res.status).toBe(400);
  });

  test("Zod-Verletzung und ungültige Enum sind 422", async () => {
    const res = await handleRequest(
      post("/api/verguetung", JSON.stringify({ ibn_datum: "2026-07-15", leistung_kwp: -1, einspeiseart: "falsch" })),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).fehler).toContain("leistung_kwp");
  });

  test("fachliche Rechnergrenze ist 422", async () => {
    const res = await handleRequest(
      post("/api/verguetung", JSON.stringify({ ibn_datum: "2026-07-15", leistung_kwp: 101, einspeiseart: "teileinspeisung" })),
    );
    expect(res.status).toBe(422);
  });

  test("unbekannte Exception wird als generischer 500 verborgen", async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const res = await engineResponse(post("/x", "{}"), z.object({}), () => {
        throw new Error("geheimes Stack-Detail");
      });
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("geheimes Stack-Detail");
    } finally {
      console.error = original;
    }
  });

  test("Tarif nach 31.07.2026 liefert Datenlücke statt still veralteten Wert", async () => {
    const res = await handleRequest(
      post("/api/verguetung", JSON.stringify({ ibn_datum: "2026-08-01", leistung_kwp: 9.8, einspeiseart: "teileinspeisung" })),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).fehler).toContain("noch nicht ab");
  });

  test("KI-Intake verlangt ausdrückliche Einwilligung", async () => {
    const res = await handleRequest(post("/api/intake", JSON.stringify({ freitext: "privat" })));
    expect(res.status).toBe(422);
    expect((await res.json()).fehler).toContain("Einwilligung");
  });
});
