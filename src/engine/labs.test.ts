import { describe, expect, it } from "vitest";
import { accuracy, centroids, pool, ruleFlags, tokens, trainingSet } from "./labs";

describe("orchard bias lab", () => {
  it("builds balanced, reproducible farms", () => {
    expect(pool).toHaveLength(160);
    expect(pool.filter((item) => item.farm === "B" && item.ripe)).toHaveLength(40);
    expect(trainingSet(0.5)).toHaveLength(40);
    expect(trainingSet(0).every((item) => item.farm === "A")).toBe(true);
  });

  it("a model trained only on farm A works worse for farm B, and mixing the data narrows the gap", () => {
    const narrow = centroids(trainingSet(0));
    const mixed = centroids(trainingSet(0.5));
    const gapNarrow = accuracy(narrow, "A") - accuracy(narrow, "B");
    const gapMixed = Math.abs(accuracy(mixed, "A") - accuracy(mixed, "B"));
    expect(accuracy(narrow, "A")).toBeGreaterThan(0.85);
    expect(gapNarrow).toBeGreaterThan(0.2);
    expect(gapMixed).toBeLessThan(gapNarrow);
    expect(accuracy(mixed, "B")).toBeGreaterThan(accuracy(narrow, "B"));
  });
});

describe("simplified tokenizer", () => {
  it("splits punctuation, contractions and common word parts, keeping spaces on the next token", () => {
    expect(tokens("Unbelievable! Models don't read.")).toEqual(["Un", "believ", "able", "!", " Model", "s", " do", "n't", " read", "."]);
    expect(tokens("Hi 42").join("")).toBe("Hi 42");
  });
});

describe("keyword rules", () => {
  it("flags a message when any keyword appears, ignoring case and blanks", () => {
    expect(ruleFlags("WIN a phone", ["win", " "])).toBe(true);
    expect(ruleFlags("Free pizza after school", ["prize"])).toBe(false);
    expect(ruleFlags("anything", [])).toBe(false);
  });
});
