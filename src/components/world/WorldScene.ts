import type { Application, SPEObject } from "@splinetool/runtime";
import { introPalette } from "@/content/intro";
import { WORLD, stations, trees, wordTokens, type Station } from "@/content/world";
import { MOVE, type Mover } from "@/engine/world";

type Vector = [number, number, number];
export type WorldFrame = { mover: Mover; time: number; collected: ReadonlySet<string>; stamped: ReadonlySet<string>; near: string | null };

const { ink, rose, paper, citron } = introPalette;
const STAGE_POSITION: Vector = [0, 118, 36];
const STAGE_ROTATION: Vector = [-0.2286, -0.4092, -0.0923];
const TILT = 0.95;
const ZOOM = 0.24;
const PLAYER_SCALE = 0.95;
const PLAYER_Y = 330;
const PATH = "#EAD9C6";
const degrees = (vector: Vector) => vector.map((angle) => (angle * 180) / Math.PI) as Vector;

type Token = { term: string; object: SPEObject; phase: number; shown: boolean };
type Marker = { object: SPEObject; shown: boolean };

export class WorldScene {
  private zoom = NaN;
  private written = { x: NaN, z: NaN, y: NaN };
  private pose = { yaw: 0, roll: 0, pitch: 0 };

  constructor(
    private readonly app: Application,
    private readonly map: SPEObject,
    private readonly player: SPEObject,
    private readonly tokens: Token[],
    private readonly halos: Map<string, Marker>,
    private readonly rings: Map<string, Marker>
  ) {}

  get objectCount() {
    return this.app.getAllObjects().filter((object) => object.name.startsWith("Wordplay.World")).length;
  }

  refresh() {
    this.zoom = NaN;
  }

  update({ mover, time, collected, stamped, near }: WorldFrame) {
    if (this.zoom !== ZOOM) { this.app.setZoom(ZOOM); this.zoom = ZOOM; }
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
      const shown = !collected.has(token.term);
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
      const shown = near === id;
      if (shown !== ring.shown) { ring.object.visible = ring.shown = shown; }
    }
    this.app.requestRender();
  }
}

export const KIT = "Wordplay.World.Kit";
type Make = (type: string, name: string, options: Record<string, unknown>) => Promise<SPEObject>;

async function fromKit(app: Application, part: string, name: string, parent: SPEObject, position: Vector) {
  const source = app.findObjectByName(`${KIT}.${part}`);
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
  const halo = await make("Torus", "Halo", { width: 240, height: 240, depth: 24, position: [0, 470, 0], rotation: [90, 0, 0], visible: false, material: { color: station.pedestal === citron ? rose : citron, roughness: 0.35 } });
  const ring = await make("Torus", "Reach", { width: WORLD.reach * 2, height: WORLD.reach * 2, depth: 16, position: [0, 6, 0], rotation: [90, 0, 0], visible: false, material: { color: station.pedestal === citron ? rose : citron, roughness: 0.6 } });
  return { halo, ring };
}

async function buildLandmark(make: Make, station: Station) {
  const top = 44;
  const r = WORLD.pedestal;
  await make("Cylinder", "Pedestal", { width: r * 2, depth: r * 2, height: top, radiusTop: r, radiusBottom: r, position: [0, top / 2, 0], material: { color: station.pedestal, roughness: 0.7 } });
  const color = { color: station.accent, roughness: 0.45 };
  if (station.landmark === "stack") {
    const slabs: [number, number, string][] = [[300, 0, paper], [270, 12, station.accent], [240, -9, citron]];
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
      await make("Cylinder", `Pan.${side}`, { width: 170, depth: 170, height: 16, radiusTop: 85, radiusBottom: 70, position: [side * 200, top + 212, 0], material: { color: citron, roughness: 0.5 } });
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
  await make("Cylinder", "Island", { width: island * 2, depth: island * 2, height: 90, radiusTop: island, radiusBottom: island - 60, position: [0, -45, 0], material: { color: paper, roughness: 0.9 } });
  await make("Torus", "Coast", { width: island * 2, height: island * 2, depth: 34, position: [0, 0, 0], rotation: [90, 0, 0], material: { color: rose, roughness: 0.6 } });
  await make("Torus", "Spawn", { width: 500, height: 500, depth: 20, position: [0, 4, 0], rotation: [90, 0, 0], material: { color: citron, roughness: 0.6 } });
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
    await make("Cylinder", `Tree.${index}.Trunk`, { width: 28, depth: 28, height: 50, radiusTop: 14, radiusBottom: 14, position: [tree.x, 25, tree.z], material: { color: ink, roughness: 0.8 } });
    await make("Cylinder", `Tree.${index}.Crown`, { width: 150, depth: 150, height: tree.height, radiusTop: 2, radiusBottom: 75, position: [tree.x, 50 + tree.height / 2, tree.z], material: { color: tree.color, roughness: 0.7 } });
  }));
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
  return new WorldScene(app, map, player, tokens, halos, rings);
}
