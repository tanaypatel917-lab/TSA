import type { Application, SPEObject } from "@splinetool/runtime";
import { introActs, introPalette, introPromptParts, type IntroPartId } from "@/content/intro";
import { hideKit } from "@/content/visuals";
import { clamp, damp, easeInOutCubic, easeOutCubic, hexToRgb, lerp, pseudoRandom, rgbToHex, smoothstep } from "@/engine/introStory";

export type IntroSceneInput = {
  t: number;
  act: number;
  local: number;
  time: number;
  dt: number;
  aspect: number;
  compact: boolean;
  pointer: { x: number; y: number };
  spin: number;
  parts: readonly IntroPartId[];
  claimChecked: boolean;
  claimAt: number;
  breakAt: number;
  celebrateAt: number;
  exit: number;
  finaleTop?: number;
};

type Kind = "question" | "ring" | "token" | "slab" | "bar" | "dot" | "star";
type Vector = [number, number, number];
type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number; color: string };
type Written = { shown: boolean; x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number; color: string };
type Item = {
  object: SPEObject;
  kind: Kind;
  index: number;
  from: Pose;
  to: Pose;
  target: Pose;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
  vs: number;
  rgb: number[];
  dir: Vector;
  direct: boolean;
  written: Written;
};
type Particle = { x: number; y: number; z: number; vx: number; vy: number; vz: number; rx: number; ry: number; rz: number; wx: number; wy: number; wz: number; age: number };
type Frame = { x: number; y: number; k: number };

const { ink, clay, paper, sky, slate, rust } = introPalette;
const STAGE_POSITION: Vector = [0, 118, 36];
const STAGE_ROTATION: Vector = [-0.2286, -0.4092, -0.0923];
const ZOOM = 0.64;
const UNITS_TALL = 820;
const FINALE_SCALE = 0.62;
const FINALE_RADIUS = 140;
const FINALE_GAP = 34;
const HIDDEN = 0.001;
const TAU = Math.PI * 2;
const TOKENS = 24;
const SHARDS = 8;
const ANCHORS: [number, number, number, number][] = [[0.7, 0.5, 0.5, 0.3], [0.27, 0.5, 0.5, 0.3], [0.7, 0.5, 0.5, 0.28], [0.28, 0.52, 0.5, 0.3], [0.7, 0.48, 0.5, 0.3], [0.27, 0.52, 0.5, 0.3], [0.5, 0.275, 0.5, 0.24]];
const LOOKS = [
  { body: clay, dot: sky, light: clay, rings: [paper, clay, sky], tokens: [clay, sky, paper, slate] },
  { body: clay, dot: sky, light: clay, rings: [paper, clay, sky], tokens: [clay, sky, paper, slate] },
  { body: clay, dot: paper, light: paper, rings: [paper, clay, sky], tokens: [paper, sky, clay, paper] },
  { body: ink, dot: clay, light: paper, rings: [ink, clay, paper], tokens: [ink, paper, clay, slate] },
  { body: ink, dot: clay, light: clay, rings: [ink, clay, sky], tokens: [clay, rust, clay, slate] },
  { body: clay, dot: sky, light: sky, rings: [paper, clay, sky], tokens: [clay, sky, paper, slate] },
  { body: ink, dot: sky, light: paper, rings: [paper, ink, sky], tokens: [ink, paper, ink, paper] }
];
const TOKEN_PART = introPromptParts.flatMap((part, index) => Array.from({ length: part.tokens }, () => index));
const RING_TILTS: Vector[] = [[1.2, 0.2, 0.9], [1.55, -0.45, 1.06], [1.85, 0.7, 1.22]];
const STAR_DIRECTION = unit(0.6, 0.7, -0.3);
const colors = new Map<string, readonly number[]>();

