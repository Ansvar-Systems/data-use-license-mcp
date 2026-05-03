// src/tools/search-vendor-templates.ts
import { z } from "zod";
import { searchEntities, type SearchResult } from "./search-entities.js";
import type { Meta, QualityTier } from "../types.js";
import { getEntityById } from "../db.js";

export const searchVendorTemplatesInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type SearchVendorTemplatesInput = z.infer<typeof searchVendorTemplatesInputSchema>;

export interface VendorResult extends SearchResult {
  quality_tier: QualityTier;
  last_reviewed_at: string | null;
}

export interface SearchVendorTemplatesOutput {
  results: VendorResult[];
  _meta: Meta;
}

export async function searchVendorTemplates(input: SearchVendorTemplatesInput): Promise<SearchVendorTemplatesOutput> {
  const parsed = searchVendorTemplatesInputSchema.parse(input);
  const inner = await searchEntities({
    query: parsed.query,
    entity_type: "vendor_template",
    limit: parsed.limit,
  });

  const results: VendorResult[] = inner.results.map((r) => {
    const entity = getEntityById(r.id);
    return {
      ...r,
      quality_tier: entity?.quality_tier ?? "amber",
      last_reviewed_at: entity?.last_fetched_at ?? null,
    };
  });

  return { results, _meta: inner._meta };
}
