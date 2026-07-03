import { beforeEach, describe, expect, test } from "bun:test";
import { netzbetreiberFuerPlz, _leereNetzbetreiberCache, type FetchFn } from "./netzbetreiber.ts";

const antwortMit = (rows: Record<string, unknown>[]): FetchFn => {
  return async () => ({ ok: true, status: 200, json: async () => ({ Data: rows }) });
};

beforeEach(() => _leereNetzbetreiberCache());

describe("netzbetreiberFuerPlz — PLZ→VNB-Heuristik (MaStR)", () => {
  test("zählt, sortiert und normalisiert Netzbetreiber (Fullwidth-＆, MaStR-Nr. extrahiert)", async () => {
    const fetchFn = antwortMit([
      { NetzbetreiberNamen: "SWM Infrastruktur GmbH ＆ Co. KG (SNB969473762610)" },
      { NetzbetreiberNamen: "SWM Infrastruktur GmbH ＆ Co. KG (SNB969473762610)" },
      { NetzbetreiberNamen: '<a href="/x">Bayernwerk Netz GmbH (SNB123456789012)</a>' },
      { NetzbetreiberNamen: "SWM Infrastruktur GmbH ＆ Co. KG (SNB969473762610)" },
    ]);
    const e = await netzbetreiberFuerPlz("80331", { fetchFn });
    expect(e.stichprobe).toBe(4);
    expect(e.netzbetreiber[0]).toEqual({
      name: "SWM Infrastruktur GmbH & Co. KG",
      mastr_nr: "SNB969473762610",
      anzahl: 3,
      anteil_prozent: 75,
    });
    expect(e.netzbetreiber[1]?.name).toBe("Bayernwerk Netz GmbH");
    expect(e.netzbetreiber[1]?.name).not.toContain("<");
    expect(e.quelle).toContain("Bundesnetzagentur");
    expect(e.hinweis).toContain("vermutlich");
  });

  test("ungültige PLZ → Klartext-Fehler", async () => {
    await expect(netzbetreiberFuerPlz("123", {})).rejects.toThrow(/5 Ziffern/);
    await expect(netzbetreiberFuerPlz("8033a", {})).rejects.toThrow(/5 Ziffern/);
  });

  test("keine Treffer → leere Liste + Handlungs-Hinweis, kein Throw", async () => {
    const e = await netzbetreiberFuerPlz("99998", { fetchFn: antwortMit([]) });
    expect(e.netzbetreiber).toEqual([]);
    expect(e.stichprobe).toBe(0);
    expect(e.hinweis).toContain("Stromrechnung");
  });

  test("API-Fehler → deutsche Meldung mit Retry-Hinweis (Fahrplan funktioniert auch ohne)", async () => {
    const kaputt: FetchFn = async () => ({ ok: false, status: 503, json: async () => ({}) });
    await expect(netzbetreiberFuerPlz("80331", { fetchFn: kaputt })).rejects.toThrow(/erneut|erreichbar/);
  });

  test("Cache: zweiter Aufruf derselben PLZ trifft die API nicht erneut", async () => {
    let aufrufe = 0;
    const fetchFn: FetchFn = async () => {
      aufrufe++;
      return { ok: true, status: 200, json: async () => ({ Data: [{ NetzbetreiberNamen: "Testnetz GmbH (SNB000000000001)" }] }) };
    };
    await netzbetreiberFuerPlz("10115", { fetchFn });
    await netzbetreiberFuerPlz("10115", { fetchFn });
    expect(aufrufe).toBe(1);
  });

  test("Einheiten ohne Netzbetreiber-Angabe werden übersprungen, zählen nicht zur Stichprobe", async () => {
    const e = await netzbetreiberFuerPlz("20095", {
      fetchFn: antwortMit([
        { NetzbetreiberNamen: "Stromnetz Hamburg GmbH (SNB999999999999)" },
        { NetzbetreiberNamen: "" },
        { AndereSpalte: "x" },
      ]),
    });
    expect(e.stichprobe).toBe(1);
    expect(e.netzbetreiber[0]?.anteil_prozent).toBe(100);
  });
});

describe("netzbetreiberFuerPlz — Advisor-Härtung", () => {
  test("HTML-Entity &amp; wird normalisiert (reale MaStR-Daten mischen Entity und Fullwidth)", async () => {
    const e = await netzbetreiberFuerPlz("70173", {
      fetchFn: antwortMit([{ NetzbetreiberNamen: "Netze BW GmbH &amp; Co. KG (SNB111111111111)" }]),
    });
    expect(e.netzbetreiber[0]?.name).toBe("Netze BW GmbH & Co. KG");
  });

  test("Anti Cache-Poisoning: fehlgeschlagener Abruf wird NICHT gecacht — nächster Aufruf versucht es erneut", async () => {
    let aufrufe = 0;
    const ersterKaputt: FetchFn = async () => {
      aufrufe++;
      if (aufrufe === 1) return { ok: false, status: 503, json: async () => ({}) };
      return { ok: true, status: 200, json: async () => ({ Data: [{ NetzbetreiberNamen: "Retry-Netz GmbH (SNB222222222222)" }] }) };
    };
    await expect(netzbetreiberFuerPlz("30159", { fetchFn: ersterKaputt })).rejects.toThrow();
    const zweiter = await netzbetreiberFuerPlz("30159", { fetchFn: ersterKaputt });
    expect(aufrufe).toBe(2);
    expect(zweiter.netzbetreiber[0]?.name).toBe("Retry-Netz GmbH");
  });
});

