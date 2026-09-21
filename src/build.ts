// Wire load → score → render and write dist/.
import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { loadSite } from "./load";
import { computeTimeline } from "./score";
import {
  renderCandidate,
  renderFeed,
  renderHome,
  renderReplay,
  renderScore,
  renderSources,
  renderUpdate,
} from "./render";

const ASSETS = join(dirname(new URL(import.meta.url).pathname), "assets");

export async function build(root: string, out: string): Promise<void> {
  const site = await loadSite(root);
  const timeline = computeTimeline(site);

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  const write = async (rel: string, content: string) => {
    const file = join(out, rel);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
  };

  await write("index.html", renderHome(site, timeline));
  await write("score/index.html", renderScore(site, timeline));
  await write("replay/index.html", renderReplay(site));
  await write("sources/index.html", renderSources(site));
  await write("feed.xml", renderFeed(site));
  for (const u of site.updates)
    await write(`updates/${u.slug}/index.html`, renderUpdate(site, timeline, u));
  for (const c of site.candidates)
    await write(`candidates/${c.id}/index.html`, renderCandidate(site, timeline, c));

  const candidates = Object.fromEntries(
    site.candidates.map((c) => [c.id, { name: c.name, affiliation: c.affiliation, theme: c.theme, photo: c.photo ?? null }]),
  );
  await write(
    "timeline.json",
    JSON.stringify({ generated: new Date().toISOString(), themes: site.config.themes, candidates, timeline }),
  );

  await cp(ASSETS, out, { recursive: true });
  const imgDir = join(root, "candidates", "img");
  if (await stat(imgDir).then(() => true, () => false)) await cp(imgDir, join(out, "img"), { recursive: true });
  console.log(
    `wrote ${out}: ${site.candidates.length} candidates, ${site.updates.length} updates, ${timeline.length} snapshots`,
  );
}

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

if (import.meta.main) {
  try {
    await build(arg("--root", "."), arg("--out", "dist"));
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }
}
