"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson, Module } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function LessonClient({ module, lesson, index }: { module: Module; lesson: Lesson; index: number }) {
  const { state, dispatch } = useProgress(); const router = useRouter();
  const complete = state.completedLessons.includes(`${module.id}/${lesson.id}`);
  function markComplete() { if (!complete) dispatch({ type: "lesson-completed", moduleId: module.id, lessonId: lesson.id, day: todayKey() }); const next = module.lessons[index + 1]; router.push(next ? `/modules/${module.slug}/lessons/${next.id}` : `/modules/${module.slug}/activity`); }
  return <div className="shell py-12"><Link href={`/modules/${module.slug}`} className="text-sm font-bold text-accent">← {module.title}</Link><div className="mx-auto mt-8 max-w-3xl"><p className="eyebrow">Lesson {index + 1} of {module.lessons.length} · {lesson.minutes} min</p><h1 className="mt-3 text-4xl font-black">{lesson.title}</h1><div className="mt-8 space-y-5 text-lg leading-8 text-slate-700">{lesson.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="mt-10 rounded-3xl bg-indigo-50 p-6"><h2 className="text-xl font-bold text-indigo-950">Key takeaways</h2><ul className="mt-4 space-y-3 text-indigo-950">{lesson.keyTakeaways.map((takeaway) => <li key={takeaway} className="flex gap-3"><span aria-hidden="true">✓</span><span>{takeaway}</span></li>)}</ul></div><div className="mt-8 flex flex-wrap items-center justify-between gap-3"><Link href={index > 0 ? `/modules/${module.slug}/lessons/${module.lessons[index - 1].id}` : `/modules/${module.slug}`} className="button-secondary">← Previous</Link><button className="button-primary" onClick={markComplete}>{complete ? "Continue →" : "Mark complete & continue →"}</button></div></div></div>;
}
