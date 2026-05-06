import { describe, it, expect } from "vitest";
import { about } from "../../src/tools/about.js";

describe("about contract", () => {
  it("returns canonical server identity", async () => {
    const out = await about({});
    expect(out.name).toBe("data-use-license");
    expect(out.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(out.category).toBe("compliance");
  });

  it("reports total_items matching the seeded catalog", async () => {
    const out = await about({});
    expect(out.stats.total_items).toBeGreaterThanOrEqual(61);
  });

  it("reports per-entity_type counts that sum to total_items", async () => {
    const out = await about({});
    const sum = Object.values(out.stats.by_type).reduce((a, b) => a + b, 0);
    expect(sum).toBe(out.stats.total_items);
  });

  it("includes schema_version", async () => {
    const out = await about({});
    expect(out.stats.schema_version).toMatch(/^\d+\.\d+/);
  });

  it("includes database_built timestamp in ISO-8601", async () => {
    const out = await about({});
    expect(out.freshness.database_built).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("links to ansvar.ai/mcp directory", async () => {
    const out = await about({});
    expect(out.network.directory).toBe("https://ansvar.ai/mcp");
  });

  it("disclaimer is non-empty", async () => {
    const out = await about({});
    expect(out.disclaimer.length).toBeGreaterThan(0);
  });
});
