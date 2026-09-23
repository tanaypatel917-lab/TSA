import type { Module } from "@/content/types";

export type ProgressState = {
  version: 1;
  xp: number;
  completedLessons: string[];
  completedActivities: string[];
  quizBest: Record<string, number>;
  badges: string[];
  streak: { count: number; lastDay: string };
  startedAt: string | null;
  world?: WorldProgress;
};

export type WorldProgress = { words: string[]; stamps: string[]; best?: Record<string, number>; stars?: Record<string, number> };

export const WORLD_XP = { word: 2, stamp: 10, perfect: 5 };

export function worldOf(state: ProgressState): WorldProgress {
  return state.world ?? { words: [], stamps: [] };
}

export const initialState: ProgressState = {
  version: 1,
  xp: 0,
  completedLessons: [],
  completedActivities: [],
  quizBest: {},
  badges: [],
  streak: { count: 0, lastDay: "" },
  startedAt: null,
  world: { words: [], stamps: [] }
};

export type ProgressEvent =
  | { type: "lesson-completed"; moduleId: string; lessonId: string; day: string }
  | { type: "activity-completed"; moduleId: string; day: string }
  | { type: "quiz-completed"; moduleId: string; scorePct: number; day: string }
  | { type: "word-collected"; term: string; day: string }
  | { type: "station-stamped"; moduleId: string; day: string }
  | { type: "mission-finished"; moduleId: string; score: number; stars: number; day: string };

function dayAfter(previous: string, day: string): boolean {
  const previousDate = new Date(`${previous}T12:00:00`);
  const currentDate = new Date(`${day}T12:00:00`);
  return (currentDate.getTime() - previousDate.getTime()) / 86400000 === 1;
}

function updateStreak(streak: ProgressState["streak"], day: string) {
  if (!streak.lastDay) return { count: 1, lastDay: day, incremented: false };
  if (streak.lastDay === day) return { ...streak, incremented: false };
  if (dayAfter(streak.lastDay, day)) return { count: streak.count + 1, lastDay: day, incremented: true };
  return { count: 1, lastDay: day, incremented: false };
}

function moduleComplete(state: ProgressState, module: Module): boolean {
  return module.lessons.every((lesson) => state.completedLessons.includes(`${module.id}/${lesson.id}`))
    && state.completedActivities.includes(module.id)
    && (state.quizBest[module.id] ?? 0) >= 70;
}

export function apply(state: ProgressState, event: ProgressEvent, moduleList: Module[]): { state: ProgressState; newBadges: string[]; xpGained: number } {
  const next: ProgressState = {
    ...state,
    completedLessons: [...state.completedLessons],
    completedActivities: [...state.completedActivities],
    quizBest: { ...state.quizBest },
    badges: [...state.badges],
    streak: { ...state.streak },
    world: { words: [...worldOf(state).words], stamps: [...worldOf(state).stamps], best: { ...worldOf(state).best }, stars: { ...worldOf(state).stars } }
  };
  const world = next.world as WorldProgress;
  let xpGained = 0;
  if (!next.startedAt) next.startedAt = new Date(`${event.day}T12:00:00`).toISOString();
  const streak = updateStreak(next.streak, event.day);
  next.streak = { count: streak.count, lastDay: streak.lastDay };
  if (streak.incremented && streak.count >= 2) xpGained += 5;
  if (event.type === "lesson-completed") {
    const key = `${event.moduleId}/${event.lessonId}`;
    if (!next.completedLessons.includes(key)) {
      next.completedLessons.push(key);
      xpGained += 10;
    }
  } else if (event.type === "activity-completed") {
    if (!next.completedActivities.includes(event.moduleId)) {
      next.completedActivities.push(event.moduleId);
      xpGained += 25;
    }
  } else if (event.type === "word-collected") {
    if (!world.words.includes(event.term)) {
      world.words.push(event.term);
      xpGained += WORLD_XP.word;
    }
  } else if (event.type === "mission-finished") {
    const best = world.best as Record<string, number>;
    const starred = world.stars as Record<string, number>;
    const previousStars = starred[event.moduleId] ?? 0;
    best[event.moduleId] = Math.max(best[event.moduleId] ?? 0, Math.max(0, Math.round(event.score)));
    starred[event.moduleId] = Math.max(previousStars, event.stars);
    if (event.stars >= 1 && !world.stamps.includes(event.moduleId)) {
      world.stamps.push(event.moduleId);
      xpGained += WORLD_XP.stamp;
    }
    if (event.stars >= 3 && previousStars < 3) xpGained += WORLD_XP.perfect;
  } else if (event.type === "station-stamped") {
    if (!world.stamps.includes(event.moduleId)) {
      world.stamps.push(event.moduleId);
      xpGained += WORLD_XP.stamp;
    }
  } else {
    const score = Math.max(0, Math.min(100, event.scorePct));
    const previous = next.quizBest[event.moduleId] ?? 0;
    const rounded = Math.round(score / 2);
    const previousXp = Math.round(previous / 2);
    if (score > previous) {
      next.quizBest[event.moduleId] = score;
      xpGained += rounded - previousXp;
    }
  }
  next.xp += xpGained;
  const newlyComplete = moduleList.filter((module) => moduleComplete(next, module)).map((module) => `module-${module.id}`);
  const earned = [...new Set([...next.badges, ...newlyComplete])];
  const newBadges = earned.filter((badge) => !next.badges.includes(badge));
  next.badges = earned;
  return { state: next, newBadges, xpGained };
}
