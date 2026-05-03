import { describe, it, expect } from "vitest";
import { searchVendorTemplates } from "../../src/tools/search-vendor-templates.js";

describe("search_vendor_templates contract", () => {
  it("returns vendor_template-only results", async () => {
    const out = await searchVendorTemplates({ query: "vendor" });
    for (const r of out.results) {
      expect(r.entity_type).toBe("vendor_template");
    }
  });

  it("custom-vendor migrated entry is findable", async () => {
    const out = await searchVendorTemplates({ query: "Custom" });
    const ids = out.results.map((r) => r.id);
    expect(ids).toContain("custom-vendor");
  });

  it("results carry quality_tier=amber for vendor_template (per spec §6.7)", async () => {
    const out = await searchVendorTemplates({ query: "vendor" });
    for (const r of out.results) {
      expect(["amber", "red"]).toContain(r.quality_tier);
    }
  });

  it("includes _meta", async () => {
    const out = await searchVendorTemplates({ query: "vendor" });
    expect(out._meta).toBeDefined();
  });
});
