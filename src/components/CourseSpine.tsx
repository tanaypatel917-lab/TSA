"use client";

import Link from "next/link";
import { useState } from "react";
import type { Module } from "@/content/types";
import { moduleVisuals } from "@/content/visuals";
import { chapterMinutes } from "@/engine/chapters";
import { useProgress } from "@/state/ProgressProvider";

type Focus = { title: string; detail: string } | null;

export function CourseSpine({ modules }: { modules: Module[] }) {
  const { state, hydrated } = useProgress();
  const [focus, setFocus] = useState<Focus>(null);
  const total = modules.reduce((sum, module) => sum + chapterMinutes(module), 0);
  const lessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const read = hydrated ? modules.reduce((sum, module) => sum + module.lessons.filter((lesson) => state.completedLessons.includes(`${module.id}/${lesson.id}`)).length, 0) : 0;
  const show = (value: Focus) => ({ onMouseEnter: () => setFocus(value), onMouseLeave: () => setFocus(null), onFocus: () => setFocus(value), onBlur: () => setFocus(null) });
  return <section className="spine" aria-labelledby="spine-title"><div className="shell"><h2 id="spine-title">The whole course, in one line.</h2><p className="spine-intro">Every block is a lesson, sized by its reading time. {read ? `You have read ${read} of ${lessons}.` : "Blocks fill in as you read."}</p><ol className="spine-track" style={{ "--columns": modules.map((module) => `${chapterMinutes(module)}fr`).join(" ") } as React.CSSProperties}>{modules.map((module, index) => <li key={module.id} className="spine-chapter"><p className="spine-label"><span>{String(index + 1).padStart(2, "0")}</span> {moduleVisuals[module.id].chapter}</p><ol className="spine-lessons" style={{ "--columns": module.lessons.map((lesson) => `${lesson.minutes}fr`).join(" ") } as React.CSSProperties}>{module.lessons.map((lesson, position) => {
    const done = hydrated && state.completedLessons.includes(`${module.id}/${lesson.id}`);
    const detail = `Chapter ${index + 1}, lesson ${position + 1}, ${lesson.minutes} min${done ? ", read" : ""}`;
    return <li key={lesson.id}><Link href={`/modules/${module.slug}/lessons/${lesson.id}`} className="spine-block" data-read={done} {...show({ title: lesson.title, detail })}><span className="sr-only">{lesson.title}, {detail}</span></Link></li>;
  })}</ol></li>)}</ol><p className="spine-caption" aria-hidden="true">{focus ? <><strong>{focus.title}</strong> {focus.detail}.</> : `${Math.floor(total / 60)} h ${total % 60} min of reading across ${lessons} lessons.`}</p></div></section>;
}
