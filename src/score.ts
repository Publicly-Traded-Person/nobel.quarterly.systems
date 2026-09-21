// Pure scoring. No I/O. See docs: spec §Scoring.
import type {
  Observation,
  Site,
  Standing,
  Snapshot,
  Timeline,
  Tier,
} from "./types";

/** Normalize one observation to a 0..100 heat. */
export function heat(o: Observation): number {
  switch (o.kind) {
    case "named":
      return o.value ? 100 : 0;
    case "rank": {
      if (!o.of || o.value <= 0) return 0;
      return (100 * (o.of - o.value + 1)) / o.of;
    }
    case "share":
    case "prob":
      return Math.max(0, Math.min(1, o.value)) * 100;
  }
}

function tierFor(
  composite: number,
  bands: Site["config"]["tiers"],
): Tier {
  if (composite >= bands.lock) return "Lock";
  if (composite >= bands.contender) return "Contender";
  if (composite >= bands.darkhorse) return "Darkhorse";
  return "Field";
}

const DESK = "kmikeym";

/**
 * One snapshot per update, in Site.updates order. Each snapshot scores every
 * candidate using the newest observation per (source, candidate) seen so far,
 * over the total weight of sources that have published anything so far.
 */
export function computeTimeline(site: Site): Timeline {
  const weights = new Map(site.sources.map((s) => [s.id, s.weight]));
  // latest[source][candidate] = observation
  const latest = new Map<string, Map<string, Observation>>();
  const active = new Set<string>();
  let previousRank = new Map<string, number>();
  const out: Timeline = [];

  for (const u of site.updates) {
    for (const o of u.observations) {
      active.add(o.source);
      let bySource = latest.get(o.source);
      if (!bySource) {
        bySource = new Map();
        latest.set(o.source, bySource);
      }
      bySource.set(o.candidate, o);
    }

    let denominator = 0;
    for (const id of active) denominator += weights.get(id) ?? 0;

    const rows: Omit<Standing, "rank" | "movement">[] = site.candidates.map(
      (c) => {
        let numerator = 0;
        let naming = 0;
        let desk = false;
        for (const src of active) {
          const o = latest.get(src)?.get(c.id);
          if (!o) continue;
          const h = heat(o);
          if (h > 0) {
            naming += 1;
            if (src === DESK) desk = true;
          }
          numerator += (weights.get(src) ?? 0) * h;
        }
        const composite =
          denominator > 0 ? Math.round((numerator / denominator) * 10) / 10 : 0;
        const tier = tierFor(composite, site.config.tiers);
        return {
          id: c.id,
          composite,
          tier,
          sleeper: desk && composite < site.config.tiers.contender,
          sourcesNaming: naming,
        };
      },
    );

    const nameOf = new Map(site.candidates.map((c) => [c.id, c.name]));
    rows.sort(
      (a, b) =>
        b.composite - a.composite ||
        (nameOf.get(a.id) ?? "").localeCompare(nameOf.get(b.id) ?? ""),
    );

    const standings: Standing[] = rows.map((r, i) => {
      const rank = i + 1;
      const prev = previousRank.get(r.id);
      const movement: number | "new" = prev === undefined ? "new" : prev - rank;
      return { ...r, rank, movement };
    });

    previousRank = new Map(standings.map((s) => [s.id, s.rank]));
    out.push({ date: u.date, slug: u.slug, title: u.title, standings });
  }
  return out;
}
