// src/tools/search-entities.ts
import { z } from "zod";
import { searchEntitiesFts, getEntityById } from "../db.js";
import { resolveToCanonicalId } from "../resolvers/alias-resolver.js";
import { buildCitation } from "../resolvers/citation-builder.js";
import { buildMeta } from "../meta/meta-builder.js";
import type { Entity, Citation, Meta, EntityType } from "../types.js";

export const searchEntitiesInputSchema = z.object({
  query: z.string().min(1),
  entity_type: z.enum(["license", "terms", "legal_regime", "vendor_template"]).optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export type SearchEntitiesInput = z.infer<typeof searchEntitiesInputSchema>;

export interface SearchResult {
  id: string;
  entity_type: EntityType;
  name: string;
  short_name: string | null;
  jurisdiction: string;
  summary: string | null;
  _citation: Citation;
}

export interface SearchEntitiesOutput {
  results: SearchResult[];
  _meta: Meta;
}

const EMPTY_META_ENTITY: Entity = {
  id: "",
  entity_type: "license",
  name: "",
  short_name: null,
  aliases: [],
  spdx_id: null,
  version: null,
  predecessor_id: null,
  successor_id: null,
  jurisdiction: "INTERNATIONAL",
  governing_law: null,
  authority: null,
  effective_date: null,
  withdrawn_date: null,
  official_text_url: null,
  official_text_hash: null,
  last_fetched_at: new Date().toISOString(),
  refresh_cadence_days: 90,
  tier: "premium",
  description: null,
  tags: [],
  quality_tier: "green",
  type_specific: {},
};

export async function searchEntities(input: SearchEntitiesInput): Promise<SearchEntitiesOutput> {
  const parsed = searchEntitiesInputSchema.parse(input);

  const canonical = resolveToCanonicalId(parsed.query);
  const direct = getEntityById(canonical);
  let entities: Entity[] = direct ? [direct] : [];

  if (entities.length === 0) {
    entities = searchEntitiesFts(parsed.query, parsed.limit);
  }

  if (parsed.entity_type) {
    entities = entities.filter((e) => e.entity_type === parsed.entity_type);
  }
  if (parsed.jurisdiction) {
    entities = entities.filter((e) => e.jurisdiction === parsed.jurisdiction);
  }

  const results: SearchResult[] = entities.slice(0, parsed.limit).map((e) => ({
    id: e.id,
    entity_type: e.entity_type,
    name: e.name,
    short_name: e.short_name,
    jurisdiction: e.jurisdiction,
    summary: e.description,
    _citation: buildCitation(e),
  }));

  const firstForMeta: Entity = entities[0] ?? EMPTY_META_ENTITY;
  return { results, _meta: buildMeta(firstForMeta) };
}
