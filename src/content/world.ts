import { scatter, type Circle, type Point } from "@/engine/world";
import { glossary } from "./glossary";
import { introPalette } from "./intro";

export type Landmark = "stack" | "brackets" | "scale" | "globe" | "star";
export type Station = { moduleId: string; number: string; landmark: Landmark; pedestal: string; accent: string; x: number; z: number };
export type WordToken = { term: string; definition: string; color: string; x: number; z: number };
export type Tree = { x: number; z: number; color: string; height: number };

export const WORLD = { radius: 2200, ring: 1300, pedestal: 230, reach: 440, pickup: 130 };

const { ink, rose, citron, plum, berry } = introPalette;
const plan: [string, Landmark, string, string][] = [
  ["foundations", "stack", ink, rose],
  ["tools", "brackets", citron, ink],
  ["ethics", "scale", rose, ink],
  ["real-world", "globe", ink, citron],
  ["capstone", "star", citron, rose]
];

export const stations: Station[] = plan.map(([moduleId, landmark, pedestal, accent], index) => {
  const angle = -Math.PI / 2 + index * ((Math.PI * 2) / plan.length);
  return { moduleId, number: String(index + 1).padStart(2, "0"), landmark, pedestal, accent, x: Math.round(Math.cos(angle) * WORLD.ring), z: Math.round(Math.sin(angle) * WORLD.ring) };
});

export const obstacles: Circle[] = stations.map(({ x, z }) => ({ x, z, r: WORLD.pedestal }));

const spawn: Circle = { x: 0, z: 0, r: 380 };
const stationClearance: Circle[] = stations.map(({ x, z }) => ({ x, z, r: 520 }));
const pathClearance: Circle[] = stations.flatMap(({ x, z }) => Array.from({ length: 6 }, (_, index) => ({ x: (x * (index + 1)) / 7, z: (z * (index + 1)) / 7, r: 150 })));

export const wordTokens: WordToken[] = scatter(glossary.length, WORLD.radius, [...stationClearance, spawn]).map((point, index) => ({
  ...glossary[index],
  color: [rose, citron, plum][index % 3],
  ...point
}));

export const trees: Tree[] = scatter(18, WORLD.radius + 60, [...stationClearance, spawn, ...pathClearance, ...wordTokens.map(({ x, z }) => ({ x, z, r: 200 }))], 1.9, 640).map((point, index) => ({
  ...point,
  color: [rose, citron, plum, berry][index % 4],
  height: 150 + (index % 3) * 45
}));

export const GATE_REACH = 250;
export const CRATE_REACH = 150;
export const gateSpots: Point[] = [{ x: -660, z: 160 }, { x: 660, z: 160 }];
export const crateSpots: Point[] = scatter(14, WORLD.radius - 250, [...stationClearance, { ...spawn, r: 420 }, ...gateSpots.map((gate) => ({ ...gate, r: 420 }))], 0.9, 560);

export const tufts = scatter(12, WORLD.radius, [...stationClearance, spawn, ...pathClearance, ...gateSpots.map((gate) => ({ ...gate, r: 330 }))], 3.1, 500).flatMap((point, index) => [0, 1, 2].map((part) => ({
  x: point.x + [0, 70, -55][part],
  z: point.z + [0, 30, 45][part],
  size: [120, 86, 70][part],
  color: index % 2 ? "#E4EBB4" : "#F0D9DD"
})));
