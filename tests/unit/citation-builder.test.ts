import { describe, it, expect } from "vitest";
import { buildCitation } from "../../src/resolvers/citation-builder.js";
import type { Entity } from "../../src/types.js";

describe("buildCitation", () => {
  const mit: Entity = {
    id: "mit",
    entity_type: "license",
    name: "MIT License",
    short_name: "MIT",
    aliases: [],
    spdx_id: "MIT",
    version: null,
    predecessor_id: null,
    successor_id: null,
    jurisdiction: "INTERNATIONAL",
    governing_law: null,
    authority: "Open Source Initiative",
    effective_date: null,
    withdrawn_date: null,
    official_text_url: "https://opensource.org/licenses/MIT",
    official_text_hash: null,
    last_fetched_at: null,
    refresh_cadence_days: 90,
    tier: "premium",
    description: "MIT License",
    tags: [],
    quality_tier: "green",
    type_specific: {},
  };

  it("includes required Source Attribution fields with catalog license", () => {
    const c = buildCitation(mit);
    expect(c.source_url).toBe("https://opensource.org/licenses/MIT");
    expect(c.publisher).toBe("opensource.org");
    // Catalog row is Apache-2.0 — the source_url is a verification pointer to
    // the upstream authority, not a re-licensing claim about the catalog.
    expect(c.license).toBe("Apache-2.0");
    expect(c.canonical_ref).toBe("mit");
  });

  it("lookup points at get_entity with entity_id arg", () => {
    const c = buildCitation(mit);
    expect(c.lookup.tool).toBe("get_entity");
    expect(c.lookup.args).toEqual({ entity_id: "mit" });
  });

  it("falls back to publisher Ansvar when no source URL", () => {
    const e = { ...mit, official_text_url: null };
    const c = buildCitation(e);
    expect(c.publisher).toBe("Ansvar");
    expect(c.source_url).toBeNull();
  });

  it("vendor_template entries get Custom-Vendor license sentinel", () => {
    const westlaw: Entity = {
      ...mit,
      id: "westlaw-tos",
      entity_type: "vendor_template",
      name: "Westlaw Terms of Service",
      short_name: "Westlaw-TOS",
      official_text_url: "https://legal.thomsonreuters.com/en/products/westlaw/terms",
    };
    const c = buildCitation(westlaw);
    expect(c.license).toBe("Custom-Vendor");
  });

  it("never emits License-Unverified", () => {
    const unknownDomain: Entity = {
      ...mit,
      official_text_url: "https://example.invalid/license-text",
    };
    const c = buildCitation(unknownDomain);
    expect(c.license).not.toBe("License-Unverified");
    expect(c.license).toBe("Apache-2.0");
  });
});
