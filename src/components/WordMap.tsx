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
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [focusedTerm, setFocusedTerm] = useState<string | null>(null);
  const selectedPoint = points.find((point) => point.term === selected)!;
  const origin = project(selectedPoint);
  const positioned = points.map((point) => ({ ...point, ...project(point) }));
  const fontSize = compact ? 22 : 17;
  const clusterFontSize = compact ? 22 : 13;
  const clusterSquare = compact ? 18 : 10;
  const clusterGap = compact ? 7 : 5;
  const clusterHeaders = WORD_MAP_GROUPS.map((group) => {
    const members = positioned.filter((point) => point.group === group.id);
    const top = members.reduce((current, point) => point.y < current.y ? point : current);
    const textWidth = group.label.length * clusterFontSize * 0.69;
    const width = textWidth + clusterSquare + clusterGap;
    const center = project({ x: WORD_MAP_GROUP_CENTERS[group.id][0], y: WORD_MAP_GROUP_CENTERS[group.id][1] });
    const baseline = top.y - (compact ? 42 : 22);
    const bounds = {
      x: center.x - width / 2,
      y: baseline - clusterFontSize * 0.9,
      width,
      height: clusterFontSize * 1.2
    };

    return { group, bounds, baseline, center };
  });
  const visibleTerms = [...new Set([selected, ...links, hoveredTerm, focusedTerm].filter((term): term is string => term !== null))];
  const placedLabels: Array<{ term: string; textX: number; baseline: number; textAnchor: "start" | "end"; rectX: number; rectY: number; rectWidth: number; rectHeight: number; isSelected: boolean; linked: boolean }> = [];
  const labelObstacles = clusterHeaders.map(({ bounds }) => bounds);
  const labelHeight = fontSize * 1.2;
  const labelStep = labelHeight + 8;

  for (const term of visibleTerms) {
    const point = positioned.find((item) => item.term === term);
    if (!point) continue;

    const textAnchor = point.x > MAP_CENTER.x ? "end" : "start";
    const textX = point.x + (textAnchor === "end" ? -9 : 9);
    const textWidth = point.term.length * fontSize * 0.68;
    const rectWidth = textWidth + 14;
    const rectHeight = labelHeight;
    const rectX = textAnchor === "end" ? textX - textWidth - 7 : textX - 7;
    const baseY = point.y + fontSize * 0.35;
    const offsets = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5].map((step) => step * labelStep);
    const baseline = offsets
      .map((offset) => baseY + offset)
      .find((candidate) => {
        const rectY = candidate - fontSize * 0.9;
        const bounds = { x: rectX, y: rectY, width: rectWidth, height: rectHeight };
        const inViewBox = bounds.x >= 4 && bounds.x + bounds.width <= 636 && bounds.y >= 4 && bounds.y + bounds.height <= 516;
        return inViewBox && !labelObstacles.some((obstacle) =>
          bounds.x < obstacle.x + obstacle.width && bounds.x + bounds.width > obstacle.x &&
          bounds.y < obstacle.y + obstacle.height && bounds.y + bounds.height > obstacle.y
        );
      });

    if (baseline === undefined) continue;
    const rectY = baseline - fontSize * 0.9;
    const bounds = { x: rectX, y: rectY, width: rectWidth, height: rectHeight };
    labelObstacles.push(bounds);
    placedLabels.push({
      term,
      textX,
      baseline,
      textAnchor,
      rectX,
      rectY,
      rectWidth,
      rectHeight,
      isSelected: term === selected,
      linked: links.includes(term)
    });
  }

  const activate = (event: KeyboardEvent<SVGGElement>, term: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(term);
    }
  };

  return <svg className={`word-map-fallback${compact ? " is-compact" : ""}`} viewBox="0 0 640 520" role="group" aria-label="Two-dimensional projection of the Word Map">
    <g aria-hidden="true">
      {WORD_MAP_GROUPS.map((group) => {
        const header = clusterHeaders.find(({ group: item }) => item.id === group.id)!;
        return <g key={group.id}>
          <circle cx={header.center.x} cy={header.center.y} r={0.86 * MAP_SCALE} fill="none" stroke={TONE_COLORS[group.tone]} strokeWidth="2" strokeDasharray="3 9" opacity=".25" />
          <rect x={header.bounds.x} y={header.baseline - clusterSquare + 2} width={clusterSquare} height={clusterSquare} fill={TONE_COLORS[group.tone]} />
          <text className="word-map-cluster-label" x={header.bounds.x + clusterSquare + clusterGap} y={header.baseline}>{group.label.toUpperCase()}</text>
        </g>;
      })}
      {links.map((term) => {
        const neighbor = positioned.find((point) => point.term === term)!;
        return <line key={term} x1={origin.x} y1={origin.y} x2={neighbor.x} y2={neighbor.y} />;
      })}
    </g>
    {positioned.map((point) => {
      const group = groupLabel(point.group);
      const isSelected = point.term === selected;
      const linked = links.includes(point.term);
      return <g key={point.term} className="word-map-node" role="button" tabIndex={0} aria-label={`Select ${point.term}${isSelected ? ", selected" : ""}`} aria-pressed={isSelected} onClick={() => onSelect(point.term)} onKeyDown={(event) => activate(event, point.term)} onMouseEnter={() => setHoveredTerm(point.term)} onMouseLeave={() => setHoveredTerm(null)} onFocus={() => setFocusedTerm(point.term)} onBlur={() => setFocusedTerm(null)}>
        <title>{point.term}</title>
        {(isSelected || linked) && <circle className="word-map-node-ring" cx={point.x} cy={point.y} r={isSelected ? 11 : 8} fill="none" stroke={isSelected ? "var(--clay)" : "var(--ink)"} strokeWidth={isSelected ? 3 : 2} />}
        <circle className="word-map-node-dot" cx={point.x} cy={point.y} r="5" fill={TONE_COLORS[group.tone]} stroke="var(--ink)" strokeWidth="1.5" />
        <circle className="word-map-node-hit" cx={point.x} cy={point.y} r="14" fill="transparent" />
      </g>;
    })}
    <g className="word-map-fallback-labels" aria-hidden="true">
      {placedLabels.map((label) => <g key={label.term}>
        <rect className={`word-map-node-label-bg${label.isSelected ? " is-selected" : label.linked ? " is-neighbor" : ""}`} x={label.rectX} y={label.rectY} width={label.rectWidth} height={label.rectHeight} rx="3" />
        <text className={`word-map-node-label${label.isSelected ? " is-selected" : ""}`} x={label.textX} y={label.baseline} textAnchor={label.textAnchor}>{label.term}</text>
      </g>)}
    </g>
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
