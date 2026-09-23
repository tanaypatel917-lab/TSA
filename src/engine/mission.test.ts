import { describe, expect, it } from "vitest";
import { missions } from "@/content/missions";
import { RUN, deliver, pickUp, startRun, stars, tick, type Run } from "./mission";

const mission = missions[0];
const spots = Array.from({ length: 12 }, (_, index) => ({ x: index * 100, z: index * -50 }));
const right = (run: Run) => mission.items[run.carrying!].gate;
const wrong = (run: Run) => mission.gates.find((gate) => gate.id !== right(run))!.id;

function play(run: Run, choose: (run: Run) => string) {
  let current = run;
  while (!current.over) current = deliver(pickUp(current, 0, spots), choose(pickUp(current, 0, spots)), mission)!.run;
  return current;
}

describe("mission runs", () => {
  it("every mission has two gates and items that point at one of them", () => {
    for (const each of missions) {
      expect(each.gates).toHaveLength(2);
      expect(each.items.length).toBeGreaterThanOrEqual(RUN.count);
      for (const item of each.items) expect(each.gates.map((gate) => gate.id)).toContain(item.gate);
    }
  });

  it("starts with a full field of crates on distinct spots and a shuffled order", () => {
    const run = startRun(mission, spots, { seed: 7, relaxed: false });
    expect(run.field).toHaveLength(RUN.field);
    expect(new Set(run.field.map((crate) => `${crate.x},${crate.z}`)).size).toBe(RUN.field);
    expect(run.order).toHaveLength(RUN.count);
    expect(new Set(run.order).size).toBe(RUN.count);
    expect(startRun(mission, spots, { seed: 7, relaxed: false }).order).toEqual(run.order);
  });

  it("carries one crate at a time and refills the field", () => {
    const run = pickUp(startRun(mission, spots, { seed: 3, relaxed: false }), 1, spots);
    expect(run.carrying).not.toBeNull();
    expect(run.field).toHaveLength(RUN.field);
    expect(pickUp(run, 0, spots)).toBe(run);
  });

  it("builds a combo on correct deliveries and resets it on a mistake", () => {
    let run = pickUp(startRun(mission, spots, { seed: 1, relaxed: false }), 0, spots);
    const first = deliver(run, right(run), mission)!;
    expect([first.ok, first.points, first.run.combo]).toEqual([true, 100, 1]);
    run = pickUp(first.run, 0, spots);
    const second = deliver(run, right(run), mission)!;
    expect([second.points, second.run.combo]).toEqual([200, 2]);
    run = pickUp(second.run, 0, spots);
    const miss = deliver(run, wrong(run), mission)!;
    expect([miss.ok, miss.points, miss.run.combo, miss.run.mistakes]).toEqual([false, 0, 0, 1]);
  });

  it("a perfect clear earns three stars and a time bonus", () => {
    const done = play(startRun(mission, spots, { seed: 5, relaxed: false }), right);
    expect(done.over).toBe("cleared");
    expect(stars(done)).toBe(3);
    expect(done.score).toBe(100 + 200 + 300 + 400 * 5 + RUN.seconds * RUN.timeBonus);
  });

  it("three mistakes end the run with no stars, and time running out ends it too", () => {
    const failed = play(startRun(mission, spots, { seed: 5, relaxed: false }), wrong);
    expect([failed.over, failed.results.length, stars(failed)]).toEqual(["mistakes", RUN.lives, 0]);
    const timed = tick(startRun(mission, spots, { seed: 5, relaxed: false }), RUN.seconds + 1);
    expect([timed.over, timed.timeLeft]).toEqual(["time", 0]);
    const relaxed = tick(startRun(mission, spots, { seed: 5, relaxed: true }), RUN.seconds + 1);
    expect(relaxed.over).toBeNull();
  });
});
