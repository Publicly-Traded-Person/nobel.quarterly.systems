export type Kind = "named" | "rank" | "share" | "prob";

export type Source = {
  id: string;
  name: string;
  url: string;
  kind: Kind;
  weight: number;
  blurb: string;
};

export type Candidate = {
  id: string;
  name: string;
  affiliation: string;
  theme: string;
  bodyHtml: string;
};

export type Observation = {
  source: string;
  candidate: string;
  kind: Kind;
  value: number;
  of?: number;
  note?: string;
};

export type Update = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  observations: Observation[];
  bodyHtml: string;
};

export type SiteConfig = {
  title: string;
  url: string;
  themes: Record<string, string>;
  tiers: { lock: number; contender: number; darkhorse: number };
};

export type Site = {
  config: SiteConfig;
  sources: Source[];
  candidates: Candidate[];
  updates: Update[];
};

export type Tier = "Lock" | "Contender" | "Darkhorse" | "Field";

export type Standing = {
  id: string;
  composite: number;
  tier: Tier;
  sleeper: boolean;
  rank: number;
  movement: number | "new";
  sourcesNaming: number;
};

export type Snapshot = {
  date: string;
  slug: string;
  title: string;
  standings: Standing[];
};

export type Timeline = Snapshot[];
