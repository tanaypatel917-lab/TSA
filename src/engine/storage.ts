import { initialState, type ProgressState } from "./progress";

export const PROGRESS_KEY = "wordplay:progress:v1";

function valid(value: unknown): value is ProgressState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProgressState>;
  const strings = (items: unknown): items is string[] => Array.isArray(items) && items.every((item) => typeof item === "string");
  const nonnegative = (number: unknown): number is number => typeof number === "number" && Number.isFinite(number) && number >= 0;
  return candidate.version === 1 && nonnegative(candidate.xp)
    && strings(candidate.completedLessons) && strings(candidate.completedActivities)
    && !!candidate.quizBest && typeof candidate.quizBest === "object" && !Array.isArray(candidate.quizBest)
    && Object.values(candidate.quizBest).every((score) => nonnegative(score) && score <= 100)
    && strings(candidate.badges) && !!candidate.streak && !Array.isArray(candidate.streak)
    && nonnegative(candidate.streak.count) && typeof candidate.streak.lastDay === "string"
    && (candidate.startedAt === null || typeof candidate.startedAt === "string")
    && (candidate.world === undefined || (!!candidate.world && strings(candidate.world.words) && strings(candidate.world.stamps)));
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    return valid(parsed) ? parsed : initialState;
  } catch {
    return initialState;
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window !== "undefined") window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
}

export function exportProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function importProgress(json: string): ProgressState | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return valid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
