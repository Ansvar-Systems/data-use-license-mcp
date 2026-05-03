import { describe, it, expect } from "vitest";
import { checkCompatibility } from "../../src/tools/check-compatibility.js";

describe("check_compatibility contract", () => {
  it("returns a verdict (likely 'unknown' in v1 — no edges seeded yet)", async () => {
    const out = await checkCompatibility({ left_id: "mit", right_id: "apache-2.0" });
    expect(["compatible", "incompatible", "conditionally_compatible", "unknown"]).toContain(out.verdict);
  });

  it("includes _citation_left, _citation_right, and _meta", async () => {
    const out = await checkCompatibility({ left_id: "mit", right_id: "apache-2.0" });
    expect(out._citation_left).toBeDefined();
    expect(out._citation_right).toBeDefined();
    expect(out._meta).toBeDefined();
  });

  it("returns 'unknown' verdict gracefully when one side is missing", async () => {
    const out = await checkCompatibility({ left_id: "mit", right_id: "zzz-missing" });
    expect(out.verdict).toBe("unknown");
  });
});
