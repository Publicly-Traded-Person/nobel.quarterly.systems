# nobel.quarterly.systems

KmikeyM covers the Economics Nobel like a sports desk. The KmikeyM Power Rankings (a composite score over every prediction source we track), a feed of dated updates with prose, a scouting report per candidate, and a replay of the season.

Design: `Agenting/docs/plans/2026-09-20-nobel-tracker-design.md` (agent-ops, private).

## Layout

- `candidates/<id>.md`: one scouting report per economist. Frontmatter `id` (equals the filename), `name`, `affiliation`, `theme` (a key of `themes` in `site.config.json`). Extra keys are allowed and ignored by the build.
- `sources.yaml`: every signal source with its `kind` (`named`, `rank`, `share`, `prob`) and `weight`. The score page renders from this file.
- `updates/YYYY-MM-DD-slug.md`: one file per update. The frontmatter carries the observations; the body is the prose.
- `site.config.json`: title, URL, theme labels, tier bands.
- `src/`: the generator. `load` reads and validates, `score` is pure math, `render` makes HTML, `build` wires them.

## Posting an update

Create `updates/2026-10-01-markets-open.md`:

```markdown
---
title: The markets open, and they disagree with Clarivate
date: 2026-10-01
summary: Polymarket lists twelve names. Athey leads at 22 percent.
observations:
  - source: polymarket
    candidate: susan-athey
    kind: prob
    value: 0.22
    note: priced at 22 cents on the first day
  - source: marginal-revolution
    candidate: michael-woodford
    kind: rank
    value: 1
    of: 5
    note: Cowen's first pick
  - source: kmikeym
    candidate: sidney-winter
    kind: named
    value: 1
    note: the desk's sleeper
---
Prose goes here. Markdown. Link candidates as `/candidates/<id>/`.
```

Rules the build enforces: every `source` must exist in `sources.yaml`, every `candidate` must have a file in `candidates/`, `rank` needs `of`, `share` and `prob` are between 0 and 1, `date` is `YYYY-MM-DD`. A newer observation from the same source about the same candidate replaces the older one; publish `value: 0` to have a source drop someone. An update with no observations is fine, it is commentary.

Then `bun run build` to check it, commit, and push to `main`. That is the whole procedure.

## Adding a candidate

Create `candidates/<firstname-lastname>.md` with the frontmatter above and four short paragraphs: the work, the case for, the case against, the KmikeyM angle. They appear in the Field tier until a source names them.

## Adding a source

Add an entry to `sources.yaml` with an `id`, `name`, `url`, `kind`, `weight`, and `blurb`. Then post an update carrying its first observations. A source added mid-season affects scores from that update forward and leaves the earlier replay untouched.

## Development

- `bun install`
- `bun run build` writes `dist/`. `bun run build --root tests/fixtures/site-ok --out /tmp/x` builds a fixture.
- `bun run test` is the suite (`bunx tsc --noEmit && bun test`).
- `bunx serve dist` or any static server to preview.

## Deploying

Cloudflare Pages, git-connected (created in the dashboard, never with `wrangler pages project create`). Production branch `main`, build command `bun install && bun run build`, output directory `dist`, environment variable `BUN_VERSION=1.3.0`. Every push to `main` deploys. Custom domain `nobel.quarterly.systems` was added through the dashboard's Custom domains wizard.
