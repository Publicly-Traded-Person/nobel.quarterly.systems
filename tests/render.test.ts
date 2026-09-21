import { beforeAll, describe, expect, test } from "bun:test";
import { loadSite } from "../src/load";
import { computeTimeline } from "../src/score";
import {
  renderCandidate,
  renderFeed,
  renderHome,
  renderReplay,
  renderScore,
  renderSources,
  renderUpdate,
} from "../src/render";
import type { Site, Timeline } from "../src/types";

let site: Site;
let timeline: Timeline;

beforeAll(async () => {
  site = await loadSite("tests/fixtures/site-ok");
  timeline = computeTimeline(site);
});

describe("render", () => {
  test("home has names, leader score, tier heading, update titles [M1]", () => {
    const html = renderHome(site, timeline);
    expect(html).toContain("Alice Example");
    expect(html).toContain("Bob Sample");
    const leader = timeline[timeline.length - 1]!.standings[0]!;
    expect(html).toContain(leader.composite.toFixed(1));
    expect(html).toContain("Contenders");
    expect(html).toContain("Clarivate names Alice");
    expect(html).toContain("Markets open");
    expect(html).toContain("Alice makes the list.");
  });

  test("update page has prose and observation sentences [M2]", () => {
    const html = renderUpdate(site, timeline, site.updates[1]!);
    expect(html).toContain("<p>The market disagrees with Clarivate. Good.</p>");
    expect(html).toContain("Polymarket");
    expect(html).toContain("Bob Sample");
    expect(html).toContain("priced");
    expect(html).toContain("60%");
    expect(html).toContain("priced at 60 cents");
  });

  test("candidate page has report and notes in date order [M3]", () => {
    const alice = site.candidates.find((c) => c.id === "alice")!;
    const html = renderCandidate(site, timeline, alice);
    expect(html).toContain("<strong>The case for:</strong>");
    const a = html.indexOf("for building the thing");
    const b = html.indexOf("still our pick");
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
  });

  test("score page lists weights and a worked example for the leader [M4]", () => {
    const html = renderScore(site, timeline);
    for (const s of site.sources) {
      expect(html).toContain(s.name);
      expect(html).toContain(`<td>${s.weight}</td>`);
    }
    const leader = site.candidates.find((c) => c.id === timeline[timeline.length - 1]!.standings[0]!.id)!;
    expect(html).toContain(`Worked example: ${leader.name}`);
  });

  test("replay page has a range input and the script [M5]", () => {
    const html = renderReplay(site);
    expect(html).toContain('type="range"');
    expect(html).toMatch(/replay(\.[a-f0-9]+)?\.js/);
  });

  test("sources page lists every source", () => {
    const html = renderSources(site);
    for (const s of site.sources) expect(html).toContain(s.name);
  });

  test("feed is RSS with one item per update [M6]", () => {
    const xml = renderFeed(site);
    expect(xml).toContain("<rss");
    expect(xml.match(/<item>/g)?.length).toBe(site.updates.length);
    expect(xml).toContain("https://example.test/updates/2026-09-17-first/");
  });

  test("content is escaped", () => {
    const evil = { ...site, candidates: [{ ...site.candidates[0]!, name: "<script>x</script>" }] };
    const html = renderHome(evil, computeTimeline(evil));
    expect(html).not.toContain("<script>x</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("faces", () => {
  test("initials drop middle initials", async () => {
    const { initials } = await import("../src/render");
    expect(initials("Susan C. Athey")).toBe("SA");
    expect(initials("W. Brian Arthur")).toBe("BA");
    expect(initials("Piketty")).toBe("P");
  });
  test("a candidate without a photo renders an initials tile, with a photo renders an img", async () => {
    const { face } = await import("../src/render");
    const c = site.candidates[0]!;
    expect(face(c)).toContain("face-initials");
    expect(face({ ...c, photo: "img/alice.jpg", photoCredit: "x" })).toContain('src="/img/alice.jpg"');
  });
});
