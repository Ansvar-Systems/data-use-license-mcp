import { describe, it, expect } from "vitest";
import { allowToolForTier } from "../../src/tier/tier-gate.js";

describe("tier gate", () => {
  it("premium tier sees premium tools", () => {
    expect(allowToolForTier("search_entities", "premium")).toBe(true);
    expect(allowToolForTier("get_entity", "premium")).toBe(true);
    expect(allowToolForTier("check_compatibility", "premium")).toBe(true);
  });

  it("premium tier does NOT see team tools", () => {
    expect(allowToolForTier("get_obligations", "premium")).toBe(false);
    expect(allowToolForTier("search_vendor_templates", "premium")).toBe(false);
  });

  it("team tier sees premium + team tools", () => {
    expect(allowToolForTier("search_entities", "team")).toBe(true);
    expect(allowToolForTier("get_obligations", "team")).toBe(true);
    expect(allowToolForTier("search_vendor_templates", "team")).toBe(true);
  });

  it("company tier sees all tools", () => {
    expect(allowToolForTier("search_entities", "company")).toBe(true);
    expect(allowToolForTier("get_obligations", "company")).toBe(true);
    expect(allowToolForTier("search_vendor_templates", "company")).toBe(true);
  });

  it("unknown tool returns false", () => {
    expect(allowToolForTier("unknown_tool", "company")).toBe(false);
  });
});
