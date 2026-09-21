import { describe, expect, test } from "bun:test";
import { computeTimeline, heat } from "../src/score";
import type { Observation, Site, Update } from "../src/types";

const config: Site["config"] = {
  title: "t",
  url: "https://example.test",
  themes: { macro: "Macro" },
  tiers: { lock: 70, contender: 40, darkhorse: 15 },
};

function site(updates: Update[], extra: Partial<Site> = {}): Site {
  return {
    config,
    sources: [
      { id: "clarivate", name: "Clarivate", url: "", kind: "named", weight: 3, blurb: "" },
      { id: "polymarket", name: "Polymarket", url: "", kind: "prob", weight: 3, blurb: "" },
      { id: "kmikeym", name: "Desk", url: "", kind: "named", weight: 0.5, blurb: "" },
    ],
    candidates: [
      { id: "a", name: "Alice", affiliation: "", theme: "macro", bodyHtml: "" },
      { id: "b", name: "Bob", affiliation: "", theme: "macro", bodyHtml: "" },
      { id: "c", name: "Carol", affiliation: "", theme: "macro", bodyHtml: "" },
    ],
    updates,
    ...extra,
  };
}

function update(slug: string, date: string, observations: Observation[]): Update {
  return { slug, date, title: slug, summary: "", observations, bodyHtml: "" };
}

describe("heat [M1]", () => {
  test("named is 100", () => expect(heat({ source: "s", candidate: "c", kind: "named", value: 1 })).toBe(100));
  test("rank 2 of 4 is 75", () => expect(heat({ source: "s", candidate: "c", kind: "rank", value: 2, of: 4 })).toBe(75));
  test("share 0.3 is 30", () => expect(heat({ source: "s", candidate: "c", kind: "share", value: 0.3 })).toBeCloseTo(30));
  test("prob 0.45 is 45", () => expect(heat({ source: "s", candidate: "c", kind: "prob", value: 0.45 })).toBeCloseTo(45));
});

test("newest observation per (source, candidate) wins [M2]", () => {
  const t = computeTimeline(
    site([
      update("u1", "2026-09-01", [{ source: "clarivate", candidate: "a", kind: "named", value: 1 }]),
      update("u2", "2026-09-02", [{ source: "clarivate", candidate: "a", kind: "named", value: 0 }]),
    ]),
  );
  expect(t[0]!.standings.find((s) => s.id === "a")!.composite).toBe(100);
  expect(t[1]!.standings.find((s) => s.id === "a")!.composite).toBe(0);
});

test("only sources that have published count in the denominator [M3]", () => {
  const t = computeTimeline(
    site([
      update("u1", "2026-09-01", [{ source: "clarivate", candidate: "a", kind: "named", value: 1 }]),
      update("u2", "2026-10-01", [{ source: "polymarket", candidate: "b", kind: "prob", value: 1 }]),
    ]),
  );
  const a1 = t[0]!.standings.find((s) => s.id === "a")!;
  expect(a1.composite).toBe(100);
  const a2 = t[1]!.standings.find((s) => s.id === "a")!;
  expect(a2.composite).toBe(50);
  const b2 = t[1]!.standings.find((s) => s.id === "b")!;
  expect(b2.composite).toBe(50);
});

test("tiers follow bands and sleeper needs the desk below contender [M4]", () => {
  // Weights: clarivate 3, polymarket 3, desk 0.5 → total 6.5 once all active.
  // Use prob values to land composites: a=71ish, b=40ish, c below 15 with desk flag.
  const t = computeTimeline(
    site([
      update("u1", "2026-09-01", [
        { source: "clarivate", candidate: "a", kind: "named", value: 1 },
        { source: "polymarket", candidate: "a", kind: "prob", value: 0.54 },
        { source: "polymarket", candidate: "b", kind: "prob", value: 0.8667 },
        { source: "kmikeym", candidate: "c", kind: "named", value: 1 },
      ]),
    ]),
  );
  const by = Object.fromEntries(t[0]!.standings.map((s) => [s.id, s]));
  expect(by.a!.composite).toBeGreaterThanOrEqual(70);
  expect(by.a!.tier).toBe("Lock");
  expect(by.b!.tier).toBe("Contender");
  expect(by.c!.composite).toBeLessThan(15);
  expect(by.c!.tier).toBe("Field");
  expect(by.c!.sleeper).toBe(true);
  expect(by.a!.sleeper).toBe(false);
});

test("exact band edges: 71, 40, 15, 14", () => {
  const s = site([]);
  // Single source with weight 1 so composite == heat.
  s.sources = [{ id: "polymarket", name: "P", url: "", kind: "prob", weight: 1, blurb: "" }];
  s.candidates = ["w", "x", "y", "z"].map((id) => ({ id, name: id, affiliation: "", theme: "macro", bodyHtml: "" }));
  s.updates = [
    update("u1", "2026-09-01", [
      { source: "polymarket", candidate: "w", kind: "prob", value: 0.71 },
      { source: "polymarket", candidate: "x", kind: "prob", value: 0.4 },
      { source: "polymarket", candidate: "y", kind: "prob", value: 0.15 },
      { source: "polymarket", candidate: "z", kind: "prob", value: 0.14 },
    ]),
  ];
  const by = Object.fromEntries(computeTimeline(s)[0]!.standings.map((r) => [r.id, r.tier]));
  expect(by).toEqual({ w: "Lock", x: "Contender", y: "Darkhorse", z: "Field" });
});

test("movement is previous rank minus current, or new [M5]", () => {
  const t = computeTimeline(
    site([
      update("u1", "2026-09-01", [
        { source: "clarivate", candidate: "a", kind: "named", value: 1 },
        { source: "clarivate", candidate: "b", kind: "named", value: 1 },
      ]),
      update("u2", "2026-09-02", [{ source: "polymarket", candidate: "b", kind: "prob", value: 1 }]),
    ]),
  );
  // Snapshot 1: Alice and Bob tie at 100, alphabetical → Alice 1, Bob 2.
  const b1 = t[0]!.standings.find((s) => s.id === "b")!;
  expect(b1.rank).toBe(2);
  expect(b1.movement).toBe("new");
  // Snapshot 2: Bob 100, Alice 50 → Bob moves 2 → 1.
  const b2 = t[1]!.standings.find((s) => s.id === "b")!;
  expect(b2.rank).toBe(1);
  expect(b2.movement).toBe(1);
  const a2 = t[1]!.standings.find((s) => s.id === "a")!;
  expect(a2.movement).toBe(-1);
});

test("one snapshot per update, in order [M6]", () => {
  const t = computeTimeline(
    site([
      update("u1", "2026-09-01", []),
      update("u2", "2026-09-02", []),
      update("u3", "2026-09-03", []),
    ]),
  );
  expect(t.map((s) => s.slug)).toEqual(["u1", "u2", "u3"]);
  // No source active yet → everyone at 0, tier Field, still listed.
  expect(t[0]!.standings.length).toBe(3);
  expect(t[0]!.standings.every((s) => s.composite === 0 && s.tier === "Field")).toBe(true);
});
