import { describe, expect, it } from "vitest";
import { titleGuess } from "./titleGuess";

describe("title guessing demo odds", () => {
  it("spells WORDPLAY with the most likely candidate in each slot", () => {
    expect(titleGuess).toHaveLength(8);
    expect(titleGuess.map(({ candidates }) => candidates[0][0]).join("")).toBe("WORDPLAY");
    expect(titleGuess.every(({ letter, candidates }) => candidates[0][0] === letter)).toBe(true);
  });

  it("keeps three candidates in descending order with no more than 100% total odds", () => {
    for (const { candidates } of titleGuess) {
      expect(candidates).toHaveLength(3);
      const percentages = candidates.map(([, percent]) => percent);
      expect(percentages.reduce((total, percent) => total + percent, 0)).toBeLessThanOrEqual(100);
      expect(percentages[0]).toBeGreaterThanOrEqual(percentages[1]);
      expect(percentages[1]).toBeGreaterThanOrEqual(percentages[2]);
    }
  });
});
