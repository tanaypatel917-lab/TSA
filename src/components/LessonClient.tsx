"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson, Module } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

const pad = (n: number) => String(n).padStart(2, "0");

export function LessonClient({ module, lesson, index }: { module: Module; lesson: Lesson; index: number }) {
  const { state, dispatch } = useProgress(); const router = useRouter();
  const complete = state.completedLessons.includes(`${module.id}/${lesson.id}`);
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
          <div className="prose-body mt-10 space-y-6">{lesson.body.map((paragraph, i) => <p key={paragraph} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8]" : ""}>{paragraph}</p>)}</div>
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
