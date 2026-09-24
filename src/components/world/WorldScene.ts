import type { Application, SPEObject } from "@splinetool/runtime";
import { introPalette } from "@/content/intro";
import { hideKit } from "@/content/visuals";
import { WORLD, gateSpots, stations, trees, tufts, wordTokens, type Station } from "@/content/world";
import { MOVE, type Mover, type Point } from "@/engine/world";

type Vector = [number, number, number];
export type SceneMission = { colors: [string, string]; carrying: boolean } | null;
export type WorldFrame = { mover: Mover; time: number; collected: ReadonlySet<string>; stamped: ReadonlySet<string>; near: string | null; mission: SceneMission; crates: readonly Point[] };

const { ink, clay, paper, sky, slate, rust } = introPalette;
const STAGE_POSITION: Vector = [0, 118, 36];
const STAGE_ROTATION: Vector = [-0.2286, -0.4092, -0.0923];
const TILT = 0.95;
const ZOOM = 0.24;
const PLAYER_SCALE = 0.95;
const PLAYER_Y = 330;
const CARRY_Y = 610;
const PATH = "#EAD9C6";
const PUFF = "#E9D3C8";
const degrees = (vector: Vector) => vector.map((angle) => (angle * 180) / Math.PI) as Vector;

type Token = { term: string; object: SPEObject; phase: number; shown: boolean };
type Marker = { object: SPEObject; shown: boolean };
type Gate = { group: SPEObject; tinted: SPEObject[]; pad: SPEObject };
type Particle = { object: SPEObject; x: number; y: number; z: number; vx: number; vy: number; vz: number; born: number; life: number; size: number; active: boolean };
export type MissionParts = { gates: Gate[]; crates: SPEObject[]; carried: SPEObject; sparks: Particle[]; puffs: Particle[] };

export class WorldScene {
  private zoom = NaN;
  private written = { x: NaN, z: NaN, y: NaN };
  private pose = { yaw: 0, roll: 0, pitch: 0 };
  private missionKey = "";
  private shownCrates = 0;
  private carriedShown = false;
  private lastTime = NaN;
  private lastPuff = 0;
  private cursor = 0;

  constructor(
    private readonly app: Application,
    private readonly map: SPEObject,
    private readonly player: SPEObject,
    private readonly tokens: Token[],
    private readonly halos: Map<string, Marker>,
    private readonly rings: Map<string, Marker>,
    private readonly parts: MissionParts
  ) {}

  get objectCount() {
    return this.app.getAllObjects().filter((object) => object.name.startsWith("Wordplay.World")).length;
  }

  refresh() {
    this.zoom = NaN;
  }

  burst(x: number, z: number, color: string, count = 10) {
    const now = this.lastTime || 0;
    for (let index = 0; index < count; index += 1) {
      const spark = this.parts.sparks[this.cursor];
      this.cursor = (this.cursor + 1) % this.parts.sparks.length;
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 420 + Math.random() * 380;
      Object.assign(spark, { x, y: 150, z, vx: Math.cos(angle) * speed, vy: 520 + Math.random() * 420, vz: Math.sin(angle) * speed, born: now, life: 0.75 + Math.random() * 0.3, size: 0.8 + Math.random() * 0.6, active: true });
      spark.object.color = color;
      spark.object.visible = true;
    }
  }

  update({ mover, time, collected, stamped, near, mission, crates }: WorldFrame) {
    if (this.zoom !== ZOOM) { this.app.setZoom(ZOOM); this.zoom = ZOOM; }
    const dt = Number.isNaN(this.lastTime) ? 0 : Math.min(0.05, time - this.lastTime);
    this.lastTime = time;
    const { written } = this;
    if (mover.x !== written.x || mover.z !== written.z) {
      this.map.position.x = written.x = -mover.x;
      this.map.position.z = written.z = -mover.z;
    }
    const pace = Math.min(1, Math.hypot(mover.vx, mover.vz) / MOVE.max);
    const pose = this.pose;
    const ease = 0.14;
    pose.yaw += (Math.sin(mover.heading) * 0.75 - pose.yaw) * ease;
    pose.roll += ((-mover.vx / MOVE.max) * 0.16 - pose.roll) * ease;
    pose.pitch += ((mover.vz / MOVE.max) * 0.14 - pose.pitch) * ease;
    this.player.rotation.x = pose.pitch;
    this.player.rotation.y = pose.yaw;
    this.player.rotation.z = pose.roll;
    const y = PLAYER_Y + Math.abs(Math.sin(time * 9)) * 14 * pace + Math.sin(time * 1.6) * 6;
    if (Math.abs(y - written.y) > 0.05) this.player.position.y = written.y = y;
    for (const token of this.tokens) {
      const shown = !mission && !collected.has(token.term);
      if (shown !== token.shown) { token.object.visible = token.shown = shown; }
      if (!shown) continue;
      token.object.position.y = 150 + Math.sin(time * 2.2 + token.phase) * 22;
      token.object.rotation.y = time * 1.3 + token.phase;
    }
    for (const [id, halo] of this.halos) {
      const shown = stamped.has(id);
      if (shown !== halo.shown) { halo.object.visible = halo.shown = shown; }
      if (shown) halo.object.position.y = 470 + Math.sin(time * 2 + id.length) * 12;
    }
    for (const [id, ring] of this.rings) {
      const shown = !mission && near === id;
      if (shown !== ring.shown) { ring.object.visible = ring.shown = shown; }
    }
    this.updateMission(mission, crates, time, y);
    this.updateParticles(dt, time, mover, pace);
    this.app.requestRender();
  }

