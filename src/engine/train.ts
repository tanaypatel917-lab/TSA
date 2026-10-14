import { random } from "./labs";

export type Dot = { x: number; y: number; label: 1 | -1 };
export type Model = { w1: number; w2: number; b: number };

export const START: Model = { w1: 0.3, w2: -0.5, b: 0.1 };

function blobs(): Dot[] {
  const next = random(211);
  const dots: Dot[] = [];
  for (const [x, y, label] of [[0.3, 0.68, 1], [0.7, 0.32, -1]] as const) {
    for (let index = 0; index < 20; index += 1) {
      dots.push({
        x: x + (next() - 0.5) * 0.26,
        y: y + (next() - 0.5) * 0.26,
        label
      });
    }
  }
  return dots;
}

function diagonal(): Dot[] {
  const next = random(509);
  const dots: Dot[] = [];
  for (let index = 0; index < 40; index += 1) {
    const x = 0.03 + next() * 0.94;
    const y = 0.03 + next() * 0.94;
    if (Math.abs(y - x) < 0.06) continue;
    dots.push({ x, y, label: y > x ? 1 : -1 });
  }
  return dots;
}

function ring(): Dot[] {
  const next = random(907);
  const dots: Dot[] = [];
  for (let index = 0; index < 14; index += 1) {
    const angle = next() * Math.PI * 2;
    const radius = Math.sqrt(next()) * 0.2;
    dots.push({ x: 0.5 + Math.cos(angle) * radius, y: 0.5 + Math.sin(angle) * radius, label: 1 });
  }
  for (let index = 0; index < 26; index += 1) {
    const angle = next() * Math.PI * 2;
    const radius = 0.32 + next() * 0.13;
    dots.push({ x: 0.5 + Math.cos(angle) * radius, y: 0.5 + Math.sin(angle) * radius, label: -1 });
  }
  return dots;
}

export const PRESETS: Record<"blobs" | "diagonal" | "ring", Dot[]> = {
  blobs: blobs(),
  diagonal: diagonal(),
  ring: ring()
};

export function predict(model: Model, x: number, y: number): 1 | -1 {
  return model.w1 * x + model.w2 * y + model.b >= 0 ? 1 : -1;
}

export function step(model: Model, data: readonly Dot[], rate = 0.1): Model {
  const next = { ...model };
  for (const dot of data) {
    if (predict(next, dot.x, dot.y) !== dot.label) {
      next.w1 += rate * dot.label * dot.x;
      next.w2 += rate * dot.label * dot.y;
      next.b += rate * dot.label;
    }
  }
  return next;
}

export function score(model: Model, data: readonly Dot[]): number {
  if (data.length === 0) return 0;
  return data.filter((dot) => predict(model, dot.x, dot.y) === dot.label).length / data.length;
}
