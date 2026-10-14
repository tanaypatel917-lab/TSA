import { describe, expect, it } from "vitest";
import { WORD_MAP_GROUPS } from "@/content/wordMap";
import { layoutWordMap, nearest } from "./wordMap";

describe("Word Map layout", () => {
  it("is deterministic and keeps every point near the origin", () => {
    const points = layoutWordMap();

    expect(layoutWordMap()).toEqual(points);
    expect(points).toHaveLength(20);
    expect(points.every((point) => Math.hypot(point.x, point.y, point.z) <= 3.5)).toBe(true);
  });

  it("keeps hallucination close to its risk-group neighbors", () => {
    const points = layoutWordMap();
    const risks = new Set<string>(WORD_MAP_GROUPS.find((group) => group.id === "risks")!.terms);

    expect(nearest(points, "Hallucination").filter((point) => risks.has(point.term)).length).toBeGreaterThanOrEqual(2);
  });
});
