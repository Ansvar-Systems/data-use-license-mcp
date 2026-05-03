import { describe, it, expect } from "vitest";
import { getObligations } from "../../src/tools/get-obligations.js";

describe("get_obligations contract", () => {
  it("returns obligations array (may include attribution_required)", async () => {
    const out = await getObligations({ entity_id: "apache-2.0" });
    expect(out.obligations).toBeInstanceOf(Array);
  });

  it("includes _citation + _meta", async () => {
    const out = await getObligations({ entity_id: "apache-2.0" });
    expect(out._citation).toBeDefined();
    expect(out._meta).toBeDefined();
  });

  it("returns empty obligations + null citation for unknown id", async () => {
    const out = await getObligations({ entity_id: "zzz-unknown" });
    expect(out.obligations).toEqual([]);
    expect(out._citation).toBeNull();
  });
});
