// src/meta/meta-builder.ts
import type { Entity, Meta } from "../types.js";

const DISCLAIMER =
  "License metadata is informational, not legal advice. Verify against canonical text before acting.";

export function buildMeta(entity: Entity): Meta {
  const dataAge = entity.last_fetched_at ?? new Date(0).toISOString();
  const ageMs = Date.now() - Date.parse(dataAge);
  const cadenceMs = entity.refresh_cadence_days * 24 * 60 * 60 * 1000;
  const corpus_freshness: "fresh" | "stale" = ageMs > cadenceMs ? "stale" : "fresh";
  return {
    disclaimer: DISCLAIMER,
    data_age: dataAge,
    source_url: entity.official_text_url,
    jurisdiction: entity.jurisdiction,
    corpus_freshness,
  };
}
