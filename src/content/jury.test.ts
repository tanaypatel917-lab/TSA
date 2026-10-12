import { describe, expect, it } from "vitest";
import { juryCorrectCount, juryModels, juryPhotos } from "./jury";

describe("jury panel data", () => {
  it("defines all 30 model-photo votes", () => {
    expect(juryModels).toHaveLength(6);
    expect(juryPhotos).toHaveLength(5);
    for (const model of juryModels) {
      expect(Object.keys(model.votes)).toHaveLength(5);
      for (const photo of juryPhotos) {
        expect(model.votes[photo.id]).toBeDefined();
        expect(model.votes[photo.id].confidence).toBeGreaterThanOrEqual(0);
        expect(model.votes[photo.id].confidence).toBeLessThanOrEqual(100);
        expect(model.votes[photo.id].reason).toBeTruthy();
      }
    }
  });

  it("makes Bo correct on every photo and strictly better than every other model", () => {
    const counts = Object.fromEntries(juryModels.map((model) => [model.id, juryCorrectCount(model)]));
    expect(counts).toEqual({ max: 2, ivy: 2, rex: 1, bo: 5, pim: 2, lux: 3 });
    expect(counts.bo).toBe(5);
    for (const model of juryModels.filter(({ id }) => id !== "bo")) {
      expect(counts.bo).toBeGreaterThan(counts[model.id]);
    }
  });
});
