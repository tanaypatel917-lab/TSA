import type { Module } from "@/content/types";
import { levelFor } from "./levels";

export type ProgressState = {
  version: 1;
  xp: number;
  completedLessons: string[];
  completedActivities: string[];
  quizBest: Record<string, number>;
  badges: string[];
  streak: { count: number; lastDay: string; shields: number; longest: number };
  daysActive: number;
  dailyChallenge: { lastDay: string; completed: number };
  onboarding: { done: boolean; dailyGoal: 1 | 2 | 3; startModule: string | null };
  startedAt: string | null;
};

export const initialState: ProgressState = {
  version: 1,
  xp: 0,
  completedLessons: [],
  completedActivities: [],
  quizBest: {},
  badges: [],
  streak: { count: 0, lastDay: "", shields: 0, longest: 0 },
  daysActive: 0,
  dailyChallenge: { lastDay: "", completed: 0 },
  onboarding: { done: false, dailyGoal: 2, startModule: null },
  startedAt: null
};

export function normalizeState(raw: ProgressState): ProgressState {
  const onboarding = raw.onboarding === undefined && raw.startedAt !== null
    ? { done: true, dailyGoal: 2 as const, startModule: null }
    : { ...initialState.onboarding, ...raw.onboarding };
  const streak = { ...initialState.streak, ...raw.streak };
  if (raw.streak && raw.streak.longest === undefined) streak.longest = raw.streak.count;
  return {
    ...initialState,
    ...raw,
    streak,
    dailyChallenge: { ...initialState.dailyChallenge, ...raw.dailyChallenge },
    onboarding
  };
}

export type ProgressEvent =
  | { type: "lesson-completed"; moduleId: string; lessonId: string; day: string }
  | { type: "activity-completed"; moduleId: string; day: string }
  | { type: "quiz-completed"; moduleId: string; scorePct: number; day: string }
  | { type: "daily-challenge-completed"; day: string; correct: number }
  | { type: "onboarding-completed"; day: string; dailyGoal: 1 | 2 | 3; startModule: string; correct: number; skipped?: boolean };

function dayAfter(previous: string, day: string): boolean {
  const previousDate = new Date(`${previous}T12:00:00`);
  const currentDate = new Date(`${day}T12:00:00`);
  return (currentDate.getTime() - previousDate.getTime()) / 86400000 === 1;
}

function updateStreak(state: ProgressState, day: string) {
  const streak = { ...state.streak };
  let incremented = false;
  let shieldUsed = false;
  let shieldEarned = false;
  if (!streak.lastDay) {
    streak.count = 1;
    streak.lastDay = day;
    state.daysActive += 1;
  } else if (streak.lastDay === day) {
    // same day: unchanged
  } else if (dayAfter(streak.lastDay, day)) {
    streak.count += 1;
    streak.lastDay = day;
    state.daysActive += 1;
    incremented = true;
    if (streak.count % 5 === 0 && streak.shields < 2) {
      streak.shields += 1;
      shieldEarned = true;
    }
  } else {
    const missed = Math.max(1, Math.round((new Date(`${day}T12:00:00`).getTime() - new Date(`${streak.lastDay}T12:00:00`).getTime()) / 86400000) - 1);
    if (streak.shields >= missed) {
      streak.shields -= missed;
      streak.count += 1;
      shieldUsed = true;
    } else {
      streak.shields = 0;
      streak.count = 1;
    }
    streak.lastDay = day;
    state.daysActive += 1;
    incremented = true;
  }
  streak.longest = Math.max(streak.longest, streak.count);
  state.streak = streak;
  return { incremented, shieldUsed, shieldEarned };
}

function moduleComplete(state: ProgressState, module: Module): boolean {
  return module.lessons.every((lesson) => state.completedLessons.includes(`${module.id}/${lesson.id}`))
    && state.completedActivities.includes(module.id)
    && (state.quizBest[module.id] ?? 0) >= 70;
}

export type ApplyResult = {
  state: ProgressState;
  newBadges: string[];
  xpGained: number;
  shieldUsed: boolean;
  shieldEarned: boolean;
  leveledUp: boolean;
};

export function apply(state: ProgressState, event: ProgressEvent, moduleList: Module[]): ApplyResult {
  const next: ProgressState = {
    ...state,
    completedLessons: [...state.completedLessons],
    completedActivities: [...state.completedActivities],
    quizBest: { ...state.quizBest },
    badges: [...state.badges],
    streak: { ...state.streak },
    dailyChallenge: { ...state.dailyChallenge },
    onboarding: { ...state.onboarding }
  };
  let xpGained = 0;
  if (!next.startedAt) next.startedAt = new Date(`${event.day}T12:00:00`).toISOString();
  const streak = updateStreak(next, event.day);
  if (streak.incremented && next.streak.count >= 2) xpGained += 5;
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
  } else if (event.type === "quiz-completed") {
    const score = Math.max(0, Math.min(100, event.scorePct));
    const previous = next.quizBest[event.moduleId] ?? 0;
    const rounded = Math.round(score / 2);
    const previousXp = Math.round(previous / 2);
    if (score > previous) {
      next.quizBest[event.moduleId] = score;
      xpGained += rounded - previousXp;
    }
  } else if (event.type === "daily-challenge-completed") {
    if (next.dailyChallenge.lastDay !== event.day) {
      next.dailyChallenge = { lastDay: event.day, completed: next.dailyChallenge.completed + 1 };
      xpGained += 15;
    }
  } else if (event.type === "onboarding-completed") {
    const alreadyDone = next.onboarding.done;
    next.onboarding = { done: true, dailyGoal: event.dailyGoal, startModule: event.startModule };
    if (!alreadyDone && !event.skipped) xpGained += 10;
  }
  next.xp += xpGained;
  const newlyComplete = moduleList.filter((module) => moduleComplete(next, module)).map((module) => `module-${module.id}`);
  const earned = [...new Set([...next.badges, ...newlyComplete])];
  const newBadges = earned.filter((badge) => !next.badges.includes(badge));
  next.badges = earned;
  const leveledUp = levelFor(next.xp).name !== levelFor(state.xp).name;
  return { state: next, newBadges, xpGained, shieldUsed: streak.shieldUsed, shieldEarned: streak.shieldEarned, leveledUp };
}
