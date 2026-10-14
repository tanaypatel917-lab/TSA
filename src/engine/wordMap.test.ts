import { describe, expect, it } from "vitest";
import { layoutWordMap, nearest } from "./wordMap";

describe("Word Map layout", () => {
  it("is deterministic and keeps every point near the origin", () => {
    const points = layoutWordMap();

    expect(layoutWordMap()).toEqual(points);
    expect(points).toHaveLength(20);
    expect(points.every((point) => Math.hypot(point.x, point.y, point.z) <= 3.5)).toBe(true);
  });

  it("keeps clusters separated and hallucination closest to risks terms", () => {
    const points = layoutWordMap();
    const crossClusterDistances = points.flatMap((point, index) => points.slice(index + 1)
      .filter((other) => point.group !== other.group)
      .map((other) => Math.hypot(point.x - other.x, point.y - other.y, point.z - other.z)));

    expect(Math.min(...crossClusterDistances)).toBeGreaterThanOrEqual(1.5);
    expect(nearest(points, "Hallucination")).toHaveLength(3);
    expect(nearest(points, "Hallucination").every((point) => point.group === "risks")).toBe(true);
  });
});
