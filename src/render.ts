// HTML from computed state. No I/O.
import type {
  Candidate,
  Observation,
  Site,
  Snapshot,
  Standing,
  Timeline,
  Update,
} from "./types";
import { heat } from "./score";

export function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}

function nav(active: string): string {
  const items: [string, string][] = [
    ["/", "Rankings"],
    ["/replay/", "Replay"],
    ["/score/", "How the score works"],
    ["/sources/", "Sources"],
  ];
  return `<nav class="nav">${items
    .map(
      ([href, label]) =>
        `<a href="${href}"${href === active ? ' aria-current="page"' : ""}>${label}</a>`,
    )
    .join("")}</nav>`;
}

export function layout(
  site: Site,
  opts: { title: string; active: string; body: string; head?: string; description?: string },
): string {
  const full = opts.title === site.config.title ? site.config.title : `${opts.title} · ${site.config.title}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(opts.description ?? "KmikeyM covers the Economics Nobel like a sports desk.")}">
<link rel="alternate" type="application/rss+xml" title="${esc(site.config.title)} updates" href="/feed.xml">
<link rel="stylesheet" href="/style.css">
${opts.head ?? ""}
</head>
<body>
<header class="masthead">
<a class="brand" href="/"><span class="brand-k">KmikeyM</span> covers the <span class="brand-n">Econ Nobel</span></a>
${nav(opts.active)}
</header>
<main class="page">
${opts.body}
</main>
<footer class="foot">
<p>A <a href="https://kmikeym.com">KmikeyM</a> production. Predictions only, no wagers taken. <a href="/feed.xml">RSS</a>.</p>
</footer>
</body>
</html>
`;
}

function movementHtml(m: Standing["movement"]): string {
  if (m === "new") return `<span class="mv mv-new">new</span>`;
  if (m > 0) return `<span class="mv mv-up">▲${m}</span>`;
  if (m < 0) return `<span class="mv mv-down">▼${-m}</span>`;
  return `<span class="mv mv-flat">–</span>`;
}

const TIER_ORDER = ["Lock", "Contender", "Darkhorse", "Field"] as const;

const TIER_BLURB: Record<(typeof TIER_ORDER)[number], string> = {
  Lock: "Highly cited, long overdue, every signal agrees.",
  Contender: "Strong work, right age, right timing.",
  Darkhorse: "Respected, lower probability, could surprise.",
  Field: "On our radar. No live source has them yet.",
};

export function rankingsTable(site: Site, snap: Snapshot, opts: { links?: boolean } = {}): string {
  const links = opts.links ?? true;
  const cand = new Map(site.candidates.map((c) => [c.id, c]));
  const groups = new Map<string, Standing[]>();
  for (const s of snap.standings) {
    const g = groups.get(s.tier) ?? [];
    g.push(s);
    groups.set(s.tier, g);
  }
  let out = `<div class="rankings" data-date="${esc(snap.date)}">`;
  for (const tier of TIER_ORDER) {
    const rows = groups.get(tier);
    if (!rows || rows.length === 0) continue;
    out += `<section class="tier tier-${tier.toLowerCase()}">
<h3 class="tier-name">${tier}s <small>${esc(TIER_BLURB[tier])}</small></h3>
<table class="standings">
<thead><tr><th class="c-rank">#</th><th class="c-mv"></th><th class="c-name">Candidate</th><th class="c-theme">Field</th><th class="c-src">Sources</th><th class="c-score">Score</th></tr></thead>
<tbody>`;
    for (const s of rows) {
      const c = cand.get(s.id);
      if (!c) continue;
      const name = links
        ? `<a href="/candidates/${esc(c.id)}/">${esc(c.name)}</a>`
        : esc(c.name);
      out += `<tr data-id="${esc(s.id)}">
<td class="c-rank">${s.rank}</td>
<td class="c-mv">${movementHtml(s.movement)}</td>
<td class="c-name">${name}${s.sleeper ? ' <span class="badge badge-sleeper" title="A KmikeyM desk call the market has not caught up to">Sleeper</span>' : ""}<div class="aff">${esc(c.affiliation)}</div></td>
<td class="c-theme">${esc(site.config.themes[c.theme] ?? c.theme)}</td>
<td class="c-src">${s.sourcesNaming}</td>
<td class="c-score"><span class="score">${s.composite.toFixed(1)}</span><span class="bar" style="--w:${Math.max(0, Math.min(100, s.composite))}%"></span></td>
</tr>`;
    }
    out += `</tbody></table></section>`;
  }
  out += `</div>`;
  return out;
}

