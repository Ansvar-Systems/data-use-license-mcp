// src/tier/tier-gate.ts
import type { Tier } from "../types.js";

export const TOOL_TIERS: Record<string, Tier> = {
  search_entities: "premium",
  get_entity: "premium",
  check_compatibility: "premium",
  get_obligations: "team",
  search_vendor_templates: "team",
};

const TIER_RANK: Record<Tier, number> = { premium: 0, team: 1, company: 2 };

export function allowToolForTier(tool: string, tier: Tier): boolean {
  const required = TOOL_TIERS[tool];
  if (!required) return false;
  return TIER_RANK[tier] >= TIER_RANK[required];
}