function unit(x: number, y: number, z: number): Vector {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function direction(index: number, seed: number) {
  return unit(pseudoRandom(index, seed) - 0.5, pseudoRandom(index, seed + 1) - 0.5, pseudoRandom(index, seed + 2) - 0.5);
}

function rgb(hex: string) {
  let value = colors.get(hex);
  if (!value) { value = hexToRgb(hex); colors.set(hex, value); }
  return value;
}

function wrapAngle(angle: number) {
  return angle - TAU * Math.floor((angle + Math.PI) / TAU);
}

function moved(value: number, previous: number, epsilon: number) {
  return !(Math.abs(value - previous) <= epsilon);
}

function set(out: Pose, x: number, y: number, z: number, rx: number, ry: number, rz: number, s: number, color: string) {
  out.x = x; out.y = y; out.z = z; out.rx = rx; out.ry = ry; out.rz = rz; out.s = s; out.color = color;
}

function blend(out: Pose, from: Pose, to: Pose, amount: number) {
  out.x = lerp(from.x, to.x, amount);
  out.y = lerp(from.y, to.y, amount);
  out.z = lerp(from.z, to.z, amount);
  out.rx = lerp(from.rx, to.rx, amount);
  out.ry = lerp(from.ry, to.ry, amount);
  out.rz = lerp(from.rz, to.rz, amount);
  out.s = lerp(from.s, to.s, amount);
  out.color = amount < 0.5 ? from.color : to.color;
}

function emptyPose(): Pose {
  return { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: HIDDEN, color: clay };
}

function makeItem(object: SPEObject, kind: Kind, index: number): Item {
  return {
    object, kind, index, from: emptyPose(), to: emptyPose(), target: emptyPose(),
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, s: HIDDEN, vs: 0,
    rgb: [0, 0, 0], dir: direction(index, kind === "ring" ? 31 : 17), direct: false,
    written: { shown: kind === "question", x: NaN, y: NaN, z: NaN, rx: NaN, ry: NaN, rz: NaN, s: NaN, color: "" }
  };
}

export class IntroScene {
  private readonly frames: Frame[] = ANCHORS.map(() => ({ x: 0, y: 0, k: 1 }));
  private readonly stack = introPromptParts.map(() => -1);
  private readonly ribbon = Array.from({ length: TOKENS }, () => -1);
  private particles: Particle[] = [];
  private claimSeen = -1;
  private autoSpin = 0;
  private spin = 0;
  private started = false;
  private zoom = NaN;
  private readonly body = { rgb: [...rgb(clay)], hex: "" };
  private readonly dot = { rgb: [...rgb(sky)], hex: "" };
  private readonly glow = { rgb: [...rgb(clay)], hex: "", x: NaN, y: NaN };
  private readonly tilted = { x: NaN, y: NaN };

  constructor(private readonly app: Application, private readonly stage: SPEObject, private readonly items: Item[], private readonly bodies: SPEObject[], private readonly dots: SPEObject[], private readonly light?: SPEObject) {}

  get objectCount() {
    return this.items.length;
  }

  refresh() {
    this.zoom = NaN;
  }

  update(input: IntroSceneInput) {
    if (this.zoom !== ZOOM) {
      this.app.setZoom(ZOOM);
      this.zoom = ZOOM;
    }
    const last = introActs.length - 1;
    const from = clamp(Math.floor(input.t), 0, last);
    const to = Math.min(last, from + 1);
    const mix = easeInOutCubic(clamp(input.t - from));
    this.layout(input);
    this.prepare(input);
    this.simulate(input);
    this.spin = this.questionSpin(input);
    for (const item of this.items) {
      this.pose(item.from, item, from, input.local, input);
      this.pose(item.to, item, to, 0, input);
      blend(item.target, item.from, item.to, item.kind === "token" ? clamp(mix * 1.35 - pseudoRandom(item.index, 9) * 0.35) : mix);
      this.finish(item, input, mix < 0.5 ? from : to);
      if (!this.started) this.place(item);
      this.integrate(item, input.dt);
      this.write(item);
    }
    this.started = true;
    this.paint(input, from, to, mix);
    this.tilt(input);
    this.app.requestRender();
  }

  private layout(input: IntroSceneInput) {
    const wide = UNITS_TALL * input.aspect;
    ANCHORS.forEach(([fx, fy, cx, cy], index) => {
      const frame = this.frames[index];
      frame.x = ((input.compact ? cx : fx) - 0.5) * wide;
      frame.y = (0.5 - (input.compact ? cy : fy)) * UNITS_TALL;
      frame.k = input.compact ? 0.72 : 1;
    });
    if (input.finaleTop === undefined || !Number.isFinite(input.finaleTop)) return;
    const finale = this.frames[this.frames.length - 1];
    finale.k *= FINALE_SCALE;
    const reach = FINALE_RADIUS * finale.k;
    finale.y = Math.min((0.5 - input.finaleTop) * UNITS_TALL + FINALE_GAP + reach, UNITS_TALL / 2 - reach - 20);
  }

  private prepare(input: IntroSceneInput) {
    let level = 0;
    introPromptParts.forEach((part, index) => { this.stack[index] = input.parts.includes(part.id) ? level++ : -1; });
    let slot = 0;
    for (let index = 0; index < TOKENS; index += 1) this.ribbon[index] = this.stack[TOKEN_PART[index]] >= 0 ? slot++ : -1;
  }

  private simulate(input: IntroSceneInput) {
    if (!input.claimChecked) {
      this.particles = [];
      this.claimSeen = -1;
      return;
    }
    const f = this.frames[4];
    const k = f.k;
    if (this.claimSeen !== input.claimAt) {
      this.claimSeen = input.claimAt;
      const barX = f.x - 60 * k;
      this.particles = Array.from({ length: SHARDS + 1 }, (_, index) => {
        const dot = index === SHARDS;
        return {
          x: barX, y: dot ? f.y - 125 * k : f.y + (135 - index * 27) * k, z: 0,
          vx: dot ? 70 : (pseudoRandom(index, 11) - 0.5) * 440, vy: dot ? 90 : 140 + pseudoRandom(index, 12) * 300, vz: dot ? 0 : (pseudoRandom(index, 13) - 0.5) * 320,
          rx: 0, ry: 0, rz: 0, wx: dot ? 0 : (pseudoRandom(index, 14) - 0.5) * 14, wy: (pseudoRandom(index, 15) - 0.5) * 10, wz: dot ? -5 : (pseudoRandom(index, 16) - 0.5) * 14, age: 0
        };
      });
    }
    if (Math.abs(input.t - 4) >= 1) return;
    const floor = f.y - 330 * k;
    const dt = input.dt;
    for (const particle of this.particles) {
      particle.age += dt;
      particle.vy -= 1500 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.z += particle.vz * dt;
      particle.rx += particle.wx * dt;
      particle.ry += particle.wy * dt;
      particle.rz += particle.wz * dt;
      if (particle.y >= floor) continue;
      particle.y = floor;
      particle.vy = Math.abs(particle.vy) * 0.38;
      if (particle.vy < 40) particle.vy = 0;
      particle.vx *= 0.7;
      particle.vz *= 0.7;
      particle.wx *= 0.6;
      particle.wy *= 0.6;
      particle.wz *= 0.6;
    }
  }

  private questionSpin(input: IntroSceneInput) {
    const presence = clamp(1 - Math.abs(input.t - 6));
    this.autoSpin = presence > 0.02 ? this.autoSpin + presence * 0.45 * input.dt : damp(this.autoSpin, Math.round(this.autoSpin / TAU) * TAU, 2.5, input.dt);
    const since = input.time - input.celebrateAt;
    const celebrate = input.celebrateAt > 0 && since >= 0 && since < 1.2 ? easeOutCubic(since / 1.2) * TAU : 0;
    return wrapAngle(input.spin + this.autoSpin + celebrate);
  }

  private explode(local: number, input: IntroSceneInput) {
    const scroll = smoothstep(0, 0.32, local) * (1 - smoothstep(0.5, 0.86, local));
    const since = input.time - input.breakAt;
    const impulse = input.breakAt > 0 && since >= 0 ? smoothstep(0, 0.08, since) * Math.exp(-since * 1.6) : 0;
    return clamp(scroll + impulse, 0, 1.25);
  }

  private pose(out: Pose, item: Item, act: number, local: number, input: IntroSceneInput) {
    switch (item.kind) {
      case "question": return this.questionPose(out, act, local, input);
      case "ring": return this.ringPose(out, item.index, act, local, input);
      case "token": return this.tokenPose(out, item, act, local, input);
      case "slab": return this.slabPose(out, item.index, act, input);
      case "bar": return this.barPose(out, act, input);
      case "dot": return this.dotPose(out, act, input);
      default: return this.starPose(out, act, local, input);
    }
  }

  private questionPose(out: Pose, act: number, local: number, input: IntroSceneInput) {
    const { x, y, k } = this.frames[act];
    const { time, pointer: p } = input;
    switch (act) {
      case 0: return set(out, x, y, 0, 0.06 + p.y * 0.14, -0.38 + Math.sin(time * 0.55) * 0.1 + p.x * 0.35, Math.sin(time * 0.4) * 0.04, 1.02 * k, clay);
      case 1: return set(out, x, y, 0, 0.08 + p.y * 0.1, 0.5 + local * 1.2 + p.x * 0.3, -0.06, 0.92 * k, clay);
      case 2: {
        const dive = Math.pow(smoothstep(0, 0.32, local), 2.2);
        return set(out, lerp(x, 0, dive), lerp(y, 0, dive), 150 + dive * 520, 0.05 + p.y * 0.08, 0.35 + p.x * 0.25 + dive * 0.6, 0, lerp(0.8, 7, dive) * k, clay);
      }
      case 3: return set(out, x - 130 * k, y + 10 * k, 0, 0.05 + p.y * 0.08, 0.42 + p.x * 0.25, 0, 0.8 * k, clay);
      case 4: return input.claimChecked
        ? set(out, x + 190 * k, y + 10 * k, -40, 0.04, Math.sin(time * 0.5) * 0.15, 0, 1.02 * k, clay)
        : set(out, x + 190 * k, y + 10 * k, -40, 0.04 + p.y * 0.08, -0.55 + p.x * 0.2, 0, 0.8 * k, clay);
      case 5: {
        const ex = this.explode(local, input);
        return set(out, x, y, 0, ex * 0.5 * Math.sin(time * 2.2) + p.y * 0.08, 0.3 + p.x * 0.3 + ex * 1.4, ex * 0.35, 0.9 * k, clay);
      }
      default: return set(out, x, y, 0, 0.04 + p.y * 0.06, -0.4 + Math.sin(time * 0.45) * 0.18 + p.x * 0.25, 0, 0.44 * k, clay);
    }
  }

  private ringPose(out: Pose, index: number, act: number, local: number, input: IntroSceneInput) {
    const { x, y, k } = this.frames[act];
    const { time } = input;
    const color = LOOKS[act].rings[index];
    if (act === 0 && index === 0) return set(out, x, y - 10 * k, -20, 1.22 + Math.sin(time * 0.3) * 0.08, Math.sin(time * 0.21) * 0.5, 0.32, k, color);
    if (act === 1 && index === 0) return set(out, x, y, -10, 1.05 + Math.sin(time * 0.35) * 0.1, Math.sin(time * 0.25) * 0.6, 0.42, k, color);
    if (act === 1 && index === 1) return set(out, x, y, 0, 1.95 + Math.sin(time * 0.3) * 0.12, -Math.sin(time * 0.2) * 0.5, -0.5, 1.02 * k, color);
    if (act === 5) {
      const ex = this.explode(local, input);
      const [tilt, roll, scale] = RING_TILTS[index];
      const [dx, dy, dz] = [0, 1, 2].map((axis) => [0.8, -0.5, 0.3][(axis + index) % 3]);
      const push = 170 * k * ex;
      return set(out, x + (dx - 0.6) * push, y + dy * push, dz * push, tilt + ex * 1.3 * (index + 1) + Math.sin(time * 0.3 + index) * 0.08, Math.sin(time * 0.25 + index) * 0.4, roll + ex, scale * (0.72 - ex * 0.12) * k, color);
    }
    if (act === 6 && index === 0) return set(out, x, y, -40, 0, 0, Math.sin(time * 0.2) * 0.3, 0.54 * k, color);
    return set(out, x, y, 0, 1.4, 0, 0, HIDDEN, color);
  }

  private tokenPose(out: Pose, item: Item, act: number, local: number, input: IntroSceneInput) {
    const { x, y, k } = this.frames[act];
    const { time } = input;
    const index = item.index;
    const color = LOOKS[act].tokens[index % 4];
    switch (act) {
      case 1: {
        const height = 1 - (2 * (index + 0.5)) / TOKENS;
        const ring = Math.sqrt(1 - height * height);
        const theta = index * 2.39996 + time * 0.25 + local * 2.2;
        const radius = 255 * k;
        return set(out, x + Math.cos(theta) * ring * radius, y + height * radius * 0.9 + Math.sin(time * 0.8 + index) * 6, Math.sin(theta) * ring * radius, Math.sin(time * 0.6 + index) * 1.2, Math.sin(time * 0.45 + index * 1.7) * 1.2, index * 0.3, (0.55 + pseudoRandom(index, 4) * 0.4) * k, color);
      }
      case 2: {
        const rush = smoothstep(0, 0.32, local);
        const angle = index * 2.39996 + time * 0.2;
        const reach = (260 + rush * 1100 + (index % 5) * 30) * k;
        return set(out, x + Math.cos(angle) * reach, y + Math.sin(angle) * reach * 0.62, -220 + rush * 900 + (index % 7) * 40, time * 0.8 + index, time * 0.6 + index * 0.4, 0, (0.42 + (index % 3) * 0.12) * k, color);
      }
      case 3: {
        const slot = this.ribbon[index];
        const tint = introPromptParts[TOKEN_PART[index]].color;
        const start = x - 270 * k;
        const spacing = 26 * k;
        return slot >= 0 && !input.compact
          ? set(out, start + slot * spacing, y - 305 * k + Math.sin(time * 1.6 + slot * 0.4) * 3, 80, 0.2, 0.55, 0, 0.44 * k, tint)
          : set(out, start + TOKENS * spacing * 0.5, y - 305 * k, 80, 0.2, 0.55, 0, HIDDEN, tint);
      }
      case 4: {
        const particle = input.claimChecked && index < SHARDS ? this.particles[index] : undefined;
        return particle
          ? set(out, particle.x, particle.y, particle.z, particle.rx, particle.ry, particle.rz, 0.62 * k * (1 - smoothstep(1.4, 2.1, particle.age)), color)
          : set(out, x - 60 * k, y + 40 * k, 0, 0, 0, 0, HIDDEN, color);
      }
      case 5: {
        const ex = this.explode(local, input);
        const angle = (index / TOKENS) * TAU + time * 0.35;
        const radius = 215 * k;
        const push = 330 * k * ex;
        const [dx, dy, dz] = item.dir;
        return set(out, x + Math.cos(angle) * radius + ((dx > 0 ? dx * 0.35 : dx) * 0.8 - 0.25) * push, y + Math.sin(angle * 2) * 36 * k + dy * push, Math.sin(angle) * radius * 0.6 + dz * push, Math.sin(time * 0.4 + index) * 0.5 + ex * (2 + (index % 5)), Math.sin(time * 0.3 + index * 0.7) * 0.5 + ex * 3, ex * index * 0.2, 0.78 * k, color);
      }
      case 6: {
        const angle = (index / TOKENS) * TAU + time * 0.2;
        const radius = 124 * k;
        return set(out, x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, -30, Math.sin(angle) * 0.6, Math.cos(angle) * 0.6, 0, 0.28 * k, color);
      }
      default: return set(out, x, y, 0, 0, 0, 0, HIDDEN, color);
    }
  }

  private slabPose(out: Pose, index: number, act: number, input: IntroSceneInput) {
    const { x, y, k } = this.frames[3];
    const { time } = input;
    const color = introPromptParts[index].color;
    const baseX = x + 140 * k;
    const baseY = y - 190 * k;
    const parkedX = baseX - 70 * k + (index - 2) * 64 * k;
    const parkedY = baseY + 340 * k + (index % 2) * 36 * k;
    if (act !== 3) return set(out, parkedX, parkedY, -80, 0.6, 0, 0.3, HIDDEN, color);
    const level = this.stack[index];
    if (level < 0) return set(out, parkedX, parkedY + Math.sin(time * 0.9 + index) * 8 * k, -80, 0.6 + Math.sin(time * 0.5 + index) * 0.2, Math.sin(time * 0.4 + index) * 0.8, 0.3, 0.72 * k, color);
    return set(out, baseX, baseY + level * 48 * k, 40, 0, -0.38 + Math.sin(time * 0.8 + level) * 0.04, 0, k, color);
  }

  private barPose(out: Pose, act: number, input: IntroSceneInput) {
    const { x, y, k } = this.frames[4];
    const { time } = input;
    const barX = x - 60 * k;
    const barY = y + 40 * k;
    if (act !== 4) return set(out, barX, barY - 320 * k, 0, 0, 0, 0, HIDDEN, clay);
    if (input.claimChecked) return set(out, barX, barY, 0, 0, 0, 0, HIDDEN, clay);
    return set(out, barX, barY, 0, 0.04, -0.2 + Math.sin(time * 0.7) * 0.28, Math.sin(time * 1.2) * 0.04, 1.06 * k * (1 + Math.sin(time * 3) * 0.012), clay);
  }

  private dotPose(out: Pose, act: number, input: IntroSceneInput) {
    const { x, y, k } = this.frames[4];
    const dotX = x - 60 * k;
    const dotY = y - 125 * k;
    if (act !== 4) return set(out, dotX, dotY - 320 * k, 0, 0, 0, 0, HIDDEN, clay);
    const particle = input.claimChecked ? this.particles[SHARDS] : undefined;
    if (particle) return set(out, particle.x, particle.y, particle.z, particle.rx, particle.ry, particle.rz, 1.06 * k, clay);
    return set(out, dotX, dotY + Math.sin(input.time * 0.7 + 1) * 3, 0, 0, 0, 0, 1.06 * k, clay);
  }

  private starPose(out: Pose, act: number, local: number, input: IntroSceneInput) {
    const { x, y, k } = this.frames[5];
    const { time } = input;
    const baseX = x + 210 * k;
    const baseY = y + 150 * k;
    if (act !== 5) return set(out, baseX, baseY, -60, 0.3, 0.2, 0, HIDDEN, sky);
    const ex = this.explode(local, input);
    const push = 320 * k * ex;
    return set(out, baseX + STAR_DIRECTION[0] * push, baseY + STAR_DIRECTION[1] * push, -60 + STAR_DIRECTION[2] * push, 0.3 + ex, 0.2 + Math.sin(time * 0.5) * 0.4, Math.sin(time * 0.6) * 0.5 + ex * 3, 0.85 * k, sky);
  }

  private finish(item: Item, input: IntroSceneInput, act: number) {
    const settled = this.particles.length > 0 && Math.abs(input.t - 4) < 0.02;
    item.direct = settled && ((item.kind === "token" && item.index < SHARDS) || item.kind === "dot");
    if (input.exit <= 0) return;
    const e = easeInOutCubic(input.exit);
    const target = item.target;
    const { x, y } = this.frames[act];
    item.direct = true;
    if (item.kind === "question") {
      target.s *= 1 + e * 5;
      target.z += e * 420;
      return;
    }
    target.x = x + (target.x - x) * (1 + e * 2.6);
    target.y = y + (target.y - y) * (1 + e * 2.6);
    target.s = Math.max(HIDDEN, target.s * (1 - e * 0.7));
  }

  private place(item: Item) {
    const target = item.target;
    item.x = target.x;
    item.y = target.y;
    item.z = target.z;
    item.rx = target.rx;
    item.ry = target.ry - (item.kind === "question" ? 2.6 : 0);
    item.rz = target.rz;
    item.s = HIDDEN;
    item.rgb = [...rgb(target.color)];
  }

  private integrate(item: Item, dt: number) {
    const target = item.target;
    if (item.direct) {
      item.x = target.x;
      item.y = target.y;
      item.z = target.z;
      item.vx = item.vy = item.vz = item.vs = 0;
      item.s = target.s;
      item.rx = target.rx;
      item.ry = target.ry;
      item.rz = target.rz;
    } else {
      const steps = dt > 1 / 55 ? 2 : 1;
      const h = dt / steps;
      for (let step = 0; step < steps; step += 1) {
        item.vx += ((target.x - item.x) * 90 - item.vx * 13.5) * h;
        item.vy += ((target.y - item.y) * 90 - item.vy * 13.5) * h;
        item.vz += ((target.z - item.z) * 90 - item.vz * 13.5) * h;
        item.vs += ((target.s - item.s) * 160 - item.vs * 15) * h;
        item.x += item.vx * h;
        item.y += item.vy * h;
        item.z += item.vz * h;
        item.s += item.vs * h;
      }
      item.rx = damp(item.rx, target.rx, 9, dt);
      item.ry = damp(item.ry, target.ry, 9, dt);
      item.rz = damp(item.rz, target.rz, 9, dt);
    }
    item.s = Math.max(HIDDEN, item.s);
    const color = rgb(target.color);
    for (let channel = 0; channel < 3; channel += 1) item.rgb[channel] = damp(item.rgb[channel], color[channel], 6, dt);
  }

  private write(item: Item) {
    const { object, written } = item;
    const shown = item.s > 0.015;
    if (shown !== written.shown) {
      object.visible = shown;
      written.shown = shown;
    }
    if (!shown) return;
    if (moved(item.x, written.x, 0.02) || moved(item.y, written.y, 0.02) || moved(item.z, written.z, 0.02)) {
      object.position.x = written.x = item.x;
      object.position.y = written.y = item.y;
      object.position.z = written.z = item.z;
    }
    const ry = item.kind === "question" ? item.ry + this.spin : item.ry;
    if (moved(item.rx, written.rx, 0.0004) || moved(ry, written.ry, 0.0004) || moved(item.rz, written.rz, 0.0004)) {
      object.rotation.x = written.rx = item.rx;
      object.rotation.y = written.ry = ry;
      object.rotation.z = written.rz = item.rz;
    }
    if (moved(item.s, written.s, 0.0004)) {
      written.s = item.s;
      object.scale.x = item.s;
      object.scale.y = item.s;
      object.scale.z = item.s;
    }
    if (item.kind === "question") return;
    const hex = rgbToHex(item.rgb);
    if (hex !== written.color) object.color = written.color = hex;
  }

  private paint(input: IntroSceneInput, from: number, to: number, mix: number) {
    this.fade(this.body, this.bodies, LOOKS[from].body, LOOKS[to].body, mix, input.dt);
    this.fade(this.dot, this.dots, LOOKS[from].dot, LOOKS[to].dot, mix, input.dt);
    if (!this.light) return;
    this.fade(this.glow, [this.light], LOOKS[from].light, LOOKS[to].light, mix, input.dt);
    const a = this.frames[from];
    const b = this.frames[to];
    const x = lerp(a.x, b.x, mix) + 330 * a.k;
    const y = lerp(a.y, b.y, mix) + 280 * a.k;
    if (moved(x, this.glow.x, 0.5) || moved(y, this.glow.y, 0.5)) {
      this.light.position.x = this.glow.x = x;
      this.light.position.y = this.glow.y = y;
      this.light.position.z = -380;
    }
  }

  private fade(state: { rgb: number[]; hex: string }, targets: SPEObject[], from: string, to: string, mix: number, dt: number) {
    const a = rgb(from);
    const b = rgb(to);
    for (let channel = 0; channel < 3; channel += 1) state.rgb[channel] = damp(state.rgb[channel], lerp(a[channel], b[channel], mix), 6, dt);
    const hex = rgbToHex(state.rgb);
    if (hex === state.hex) return;
    state.hex = hex;
    for (const target of targets) target.color = hex;
  }

  private tilt(input: IntroSceneInput) {
    const x = STAGE_ROTATION[0] + input.pointer.y * 0.035;
    const y = STAGE_ROTATION[1] + input.pointer.x * 0.06;
    if (!moved(x, this.tilted.x, 0.0002) && !moved(y, this.tilted.y, 0.0002)) return;
    this.stage.rotation.x = this.tilted.x = x;
    this.stage.rotation.y = this.tilted.y = y;
    this.stage.rotation.z = STAGE_ROTATION[2];
  }
}

export async function createIntroScene(app: Application, subject: string) {
  const root = app.findObjectByName(subject);
  if (!root) throw new Error(`The scene is missing ${subject}.`);
  hideKit(app);
  const ground = app.findObjectByName("Wordplay.Studio.PaperGround");
  if (ground) ground.visible = false;
  const stage = await app.createObject("Group", { name: "Wordplay.Intro.Stage", position: STAGE_POSITION, rotation: STAGE_ROTATION.map((angle) => (angle * 180) / Math.PI) as Vector });
  const question = await app.cloneObject(root, { name: "Wordplay.Intro.Question", parent: stage, position: [0, 0, 0] });
  root.visible = false;
  const bodies = app.getAllObjects().filter((object) => object.name === "Wordplay.Question.Body");
  const dots = app.getAllObjects().filter((object) => object.name === "Wordplay.Question.Dot");
  const create = (type: string, name: string, options: Record<string, unknown>) => app.createObject(type, { name, parent: stage, visible: false, scale: HIDDEN, castShadow: false, receiveShadow: false, ...options });
  const items = [makeItem(question, "question", 0)];
  for (let index = 0; index < 3; index += 1) items.push(makeItem(await create("Torus", `Wordplay.Intro.Ring.${index + 1}`, { width: 540, height: 540, depth: 13, material: { color: paper, roughness: 0.45 } }), "ring", index));
  for (let index = 0; index < TOKENS; index += 1) items.push(makeItem(await create("Cube", `Wordplay.Intro.Token.${index + 1}`, { width: 44, height: 44, depth: 44, cornerRadius: 10, material: { color: clay, roughness: 0.6 } }), "token", index));
  for (const [index, part] of introPromptParts.entries()) items.push(makeItem(await create("Cube", `Wordplay.Intro.Part.${part.label}`, { width: 176, height: 36, depth: 100, cornerRadius: 12, material: { color: part.color, roughness: 0.5 } }), "slab", index));
  items.push(makeItem(await create("Cylinder", "Wordplay.Intro.Claim.Bar", { width: 68, height: 230, depth: 68, radiusTop: 34, radiusBottom: 15, cornerRadius: 12, material: { color: clay, roughness: 0.25, metalness: 0.15 } }), "bar", 0));
  items.push(makeItem(await create("Sphere", "Wordplay.Intro.Claim.Dot", { width: 62, height: 62, depth: 62, material: { color: clay, roughness: 0.25 } }), "dot", 0));
  items.push(makeItem(await create("Star", "Wordplay.Intro.Star", { width: 170, height: 170, depth: 46, spikes: 6, innerRadiusPercent: 46, cornerRadius: 14, material: { color: sky, roughness: 0.55 } }), "star", 0));
  const light = await app.createObject("PointLight", { name: "Wordplay.Intro.Rim", parent: stage, position: [300, 260, -380], color: clay, intensity: 1.2, distance: 1800 });
  return new IntroScene(app, stage, items, bodies, dots, light);
}
