import type { Module } from "@/content/types";
import { BADGES, evaluateBadges } from "./badges";
import { courseComplete } from "./chapters";
import { levelFor } from "./levels";
import { worldOf, type ProgressState } from "./progress";

export type Wrapped = {
  persona: string;
  minutes: number;
  lessons: number;
  totalLessons: number;
  quizzes: number;
  average: number;
  best: { title: string; score: number } | null;
  badges: number;
  totalBadges: number;
  level: string;
  xp: number;
  streak: number;
  words: number;
  days: number | null;
  complete: boolean;
};

const DAY = 24 * 60 * 60 * 1000;

export function wrapped(state: ProgressState, moduleList: Module[], now = new Date()): Wrapped {
  const lessons = moduleList.flatMap((module) => module.lessons.map((lesson) => ({ key: `${module.id}/${lesson.id}`, minutes: lesson.minutes })));
  const read = lessons.filter((lesson) => state.completedLessons.includes(lesson.key));
  const scores = moduleList.flatMap((module) => (state.quizBest[module.id] ?? 0) > 0 ? [{ title: module.title, score: state.quizBest[module.id] }] : []);
  const average = scores.length ? Math.round(scores.reduce((sum, entry) => sum + entry.score, 0) / scores.length) : 0;
  const best = scores.reduce<Wrapped["best"]>((top, entry) => !top || entry.score > top.score ? entry : top, null);
  const words = worldOf(state).words.length;
  const minutes = read.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const started = state.startedAt ? Date.parse(state.startedAt) : NaN;
  const days = Number.isNaN(started) ? null : Math.max(1, Math.ceil((now.getTime() - started) / DAY));
  const persona = scores.length >= 2 && average >= 90 ? "The Fact-Checker" : words >= 20 ? "The Word Hunter" : minutes >= 60 ? "The Deep Reader" : state.streak.count >= 3 ? "The Daily Regular" : "The Curious Starter";
  return {
    persona,
    minutes,
    lessons: read.length,
    totalLessons: lessons.length,
    quizzes: scores.length,
    average,
    best,
    badges: evaluateBadges(state, moduleList).length,
    totalBadges: BADGES.length,
    level: levelFor(state.xp).name,
    xp: state.xp,
    streak: state.streak.count,
    words,
    days,
    complete: courseComplete(state, moduleList)
  };
}
