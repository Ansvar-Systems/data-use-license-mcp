import { describe, it, expect } from "vitest";
import { getEntity } from "../../src/tools/get-entity.js";

describe("get_entity contract", () => {
  it("returns full record for a known id", async () => {
    const out = await getEntity({ entity_id: "mit" });
    expect(out.entity).toBeDefined();
    expect(out.entity?.id).toBe("mit");
    expect(out.entity?.entity_type).toBe("license");
  });

  it("returns _citation + _meta", async () => {
    const out = await getEntity({ entity_id: "mit" });
    expect(out._citation).toBeDefined();
    expect(out._meta).toBeDefined();
  });

  it("accepts human-readable input via alias resolver", async () => {
    const out = await getEntity({ entity_id: "Apache 2.0" });
    expect(out.entity?.id).toBe("apache-2.0");
  });

  it("returns null entity + null citation for unknown id (no silent empty)", async () => {
    const out = await getEntity({ entity_id: "zzz-unknown-xyz" });
    expect(out.entity).toBeNull();
    expect(out._citation).toBeNull();
    expect(out._meta).toBeDefined();
  });

  it("type_specific carries the 11 policy-catalog fields", async () => {
    const out = await getEntity({ entity_id: "cc-by-sa-4.0" });
    const ts = out.entity?.type_specific as Record<string, unknown>;
    for (const key of [
      "commercial_allowed",
      "attribution_required",
      "derivatives_allowed",
      "share_alike",
      "non_commercial",
      "safe_for_public_ghcr",
      "safe_for_commercial_serving",
      "applies_to_database_right_separately",
    ]) {
      expect(ts[key], `missing ${key} in type_specific for cc-by-sa-4.0`).toBeDefined();
    }
    expect(ts.share_alike).toBe(true);
    expect(ts.safe_for_public_ghcr).toBe(false);
    expect(ts.safe_for_commercial_serving).toBe(true);
  });
});