  private updateMission(mission: SceneMission, crates: readonly Point[], time: number, playerY: number) {
    const { gates, crates: pool, carried } = this.parts;
    const key = mission ? mission.colors.join() : "";
    if (key !== this.missionKey) {
      this.missionKey = key;
      gates.forEach((gate, index) => {
        gate.group.visible = !!mission;
        if (mission) for (const part of gate.tinted) part.color = mission.colors[index];
      });
    }
    if (mission) {
      const pulse = mission.carrying ? 1 + Math.sin(time * 7) * 0.07 : 1;
      for (const gate of gates) { gate.pad.scale.x = pulse; gate.pad.scale.z = pulse; }
    }
    const count = mission ? Math.min(crates.length, pool.length) : 0;
    pool.forEach((crate, index) => {
      const shown = index < count;
      if (index >= this.shownCrates && shown) crate.visible = true;
      if (index < this.shownCrates && !shown) crate.visible = false;
      if (!shown) return;
      crate.position.x = crates[index].x;
      crate.position.z = crates[index].z;
      crate.position.y = 140 + Math.sin(time * 2.6 + index * 1.7) * 18;
      crate.rotation.y = time * 0.9 + index;
    });
    this.shownCrates = count;
    const carrying = !!mission?.carrying;
    if (carrying !== this.carriedShown) { carried.visible = this.carriedShown = carrying; }
    if (carrying) {
      carried.position.y = CARRY_Y + (playerY - PLAYER_Y) + Math.sin(time * 5) * 10;
      carried.rotation.y = time * 1.6;
    }
  }

  private updateParticles(dt: number, time: number, mover: Mover, pace: number) {
    for (const spark of this.parts.sparks) {
      if (!spark.active) continue;
      const age = time - spark.born;
      if (age > spark.life) { spark.active = false; spark.object.visible = false; continue; }
      spark.vy -= 1500 * dt;
      spark.x += spark.vx * dt;
      spark.y = Math.max(20, spark.y + spark.vy * dt);
      spark.z += spark.vz * dt;
      const scale = spark.size * (1 - age / spark.life);
      spark.object.position.x = spark.x;
      spark.object.position.y = spark.y;
      spark.object.position.z = spark.z;
      spark.object.rotation.x = age * 9;
      spark.object.rotation.z = age * 7;
      spark.object.scale.x = spark.object.scale.y = spark.object.scale.z = Math.max(0.01, scale);
    }
    if (pace > 0.55 && time - this.lastPuff > 0.07) {
      this.lastPuff = time;
      const puff = this.parts.puffs.find((item) => !item.active);
      if (puff) {
        Object.assign(puff, { x: mover.x - Math.sin(mover.heading) * 60, y: 26, z: mover.z - Math.cos(mover.heading) * 60, born: time, life: 0.55, size: 0.7 + pace * 0.5, active: true });
        puff.object.position.x = puff.x;
        puff.object.position.y = puff.y;
        puff.object.position.z = puff.z;
        puff.object.visible = true;
      }
    }
    for (const puff of this.parts.puffs) {
      if (!puff.active) continue;
      const age = time - puff.born;
      if (age > puff.life) { puff.active = false; puff.object.visible = false; continue; }
      const scale = puff.size * (1 - age / puff.life);
      puff.object.position.y = puff.y + age * 60;
      puff.object.scale.x = puff.object.scale.y = puff.object.scale.z = Math.max(0.01, scale);
    }
  }
}

