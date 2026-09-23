"use client";

import Link from "next/link";
import type { Module } from "@/content/types";
import { activityLabels, moduleVisuals } from "@/content/visuals";
import { chapterMinutes, chapterProgress } from "@/engine/chapters";
import { useProgress } from "@/state/ProgressProvider";

export function ChapterIndex({ modules }: { modules: Module[] }) {
  const { state, hydrated } = useProgress();
  return <ol className="chapter-index">{modules.map((module, index) => {
    const visual = moduleVisuals[module.id];
    const progress = hydrated ? chapterProgress(state, module) : null;
    return <li key={module.id} data-reveal={index}><Link href={`/modules/${module.slug}`} className="chapter-row"><span className="chapter-number">{String(index + 1).padStart(2, "0")}</span><span className="chapter-question">{visual.question}</span><span className="chapter-meta"><strong>{module.title}</strong><span>{module.tagline}</span></span><span className="chapter-row-facts"><span>{module.lessons.length} lessons · {chapterMinutes(module)} min</span><span>{activityLabels[module.activity.kind]} · Quiz</span>{progress && <span className="chapter-status" data-state={progress.status}>{progress.label}</span>}</span><span className="chapter-mark" aria-hidden="true">{visual.mark}</span><span className="chapter-arrow" aria-hidden="true">↗</span></Link></li>;
  })}</ol>;
}
