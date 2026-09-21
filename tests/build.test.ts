import { expect, test } from "bun:test";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "../src/build";

const OK = "tests/fixtures/site-ok";

async function exists(p: string): Promise<boolean> {
  return stat(p).then(() => true, () => false);
}

test("build writes every page and asset [M1]", async () => {
  const out = await mkdtemp(join(tmpdir(), "nobel-build-"));
  await build(OK, out);
  for (const rel of [
    "index.html",
    "style.css",
    "replay.js",
    "timeline.json",
    "feed.xml",
    "updates/2026-09-17-first/index.html",
    "updates/2026-10-01-second/index.html",
    "candidates/alice/index.html",
    "candidates/bob/index.html",
    "score/index.html",
    "replay/index.html",
    "sources/index.html",
  ]) {
    expect(await exists(join(out, rel))).toBe(true);
  }
});

test("timeline.json has one snapshot per update [M2]", async () => {
  const out = await mkdtemp(join(tmpdir(), "nobel-build-"));
  await build(OK, out);
  const t = JSON.parse(await readFile(join(out, "timeline.json"), "utf8"));
  expect(t.timeline.length).toBe(2);
  expect(t.candidates.alice.name).toBe("Alice Example");
});

test("CLI accepts --root and --out and exits 0 [M3]", async () => {
  const out = await mkdtemp(join(tmpdir(), "nobel-cli-"));
  const proc = Bun.spawn(["bun", "run", "src/build.ts", "--root", OK, "--out", out]);
  const code = await proc.exited;
  expect(code).toBe(0);
  expect(await exists(join(out, "index.html"))).toBe(true);
});

test("CLI exits non-zero on a bad tree", async () => {
  const out = await mkdtemp(join(tmpdir(), "nobel-cli-bad-"));
  const proc = Bun.spawn(["bun", "run", "src/build.ts", "--root", "tests/fixtures/site-bad", "--out", out], { stderr: "pipe" });
  const code = await proc.exited;
  const err = await new Response(proc.stderr).text();
  expect(code).toBe(1);
  expect(err).toContain("alicia");
});
