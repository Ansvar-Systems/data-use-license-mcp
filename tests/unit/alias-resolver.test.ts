import { describe, it, expect } from "vitest";
import { resolveToCanonicalId } from "../../src/resolvers/alias-resolver.js";

describe("resolveToCanonicalId", () => {
  it("returns canonical id when input is already canonical", () => {
    expect(resolveToCanonicalId("mit")).toBe("mit");
    expect(resolveToCanonicalId("nlod-2.0")).toBe("nlod-2.0");
  });

  it("resolves common SPDX ids in mixed case", () => {
    expect(resolveToCanonicalId("MIT")).toBe("mit");
    expect(resolveToCanonicalId("Apache-2.0")).toBe("apache-2.0");
    expect(resolveToCanonicalId("CC-BY-4.0")).toBe("cc-by-4.0");
  });

  it("resolves common human-readable aliases", () => {
    expect(resolveToCanonicalId("MIT License")).toBe("mit");
    expect(resolveToCanonicalId("Apache 2")).toBe("apache-2.0");
    expect(resolveToCanonicalId("Apache 2.0")).toBe("apache-2.0");
    expect(resolveToCanonicalId("Creative Commons Attribution 4.0")).toBe("cc-by-4.0");
  });

  it("returns input lowercased when no alias match", () => {
    expect(resolveToCanonicalId("zzz-unknown-license")).toBe("zzz-unknown-license");
  });
});
