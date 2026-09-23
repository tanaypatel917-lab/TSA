import type { CSSProperties } from "react";
import { moduleVisuals } from "@/content/visuals";
import { WORLD, stations, trees, wordTokens, type WordToken } from "@/content/world";
import { modules } from "@/content";
import { introPalette } from "@/content/intro";

const SPAN = WORLD.radius + 200;
const at = (value: number) => `${((value + SPAN) / (SPAN * 2)) * 100}%`;
const title = (id: string) => modules.find((module) => module.id === id)?.title ?? id;

type Props = {
  variant: "mini" | "full";
  collected: ReadonlySet<string>;
  stamped: ReadonlySet<string>;
  player?: { x: number; z: number; heading: number };
  near?: string | null;
  onStation?: (id: string) => void;
  onWord?: (token: WordToken) => void;
};

export function WorldMap({ variant, collected, stamped, player, near, onStation, onWord }: Props) {
  const full = variant === "full";
  return <div className={`world-map is-${variant}`} aria-hidden={full ? undefined : true}>
    <svg viewBox={`${-SPAN} ${-SPAN} ${SPAN * 2} ${SPAN * 2}`} aria-hidden="true" focusable="false">
      <circle r={WORLD.radius + 160} className="map-island" />
      {stations.map((station) => <line key={station.moduleId} x1={0} y1={0} x2={station.x} y2={station.z} className="map-path" />)}
      <circle r={250} className="map-spawn" />
      {trees.map((tree, index) => <path key={index} d={`M${tree.x - 60} ${tree.z + 50}L${tree.x} ${tree.z - 70}L${tree.x + 60} ${tree.z + 50}Z`} className="map-tree" style={{ fill: tree.color }} />)}
      {!full && wordTokens.filter((token) => !collected.has(token.term)).map((token) => <rect key={token.term} x={token.x - 55} y={token.z - 55} width={110} height={110} rx={24} className="map-word" style={{ fill: token.color }} />)}
      {!full && stations.map((station) => <circle key={station.moduleId} cx={station.x} cy={station.z} r={near === station.moduleId ? 300 : 230} className="map-station" data-stamped={stamped.has(station.moduleId)} style={{ fill: station.pedestal }} />)}
      {player && <g transform={`translate(${player.x} ${player.z}) rotate(${180 - (player.heading * 180) / Math.PI})`}><path d="M0 -190L140 150L0 80L-140 150Z" className="map-player" /></g>}
    </svg>
    {full && <>
      {wordTokens.map((token) => {
        const got = collected.has(token.term);
        return <button key={token.term} type="button" className="map-word-button" data-collected={got} style={{ left: at(token.x), top: at(token.z), "--token": token.color } as CSSProperties} aria-label={`Word: ${token.term}${got ? ", collected" : ""}`} onClick={() => onWord?.(token)}><span aria-hidden="true" /></button>;
      })}
      {stations.map((station) => {
        const done = stamped.has(station.moduleId);
        return <button key={station.moduleId} type="button" className="map-station-button" data-stamped={done} data-dark={station.pedestal === introPalette.ink} style={{ left: at(station.x), top: at(station.z), "--pedestal": station.pedestal } as CSSProperties} aria-label={`Station ${station.number}: ${title(station.moduleId)}${done ? ", stamped" : ""}`} onClick={() => onStation?.(station.moduleId)}><span aria-hidden="true">{done ? "✓" : moduleVisuals[station.moduleId].mark}</span></button>;
      })}
    </>}
  </div>;
}
