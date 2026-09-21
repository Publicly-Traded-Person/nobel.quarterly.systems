# nobel.quarterly.systems

KmikeyM covers the Economics Nobel like a sports desk. The KmikeyM Power Rankings (a composite score over every prediction source we track), a feed of dated updates, and a replay of the season.

Design: `Agenting/docs/plans/2026-09-20-nobel-tracker-design.md` (agent-ops, private).

- `bun run build` writes the site to `dist/`.
- `bun run test` is the suite.

## Deploying

Cloudflare Pages, git-connected (created in the dashboard, never with `wrangler pages project create`). Production branch `main`, build command `bun install && bun run build`, output directory `dist`, environment variable `BUN_VERSION=1.3.0`. Every push to `main` deploys.
