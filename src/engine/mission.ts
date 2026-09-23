import type { Mission } from "@/content/missions";
import type { Point } from "./world";

export const RUN = { seconds: 75, lives: 3, field: 3, points: 100, maxCombo: 4, timeBonus: 10, count: 8 };

export type Crate = Point & { item: number };
export type RunResult = { item: number; gate: string; ok: boolean };
export type RunEnd = "cleared" | "time" | "mistakes";
export type Run = {
  moduleId: string;
  order: number[];
  next: number;
  spawned: number;
  field: Crate[];
  carrying: number | null;
  score: number;
  combo: number;
  mistakes: number;
  results: RunResult[];
  timeLeft: number;
  relaxed: boolean;
  over: RunEnd | null;
};
export type Delivery = { run: Run; ok: boolean; points: number; item: number } | null;

function shuffled(length: number, seed: number) {
  const order = Array.from({ length }, (_, index) => index);
  let state = (seed * 2654435761) >>> 0 || 1;
  for (let index = length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
}

function spawn(run: Run, spots: readonly Point[]): Run {
  const field = [...run.field];
  let { next, spawned } = run;
  while (field.length < RUN.field && next < run.order.length) {
    const taken = field.map((crate) => `${crate.x},${crate.z}`);
    let spot = spots[(spawned * 5) % spots.length];
    for (let step = 1; taken.includes(`${spot.x},${spot.z}`) && step < spots.length; step += 1) spot = spots[(spawned * 5 + step) % spots.length];
    field.push({ item: run.order[next], x: spot.x, z: spot.z });
    next += 1;
    spawned += 1;
  }
  return { ...run, field, next, spawned };
}

export function startRun(mission: Mission, spots: readonly Point[], options: { seed: number; relaxed: boolean }): Run {
  const order = shuffled(mission.items.length, options.seed).slice(0, Math.min(RUN.count, mission.items.length));
  return spawn({ moduleId: mission.moduleId, order, next: 0, spawned: options.seed % spots.length, field: [], carrying: null, score: 0, combo: 0, mistakes: 0, results: [], timeLeft: RUN.seconds, relaxed: options.relaxed, over: null }, spots);
}

export function pickUp(run: Run, crate: number, spots: readonly Point[]): Run {
  if (run.over || run.carrying !== null || !run.field[crate]) return run;
  const field = run.field.filter((_, index) => index !== crate);
  return spawn({ ...run, field, carrying: run.field[crate].item }, spots);
}

export function deliver(run: Run, gate: string, mission: Mission): Delivery {
  if (run.over || run.carrying === null) return null;
  const item = run.carrying;
  const ok = mission.items[item].gate === gate;
  const combo = ok ? Math.min(RUN.maxCombo, run.combo + 1) : 0;
  const points = ok ? RUN.points * combo : 0;
  const results = [...run.results, { item, gate, ok }];
  const mistakes = run.mistakes + (ok ? 0 : 1);
  const cleared = results.length === run.order.length;
  const over: RunEnd | null = mistakes >= RUN.lives ? "mistakes" : cleared ? "cleared" : null;
  const bonus = over === "cleared" && !run.relaxed ? Math.floor(run.timeLeft) * RUN.timeBonus : 0;
  return { run: { ...run, carrying: null, combo, mistakes, results, score: run.score + points + bonus, over }, ok, points, item };
}

export function tick(run: Run, dt: number): Run {
  if (run.over || run.relaxed) return run;
  const timeLeft = Math.max(0, run.timeLeft - dt);
  return { ...run, timeLeft, over: timeLeft === 0 ? "time" : null };
}

export function stars(run: Run) {
  const correct = run.results.filter((result) => result.ok).length;
  if (run.over === "cleared" && run.mistakes === 0) return 3;
  if (run.over === "cleared" && run.mistakes <= 1) return 2;
  return correct >= Math.ceil(run.order.length * 0.6) ? 1 : 0;
}
