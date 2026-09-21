import { readdir, readFile, writeFile } from "node:fs/promises";
import { parse } from "yaml";
const rows: { id: string; year: number; note: string; name: string }[] = [];
for (const f of (await readdir("candidates")).filter((n) => n.endsWith(".md")).sort()) {
  const t = await readFile(`candidates/${f}`, "utf8");
  const m = t.match(/^---\n([\s\S]*?)\n---/);
  const fm = parse(m![1]!) as Record<string, unknown>;
  if (typeof fm.clarivate_year !== "number") continue;
  rows.push({ id: fm.id as string, year: fm.clarivate_year, note: String(fm.clarivate_note ?? "").replace(/^"|"$/g, ""), name: fm.name as string });
}
rows.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
const obs = rows.map((r) => `  - source: clarivate-alumni\n    candidate: ${r.id}\n    kind: named\n    value: 1\n    note: "named in ${r.year}${r.note ? ": " + r.note.replace(/"/g, "'") : ""}"`).join("\n");
const byYear = new Map<number, string[]>();
for (const r of rows) byYear.set(r.year, [...(byYear.get(r.year) ?? []), `[${r.name}](/candidates/${r.id}/)`]);
const list = [...byYear.entries()].map(([y, names]) => `- **${y}:** ${names.join(", ")}`).join("\n");
const md = `---
title: "Preseason: the Clarivate alumni pool"
date: 2026-09-16
summary: Before this year's list drops, here is everyone Clarivate has named since 2002 who is still waiting. ${rows.length} economists. Most laureates were on this bench first.
observations:
${obs}
---
Clarivate has been naming Citation Laureates in economics since 2002, and the striking thing about the list is not who won but how long it took. Most Citation Laureates who go on to win do it years after being named. So before the 2026 list drops tomorrow, this is the bench: every living economist Clarivate has named who has not yet gotten the call from Stockholm.

They enter the board as a source of their own, "Clarivate alumni," at weight 1 against this year's list at weight 3. That is an editorial call and it is written down on the [score page](/score/). The effect is that the bench sits as a block of Darkhorses under whoever Clarivate names this week, and the markets, when they open in October, will sort them.

${list}

Deceased Citation Laureates are not listed, since the Nobel is not awarded posthumously. If someone here has died and we missed it, that is an update.
`;
await writeFile("updates/2026-09-16-the-clarivate-alumni-pool.md", md);
console.log(`pool: ${rows.length} observations, ${byYear.size} years`);
