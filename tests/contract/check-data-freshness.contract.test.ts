import { describe, it, expect } from "vitest";
import { checkDataFreshness } from "../../src/tools/check-data-freshness.js";

describe("check_data_freshness contract", () => {
  it("returns a status from the canonical enum", async () => {
    const out = await checkDataFreshness({});
    expect(["current", "due", "overdue"]).toContain(out.status);
  });

  it("returns current status when DB is freshly built", async () => {
    const out = await checkDataFreshness({});
    expect(out.age_days).toBeGreaterThanOrEqual(0);
    if (out.age_days < out.refresh_cadence_days * 0.8) {
      expect(out.status).toBe("current");
    }
  });

  it("returns refresh_cadence_days at the documented default (90)", async () => {
    const out = await checkDataFreshness({});
    expect(out.refresh_cadence_days).toBe(90);
  });

  it("returns the build timestamp from db_metadata", async () => {
    const out = await checkDataFreshness({});
    expect(out.database_built).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("entity_count is non-zero", async () => {
    const out = await checkDataFreshness({});
    expect(out.entity_count).toBeGreaterThanOrEqual(61);
  });

  it("update_command names the canonical refresh path", async () => {
    const out = await checkDataFreshness({});
    expect(out.update_command).toMatch(/data-use-license-mcp/);
    expect(out.update_command).toMatch(/mirror|catalog/i);
  });
});
