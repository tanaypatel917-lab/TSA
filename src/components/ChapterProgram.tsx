"use client";

import Link from "next/link";
import type { Module } from "@/content/types";
import { chapterMinutes, chapterProgress } from "@/engine/chapters";
import { useProgress } from "@/state/ProgressProvider";

export function ChapterStart({ module }: { module: Module }) {
  const { state, hydrated } = useProgress();
  const progress = chapterProgress(state, module);
  const first = `/modules/${module.slug}/lessons/${module.lessons[0].id}`;
  const [href, action, note] = !hydrated || !progress.started
    ? [first, "Start lesson 1", `${chapterMinutes(module)} minutes of reading, at your own pace.`]
    : progress.next
      ? [progress.next.href, "Continue", `Up next: ${progress.next.label}`]
      : [first, "Review the chapter", `Chapter complete. Best quiz score: ${progress.quizBest}%.`];
  return <div className="chapter-cta"><Link href={href} className="button-primary">{action} <span aria-hidden="true">↗</span></Link><p className="chapter-cta-note">{note}</p></div>;
}

export function ChapterProgram({ module }: { module: Module }) {
  const { state, hydrated } = useProgress();
  const progress = chapterProgress(state, module);
  const activityDone = hydrated && progress.activityDone;
  const quizPassed = hydrated && progress.quizBest >= 70;
  const next = hydrated ? progress.next?.href : undefined;
  const station = (done: boolean, href: string, order: number) => ({ "data-done": done, "data-next": !done && href === next, "data-reveal": order });
  return <ol className="program-list program-route">{module.lessons.map((lesson, index) => {
    const read = hydrated && state.completedLessons.includes(`${module.id}/${lesson.id}`);
    return <li key={lesson.id} {...station(read, `/modules/${module.slug}/lessons/${lesson.id}`, index)}><Link className="program-step" data-done={read} href={`/modules/${module.slug}/lessons/${lesson.id}`}><span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="step-body"><strong>{lesson.title}</strong><span>Lesson {index + 1} · {lesson.minutes} min read · {lesson.keyTakeaways.length} key ideas</span></span><span className="step-state">{read ? "Read" : "Lesson"}</span><span className="step-arrow" aria-hidden="true">↗</span></Link></li>;
  })}<li {...station(activityDone, `/modules/${module.slug}/activity`, module.lessons.length)}><Link className="program-step is-practice" data-done={activityDone} href={`/modules/${module.slug}/activity`}><span className="step-number" aria-hidden="true">[ ]</span><span className="step-body"><strong>{module.activity.title}</strong><span>Practice · {module.activity.intro}</span></span><span className="step-state">{activityDone ? "Done" : "Practice"}</span><span className="step-arrow" aria-hidden="true">↗</span></Link></li><li {...station(quizPassed, `/modules/${module.slug}/quiz`, module.lessons.length + 1)}><Link className="program-step is-quiz" data-done={quizPassed} href={`/modules/${module.slug}/quiz`}><span className="step-number" aria-hidden="true">?</span><span className="step-body"><strong>Knowledge check</strong><span>Quiz · {module.quiz.length} questions, with an explanation after every answer.</span></span><span className="step-state">{hydrated && progress.quizBest ? `Best ${progress.quizBest}%` : "Quiz"}</span><span className="step-arrow" aria-hidden="true">↗</span></Link></li></ol>;
}