async function buildCrate(app: Application, name: string, parent: SPEObject, position: Vector) {
  const group = await app.createObject("Group", { name, parent, position, visible: false });
  const part = (type: string, suffix: string, options: Record<string, unknown>) => app.createObject(type, { name: `${name}.${suffix}`, parent: group, castShadow: false, receiveShadow: false, ...options });
  await part("Cube", "Box", { width: 170, height: 170, depth: 170, cornerRadius: 36, material: { color: paper, roughness: 0.45 } });
  await part("Cube", "Band", { width: 180, height: 38, depth: 180, cornerRadius: 14, material: { color: ink, roughness: 0.5 } });
  await part("Sphere", "Seal", { width: 60, height: 60, depth: 60, position: [0, 116, 0], material: { color: clay, roughness: 0.35 } });
  return group;
}

async function buildMissionParts(app: Application, map: SPEObject, tilt: SPEObject): Promise<MissionParts> {
  const gates = await Promise.all(gateSpots.map(async (spot, index) => {
    const group = await app.createObject("Group", { name: `Wordplay.World.Gate.${index}`, parent: map, position: [spot.x, 0, spot.z], visible: false });
    const part = (type: string, suffix: string, options: Record<string, unknown>) => app.createObject(type, { name: `Wordplay.World.Gate.${index}.${suffix}`, parent: group, castShadow: false, receiveShadow: false, ...options });
    const pad = await part("Cylinder", "Pad", { width: 520, depth: 520, height: 12, radiusTop: 260, radiusBottom: 260, position: [0, 6, 0], material: { color: sky, roughness: 0.6 } });
    for (const side of [-1, 1]) await part("Cylinder", `Pillar.${side}`, { width: 66, depth: 66, height: 360, radiusTop: 30, radiusBottom: 36, position: [side * 205, 180, 0], material: { color: ink, roughness: 0.5 } });
    const beam = await part("Cube", "Beam", { width: 500, height: 72, depth: 72, cornerRadius: 22, position: [0, 390, 0], material: { color: sky, roughness: 0.45 } });
    const cap = await part("Sphere", "Cap", { width: 120, height: 120, depth: 120, position: [0, 490, 0], material: { color: sky, roughness: 0.35 } });
    return { group, pad, tinted: [pad, beam, cap] };
  }));
  const crates = await Promise.all([0, 1, 2].map((index) => buildCrate(app, `Wordplay.World.Crate.${index}`, map, [0, 110, 0])));
  const carried = await buildCrate(app, "Wordplay.World.Carried", tilt, [0, CARRY_Y, 0]);
  const particle = async (type: string, name: string, options: Record<string, unknown>): Promise<Particle> => ({
    object: await app.createObject(type, { name, parent: map, visible: false, castShadow: false, receiveShadow: false, ...options }),
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, born: 0, life: 1, size: 1, active: false
  });
  const sparks = await Promise.all(Array.from({ length: 18 }, (_, index) => particle("Cube", `Wordplay.World.Spark.${index}`, { width: 48, height: 48, depth: 48, cornerRadius: 10, material: { color: sky, roughness: 0.4 } })));
  const puffs = await Promise.all(Array.from({ length: 12 }, (_, index) => particle("Sphere", `Wordplay.World.Puff.${index}`, { width: 70, height: 70, depth: 70, material: { color: PUFF, roughness: 0.9 } })));
  return { gates, crates, carried, sparks, puffs };
}

export const KIT = "Wordplay.World.Kit";
type Make = (type: string, name: string, options: Record<string, unknown>) => Promise<SPEObject>;

async function fromKit(app: Application, part: string, name: string, parent: SPEObject, position: Vector) {
  const source = app.findObjectByName(KIT) && app.findObjectByName(`${KIT}.${part}`);
  if (!source) return null;
  const copy = await app.cloneObject(source, { name, parent, position });
  copy.visible = true;
  return copy;
}

async function buildStation(app: Application, parent: SPEObject, station: Station) {
  const group = await app.createObject("Group", { name: `Wordplay.World.Station.${station.moduleId}`, parent, position: [station.x, 0, station.z] });
  const make: Make = (type, name, options) => app.createObject(type, { name: `Wordplay.World.${station.moduleId}.${name}`, parent: group, castShadow: false, receiveShadow: false, ...options });
  const crafted = await fromKit(app, `Landmark.${station.landmark}`, `Wordplay.World.${station.moduleId}.Landmark`, group, [0, 0, 0]);
  if (!crafted) await buildLandmark(make, station);
  const halo = await make("Torus", "Halo", { width: 240, height: 240, depth: 24, position: [0, 470, 0], rotation: [90, 0, 0], visible: false, material: { color: station.pedestal === sky ? clay : sky, roughness: 0.35 } });
  const ring = await make("Torus", "Reach", { width: WORLD.reach * 2, height: WORLD.reach * 2, depth: 16, position: [0, 6, 0], rotation: [90, 0, 0], visible: false, material: { color: station.pedestal === sky ? clay : sky, roughness: 0.6 } });
  return { halo, ring };
}

