import { describe, it, expect } from "vitest";
import { searchEntities } from "../../src/tools/search-entities.js";

describe("search_entities contract", () => {
  it("returns results array on simple query", async () => {
    const out = await searchEntities({ query: "MIT" });
    expect(out.results).toBeInstanceOf(Array);
    expect(out.results.length).toBeGreaterThan(0);
  });

  it("each result has _citation with required fields", async () => {
    const out = await searchEntities({ query: "MIT" });
    for (const item of out.results) {
      expect(item._citation).toBeDefined();
      expect(item._citation.source_url !== undefined).toBe(true);
      expect(item._citation.publisher).toBeTruthy();
      expect(item._citation.license).toBeTruthy();
    }
  });

  it("response has _meta with required fields", async () => {
    const out = await searchEntities({ query: "MIT" });
    expect(out._meta.disclaimer).toBeTruthy();
    expect(out._meta.data_age).toBeTruthy();
    expect(out._meta.jurisdiction).toBeTruthy();
  });

  it("accepts human-readable input via alias resolver", async () => {
    const out = await searchEntities({ query: "Apache 2.0" });
    const ids = out.results.map((r) => r.id);
    expect(ids).toContain("apache-2.0");
  });

  it("filters by entity_type when provided", async () => {
    const out = await searchEntities({ query: "license", entity_type: "vendor_template" });
    for (const r of out.results) {
      expect(r.entity_type).toBe("vendor_template");
    }
  });

  it("returns empty results gracefully (does not throw)", async () => {
    const out = await searchEntities({ query: "zzz_no_such_license_xyz" });
    expect(out.results).toEqual([]);
    expect(out._meta).toBeDefined();
  });
});
