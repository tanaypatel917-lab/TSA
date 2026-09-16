"use client";
import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson, Module } from "@/content/types";
import { glossary } from "@/content/glossary";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

const pad = (n: number) => String(n).padStart(2, "0");

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
    <button type="button" className="underline decoration-signal decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal" aria-expanded={open} aria-describedby={id} onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} onBlur={() => setOpen(false)}>{text}</button>
    <span role="tooltip" id={id} className={`${open ? "block" : "hidden"} terminal absolute left-0 top-full z-20 mt-2 w-72 max-w-[80vw] p-4 text-left font-display text-sm normal-case leading-6 tracking-normal text-paper`}><strong className="mono-label block text-signal">:// {term}</strong>{definition}</span>
  </span>;
}

export function LessonClient({ module, lesson, index }: { module: Module; lesson: Lesson; index: number }) {
  const { state, dispatch } = useProgress(); const router = useRouter();
  const complete = state.completedLessons.includes(`${module.id}/${lesson.id}`);
  const annotated = useMemo(() => annotateLesson(lesson.body), [lesson.body]);
  function markComplete() { if (!complete) dispatch({ type: "lesson-completed", moduleId: module.id, lessonId: lesson.id, day: todayKey() }); const next = module.lessons[index + 1]; router.push(next ? `/modules/${module.slug}/lessons/${next.id}` : `/modules/${module.slug}/activity`); }
  return (
    <article className="shell py-12 sm:py-16">
      <Link href={`/modules/${module.slug}`} className="nav-link"><span aria-hidden="true">←</span> {module.title}</Link>
      <div className="mt-10 grid gap-10 lg:grid-cols-[0.3fr_0.7fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">Lesson {pad(index + 1)} / {pad(module.lessons.length)}</p>
          <p className="display-xl mt-4 tabular-nums text-signal">{pad(index + 1)}</p>
          <p className="index mt-4">{lesson.minutes} min read {complete && "· completed"}</p>
        </div>
        <div className="max-w-3xl">
          <h1 className="display-lg">{lesson.title}</h1>
          <p className="index mt-6">Dotted words are glossary terms. Select one for a definition; Escape closes it.</p>
          <div className="prose-body mt-8 space-y-6">{annotated.map((segments, i) => <p key={lesson.body[i]} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8]" : ""}>{segments.map((segment, j) => "term" in segment ? <GlossaryTerm key={j} term={segment.term} definition={segment.definition} text={segment.text} /> : <span key={j}>{segment.text}</span>)}</p>)}</div>
          <div className="terminal frame mt-14 p-6 sm:p-8">
            <h2 className="mono-label">:// key takeaways</h2>
            <ul className="mt-5 space-y-3 font-display text-base text-paper">{lesson.keyTakeaways.map((takeaway, i) => <li key={takeaway} className="flex gap-4"><span aria-hidden="true" className="font-mono text-signal">{pad(i + 1)}</span><span>{takeaway}</span></li>)}</ul>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink pt-6">
            <Link href={index > 0 ? `/modules/${module.slug}/lessons/${module.lessons[index - 1].id}` : `/modules/${module.slug}`} className="button-secondary">← Previous</Link>
            <button className="button-primary" onClick={markComplete}>{complete ? "Continue →" : "Mark complete & continue →"}</button>
          </div>
        </div>
      </div>
    </article>
  );
}
