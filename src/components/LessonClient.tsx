"use client";
import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson, Module } from "@/content/types";
import { glossary } from "@/content/glossary";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

type Segment = { text: string } | { term: string; definition: string; text: string };

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const glossaryPattern = new RegExp(`\\b(${[...glossary].sort((a, b) => b.term.length - a.term.length).map((entry) => escapeRegExp(entry.term)).join("|")})(s|es)?\\b`, "gi");
const definitions = new Map(glossary.map((entry) => [entry.term.toLowerCase(), entry]));

export function annotateLesson(paragraphs: string[]): Segment[][] {
  const seen = new Set<string>();
  return paragraphs.map((paragraph) => {
    const segments: Segment[] = [];
    let cursor = 0;
    for (const match of paragraph.matchAll(glossaryPattern)) {
      const key = match[1].toLowerCase();
      const entry = definitions.get(key);
      if (!entry || seen.has(key) || match.index === undefined) continue;
      seen.add(key);
      if (match.index > cursor) segments.push({ text: paragraph.slice(cursor, match.index) });
      segments.push({ term: entry.term, definition: entry.definition, text: match[0] });
      cursor = match.index + match[0].length;
    }
    if (cursor < paragraph.length) segments.push({ text: paragraph.slice(cursor) });
    return segments;
  });
}

function GlossaryTerm({ term, definition, text }: { term: string; definition: string; text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button type="button" className="rounded-sm font-semibold text-indigo-900 underline decoration-indigo-400 decoration-dotted underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300" aria-expanded={open} aria-describedby={id} onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} onBlur={() => setOpen(false)}>{text}</button>
    <span role="tooltip" id={id} className={`${open ? "block" : "hidden"} absolute left-0 top-full z-20 mt-2 w-72 max-w-[80vw] rounded-2xl border border-indigo-100 bg-white p-4 text-left text-sm leading-6 text-slate-700 shadow-lg`}><strong className="block text-indigo-950">{term}</strong>{definition}</span>
  </span>;
}

export function LessonClient({ module, lesson, index }: { module: Module; lesson: Lesson; index: number }) {
  const { state, dispatch } = useProgress(); const router = useRouter();
  const complete = state.completedLessons.includes(`${module.id}/${lesson.id}`);
  const annotated = useMemo(() => annotateLesson(lesson.body), [lesson.body]);
  function markComplete() { if (!complete) dispatch({ type: "lesson-completed", moduleId: module.id, lessonId: lesson.id, day: todayKey() }); const next = module.lessons[index + 1]; router.push(next ? `/modules/${module.slug}/lessons/${next.id}` : `/modules/${module.slug}/activity`); }
  return <div className="shell py-12"><Link href={`/modules/${module.slug}`} className="text-sm font-bold text-accent">← {module.title}</Link><div className="mx-auto mt-8 max-w-3xl"><p className="eyebrow font-mono">Lesson {index + 1} of {module.lessons.length} · {lesson.minutes} min</p><h1 className="mt-3 text-4xl font-black">{lesson.title}</h1><p className="mt-3 text-sm text-slate-500">Dotted words are glossary terms. Select one to see its definition; press Escape to close it.</p><div className="mt-8 space-y-5 text-lg leading-8 text-slate-700">{annotated.map((segments, paragraphIndex) => <p key={lesson.body[paragraphIndex]}>{segments.map((segment, segmentIndex) => "term" in segment ? <GlossaryTerm key={segmentIndex} term={segment.term} definition={segment.definition} text={segment.text} /> : <span key={segmentIndex}>{segment.text}</span>)}</p>)}</div><div className="mt-10 rounded-3xl bg-indigo-50 p-6"><h2 className="text-xl font-bold text-indigo-950">Key takeaways</h2><ul className="mt-4 space-y-3 text-indigo-950">{lesson.keyTakeaways.map((takeaway) => <li key={takeaway} className="flex gap-3"><span aria-hidden="true">✓</span><span>{takeaway}</span></li>)}</ul></div><div className="mt-8 flex flex-wrap items-center justify-between gap-3"><Link href={index > 0 ? `/modules/${module.slug}/lessons/${module.lessons[index - 1].id}` : `/modules/${module.slug}`} className="button-secondary">← Previous</Link><button className="button-primary" onClick={markComplete}>{complete ? "Continue →" : "Mark complete & continue →"}</button></div></div></div>;
}
