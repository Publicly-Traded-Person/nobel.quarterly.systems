import { describe, expect, test } from "bun:test";
import { cp, mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadSite } from "../src/load";

const OK = "tests/fixtures/site-ok";

describe("loadSite", () => {
  test("ok fixture loads with counts, order, and rendered bodies [M1]", async () => {
    const site = await loadSite(OK);
    expect(site.candidates.length).toBe(2);
    expect(site.updates.length).toBe(2);
    expect(site.updates.map((u) => u.date)).toEqual(["2026-09-17", "2026-10-01"]);
    expect(site.updates[0]!.slug).toBe("2026-09-17-first");
    expect(site.candidates[0]!.bodyHtml).toContain("<p>");
    expect(site.candidates[0]!.bodyHtml).toContain("<strong>");
    expect(site.updates[0]!.observations[0]!.note).toBe("for building the thing");
    expect(site.sources.map((s) => s.id)).toEqual(["clarivate", "polymarket", "kmikeym"]);
  });

  test("unknown candidate names the file and field [M2]", async () => {
    await expect(loadSite("tests/fixtures/site-bad")).rejects.toThrow(/updates\/2026-09-17-typo\.md.*candidate.*alicia/);
  });

  test("rank without of names the field [M2]", async () => {
    await expect(loadSite("tests/fixtures/site-bad-rank")).rejects.toThrow(/2026-10-02-cowen\.md.*\bof\b/);
  });

  test("bad date format rejects [M3]", async () => {
    const dir = await mkdtemp(join(tmpdir(), "nobel-date-"));
    await cp(OK, dir, { recursive: true });
    await writeFile(
      join(dir, "updates", "2026-9-1-bad.md"),
      "---\ntitle: Bad\ndate: 2026-9-1\nsummary: bad\n---\nx\n",
    );
    await expect(loadSite(dir)).rejects.toThrow(/bad\.md.*date/);
  });

  test("unknown theme rejects", async () => {
    const dir = await mkdtemp(join(tmpdir(), "nobel-theme-"));
    await cp(OK, dir, { recursive: true });
    await writeFile(
      join(dir, "candidates", "carol.md"),
      "---\nid: carol\nname: Carol\naffiliation: X\ntheme: nope\n---\nbody\n",
    );
    await expect(loadSite(dir)).rejects.toThrow(/carol\.md.*theme.*nope/);
  });

  test("id must equal filename stem", async () => {
    const dir = await mkdtemp(join(tmpdir(), "nobel-id-"));
    await cp(OK, dir, { recursive: true });
    await mkdir(join(dir, "candidates"), { recursive: true });
    await writeFile(
      join(dir, "candidates", "dave.md"),
      "---\nid: david\nname: Dave\naffiliation: X\ntheme: macro\n---\nbody\n",
    );
    await expect(loadSite(dir)).rejects.toThrow(/dave\.md.*id/);
  });
});
