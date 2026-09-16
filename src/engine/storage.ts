import { initialState, normalizeState, type ProgressState } from "./progress";

const KEY = "ai-compass:progress:v1";

export function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProgressState>;
  return candidate.version === 1 && typeof candidate.xp === "number"
    && Array.isArray(candidate.completedLessons) && Array.isArray(candidate.completedActivities)
    && !!candidate.quizBest && typeof candidate.quizBest === "object"
    && Array.isArray(candidate.badges) && !!candidate.streak
    && typeof candidate.streak.count === "number" && typeof candidate.streak.lastDay === "string"
    && (candidate.startedAt === null || typeof candidate.startedAt === "string");
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    return isProgressState(parsed) ? normalizeState(parsed) : initialState;
  } catch {
    return initialState;
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function importProgress(json: string): ProgressState | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return isProgressState(parsed) ? normalizeState(parsed) : null;
  } catch {
    return null;
  }
}
