import { describe, it, expect } from "vitest";
import { listSources } from "../../src/tools/list-sources.js";

describe("list_sources contract (expert_curated empty pattern)", () => {
  it("returns an empty sources array", async () => {
    const out = await listSources({});
    expect(Array.isArray(out.sources)).toBe(true);
    expect(out.sources).toHaveLength(0);
  });

  it("returns notes explaining why sources is empty", async () => {
    const out = await listSources({});
    expect(out.notes).toMatch(/expert-curated/i);
    expect(out.notes).toMatch(/per-entity|per entity/i);
  });

  it("returns _meta with disclaimer + data_age", async () => {
    const out = await listSources({});
    expect(out._meta.disclaimer).toBeTruthy();
    expect(out._meta.data_age).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(out._meta.jurisdiction).toBe("INTERNATIONAL");
  });

  it("ignores arbitrary input (passthrough schema)", async () => {
    const out = await listSources({ ignored: "value" } as never);
    expect(out.sources).toHaveLength(0);
  });
});
