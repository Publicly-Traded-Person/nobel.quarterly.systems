// Read and validate the content tree into one Site object.
import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { parse as parseYaml } from "yaml";
import { marked } from "marked";
import type {
  Candidate,
  Kind,
  Observation,
  Site,
  SiteConfig,
  Source,
  Update,
} from "./types";

const KINDS: Kind[] = ["named", "rank", "share", "prob"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class LoadError extends Error {
  constructor(file: string, field: string, message: string) {
    super(`${file}: ${field}: ${message}`);
    this.name = "LoadError";
  }
}

type Doc = { front: Record<string, unknown>; body: string };

function splitFrontmatter(file: string, text: string): Doc {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new LoadError(file, "frontmatter", "missing --- block");
  const front = parseYaml(m[1]!) as Record<string, unknown> | null;
  if (!front || typeof front !== "object")
    throw new LoadError(file, "frontmatter", "not a YAML mapping");
  return { front, body: m[2] ?? "" };
}

function str(file: string, front: Record<string, unknown>, key: string): string {
  const v = front[key];
  if (typeof v !== "string" || v.trim() === "")
    throw new LoadError(file, key, "required string");
  return v.trim();
}

function num(file: string, obj: Record<string, unknown>, key: string): number {
  const v = obj[key];
  if (typeof v !== "number" || Number.isNaN(v))
    throw new LoadError(file, key, "required number");
  return v;
}

async function mdFiles(dir: string): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    throw new LoadError(dir, "directory", "missing");
  }
  return names.filter((n) => n.endsWith(".md")).sort();
}

function render(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

async function loadConfig(root: string): Promise<SiteConfig> {
  const file = join(root, "site.config.json");
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    throw new LoadError(file, "json", String(e));
  }
  const c = raw as Record<string, unknown>;
  const title = str(file, c, "title");
  const url = str(file, c, "url");
  const themes = c.themes;
  if (!themes || typeof themes !== "object")
    throw new LoadError(file, "themes", "required mapping");
  const tiersRaw = c.tiers as Record<string, unknown> | undefined;
  if (!tiersRaw) throw new LoadError(file, "tiers", "required mapping");
  const tiers = {
    lock: num(file, tiersRaw, "lock"),
    contender: num(file, tiersRaw, "contender"),
    darkhorse: num(file, tiersRaw, "darkhorse"),
  };
  return { title, url, themes: themes as Record<string, string>, tiers };
}

async function loadSources(root: string): Promise<Source[]> {
  const file = join(root, "sources.yaml");
  let raw: unknown;
  try {
    raw = parseYaml(await readFile(file, "utf8"));
  } catch (e) {
    throw new LoadError(file, "yaml", String(e));
  }
  if (!Array.isArray(raw)) throw new LoadError(file, "root", "must be a list");
  const seen = new Set<string>();
  return raw.map((entry, i) => {
    const e = entry as Record<string, unknown>;
    const where = `${file}[${i}]`;
    const id = str(where, e, "id");
    if (seen.has(id)) throw new LoadError(where, "id", `duplicate ${id}`);
    seen.add(id);
    const kind = str(where, e, "kind") as Kind;
    if (!KINDS.includes(kind))
      throw new LoadError(where, "kind", `must be one of ${KINDS.join(", ")}`);
    return {
      id,
      name: str(where, e, "name"),
      url: typeof e.url === "string" ? e.url : "",
      kind,
      weight: num(where, e, "weight"),
      blurb: typeof e.blurb === "string" ? e.blurb : "",
    };
  });
}

async function loadCandidates(root: string, config: SiteConfig): Promise<Candidate[]> {
  const dir = join(root, "candidates");
  const out: Candidate[] = [];
  for (const name of await mdFiles(dir)) {
    const file = join(dir, name);
    const { front, body } = splitFrontmatter(file, await readFile(file, "utf8"));
    const id = str(file, front, "id");
    if (id !== basename(name, ".md"))
      throw new LoadError(file, "id", `must equal filename stem ${basename(name, ".md")}`);
    const theme = str(file, front, "theme");
    if (!(theme in config.themes))
      throw new LoadError(file, "theme", `unknown theme ${theme}`);
    out.push({
      id,
      name: str(file, front, "name"),
      affiliation: str(file, front, "affiliation"),
      theme,
      bodyHtml: render(body),
    });
  }
  return out;
}

function parseObservation(
  file: string,
  i: number,
  raw: unknown,
  sources: Map<string, Source>,
  candidates: Set<string>,
): Observation {
  const where = `${file} observations[${i}]`;
  const o = raw as Record<string, unknown>;
  const source = str(where, o, "source");
  if (!sources.has(source)) throw new LoadError(where, "source", `unknown source ${source}`);
  const candidate = str(where, o, "candidate");
  if (!candidates.has(candidate))
    throw new LoadError(where, "candidate", `unknown candidate ${candidate}`);
  const kind = str(where, o, "kind") as Kind;
  if (!KINDS.includes(kind))
    throw new LoadError(where, "kind", `must be one of ${KINDS.join(", ")}`);
  const value = num(where, o, "value");
  const obs: Observation = { source, candidate, kind, value };
  if (kind === "rank") {
    if (typeof o.of !== "number") throw new LoadError(where, "of", "required for rank");
    obs.of = o.of;
  }
  if ((kind === "share" || kind === "prob") && (value < 0 || value > 1))
    throw new LoadError(where, "value", "must be between 0 and 1");
  if (typeof o.note === "string" && o.note.trim()) obs.note = o.note.trim();
  return obs;
}

async function loadUpdates(
  root: string,
  sources: Source[],
  candidates: Candidate[],
): Promise<Update[]> {
  const dir = join(root, "updates");
  const srcMap = new Map(sources.map((s) => [s.id, s]));
  const candSet = new Set(candidates.map((c) => c.id));
  const out: Update[] = [];
  const seen = new Set<string>();
  for (const name of await mdFiles(dir)) {
    const file = join(dir, name);
    const { front, body } = splitFrontmatter(file, await readFile(file, "utf8"));
    const date = str(file, front, "date");
    if (!DATE.test(date)) throw new LoadError(file, "date", "must be YYYY-MM-DD");
    const slug = basename(name, ".md");
    const key = `${date}/${slug}`;
    if (seen.has(key)) throw new LoadError(file, "slug", `duplicate update ${key}`);
    seen.add(key);
    const rawObs = front.observations ?? [];
    if (!Array.isArray(rawObs)) throw new LoadError(file, "observations", "must be a list");
    const observations = rawObs.map((o, i) => parseObservation(file, i, o, srcMap, candSet));
    out.push({
      slug,
      title: str(file, front, "title"),
      date,
      summary: str(file, front, "summary"),
      observations,
      bodyHtml: render(body),
    });
  }
  out.sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
  return out;
}

export async function loadSite(root: string): Promise<Site> {
  const config = await loadConfig(root);
  const sources = await loadSources(root);
  const candidates = await loadCandidates(root, config);
  const updates = await loadUpdates(root, sources, candidates);
  return { config, sources, candidates, updates };
}
