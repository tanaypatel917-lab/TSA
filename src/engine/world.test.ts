import { describe, expect, it } from "vitest";
import { MOVE, inputFrom, nearest, scatter, startMover, step, wrapAngle, type Mover } from "./world";

const run = (mover: Mover, input: { x: number; z: number }, seconds: number, obstacles = [] as { x: number; z: number; r: number }[], bounds = 2000) => {
  let current = mover;
  for (let time = 0; time < seconds; time += 1 / 60) current = step(current, input, 1 / 60, bounds, obstacles);
  return current;
};

describe("world movement", () => {
  it("accelerates toward the pressed direction up to top speed and turns to face it", () => {
    const moved = run(startMover(), { x: 1, z: 0 }, 1.5);
    expect(moved.x).toBeGreaterThan(500);
    expect(Math.hypot(moved.vx, moved.vz)).toBeLessThanOrEqual(MOVE.max + 0.001);
    expect(moved.heading).toBeCloseTo(Math.PI / 2, 1);
  });

  it("keeps diagonal speed the same as straight speed and glides to a stop", () => {
    const diagonal = run(startMover(), { x: 1, z: -1 }, 2);
    expect(Math.hypot(diagonal.vx, diagonal.vz)).toBeCloseTo(MOVE.max, 0);
    const stopped = run(diagonal, { x: 0, z: 0 }, 2);
    expect(Math.hypot(stopped.vx, stopped.vz)).toBeLessThan(1);
  });

  it("cannot pass through a station pedestal or leave the island", () => {
    const pedestal = { x: 0, z: -400, r: 200 };
    const blocked = run(startMover(), { x: 0, z: -1 }, 3, [pedestal]);
    expect(Math.hypot(blocked.x - pedestal.x, blocked.z - pedestal.z)).toBeGreaterThanOrEqual(pedestal.r + MOVE.radius - 0.001);
    const edge = run(startMover(), { x: 0, z: 1 }, 6, [], 900);
    expect(Math.hypot(edge.x, edge.z)).toBeLessThanOrEqual(900 - MOVE.radius + 0.001);
  });

  it("wraps angles into the -π to π range", () => {
    expect(wrapAngle(Math.PI * 3)).toBeCloseTo(-Math.PI);
    expect(wrapAngle(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2);
  });
});

describe("world layout and reach", () => {
  it("finds the nearest item within reach only", () => {
    const items = [{ id: "a", x: 0, z: 0 }, { id: "b", x: 300, z: 0 }];
    expect(nearest({ x: 250, z: 0 }, items, 100)?.id).toBe("b");
    expect(nearest({ x: 150, z: 400 }, items, 100)).toBeNull();
  });

  it("scatters points inside the island, clear of stations and each other", () => {
    const avoid = [{ x: 0, z: -1300, r: 520 }, { x: 1300, z: 0, r: 520 }];
    const points = scatter(20, 2200, avoid);
    expect(points).toHaveLength(20);
    for (const point of points) {
      expect(Math.hypot(point.x, point.z)).toBeLessThan(2200 - 300);
      for (const circle of avoid) expect(Math.hypot(point.x - circle.x, point.z - circle.z)).toBeGreaterThanOrEqual(circle.r);
    }
    expect(scatter(20, 2200, avoid)).toEqual(points);
  });

  it("maps arrow keys and WASD to screen directions", () => {
    expect(inputFrom(["ArrowUp"])).toEqual({ x: 0, z: -1 });
    expect(inputFrom(["KeyD", "KeyS"])).toEqual({ x: 1, z: 1 });
    expect(inputFrom(["ArrowLeft", "ArrowRight", "Enter"])).toEqual({ x: 0, z: 0 });
  });
});
