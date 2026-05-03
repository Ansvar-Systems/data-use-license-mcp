import { describe, it, expect } from "vitest";
import { buildMeta } from "../../src/meta/meta-builder.js";
import type { Entity } from "../../src/types.js";

describe("buildMeta", () => {
  const base: Entity = {
    id: "nlod-2.0",
    entity_type: "terms",
    name: "Norsk lisens for offentlige data 2.0",
    short_name: "NLOD 2.0",
    aliases: [],
    spdx_id: null,
    version: "2.0",
    predecessor_id: "nlod-1.0",
    successor_id: null,
    jurisdiction: "NO",
    governing_law: null,
    authority: "Digitaliseringsdirektoratet",
    effective_date: null,
    withdrawn_date: null,
    official_text_url: "https://data.norge.no/nlod/no/2.0",
    official_text_hash: null,
    last_fetched_at: "2026-04-15T04:01:23Z",
    refresh_cadence_days: 30,
    tier: "premium",
    description: null,
    tags: [],
    quality_tier: "green",
    type_specific: {},
  };

  it("includes disclaimer + data_age + source_url + jurisdiction", () => {
    const m = buildMeta(base);
    expect(m.disclaimer).toMatch(/informational/i);
    expect(m.data_age).toBe("2026-04-15T04:01:23Z");
    expect(m.source_url).toBe("https://data.norge.no/nlod/no/2.0");
    expect(m.jurisdiction).toBe("NO");
  });

  it("derives corpus_freshness=stale when data_age > refresh_cadence_days", () => {
    const old = { ...base, last_fetched_at: "2024-01-01T00:00:00Z" };
    const m = buildMeta(old);
    expect(m.corpus_freshness).toBe("stale");
  });

  it("derives corpus_freshness=fresh when data_age recent", () => {
    const recent = { ...base, last_fetched_at: new Date().toISOString() };
    const m = buildMeta(recent);
    expect(m.corpus_freshness).toBe("fresh");
  });
});