function observationSentence(site: Site, o: Observation): string {
  const src = site.sources.find((s) => s.id === o.source);
  const cand = site.candidates.find((c) => c.id === o.candidate);
  const sName = esc(src?.name ?? o.source);
  const cName = `<a href="/candidates/${esc(o.candidate)}/">${esc(cand?.name ?? o.candidate)}</a>`;
  let verb: string;
  switch (o.kind) {
    case "named":
      verb = o.value ? `named ${cName}` : `dropped ${cName}`;
      break;
    case "rank":
      verb = `ranked ${cName} #${o.value} of ${o.of ?? "?"}`;
      break;
    case "share":
      verb = `gave ${cName} ${(o.value * 100).toFixed(0)}% of its votes`;
      break;
    case "prob":
      verb = `priced ${cName} at ${(o.value * 100).toFixed(0)}%`;
      break;
  }
  const note = o.note ? `: <em>${esc(o.note)}</em>` : "";
  return `<strong>${sName}</strong> ${verb}${note} <span class="heat">(heat ${heat(o).toFixed(0)})</span>`;
}

function updateCard(u: Update): string {
  return `<article class="update-card">
<time datetime="${esc(u.date)}">${prettyDate(u.date)}</time>
<h3><a href="/updates/${esc(u.slug)}/">${esc(u.title)}</a></h3>
<p>${esc(u.summary)}</p>
<a class="more" href="/updates/${esc(u.slug)}/">Read more</a>
</article>`;
}

export function renderHome(site: Site, timeline: Timeline): string {
  const latest = timeline[timeline.length - 1];
  const leader = latest ? site.candidates.find((c) => c.id === latest.standings[0]?.id) : undefined;
  const hero = latest
    ? `<section class="hero">
<h1>KmikeyM Power Rankings</h1>
<p class="lede">Who wins the ${latest.date.slice(0, 4)} Economics Nobel. One composite score over every prediction source we track, re-ranked with each update. <a href="/score/">How the score works</a>.</p>
<p class="asof">As of <a href="/updates/${esc(latest.slug)}/">${prettyDate(latest.date)}</a>${leader ? ` · Leader: <strong>${esc(leader.name)}</strong> at ${latest.standings[0]!.composite.toFixed(1)}` : ""}</p>
${rankingsTable(site, latest)}
</section>`
    : `<section class="hero"><h1>KmikeyM Power Rankings</h1><p>No updates yet.</p></section>`;
  const feed = `<section class="feed">
<h2>Updates</h2>
${[...site.updates].reverse().map(updateCard).join("\n")}
</section>`;
  return layout(site, { title: site.config.title, active: "/", body: hero + feed });
}

export function renderUpdate(site: Site, timeline: Timeline, u: Update): string {
  const idx = timeline.findIndex((s) => s.slug === u.slug);
  const snap = timeline[idx];
  const prev = idx > 0 ? timeline[idx - 1] : undefined;
  const obsList =
    u.observations.length === 0
      ? `<p class="muted">Commentary only. No new observations.</p>`
      : `<ul class="obs">${u.observations
          .map((o) => {
            const now = snap?.standings.find((s) => s.id === o.candidate);
            const before = prev?.standings.find((s) => s.id === o.candidate);
            let move = "";
            if (now) {
              move =
                before && before.rank !== now.rank
                  ? ` → #${now.rank} (was #${before.rank})`
                  : ` → #${now.rank}`;
            }
            return `<li>${observationSentence(site, o)}<span class="move">${esc(move)}</span></li>`;
          })
          .join("")}</ul>`;
  const body = `<article class="update">
<p class="crumb"><a href="/">Rankings</a> / Update</p>
<time datetime="${esc(u.date)}">${prettyDate(u.date)}</time>
<h1>${esc(u.title)}</h1>
<p class="lede">${esc(u.summary)}</p>
<div class="prose">${u.bodyHtml}</div>
<aside class="obs-box">
<h2>What came in with this update</h2>
${obsList}
</aside>
${snap ? `<section class="board-then"><h2>The board after this update</h2>${rankingsTable(site, snap)}</section>` : ""}
</article>`;
  return layout(site, { title: u.title, active: "", body, description: u.summary });
}

export function renderCandidate(site: Site, timeline: Timeline, c: Candidate): string {
  const latest = timeline[timeline.length - 1];
  const standing = latest?.standings.find((s) => s.id === c.id);
  const history: { date: string; slug: string; title: string; o: Observation }[] = [];
  for (const u of site.updates)
    for (const o of u.observations)
      if (o.candidate === c.id) history.push({ date: u.date, slug: u.slug, title: u.title, o });
  const spark = timeline
    .map((s) => s.standings.find((x) => x.id === c.id)?.composite ?? 0)
    .map((v) => v.toFixed(1))
    .join(", ");
  const body = `<article class="candidate">
