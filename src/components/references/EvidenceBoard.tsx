"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardChapter, ExplorerGroup, Focus } from "./ReferencesExplorer";

const HEAD = 1.7;
const GAP = 0.8;
const moves: Record<string, (index: number, last: number) => number> = { ArrowDown: (index) => index + 1, ArrowUp: (index) => index - 1, Home: () => 0, End: (_, last) => last };

function stack(counts: number[], item: number) {
  let y = 0;
  return counts.map((count, index) => {
    const top = y;
    const height = HEAD + count * item;
    y += height + (index < counts.length - 1 ? GAP : 0);
    return { top, height };
  });
}

function roam(event: React.KeyboardEvent<HTMLElement>) {
  const move = moves[event.key];
  const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(".board-node"));
  const index = nodes.indexOf(document.activeElement as HTMLButtonElement);
  if (!move || index < 0) return;
  event.preventDefault();
  nodes[(move(index, nodes.length - 1) + nodes.length) % nodes.length].focus();
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function EvidenceBoard({ chapters, groups, pinned, pinnedLabel, onPin, onClear }: { chapters: BoardChapter[]; groups: ExplorerGroup[]; pinned: Focus; pinnedLabel: string; onPin: (focus: Focus) => void; onClear: () => void }) {
  const [preview, setPreview] = useState<Focus>(null);
  const [tabs, setTabs] = useState({ lesson: 0, source: 0 });
  const [ready, setReady] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const active = preview ?? pinned;

  useEffect(() => {
    setReady(true);
    const element = board.current;
    if (!element || !("IntersectionObserver" in window)) { setDrawn(true); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setDrawn(true); observer.disconnect(); } }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const sourceStack = stack(groups.map((group) => group.references.length), 1);
  const rows = sourceStack.length ? sourceStack[sourceStack.length - 1].top + sourceStack[sourceStack.length - 1].height : 0;
  const lessonTotal = chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  const lessonItem = (rows - chapters.length * HEAD - (chapters.length - 1) * GAP) / lessonTotal;
  const lessonStack = stack(chapters.map((chapter) => chapter.lessons.length), lessonItem);
  const lessonY = new Map(chapters.flatMap((chapter, group) => chapter.lessons.map((lesson, index) => [lesson.key, lessonStack[group].top + HEAD + (index + 0.5) * lessonItem] as const)));
  const sourceY = new Map(groups.flatMap((group, position) => group.references.map((reference, index) => [reference.id, sourceStack[position].top + HEAD + index + 0.5] as const)));
  const strings = groups.flatMap((group) => group.references.flatMap((reference) => reference.links.filter((key) => lessonY.has(key)).map((key) => {
    const from = lessonY.get(key)!;
    const to = sourceY.get(reference.id)!;
    return { lesson: key, source: reference.id, d: `M0 ${from.toFixed(3)} C 430 ${from.toFixed(3)}, 570 ${to.toFixed(3)}, 1000 ${to.toFixed(3)}` };
  })));
  const touches = (string: { lesson: string; source: string }) => !!active && (active.type === "lesson" ? string.lesson === active.key : string.source === active.key);
  const litLessons = new Set(strings.filter(touches).map((string) => string.lesson));
  const litSources = new Set(strings.filter(touches).map((string) => string.source));
  if (active) (active.type === "lesson" ? litLessons : litSources).add(active.key);
  const sourceCount = (key: string) => strings.filter((string) => string.lesson === key).length;
  const lessonCount = (id: string) => strings.filter((string) => string.source === id).length;
  const pinnedCount = pinned ? (pinned.type === "lesson" ? sourceCount(pinned.key) : lessonCount(pinned.key)) : 0;
  const hover = (focus: Focus) => ({ onMouseEnter: () => setPreview(focus), onMouseLeave: () => setPreview(null), onBlur: () => setPreview(null) });
  let lessonIndex = -1;
  let sourceIndex = -1;

  return <section className="evidence" aria-labelledby="evidence-title"><div className="shell"><h2 id="evidence-title">Follow a fact to its source.</h2><p className="evidence-intro">Choose a lesson or a source. Its connections light up, and the list below narrows to match.</p><div ref={board} className="board" data-active={!!active} data-ready={ready} data-drawn={drawn} style={{ "--rows": rows } as React.CSSProperties}><div className="board-column board-lessons" role="group" aria-label="Lessons" onKeyDown={roam}>{chapters.map((chapter, group) => <div key={chapter.id} className="board-group" style={{ "--y": lessonStack[group].top, "--h": lessonStack[group].height } as React.CSSProperties}><p className="board-heading">{chapter.label}</p><div className="board-items">{chapter.lessons.map((lesson, index) => {
    const position = ++lessonIndex;
    const focus = { type: "lesson" as const, key: lesson.key };
    const count = sourceCount(lesson.key);
    return <button key={lesson.key} type="button" className="board-node" style={{ "--y": HEAD + index * lessonItem, "--h": lessonItem } as React.CSSProperties} data-lit={litLessons.has(lesson.key)} data-current={active?.type === "lesson" && active.key === lesson.key} aria-pressed={pinned?.type === "lesson" && pinned.key === lesson.key} tabIndex={position === tabs.lesson ? 0 : -1} onFocus={() => { setTabs((current) => ({ ...current, lesson: position })); setPreview(focus); }} onClick={() => onPin(focus)} {...hover(focus)}><span className="board-label"><span className="board-index">{String(lesson.number).padStart(2, "0")}</span> {lesson.title}</span><span className="board-count" aria-hidden="true">{count}</span><span className="sr-only">, {plural(count, "source")}</span><span className="board-dot" aria-hidden="true" /></button>;
  })}</div></div>)}</div><svg className="board-strings" viewBox={`0 0 1000 ${rows}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">{strings.map((string) => <path key={`${string.lesson}>${string.source}`} d={string.d} data-lit={touches(string)} />)}</svg><div className="board-column board-sources" role="group" aria-label="Sources" onKeyDown={roam}>{groups.map((group, position) => <div key={group.id} className="board-group" style={{ "--y": sourceStack[position].top, "--h": sourceStack[position].height } as React.CSSProperties}><p className="board-heading">{group.label}</p><div className="board-items">{group.references.map((reference, index) => {
    const order = ++sourceIndex;
    const focus = { type: "source" as const, key: reference.id };
    return <button key={reference.id} type="button" className="board-node" style={{ "--y": HEAD + index, "--h": 1 } as React.CSSProperties} data-lit={litSources.has(reference.id)} data-current={active?.type === "source" && active.key === reference.id} aria-pressed={pinned?.type === "source" && pinned.key === reference.id} tabIndex={order === tabs.source ? 0 : -1} onFocus={() => { setTabs((current) => ({ ...current, source: order })); setPreview(focus); }} onClick={() => onPin(focus)} {...hover(focus)}><span className="board-dot" aria-hidden="true" /><span className="board-label"><span className="board-index">{String(reference.number).padStart(2, "0")}</span> {reference.short}</span><span className="sr-only">, supports {plural(lessonCount(reference.id), "lesson")}</span></button>;
  })}</div></div>)}</div></div><div className="board-status">{pinned ? <><p><strong>{pinnedLabel}</strong> {pinned.type === "lesson" ? `is backed by ${plural(pinnedCount, "source")}.` : `supports ${plural(pinnedCount, "lesson")}.`}</p><a href="#source-directory" className="text-link">See {pinned.type === "lesson" && pinnedCount !== 1 ? "them" : "it"} in the list <span aria-hidden="true">↓</span></a><button type="button" className="board-clear" onClick={onClear}>Clear</button></> : <p>{`${plural(strings.length, "connection")} across ${plural(sourceY.size, "source")}. Every lesson is backed by at least one.`}</p>}</div></div></section>;
}
