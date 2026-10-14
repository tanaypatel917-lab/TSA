"use client";

import { Fragment, useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { glossary } from "@/content/glossary";
import { WORD_MAP_GROUPS, WORD_MAP_GROUP_CENTERS, type WordMapGroupId, type WordMapTone } from "@/content/wordMap";
import { layoutWordMap, nearest, type WordMapPoint } from "@/engine/wordMap";
import { termSlug } from "@/engine/glossary";
import { useMotionPreference } from "./MotionPreferences";
import { WordMapStage } from "./three/WordMapStage";

const CAPTION = "Models store words as points in space. Words used in similar ways end up close together. This map is hand-placed by topic in three dimensions; real models use hundreds of dimensions and learn the positions from data.";
const TONE_COLORS: Record<WordMapTone, string> = {
  sky: "#AFCBE3",
  clay: "#DD8962",
  lake: "#5F86BA",
  ink: "#1C2A43"
};
const MAP_CENTER = { x: 320, y: 260 };
const MAP_SCALE = 100;

function project(point: { x: number; y: number }) {
  return { x: MAP_CENTER.x + point.x * MAP_SCALE, y: MAP_CENTER.y - point.y * MAP_SCALE };
}

function groupLabel(id: WordMapGroupId) {
  return WORD_MAP_GROUPS.find((group) => group.id === id)!;
}

function MapFallback({ points, selected, links, onSelect, compact }: {
  points: WordMapPoint[];
  selected: string;
  links: string[];
  onSelect: (term: string) => void;
  compact: boolean;
}) {
  const selectedPoint = points.find((point) => point.term === selected)!;
  const origin = project(selectedPoint);
  const positioned = points.map((point) => ({ ...point, ...project(point) }));

  const activate = (event: KeyboardEvent<SVGGElement>, term: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(term);
    }
  };

  return <svg className="word-map-fallback" viewBox="0 0 640 520" role="group" aria-label="Two-dimensional projection of the Word Map">
    <g aria-hidden="true">
      {WORD_MAP_GROUPS.map((group) => {
        const center = project({ x: WORD_MAP_GROUP_CENTERS[group.id][0], y: WORD_MAP_GROUP_CENTERS[group.id][1] });
        const radius = 0.86 * MAP_SCALE;
        const compactLabelOffset = compact ? group.id === "models" ? 4 : group.id === "data" ? -24 : 0 : 0;
        const compactLabelXOffset = compact && group.id === "data" ? 8 : 0;
        return <g key={group.id}>
          <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke={TONE_COLORS[group.tone]} strokeWidth="2" strokeDasharray="3 9" opacity=".25" />
          <text className="word-map-cluster-label" x={center.x + compactLabelXOffset} y={center.y - radius - 12 + compactLabelOffset} textAnchor="middle">{group.label}</text>
        </g>;
      })}
      {links.map((term) => {
        const neighbor = positioned.find((point) => point.term === term)!;
        return <line key={term} x1={origin.x} y1={origin.y} x2={neighbor.x} y2={neighbor.y} />;
      })}
    </g>
    {positioned.map((point) => {
      const group = groupLabel(point.group);
      const depth = (point.z + 3.5) / 7;
      const radius = 5 + depth * 2;
      const isSelected = point.term === selected;
      const linked = links.includes(point.term);
      const termIndex = group.terms.findIndex((term) => term === point.term);
      const textAnchor = point.x > MAP_CENTER.x + 24 ? "end" : point.x < MAP_CENTER.x - 24 ? "start" : "middle";
      const textX = point.x + (textAnchor === "start" ? 10 : textAnchor === "end" ? -10 : 0) + (compact && point.term === "Verification" ? 12 : 0);
      const row = Math.floor(termIndex / 2);
      const rowOffset = compact
        ? group.id === "models" ? [-28, 28, 24, 40][row] ?? 0 : row % 2 === 0 ? -28 : 28
        : 0;
      const textY = point.y + (point.y < MAP_CENTER.y ? -12 : 22)
        + rowOffset
        + (compact ? (group.id === "use" ? 55 : 0) + (termIndex % 2 === 0 ? -18 : 18) : 0);
      return <g key={point.term} className="word-map-node" role="button" tabIndex={0} aria-label={`Select ${point.term}${isSelected ? ", selected" : ""}`} aria-pressed={isSelected} onClick={() => onSelect(point.term)} onKeyDown={(event) => activate(event, point.term)} style={{ opacity: 0.58 + depth * 0.42 }}>
        <circle cx={point.x} cy={point.y} r={radius + (isSelected ? 7 : linked ? 4 : 0)} fill="none" stroke={isSelected ? "var(--clay)" : linked ? "var(--ink)" : "transparent"} strokeWidth={isSelected ? 4 : 2} />
        <circle cx={point.x} cy={point.y} r={radius} fill={TONE_COLORS[group.tone]} stroke="var(--ink)" strokeWidth="2" />
        <text className={isSelected ? "word-map-node-label is-selected" : "word-map-node-label"} x={textX} y={textY} textAnchor={textAnchor}>{point.term}</text>
      </g>;
    })}
  </svg>;
}