<p class="crumb"><a href="/">Rankings</a> / Candidate</p>
<h1>${esc(c.name)}</h1>
<p class="lede">${esc(c.affiliation)} · ${esc(site.config.themes[c.theme] ?? c.theme)}</p>
${
  standing
    ? `<p class="standing-line">Currently <strong>#${standing.rank}</strong>, tier <strong>${standing.tier}</strong>, score <strong>${standing.composite.toFixed(1)}</strong>, named by ${standing.sourcesNaming} source${standing.sourcesNaming === 1 ? "" : "s"}.${standing.sleeper ? " KmikeyM desk sleeper." : ""}<span class="spark" title="Score after each update">Score history: ${esc(spark)}</span></p>`
    : ""
}
<div class="prose">${c.bodyHtml}</div>
<section class="history">
<h2>What the sources say</h2>
${
  history.length === 0
    ? `<p class="muted">No source has published on ${esc(c.name)} yet.</p>`
    : `<ol class="obs">${history
        .map(
          (h) =>
            `<li><time datetime="${esc(h.date)}">${prettyDate(h.date)}</time> ${observationSentence(site, h.o)} <a class="ctx" href="/updates/${esc(h.slug)}/">${esc(h.title)}</a></li>`,
        )
        .join("")}</ol>`
}
</section>
</article>`;
  return layout(site, { title: c.name, active: "", body, description: `${c.name}: the case for and against a Nobel, and what every source says.` });
}

export function renderScore(site: Site, timeline: Timeline): string {
  const latest = timeline[timeline.length - 1];
  const leader = latest ? site.candidates.find((c) => c.id === latest.standings[0]?.id) : undefined;
  let example = "";
  if (latest && leader) {
    // Reconstruct the leader's arithmetic from the latest observations.
    const active = new Set<string>();
    const latestObs = new Map<string, Observation>();
    for (const u of site.updates)
      for (const o of u.observations) {
        active.add(o.source);
        if (o.candidate === leader.id) latestObs.set(o.source, o);
      }
    let denom = 0;
    const rows: string[] = [];
    let numer = 0;
    for (const s of site.sources) {
      if (!active.has(s.id)) continue;
      denom += s.weight;
      const o = latestObs.get(s.id);
      const h = o ? heat(o) : 0;
      numer += s.weight * h;
      rows.push(
        `<tr><td>${esc(s.name)}</td><td>${s.weight}</td><td>${o ? h.toFixed(0) : "0 (not mentioned)"}</td><td>${(s.weight * h).toFixed(0)}</td></tr>`,
      );
    }
    example = `<h2>Worked example: ${esc(leader.name)}</h2>
<p>As of ${prettyDate(latest.date)}, these sources have published something (only they count):</p>
<table class="example"><thead><tr><th>Source</th><th>Weight</th><th>Heat for ${esc(leader.name)}</th><th>Weight × heat</th></tr></thead><tbody>${rows.join("")}</tbody></table>
<p>Total weight of active sources: <strong>${denom}</strong>. Sum of weight × heat: <strong>${numer.toFixed(0)}</strong>. Composite: ${numer.toFixed(0)} ÷ ${denom} = <strong>${(denom ? numer / denom : 0).toFixed(1)}</strong>.</p>`;
  }
  const body = `<article class="prose score-doc">
