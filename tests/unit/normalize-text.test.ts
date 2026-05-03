import { describe, it, expect } from "vitest";
import { normalizeForHashing } from "../../scripts/normalize-text.js";

describe("normalizeForHashing", () => {
  it("strips HTML tags safely (no greedy regex)", () => {
    expect(normalizeForHashing("<p>hello <b>world</b></p>")).toBe("hello world");
  });

  it("collapses whitespace", () => {
    expect(normalizeForHashing("hello   \n\n\tworld")).toBe("hello world");
  });

  it("NFC-normalizes unicode (composed vs decomposed)", () => {
    const composed = "café";        // single codepoint é
    const decomposed = "café";     // e + combining acute
    expect(normalizeForHashing(composed)).toBe(normalizeForHashing(decomposed));
  });
});