async function buildLandmark(make: Make, station: Station) {
  const top = 44;
  const r = WORLD.pedestal;
  await make("Cylinder", "Pedestal", { width: r * 2, depth: r * 2, height: top, radiusTop: r, radiusBottom: r, position: [0, top / 2, 0], material: { color: station.pedestal, roughness: 0.7 } });
  const color = { color: station.accent, roughness: 0.45 };
  if (station.landmark === "stack") {
    const slabs: [number, number, string][] = [[300, 0, paper], [270, 12, station.accent], [240, -9, sky]];
    for (const [index, [width, turn, tone]] of slabs.entries()) await make("Cube", `Slab.${index}`, { width, height: 56, depth: width * 0.66, cornerRadius: 12, position: [0, top + 30 + index * 62, 0], rotation: [0, turn, 0], material: { color: tone, roughness: 0.55 } });
  } else if (station.landmark === "brackets") {
    for (const side of [-1, 1]) {
      await make("Cube", `Bracket.${side}.Bar`, { width: 46, height: 320, depth: 46, cornerRadius: 10, position: [side * 130, top + 160, 0], material: color });
      for (const level of [top + 23, top + 297]) await make("Cube", `Bracket.${side}.Arm.${level}`, { width: 110, height: 46, depth: 46, cornerRadius: 10, position: [side * 95, level, 0], material: color });
    }
  } else if (station.landmark === "scale") {
    await make("Cylinder", "Post", { width: 36, depth: 36, height: 320, radiusTop: 18, radiusBottom: 18, position: [0, top + 160, 0], material: color });
    await make("Cube", "Beam", { width: 440, height: 24, depth: 24, cornerRadius: 8, position: [0, top + 320, 0], material: color });
    for (const side of [-1, 1]) {
      await make("Cylinder", `Cord.${side}`, { width: 8, depth: 8, height: 100, radiusTop: 4, radiusBottom: 4, position: [side * 200, top + 270, 0], material: color });
      await make("Cylinder", `Pan.${side}`, { width: 170, depth: 170, height: 16, radiusTop: 85, radiusBottom: 70, position: [side * 200, top + 212, 0], material: { color: sky, roughness: 0.5 } });
    }
  } else if (station.landmark === "globe") {
    await make("Sphere", "Globe", { width: 300, height: 300, depth: 300, position: [0, top + 180, 0], material: { color: paper, roughness: 0.5 } });
    await make("Torus", "Orbit", { width: 420, height: 420, depth: 18, position: [0, top + 180, 0], rotation: [70, 0, 20], material: { color: station.accent, roughness: 0.4 } });
  } else {
    await make("Star", "Star", { width: 330, height: 330, depth: 64, spikes: 5, innerRadiusPercent: 48, cornerRadius: 16, position: [0, top + 190, 0], material: color });
  }
}

