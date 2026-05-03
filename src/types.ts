// src/types.ts
export type EntityType = "license" | "terms" | "legal_regime" | "vendor_template";
export type Tier = "premium" | "team" | "company";
export type QualityTier = "green" | "amber" | "red";

export type EdgeType =
  | "compatible_with"
  | "incompatible_with"
  | "applies_alongside"
  | "subsumes"
  | "subsumed_by"
  | "interpreted_by"
  | "clarified_by"
  | "cross_corpus_anchor";

export interface Entity {
  id: string;
  entity_type: EntityType;
  name: string;
  short_name: string | null;
  aliases: string[];
  spdx_id: string | null;
  version: string | null;
  predecessor_id: string | null;
  successor_id: string | null;
  jurisdiction: string;
  governing_law: string | null;
  authority: string | null;
  effective_date: string | null;
  withdrawn_date: string | null;
  official_text_url: string | null;
  official_text_hash: string | null;
  last_fetched_at: string | null;
  refresh_cadence_days: number;
  tier: Tier;
  description: string | null;
  tags: string[];
  quality_tier: QualityTier;
  type_specific: Record<string, unknown>;
}

export interface Edge {
  id: number;
  edge_type: EdgeType;
  source_id: string;
  target_id: string;
  metadata: Record<string, unknown> | null;
}

export interface Citation {
  source_url: string | null;
  publisher: string;
  license: string;
  canonical_ref: string;
  display_text: string;
  lookup: { tool: string; args: Record<string, unknown> };
  attribution_text: string | null;
}

export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string | null;
  jurisdiction: string;
  corpus_freshness?: "fresh" | "stale";
  degraded_source_used?: boolean;
}
