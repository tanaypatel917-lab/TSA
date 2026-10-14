import { describe, expect, it } from "vitest";
import { samplePoints } from "./glyphPoints";

describe("glyph point sampling", () => {
  it("is deterministic and returns the requested number of points", () => {
    const alpha = new Uint8ClampedArray(24 * 16);
    for (let y = 3; y < 13; y += 1) {
      for (let x = 4; x < 20; x += 1) alpha[y * 24 + x] = 255;
    }

    const points = samplePoints(alpha, 24, 16, 1600);

    expect(points).toEqual(samplePoints(alpha, 24, 16, 1600));
    expect(points).toHaveLength(1600 * 3);
  });

  it("keeps mapped points and depth jitter within bounds", () => {
    const alpha = new Uint8ClampedArray(12 * 8);
    alpha.fill(255);

    const points = samplePoints(alpha, 12, 8, 64);
    for (let index = 0; index < points.length; index += 3) {
      expect(Math.abs(points[index])).toBeLessThanOrEqual(1);
      expect(Math.abs(points[index + 1])).toBeLessThanOrEqual(1);
      expect(points[index + 2]).toBeGreaterThanOrEqual(-0.12);
      expect(points[index + 2]).toBeLessThan(0.12);
    }
  });

  it("places empty masks on a ring", () => {
    const points = samplePoints(new Uint8ClampedArray(32 * 32), 32, 32, 64);

    expect(points).toHaveLength(64 * 3);
    for (let index = 0; index < points.length; index += 3) {
      expect(Math.hypot(points[index], points[index + 1])).toBeCloseTo(0.8, 5);
    }
  });

  it("samples only the filled square", () => {
    const alpha = new Uint8ClampedArray(12 * 12);
    for (let y = 4; y < 8; y += 1) {
      for (let x = 4; x < 8; x += 1) alpha[y * 12 + x] = 255;
    }
    alpha[0] = 128;

    const points = samplePoints(alpha, 12, 12, 16);

    expect(points).toHaveLength(16 * 3);
    for (let index = 0; index < points.length; index += 3) {
      expect(Math.abs(points[index])).toBeLessThanOrEqual(0.25);
      expect(Math.abs(points[index + 1])).toBeLessThanOrEqual(0.25);
    }
  });
});
