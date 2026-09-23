"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Reference } from "@/content/references";
import type { Lesson, Module } from "@/content/types";
import type { LessonTerm } from "@/engine/glossary";
import { lessonVisuals, moduleVisuals } from "@/content/visuals";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";
import { StudyShell } from "./StudyShell";

export function LessonClient({ module, lesson, index, sources, terms }: { module: Module; lesson: Lesson; index: number; sources: Reference[]; terms: LessonTerm[] }) {
  const { state, dispatch, hydrated, storageError } = useProgress();
  const router = useRouter();
  const advancing = useRef(false);
  const reading = useRef<HTMLElement>(null);
  const [card, setCard] = useState<{ slug: string; left: number; top: number; width: number } | null>(null);
  useEffect(() => { advancing.current = false; }, [lesson.id]);
  const complete = hydrated && state.completedLessons.includes(`${module.id}/${lesson.id}`);
  const visual = lessonVisuals[`${module.id}/${lesson.id}`];
  const sections = visual?.sections ?? ["Read the lesson"];
  const outline = <ol>{sections.map((title, position) => <li key={title}><a href={`#lesson-section-${position}`}>{title}</a></li>)}<li><a href="#takeaways">Key takeaways</a></li></ol>;
  function openTerm(slug: string, target: HTMLElement) {
    const box = reading.current?.getBoundingClientRect();
    if (!box) return;
    const rect = target.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 32);
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 16), window.innerWidth - width - 16) - box.left;
    setCard({ slug, left, top: rect.bottom - box.top + 10, width });
  }
  function annotate(text: string, paragraph: number) {
    const marks = terms.filter((term) => term.paragraph === paragraph);
    if (!marks.length) return text;
    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const term of marks) {
      parts.push(text.slice(last, term.start));
      parts.push(<button key={term.slug} type="button" className="term-trigger" data-open={card?.slug === term.slug} aria-describedby={`term-note-${term.slug}`} onMouseEnter={(event) => openTerm(term.slug, event.currentTarget)} onMouseLeave={() => setCard(null)} onFocus={(event) => openTerm(term.slug, event.currentTarget)} onBlur={() => setCard(null)} onClick={(event) => openTerm(term.slug, event.currentTarget)} onKeyDown={(event) => { if (event.key === "Escape") setCard(null); }}>{text.slice(term.start, term.end)}</button>);
      last = term.end;
    }
    parts.push(text.slice(last));
    return parts;
  }
  const active = card && terms.find((term) => term.slug === card.slug);
  function markComplete() {
    if (!hydrated || advancing.current) return;
    advancing.current = true;
    if (!complete) dispatch({ type: "lesson-completed", moduleId: module.id, lessonId: lesson.id, day: todayKey() });
    const next = module.lessons[index + 1];
    router.push(next ? `/modules/${module.slug}/lessons/${next.id}` : `/modules/${module.slug}/activity`);
  }
  return <StudyShell module={module} kind="Lesson"><div className="reading-progress" aria-hidden="true" /><header className="lesson-opener"><div className="lesson-meta"><span>Lesson {String(index + 1).padStart(2, "0")} / {String(module.lessons.length).padStart(2, "0")}</span><span>{lesson.minutes} min reading</span><span>{hydrated ? complete ? "Completed · Ready to revisit" : "Read at your own pace" : "Checking progress…"}</span></div><div><h1>{lesson.title}</h1><p className="lesson-question">{visual?.question ?? moduleVisuals[module.id]?.question}</p></div></header><div className="lesson-grid"><aside className="lesson-outline"><p>In this lesson</p><nav aria-label="Lesson outline">{outline}</nav>{terms.length > 0 && <div className="outline-terms"><p>Terms in this lesson</p><ul>{terms.map((term) => <li key={term.slug}><Link href={`/glossary/#term-${term.slug}`}>{term.term}</Link></li>)}</ul></div>}<Link href={`/modules/${module.slug}`} className="text-link mt-8 text-sm">Back to module</Link></aside><div><details className="mobile-contents"><summary>Contents</summary><nav aria-label="Lesson contents">{outline}</nav></details><article ref={reading} className="lesson-reading" aria-label={lesson.title}>{active && <div className="term-card" aria-hidden="true" style={{ left: card.left, top: card.top, width: card.width }}><strong>{active.term}</strong><span>{active.definition}</span></div>}<div hidden>{terms.map((term) => <span key={term.slug} id={`term-note-${term.slug}`}>{term.term}: {term.definition}</span>)}</div>{visual ? lesson.body.map((paragraph, position) => <section id={`lesson-section-${position}`} key={paragraph}><h2>{visual.sections[position]}</h2><p>{annotate(paragraph, position)}</p></section>) : <section id="lesson-section-0">{lesson.body.map((paragraph, position) => <p className="mb-6" key={paragraph}>{annotate(paragraph, position)}</p>)}</section>}<section className="takeaways" id="takeaways"><h2>Take this with you.</h2><p className="small-note">Key takeaways</p><ul>{lesson.keyTakeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul></section>{sources.length > 0 && <section className="lesson-sources" aria-labelledby="lesson-sources-title"><h2 id="lesson-sources-title">Sources</h2><ol>{sources.map((source) => <li key={source.id}>{source.authors} ({source.date}). <a href={source.url} rel="noreferrer">{source.title}</a>.{source.source && ` ${source.source}.`}</li>)}</ol><Link href="/references" className="text-link">All references <span aria-hidden="true">↗</span></Link></section>}<div className="lesson-controls"><Link href={index > 0 ? `/modules/${module.slug}/lessons/${module.lessons[index - 1].id}` : `/modules/${module.slug}`} className="text-link">← Previous</Link><button className="button-primary" disabled={!hydrated} onClick={markComplete}>{complete ? "Continue learning" : "Mark complete & continue"}<span aria-hidden="true">↗</span></button></div>{storageError && <p className="storage-warning" role="status">{storageError}</p>}</article></div></div></StudyShell>;
}