export function WordMap({ onBrowse }: { onBrowse: (term: string) => void }) {
  const points = useMemo(() => layoutWordMap(), []);
  const [selected, setSelected] = useState("Token");
  const [smallScreen, setSmallScreen] = useState(false);
  const [threeReady, setThreeReady] = useState(false);
  const { reduced } = useMotionPreference();
  const selectedPoint = points.find((point) => point.term === selected)!;
  const entry = glossary.find((item) => item.term === selected)!;
  const group = groupLabel(selectedPoint.group);
  const neighbors = useMemo(() => nearest(points, selected), [points, selected]);
  const linkedTerms = neighbors.map((point) => point.term);
  const onStageReady = useCallback((ready: boolean) => setThreeReady(ready), []);
  const canUseThree = !smallScreen && !reduced;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setSmallScreen(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return <section className="word-map-view" aria-labelledby="word-map-heading">
    <h2 id="word-map-heading">Word map</h2>
    <div className="word-map-main">
      <div className="word-map-stage" data-3d={canUseThree && threeReady}>
        <MapFallback points={points} selected={selected} links={linkedTerms} onSelect={setSelected} compact={smallScreen} />
        {canUseThree && <WordMapStage points={points} selected={selected} onSelect={setSelected} onReady={onStageReady} />}
        <p className="word-map-stage-hint">{canUseThree ? "Drag · hover · select" : "Select any term"}</p>
      </div>
      <aside className="word-map-detail" aria-live="polite">
        <span className="word-map-group-chip" data-tone={group.tone}>{group.label}</span>
        <h3>{selected}</h3>
        <p className="word-map-definition">{entry.definition}</p>
        <p className="word-map-nearest"><span>Nearest:</span> {neighbors.map((neighbor, index) => <Fragment key={neighbor.term}>{index > 0 && <span aria-hidden="true"> · </span>}<button type="button" onClick={() => setSelected(neighbor.term)}>{neighbor.term}</button></Fragment>)}</p>
        <a className="word-map-browse-link" href={`#term-${termSlug(selected)}`} onClick={() => onBrowse(selected)}>Find {selected} in Browse <span aria-hidden="true">↗</span></a>
      </aside>
    </div>
    <p className="word-map-caption">{CAPTION}</p>
    <div className="word-map-groups" aria-label="Select a glossary term">
      {WORD_MAP_GROUPS.map((category) => <section key={category.id} className="word-map-term-group" aria-labelledby={`word-map-group-${category.id}`}>
        <h3 id={`word-map-group-${category.id}`}><span className="word-map-group-chip" data-tone={category.tone}>{category.label}</span></h3>
        <div>{category.terms.map((term) => <button key={term} type="button" aria-pressed={selected === term} onClick={() => setSelected(term)}>{term}</button>)}</div>
      </section>)}
    </div>
  </section>;
}