export async function createWorldScene(app: Application, subject: string) {
  const root = app.findObjectByName(subject);
  if (!root) throw new Error(`The scene is missing ${subject}.`);
  const studio = app.findObjectByName("Wordplay.Studio.PaperGround");
  if (studio) studio.visible = false;
  const stage = await app.createObject("Group", { name: "Wordplay.World.Stage", position: STAGE_POSITION, rotation: degrees(STAGE_ROTATION) });
  const tilt = await app.createObject("Group", { name: "Wordplay.World.Tilt", parent: stage, rotation: degrees([TILT, 0, 0]) });
  const map = await app.createObject("Group", { name: "Wordplay.World.Map", parent: tilt });
  const make = (type: string, name: string, options: Record<string, unknown>, parent = map) => app.createObject(type, { name: `Wordplay.World.${name}`, parent, castShadow: false, receiveShadow: false, ...options });
  const island = WORLD.radius + 160;
  await make("Cylinder", "Island", { width: island * 2, depth: island * 2, height: 40, radiusTop: island, radiusBottom: island, position: [0, -20, 0], material: { color: paper, roughness: 0.9 } });
  await make("Cylinder", "Cliff", { width: island * 2, depth: island * 2, height: 280, radiusTop: island - 6, radiusBottom: island - 260, position: [0, -180, 0], material: { color: slate, roughness: 0.8 } });
  await make("Cylinder", "Cliff.Band", { width: island * 2 + 10, depth: island * 2 + 10, height: 26, radiusTop: island + 2, radiusBottom: island - 8, position: [0, -52, 0], material: { color: rust, roughness: 0.7 } });
  await make("Torus", "Coast", { width: island * 2, height: island * 2, depth: 34, position: [0, 0, 0], rotation: [90, 0, 0], material: { color: clay, roughness: 0.6 } });
  await make("Torus", "Spawn", { width: 500, height: 500, depth: 20, position: [0, 4, 0], rotation: [90, 0, 0], material: { color: sky, roughness: 0.6 } });
  for (const station of stations) {
    const length = Math.hypot(station.x, station.z) - WORLD.pedestal - 250;
    const angle = Math.atan2(station.x, station.z);
    const middle = 250 + length / 2;
    await make("Cube", `Path.${station.moduleId}`, { width: 84, height: 6, depth: length, cornerRadius: 3, position: [Math.sin(angle) * middle, 3, Math.cos(angle) * middle], rotation: [0, (angle * 180) / Math.PI, 0], material: { color: PATH, roughness: 0.9 } });
  }
  const halos = new Map<string, Marker>();
  const rings = new Map<string, Marker>();
  for (const station of stations) {
    const { halo, ring } = await buildStation(app, map, station);
    halos.set(station.moduleId, { object: halo, shown: false });
    rings.set(station.moduleId, { object: ring, shown: false });
  }
  await Promise.all(trees.map(async (tree, index) => {
    if (await fromKit(app, `Tree.${(index % 3) + 1}`, `Wordplay.World.Tree.${index}`, map, [tree.x, 0, tree.z])) return;
    const style = index % 3;
    const trunk = style === 1 ? 110 : 50;
    await make("Cylinder", `Tree.${index}.Trunk`, { width: 30, depth: 30, height: trunk, radiusTop: 13, radiusBottom: 16, position: [tree.x, trunk / 2, tree.z], material: { color: ink, roughness: 0.8 } });
    if (style === 0) await make("Cylinder", `Tree.${index}.Crown`, { width: 160, depth: 160, height: tree.height, radiusTop: 2, radiusBottom: 80, position: [tree.x, trunk + tree.height / 2, tree.z], material: { color: tree.color, roughness: 0.7 } });
    else if (style === 1) await make("Sphere", `Tree.${index}.Crown`, { width: 190, height: 180, depth: 190, position: [tree.x, trunk + 80, tree.z], material: { color: tree.color, roughness: 0.65 } });
    else for (const [level, width] of [[0, 180], [1, 130]]) await make("Cylinder", `Tree.${index}.Crown.${level}`, { width, depth: width, height: 130, radiusTop: 2, radiusBottom: width / 2, position: [tree.x, trunk + 60 + level * 80, tree.z], material: { color: tree.color, roughness: 0.7 } });
  }));
  await Promise.all(tufts.map((tuft, index) => make("Sphere", `Tuft.${index}`, { width: tuft.size, height: tuft.size * 0.42, depth: tuft.size * 0.8, position: [tuft.x, 6, tuft.z], material: { color: tuft.color, roughness: 0.9 } })));
  const tokens: Token[] = await Promise.all(wordTokens.map(async (token, index) => ({
    term: token.term,
    phase: index * 0.7,
    shown: true,
    object: await fromKit(app, `Word.${(index % 3) + 1}`, `Wordplay.World.Word.${index}`, map, [token.x, 150, token.z]) ?? await make("Cube", `Word.${index}`, { width: 116, height: 116, depth: 116, cornerRadius: 28, position: [token.x, 150, token.z], rotation: [45, 0, 45], material: { color: token.color, roughness: 0.4 } })
  })));
  await make("Cylinder", "Player.Shadow", { width: 330, depth: 330, height: 3, radiusTop: 165, radiusBottom: 165, position: [0, 3, 0], material: { color: "#DCC6B1", roughness: 1 } }, tilt);
  const player = await app.cloneObject(root, { name: "Wordplay.World.Player", parent: tilt, position: [0, PLAYER_Y, 0] });
  player.scale.x = player.scale.y = player.scale.z = PLAYER_SCALE;
  root.visible = false;
  await app.createObject("PointLight", { name: "Wordplay.World.Lamp", parent: tilt, position: [260, 760, 420], color: paper, intensity: 0.9, distance: 2600 });
  const parts = await buildMissionParts(app, map, tilt);
  hideKit(app);
  return new WorldScene(app, map, player, tokens, halos, rings, parts);
}
