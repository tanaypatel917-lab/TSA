import type { Module } from "@/content/types";
import type { ProgressState } from "./progress";

export type ChapterStatus = "new" | "progress" | "complete";

export type ChapterProgress = {
  lessonsDone: number;
  activityDone: boolean;
  quizBest: number;
  complete: boolean;
  started: boolean;
  status: ChapterStatus;
  label: string;
  next: { href: string; label: string } | null;
};

export type ChapterStep = { kind: "lesson" | "practice" | "quiz"; key: string; title: string; href: string; done: boolean; detail: string };

export function chapterSteps(state: ProgressState, module: Module): ChapterStep[] {
  const best = state.quizBest[module.id] ?? 0;
  return [
    ...module.lessons.map((lesson, index) => ({ kind: "lesson" as const, key: `${module.id}/${lesson.id}`, title: lesson.title, href: `/modules/${module.slug}/lessons/${lesson.id}`, done: state.completedLessons.includes(`${module.id}/${lesson.id}`), detail: `Lesson ${index + 1}, ${lesson.minutes} min` })),
    { kind: "practice", key: `${module.id}/practice`, title: module.activity.title, href: `/modules/${module.slug}/activity`, done: state.completedActivities.includes(module.id), detail: "Practice" },
    { kind: "quiz", key: `${module.id}/quiz`, title: "Knowledge check", href: `/modules/${module.slug}/quiz`, done: best >= 70, detail: best ? `Quiz, best ${best}%` : "Quiz" }
  ];
}

export function overallProgress(state: ProgressState, moduleList: Module[]) {
  const steps = moduleList.flatMap((module) => chapterSteps(state, module));
  return steps.length ? Math.round((steps.filter((step) => step.done).length / steps.length) * 100) : 0;
}

export function chapterMinutes(module: Module) {
  return module.lessons.reduce((total, lesson) => total + lesson.minutes, 0);
}

export function chapterProgress(state: ProgressState, module: Module): ChapterProgress {
  const read = (lessonId: string) => state.completedLessons.includes(`${module.id}/${lessonId}`);
  const lessonsDone = module.lessons.filter((lesson) => read(lesson.id)).length;
  const activityDone = state.completedActivities.includes(module.id);
  const quizBest = state.quizBest[module.id] ?? 0;
  const complete = lessonsDone === module.lessons.length && activityDone && quizBest >= 70;
  const started = lessonsDone > 0 || activityDone || quizBest > 0;
  const nextIndex = module.lessons.findIndex((lesson) => !read(lesson.id));
  const next = nextIndex >= 0
    ? { href: `/modules/${module.slug}/lessons/${module.lessons[nextIndex].id}`, label: `Lesson ${nextIndex + 1}: ${module.lessons[nextIndex].title}` }
    : !activityDone
      ? { href: `/modules/${module.slug}/activity`, label: module.activity.title }
      : quizBest < 70 ? { href: `/modules/${module.slug}/quiz`, label: "Knowledge check" } : null;
  const status: ChapterStatus = complete ? "complete" : started ? "progress" : "new";
  const label = complete ? "Complete" : started ? `${lessonsDone} of ${module.lessons.length} lessons read` : "Not started";
  return { lessonsDone, activityDone, quizBest, complete, started, status, label, next };
}