describe("netzbetreiberFuerPlz — adversariale Szenarien (Forge)", () => {
  test("Gleichstand zweier Netzbetreiber (je 50 %) — stabile Reihenfolge bleibt erhalten", async () => {
    const e = await netzbetreiberFuerPlz("80331", {
      fetchFn: antwortMit([
        { NetzbetreiberNamen: "Netz A GmbH (SNB100000000001)" },
        { NetzbetreiberNamen: "Netz B GmbH (SNB200000000002)" },
      ]),
    });

    expect(e.stichprobe).toBe(2);
    expect(e.netzbetreiber.length).toBe(2);
    expect(e.netzbetreiber[0]).toMatchObject({ anzahl: 1, anteil_prozent: 50 });
    expect(e.netzbetreiber[1]).toMatchObject({ anzahl: 1, anteil_prozent: 50 });
    expect(e.netzbetreiber.map((n) => n.name)).toEqual(["Netz A GmbH", "Netz B GmbH"]);
  });

  test("Antwort ohne Data-Feld ({}) bzw. Data:null → kein Crash, leere Liste", async () => {
    const ohneData = await netzbetreiberFuerPlz("99990", {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
    });
    expect(ohneData.netzbetreiber).toEqual([]);
    expect(ohneData.stichprobe).toBe(0);
    expect(ohneData.hinweis).toContain("Stromrechnung");

    const dataNull = await netzbetreiberFuerPlz("99991", {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({ Data: null }) }),
    });
    expect(dataNull.netzbetreiber).toEqual([]);
    expect(dataNull.stichprobe).toBe(0);
    expect(dataNull.hinweis).toContain("Stromrechnung");
  });

  test("NetzbetreiberNamen ohne MaStR-Nr.-Klammer", async () => {
    const e = await netzbetreiberFuerPlz("80332", {
      fetchFn: antwortMit([{ NetzbetreiberNamen: "Stadtwerke München" }]),
    });

    expect(e.netzbetreiber[0]?.name).toBe("Stadtwerke München");
    expect(e.netzbetreiber[0]?.mastr_nr).toBeUndefined();
    expect(e.netzbetreiber[0]?.anteil_prozent).toBe(100);
  });

  test('PLZ mit führenden/abschließenden Spaces (" 80331 ")', async () => {
    const e = await netzbetreiberFuerPlz(" 80331 ", {
      fetchFn: antwortMit([{ NetzbetreiberNamen: "SWM (SNB000000000001)" }]),
    });

    expect(e.plz).toBe("80331");
    expect(e.netzbetreiber.length).toBe(1);
  });

  test("Cache-Isolation: verschiedene PLZ → getrennte Fetches", async () => {
    let aufrufe = 0;
    const fetchFn: FetchFn = async () => {
      aufrufe++;
      return { ok: true, status: 200, json: async () => ({ Data: [{ NetzbetreiberNamen: "Testnetz GmbH (SNB000000000123)" }] }) };
    };

    await netzbetreiberFuerPlz("10115", { fetchFn });
    await netzbetreiberFuerPlz("20095", { fetchFn });

    expect(aufrufe).toBe(2);
  });

  test("json() wirft (kaputtes JSON) → deutsche Fehlermeldung", async () => {
    const fetchFn: FetchFn = async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Unexpected token < in JSON");
      },
    });

    await expect(netzbetreiberFuerPlz("80331", { fetchFn })).rejects.toThrow(/nicht erreichbar|erneut/);
  });

  test("Abgelehnter fetch (Netzwerkfehler / AbortError) → deutsche Fehlermeldung", async () => {
    const fetchFn: FetchFn = async () => {
      throw new DOMException("The operation was aborted.", "AbortError");
    };

    await expect(netzbetreiberFuerPlz("80331", { fetchFn })).rejects.toThrow(/nicht erreichbar|erneut/);
  });

  test("Tag-only NetzbetreiberNamen ('<br/>') wird übersprungen — kein Phantom-Eintrag (Forge-Fund, behoben)", async () => {
    const e = await netzbetreiberFuerPlz("99992", {
      fetchFn: antwortMit([{ NetzbetreiberNamen: "<br/>" }, { NetzbetreiberNamen: "Echtes Netz GmbH (SNB333333333333)" }]),
    });
    expect(e.stichprobe).toBe(1);
    expect(e.netzbetreiber).toHaveLength(1);
    expect(e.netzbetreiber[0]?.name).toBe("Echtes Netz GmbH");
  });

  test("Data als Nicht-Array-Objekt ({}) → wie leere Daten, kein roher TypeError (Forge-Fund, behoben)", async () => {
    const e = await netzbetreiberFuerPlz("99993", {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({ Data: {} }) }),
    });
    expect(e.netzbetreiber).toEqual([]);
    expect(e.stichprobe).toBe(0);
  });
});

describe("netzbetreiberFuerPlz — Cato-Härtung (Nebenläufigkeit)", () => {
  test("zwei GLEICHZEITIGE Erstaufrufe derselben PLZ teilen sich eine Anfrage (In-Flight-Cache)", async () => {
    let aufrufe = 0;
    const fetchFn: FetchFn = async () => {
      aufrufe++;
      await new Promise((r) => setTimeout(r, 20));
      return { ok: true, status: 200, json: async () => ({ Data: [{ NetzbetreiberNamen: "Parallel-Netz GmbH (SNB444444444444)" }] }) };
    };
    const [a, b] = await Promise.all([netzbetreiberFuerPlz("50667", { fetchFn }), netzbetreiberFuerPlz("50667", { fetchFn })]);
    expect(aufrufe).toBe(1);
    expect(a.netzbetreiber[0]?.name).toBe("Parallel-Netz GmbH");
    expect(b.netzbetreiber[0]?.name).toBe("Parallel-Netz GmbH");
  });
});
