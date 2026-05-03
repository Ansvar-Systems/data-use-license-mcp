// src/tools/check-compatibility.ts
import { z } from "zod";
import { getEntityById, getEdgesFor } from "../db.js";
import { resolveToCanonicalId } from "../resolvers/alias-resolver.js";
import { buildCitation } from "../resolvers/citation-builder.js";
import { buildMeta } from "../meta/meta-builder.js";
import type { Citation, Entity, Meta } from "../types.js";

export const checkCompatibilityInputSchema = z.object({
  left_id: z.string().min(1),
  right_id: z.string().min(1),
});

export type CheckCompatibilityInput = z.infer<typeof checkCompatibilityInputSchema>;

export type Verdict = "compatible" | "incompatible" | "conditionally_compatible" | "unknown";

export interface CheckCompatibilityOutput {
  verdict: Verdict;
  obligations_triggered: unknown[];
  edge_metadata: Record<string, unknown> | null;
  _citation_left: Citation | null;
  _citation_right: Citation | null;
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

export async function checkCompatibility(input: CheckCompatibilityInput): Promise<CheckCompatibilityOutput> {
  const parsed = checkCompatibilityInputSchema.parse(input);
  const leftId = resolveToCanonicalId(parsed.left_id);
  const rightId = resolveToCanonicalId(parsed.right_id);
  const left = getEntityById(leftId);
  const right = getEntityById(rightId);

  if (!left || !right) {
    return {
      verdict: "unknown",
      obligations_triggered: [],
      edge_metadata: null,
      _citation_left: left ? buildCitation(left) : null,
      _citation_right: right ? buildCitation(right) : null,
      _meta: buildMeta(left ?? right ?? EMPTY_META_ENTITY),
    };
  }

  const edges = getEdgesFor(leftId);
  const compatEdge = edges.find(
    (e) => e.edge_type === "compatible_with" &&
           ((e.source_id === leftId && e.target_id === rightId) ||
            (e.source_id === rightId && e.target_id === leftId))
  );
  const incompatEdge = edges.find(
    (e) => e.edge_type === "incompatible_with" &&
           ((e.source_id === leftId && e.target_id === rightId) ||
            (e.source_id === rightId && e.target_id === leftId))
  );

  let verdict: Verdict = "unknown";
  let edge_metadata: Record<string, unknown> | null = null;
  if (compatEdge) {
    verdict = "compatible";
    edge_metadata = compatEdge.metadata;
  } else if (incompatEdge) {
    verdict = "incompatible";
    edge_metadata = incompatEdge.metadata;
  }

  return {
    verdict,
    obligations_triggered: [],
    edge_metadata,
    _citation_left: buildCitation(left),
    _citation_right: buildCitation(right),
    _meta: buildMeta(left),
  };
}
