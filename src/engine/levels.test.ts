import { describe, expect, it } from "vitest";
import { levelFor, nextLevel, progressToNext } from "./levels";

describe("levels", () => {
  it("handles level boundaries", () => {
    expect(levelFor(0).name).toBe("Novice");
    expect(levelFor(100).name).toBe("Explorer");
    expect(levelFor(700).name).toBe("AI Ally");
    expect(nextLevel(700)).toBeNull();
    expect(progressToNext(50)).toBe(0.5);
  });
});
