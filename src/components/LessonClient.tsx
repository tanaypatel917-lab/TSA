"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson, Module } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";
import { SplitText } from "@/components/motion/SplitText";
import ScrollRevealParagraph from "@/components/smoothui/scroll-reveal-paragraph";
import { BlurFade } from "@/components/magicui/BlurFade";

export function LessonClient({ module, lesson, index }: { module: Module; lesson: Lesson; index: number }) {
  const { state, dispatch } = useProgress(); const router = useRouter();
  const complete = state.completedLessons.includes(`${module.id}/${lesson.id}`);
  const next = module.lessons[index + 1];
  function markComplete() { if (!complete) dispatch({ type: "lesson-completed", moduleId: module.id, lessonId: lesson.id, day: todayKey() }); router.push(next ? `/modules/${module.slug}/lessons/${next.id}` : `/modules/${module.slug}/activity`); }
  return <div className="shell py-32"><Link href={`/modules/${module.slug}`} className="btn-ghost">← {module.title}</Link><article className="mx-auto mt-20 max-w-[68ch]"><p className="eyebrow">Lesson {String(index + 1).padStart(2, "0")} / {String(module.lessons.length).padStart(2, "0")} · {lesson.minutes} min</p><SplitText as="h1" className="mt-7 font-display text-[clamp(3rem,7vw,6rem)] leading-[.9]">{lesson.title}</SplitText><div className="mt-12 space-y-7 text-[1.125rem] leading-[1.75] text-ink/75">{lesson.body.map((paragraph) => <ScrollRevealParagraph key={paragraph} paragraph={paragraph} className="text-[1.125rem] leading-[1.75] text-ink/75" />)}</div><aside className="mt-14 border-l-2 border-lime py-2 pl-6"><h2 className="font-mono text-xs font-bold uppercase tracking-[.2em]">Key takeaways</h2><ul className="mt-5 space-y-3">{lesson.keyTakeaways.map((takeaway) => <li key={takeaway} className="flex gap-3"><span className="text-accent">+</span><span>{takeaway}</span></li>)}</ul></aside></article><div className="mx-auto mt-20 max-w-[900px] border-y border-line"><div className="flex flex-col sm:flex-row sm:divide-x sm:divide-line">{index > 0 ? <Link href={`/modules/${module.slug}/lessons/${module.lessons[index - 1].id}`} className="flex flex-1 items-center justify-between py-6 pr-6 hover:bg-ink hover:px-5 hover:text-paper"><span className="font-mono text-[10px] uppercase tracking-wider">Previous</span><span className="text-3xl">←</span></Link> : <Link href={`/modules/${module.slug}`} className="flex flex-1 items-center justify-between py-6 pr-6 hover:bg-ink hover:px-5 hover:text-paper"><span className="font-mono text-[10px] uppercase tracking-wider">Module</span><span className="text-3xl">↗</span></Link>}<button className="flex flex-1 items-center justify-between py-6 pl-6 text-left hover:bg-lime hover:px-5" onClick={markComplete}><span className="font-mono text-[10px] uppercase tracking-wider">{complete ? (next ? "Next lesson" : "Continue to activity") : "Mark complete →"}</span>{complete && <span className="text-3xl">→</span>}</button></div></div></div>;
}
