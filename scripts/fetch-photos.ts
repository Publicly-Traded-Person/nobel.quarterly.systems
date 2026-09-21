// Pull a freely licensed portrait for each candidate from Wikipedia/Wikimedia
// Commons, resize it, and write `photo` + `photo_credit` into the frontmatter.
//
//   bun run scripts/fetch-photos.ts            # all candidates without a photo
//   bun run scripts/fetch-photos.ts --force    # re-fetch everyone
//   bun run scripts/fetch-photos.ts --only susan-athey
//
// Only CC-licensed or public-domain images are kept. Anyone without one is
// reported at the end so a photo can be found by hand.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parse, stringify } from "yaml";

const UA = "nobel.quarterly.systems photo fetch (kmikeym@kmikeym.com)";
const ROOT = ".";
const IMG_DIR = join(ROOT, "candidates", "img");
const WIDTH = 320;

const force = process.argv.includes("--force");
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : undefined;

type Result = { id: string; status: "ok" | "kept" | "no-page" | "no-image" | "bad-license" | "download-failed"; detail?: string };

async function api(base: string, params: Record<string, string>): Promise<any> {
  const u = new URL(base);
  u.search = new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params }).toString();
  await Bun.sleep(350);
  let r = await fetch(u, { headers: { "user-agent": UA } });
  if (r.status === 429) {
    await Bun.sleep(5000);
    r = await fetch(u, { headers: { "user-agent": UA } });
  }
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  return r.json();
}

const WIKI = "https://en.wikipedia.org/w/api.php";
const COMMONS = "https://commons.wikimedia.org/w/api.php";

function lastName(name: string): string {
  const parts = name.replace(/[,.]/g, "").trim().split(/\s+/);
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

async function pageImage(title: string): Promise<{ title: string; image?: string } | undefined> {
  const p = await api(WIKI, { action: "query", prop: "pageimages", piprop: "name", titles: title, redirects: "1" });
  const page = p.query?.pages?.[0];
  if (!page || page.missing) return undefined;
  return { title: page.title, image: page.pageimage };
}

async function findPage(name: string): Promise<{ title: string; image?: string } | undefined> {
  // Direct title guesses first: full name, name without middle initial, each
  // with and without the (economist)/(statistician) disambiguator. Then search.
  const noInitial = name.replace(/\s[A-Z]\.\s/, " ");
  const guesses = [name, noInitial].flatMap((n) => [n, `${n} (economist)`, `${n} (statistician)`]);
  const ln = lastName(name);
  for (const g of [...new Set(guesses)]) {
    const r = await pageImage(g);
    if (r && r.title.toLowerCase().includes(ln)) {
      if (r.image) return r;
    }
  }
  const s = await api(WIKI, { action: "query", list: "search", srsearch: `${name} economist`, srlimit: "5" });
  const hits: { title: string }[] = s.query?.search ?? [];
  const hit = hits.find((h) => h.title.toLowerCase().includes(ln) && !/^list of/i.test(h.title));
  if (!hit) return undefined;
  return pageImage(hit.title);
}

const FREE = /^(cc[- ]|public domain|pd|cc0|attribution|gfdl|copyrighted free use)/i;

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function imageInfo(file: string): Promise<{ url: string; license: string; artist: string; free: boolean } | undefined> {
  const r = await api(COMMONS, {
    action: "query",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(WIDTH * 2),
    titles: `File:${file}`,
  });
  const page = r.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!info) return undefined;
  const md = info.extmetadata ?? {};
  const license: string = md.LicenseShortName?.value ?? md.License?.value ?? "";
  const artist: string = stripHtml(md.Artist?.value ?? md.Credit?.value ?? "");
  return { url: info.thumburl ?? info.url, license, artist, free: FREE.test(license) };
}

async function download(url: string, dest: string): Promise<boolean> {
  const r = await fetch(url, { headers: { "user-agent": UA } });
  if (!r.ok) return false;
  const buf = new Uint8Array(await r.arrayBuffer());
  await writeFile(dest, buf);
  // Resize with sips (macOS) to a JPEG at WIDTH px wide.
  const p = Bun.spawn(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", "--resampleWidth", String(WIDTH), dest, "--out", dest], { stdout: "ignore", stderr: "ignore" });
  await p.exited;
  return p.exitCode === 0;
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  const files = (await readdir(join(ROOT, "candidates"))).filter((f) => f.endsWith(".md")).sort();
  const results: Result[] = [];
  for (const f of files) {
    const path = join(ROOT, "candidates", f);
    const text = await readFile(path, "utf8");
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) continue;
    const fm = parse(m[1]!) as Record<string, unknown>;
    const id = String(fm.id);
    if (only && id !== only) continue;
    if (fm.photo && !force) {
      results.push({ id, status: "kept" });
      continue;
    }
    const name = String(fm.name);
    try {
      const page = await findPage(name);
      if (!page) { results.push({ id, status: "no-page" }); continue; }
      if (!page.image) { results.push({ id, status: "no-image", detail: page.title }); continue; }
      const info = await imageInfo(page.image);
      if (!info) { results.push({ id, status: "no-image", detail: page.image }); continue; }
      if (!info.free) { results.push({ id, status: "bad-license", detail: `${page.image} (${info.license || "no license"})` }); continue; }
      const dest = join(IMG_DIR, `${id}.jpg`);
      const ok = await download(info.url, dest);
      if (!ok) { results.push({ id, status: "download-failed", detail: info.url }); continue; }
      const credit = `${info.artist || "Wikimedia Commons"}, ${info.license}, via Wikimedia Commons`;
      const newFm = { ...fm, photo: `img/${id}.jpg`, photo_credit: credit };
      const yaml = stringify(newFm, { lineWidth: 0 }).trimEnd();
      await writeFile(path, `---\n${yaml}\n---\n${m[2] ?? ""}`);
      results.push({ id, status: "ok", detail: `${page.image} (${info.license})` });
    } catch (e) {
      results.push({ id, status: "download-failed", detail: String(e) });
    }
  }
  const by = (s: Result["status"]) => results.filter((r) => r.status === s);
  console.log(`ok ${by("ok").length}, kept ${by("kept").length}, no-page ${by("no-page").length}, no-image ${by("no-image").length}, bad-license ${by("bad-license").length}, failed ${by("download-failed").length}`);
  for (const s of ["no-page", "no-image", "bad-license", "download-failed"] as const)
    for (const r of by(s)) console.log(`  ${s}\t${r.id}\t${r.detail ?? ""}`);
}

await main();
