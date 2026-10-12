import { describe, expect, it } from "vitest";
import { detectorPassages, detectorScoreLabel } from "./detector";

describe("TruthMeter lesson passages", () => {
  it("contains exactly three passages with unique ids and scores from zero to one hundred", () => {
    expect(detectorPassages).toHaveLength(3);
    expect(new Set(detectorPassages.map(({ id }) => id)).size).toBe(3);
    for (const passage of detectorPassages) {
      expect(passage.score).toBeGreaterThanOrEqual(0);
      expect(passage.score).toBeLessThanOrEqual(100);
    }
  });

  it("uses the intended score range for each example", () => {
    const declaration = detectorPassages.find(({ id }) => id === "declaration")!;
    const scienceFair = detectorPassages.find(({ id }) => id === "science-fair")!;
    const photosynthesis = detectorPassages.find(({ id }) => id === "photosynthesis")!;
    expect(declaration.score).toBeGreaterThanOrEqual(80);
    expect(scienceFair.score).toBeLessThan(50);
    expect(photosynthesis.score).toBeGreaterThanOrEqual(80);
    expect(detectorScoreLabel(scienceFair.score)).toBe("LIKELY HUMAN");
    expect(detectorScoreLabel(declaration.score)).toBe("HIGH CONFIDENCE · LIKELY AI");
  });
});
