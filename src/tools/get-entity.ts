// src/tools/get-entity.ts
import { z } from "zod";
import { getEntityById } from "../db.js";
import { resolveToCanonicalId } from "../resolvers/alias-resolver.js";
import { buildCitation } from "../resolvers/citation-builder.js";
import { buildMeta } from "../meta/meta-builder.js";
import type { Entity, Citation, Meta } from "../types.js";

export const getEntityInputSchema = z.object({
  entity_id: z.string().min(1),
});

export type GetEntityInput = z.infer<typeof getEntityInputSchema>;

export interface GetEntityOutput {
  entity: Entity | null;
  _citation: Citation | null;
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
  last_fetched_at: new Date(0).toISOString(),
  refresh_cadence_days: 90,
  tier: "premium",
  description: null,
  tags: [],
  quality_tier: "green",
  type_specific: {},
};

export async function getEntity(input: GetEntityInput): Promise<GetEntityOutput> {
  const parsed = getEntityInputSchema.parse(input);
  const canonical = resolveToCanonicalId(parsed.entity_id);
  const entity = getEntityById(canonical);

  if (!entity) {
    return {
      entity: null,
      _citation: null,
      _meta: buildMeta(EMPTY_META_ENTITY),
    };
  }

  return {
    entity,
    _citation: buildCitation(entity),
    _meta: buildMeta(entity),
  };
}
