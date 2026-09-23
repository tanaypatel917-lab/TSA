export type Point = { x: number; z: number };
export type Circle = Point & { r: number };
export type Mover = Point & { vx: number; vz: number; heading: number };

export const MOVE = { max: 640, accel: 7, friction: 5, turn: 10, radius: 60 };
const TAU = Math.PI * 2;
const GOLDEN = 2.399963229728653;

export function startMover(): Mover {
  return { x: 0, z: 260, vx: 0, vz: 0, heading: Math.PI };
}

export function wrapAngle(angle: number) {
  return angle - TAU * Math.floor((angle + Math.PI) / TAU);
}

export function step(mover: Mover, input: Point, dt: number, bounds: number, obstacles: Circle[]): Mover {
  const length = Math.hypot(input.x, input.z);
  const scale = length > 1 ? 1 / length : 1;
  const k = 1 - Math.exp(-(length > 0.05 ? MOVE.accel : MOVE.friction) * dt);
  let vx = mover.vx + (input.x * scale * MOVE.max - mover.vx) * k;
  let vz = mover.vz + (input.z * scale * MOVE.max - mover.vz) * k;
  let x = mover.x + vx * dt;
  let z = mover.z + vz * dt;
  for (const obstacle of obstacles) {
    const dx = x - obstacle.x;
    const dz = z - obstacle.z;
    const distance = Math.hypot(dx, dz);
    const minimum = obstacle.r + MOVE.radius;
    if (distance >= minimum) continue;
    const nx = distance ? dx / distance : 0;
    const nz = distance ? dz / distance : 1;
    x = obstacle.x + nx * minimum;
    z = obstacle.z + nz * minimum;
    const into = vx * nx + vz * nz;
    if (into < 0) { vx -= into * nx; vz -= into * nz; }
  }
  const limit = bounds - MOVE.radius;
  const reach = Math.hypot(x, z);
  if (reach > limit) {
    const nx = x / reach;
    const nz = z / reach;
    x = nx * limit;
    z = nz * limit;
    const out = vx * nx + vz * nz;
    if (out > 0) { vx -= out * nx; vz -= out * nz; }
  }
  const moving = Math.hypot(vx, vz) > 30;
  const heading = moving ? mover.heading + wrapAngle(Math.atan2(vx, vz) - mover.heading) * Math.min(1, MOVE.turn * dt) : mover.heading;
  return { x, z, vx, vz, heading: wrapAngle(heading) };
}

export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function nearest<T extends Point>(point: Point, items: readonly T[], reach: number): T | null {
  let best: T | null = null;
  let bestDistance = reach;
  for (const item of items) {
    const gap = distance(point, item);
    if (gap <= bestDistance) { best = item; bestDistance = gap; }
  }
  return best;
}

export function scatter(count: number, bounds: number, avoid: Circle[], seed = 0.4, inner = 420): Point[] {
  const points: Point[] = [];
  for (let index = 0; index < count; index += 1) {
    const radius = inner + (bounds - 320 - inner) * Math.sqrt((index + 0.5) / count);
    let angle = index * GOLDEN + seed;
    let point = { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
    for (let attempt = 0; attempt < 12 && [...avoid, ...points.map((placed) => ({ ...placed, r: 150 }))].some((circle) => distance(point, circle) < circle.r); attempt += 1) {
      angle += 0.29;
      point = { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
    }
    points.push({ x: Math.round(point.x), z: Math.round(point.z) });
  }
  return points;
}

const directions: Record<string, Point> = {
  ArrowUp: { x: 0, z: -1 }, KeyW: { x: 0, z: -1 },
  ArrowDown: { x: 0, z: 1 }, KeyS: { x: 0, z: 1 },
  ArrowLeft: { x: -1, z: 0 }, KeyA: { x: -1, z: 0 },
  ArrowRight: { x: 1, z: 0 }, KeyD: { x: 1, z: 0 }
};

export const MOVE_KEYS = new Set(Object.keys(directions));

export function inputFrom(keys: Iterable<string>): Point {
  let x = 0;
  let z = 0;
  for (const key of new Set(keys)) {
    const direction = directions[key];
    if (direction) { x += direction.x; z += direction.z; }
  }
  return { x: Math.sign(x), z: Math.sign(z) };
}
