import { describe, expect, it } from "vitest";
import { fakePageClues, fakePageRevealThreshold, shouldRevealFakePage } from "./fakePage";

describe("fake page planted clues", () => {
  it("contains five clues with unique ids", () => {
    expect(fakePageClues).toHaveLength(5);
    expect(new Set(fakePageClues.map(({ id }) => id)).size).toBe(5);
  });

  it("reveals after at least three clues", () => {
    expect(fakePageRevealThreshold).toBeGreaterThanOrEqual(3);
    expect(shouldRevealFakePage(fakePageRevealThreshold - 1)).toBe(false);
    expect(shouldRevealFakePage(fakePageRevealThreshold)).toBe(true);
    expect(shouldRevealFakePage(fakePageRevealThreshold + 1)).toBe(true);
  });
});
