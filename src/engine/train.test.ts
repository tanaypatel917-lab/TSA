import { describe, expect, it } from "vitest";
import { PRESETS, START, score, step } from "./train";

describe("perceptron training lab", () => {
  it("learns the two blobs and diagonal within the requested number of epochs", () => {
    let blobs = START;
    for (let index = 0; index < 40; index += 1) blobs = step(blobs, PRESETS.blobs);
    expect(score(blobs, PRESETS.blobs)).toBeGreaterThanOrEqual(0.95);

    let diagonal = START;
    for (let index = 0; index < 60; index += 1) diagonal = step(diagonal, PRESETS.diagonal);
    expect(score(diagonal, PRESETS.diagonal)).toBeGreaterThanOrEqual(0.9);
  });

  it("cannot sort the ring with a single line", () => {
    let model = START;
    for (let index = 0; index < 60; index += 1) model = step(model, PRESETS.ring);
    expect(score(model, PRESETS.ring)).toBeLessThanOrEqual(0.8);
  });

  it("returns a fresh model without mutating input and repeats deterministically", () => {
    const original = { ...START };
    const snapshot = { ...original };
    const first = step(original, PRESETS.blobs);
    const second = step(original, PRESETS.blobs);

    expect(original).toEqual(snapshot);
    expect(first).not.toBe(original);
    expect(first).toEqual(second);
  });

  it("keeps every preset coordinate inside the plotting area", () => {
    for (const dots of Object.values(PRESETS)) {
      expect(dots.every(({ x, y }) => x >= 0.03 && x <= 0.97 && y >= 0.03 && y <= 0.97)).toBe(true);
    }
  });
});
