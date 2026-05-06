import { describe, it, expect } from "vitest";
import { searchEntities } from "../../src/tools/search-entities.js";
import { getEntity } from "../../src/tools/get-entity.js";

describe("citation shape — Gate 13 contract", () => {
  it("search_entities items match manifest source_url_pattern (where source_url is non-null)", async () => {
    const out = await searchEntities({ query: "MIT" });
    const pattern = /^https?:\/\/(creativecommons\.org|opendatacommons\.org|nationalarchives\.gov\.uk|data\.norge\.no|etalab\.gouv\.fr|govdata\.de|dati\.gov\.it|joinup\.ec\.europa\.eu|spdx\.org|opensource\.org|fsf\.org|web\.archive\.org)\/.*$/;
    for (const r of out.results) {
      if (r._citation.source_url) {
        expect(r._citation.source_url).toMatch(pattern);
      }
    }
  });

  it("search_entities items have license code matching manifest allowed_licenses", async () => {
    // Catalog rows are Apache-2.0; vendor_template rows are Custom-Vendor.
    // No other licenses appear — the source_url is a verification pointer,
    // not a re-licensing claim. Must match manifest.attribution.allowed_licenses.
    const allowed = new Set(["Apache-2.0", "Custom-Vendor"]);
    const out = await searchEntities({ query: "MIT" });
    for (const r of out.results) {
      expect(allowed.has(r._citation.license)).toBe(true);
    }
  });

  it("get_entity with null entity has _meta but no _citation", async () => {
    const out = await getEntity({ entity_id: "zzz-unknown" });
    expect(out.entity).toBeNull();
    expect(out._citation).toBeNull();
    expect(out._meta).toBeDefined();
  });
});