<h1>How the score works</h1>
<p>Every prediction source speaks a different language. Clarivate names people or it doesn't. Tyler Cowen publishes a ranked list. A pool gives vote shares. A betting market gives a probability. The KmikeyM Power Ranking turns each of those into one number, the <strong>composite</strong>, so the board can be sorted, argued about, and replayed.</p>
<h2>Step 1: each observation becomes a heat from 0 to 100</h2>
<table class="example"><thead><tr><th>Kind</th><th>What the source said</th><th>Heat</th></tr></thead><tbody>
<tr><td><code>named</code></td><td>The source lists this person</td><td>100</td></tr>
<tr><td><code>rank</code></td><td>Position <em>r</em> in a list of <em>n</em></td><td>100 × (n − r + 1) ÷ n. First of five is 100, fifth of five is 20.</td></tr>
<tr><td><code>share</code></td><td>A vote share from 0 to 1</td><td>share × 100</td></tr>
<tr><td><code>prob</code></td><td>A market or bookmaker probability from 0 to 1</td><td>probability × 100</td></tr>
</tbody></table>
<p>If a source publishes again about the same person, the newer observation replaces the older one. The old one stays in the record.</p>
<h2>Step 2: sources carry weights</h2>
<p>The weights are our editorial call. They are published here, from the same file the build reads, so what you see is what the score uses.</p>
<table class="example"><thead><tr><th>Source</th><th>Kind</th><th>Weight</th><th>Why</th></tr></thead><tbody>
${site.sources.map((s) => `<tr><td><a href="${esc(s.url)}">${esc(s.name)}</a></td><td><code>${s.kind}</code></td><td>${s.weight}</td><td>${esc(s.blurb)}</td></tr>`).join("")}
</tbody></table>
<h2>Step 3: the composite</h2>
<p>A candidate's composite is the sum of <em>weight × heat</em> across sources, divided by the total weight of every source that has published anything so far. A source that has not published yet is ignored entirely, so a Clarivate name in September sits high until the markets open. When a new source comes online, everyone it ignores drops and everyone it names rises. That reshuffle is the season, and the <a href="/replay/">replay</a> shows it.</p>
<h2>Tiers</h2>
<p><strong>Lock</strong> is ${site.config.tiers.lock} and up. <strong>Contender</strong> is ${site.config.tiers.contender} to ${site.config.tiers.lock - 1}. <strong>Darkhorse</strong> is ${site.config.tiers.darkhorse} to ${site.config.tiers.contender - 1}. <strong>Field</strong> is everyone else we track. A <strong>Sleeper</strong> badge marks a KmikeyM desk call that the composite has not caught up to yet.</p>
${example}
<h2>Arguing with it</h2>
<p>Every weight is a line in a public file and every change is a dated update, so if we change our minds the replay shows exactly when. If you think a source deserves more or less, that argument is the content. Write in.</p>
</article>`;
  return layout(site, { title: "How the score works", active: "/score/", body });
}

export function renderReplay(site: Site): string {
  const body = `<section class="replay">
<h1>Season replay</h1>
<p class="lede">Drag through every update and watch the board reshuffle.</p>
<div class="replay-controls">
<button type="button" id="replay-play" aria-label="Play">▶</button>
<input type="range" id="replay-range" min="0" max="0" value="0" step="1" aria-label="Update">
<div class="replay-label"><time id="replay-date"></time> <a id="replay-title" href="/"></a></div>
</div>
<div id="replay-board" aria-live="polite"><p class="muted">Loading timeline…</p></div>
</section>`;
  return layout(site, {
    title: "Season replay",
    active: "/replay/",
    body,
    head: `<script defer src="/replay.js"></script>`,
  });
}

export function renderSources(site: Site): string {
  const body = `<article class="prose">
<h1>Sources</h1>
<p>Every signal the ranking reads, with its weight. Weights are explained on <a href="/score/">how the score works</a>. Know a source we're missing? That is an update waiting to happen.</p>
<ul class="sources">
${site.sources
  .map(
    (s) =>
      `<li><h3><a href="${esc(s.url)}">${esc(s.name)}</a> <span class="badge">${s.kind}</span> <span class="badge badge-w">weight ${s.weight}</span></h3><p>${esc(s.blurb)}</p></li>`,
  )
  .join("\n")}
</ul>
</article>`;
  return layout(site, { title: "Sources", active: "/sources/", body });
}

export function renderFeed(site: Site): string {
  const base = site.config.url.replace(/\/$/, "");
  const items = [...site.updates]
    .reverse()
    .map(
      (u) => `<item>
<title>${esc(u.title)}</title>
<link>${base}/updates/${esc(u.slug)}/</link>
<guid isPermaLink="true">${base}/updates/${esc(u.slug)}/</guid>
<pubDate>${new Date(`${u.date}T16:00:00Z`).toUTCString()}</pubDate>
<description>${esc(u.summary)}</description>
</item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${esc(site.config.title)}</title>
<link>${base}/</link>
<description>KmikeyM covers the Economics Nobel like a sports desk.</description>
${items}
</channel>
</rss>
`;
}
