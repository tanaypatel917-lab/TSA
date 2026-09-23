"use client";

import { useCallback, useMemo, useState } from "react";
import type { Reference } from "@/content/references";
import { EvidenceBoard } from "./EvidenceBoard";
import { SourceDirectory } from "./SourceDirectory";

export type BoardLesson = { key: string; title: string; number: number };
export type BoardChapter = { id: string; label: string; lessons: BoardLesson[] };
export type ExplorerReference = Reference & { number: number; links: string[]; used: { href: string; title: string }[] };
export type ExplorerGroup = { id: string; title: string; label: string; description: string; references: ExplorerReference[] };
export type Focus = { type: "lesson" | "source"; key: string } | null;

export function ReferencesExplorer({ chapters, groups, checkedOn }: { chapters: BoardChapter[]; groups: ExplorerGroup[]; checkedOn: string }) {
  const [pinned, setPinned] = useState<Focus>(null);
  const references = useMemo(() => groups.flatMap((group) => group.references), [groups]);
  const lessons = useMemo(() => new Map(chapters.flatMap((chapter) => chapter.lessons.map((lesson) => [lesson.key, lesson.title] as const))), [chapters]);
  const pin = useCallback((focus: Focus) => setPinned((current) => focus && current?.type === focus.type && current.key === focus.key ? null : focus), []);
  const clear = useCallback(() => setPinned(null), []);
  const pinnedSources = pinned && (pinned.type === "lesson" ? references.filter((reference) => reference.links.includes(pinned.key)).map((reference) => reference.id) : [pinned.key]);
  const pinnedLabel = pinned ? (pinned.type === "lesson" ? lessons.get(pinned.key) : references.find((reference) => reference.id === pinned.key)?.short) ?? "" : "";
  return <><EvidenceBoard chapters={chapters} groups={groups} pinned={pinned} pinnedLabel={pinnedLabel} onPin={pin} onClear={clear} /><SourceDirectory groups={groups} pinned={pinned} pinnedSources={pinnedSources} pinnedLabel={pinnedLabel} onClear={clear} checkedOn={checkedOn} /></>;
}
