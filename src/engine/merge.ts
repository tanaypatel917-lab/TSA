import type { ProgressState } from "./progress";

function union(local: string[], remote: string[]): string[] {
  return [...new Set([...local, ...remote])];
}

function laterStreak(local: ProgressState["streak"], remote: ProgressState["streak"]) {
  if (local.lastDay > remote.lastDay) return local;
  if (remote.lastDay > local.lastDay) return remote;
  return local.count >= remote.count ? local : remote;
}

function earliestStartedAt(local: string | null, remote: string | null): string | null {
  if (!local) return remote;
  if (!remote) return local;
  return local <= remote ? local : remote;
}

export function mergeProgress(local: ProgressState, remote: ProgressState): ProgressState {
  const quizKeys = new Set([...Object.keys(local.quizBest), ...Object.keys(remote.quizBest)]);
  const quizBest: Record<string, number> = {};
  for (const key of quizKeys) {
    quizBest[key] = Math.max(local.quizBest[key] ?? 0, remote.quizBest[key] ?? 0);
  }

  return {
    version: 1,
    xp: Math.max(local.xp, remote.xp),
    completedLessons: union(local.completedLessons, remote.completedLessons),
    completedActivities: union(local.completedActivities, remote.completedActivities),
    quizBest,
    badges: union(local.badges, remote.badges),
    streak: laterStreak(local.streak, remote.streak),
    startedAt: earliestStartedAt(local.startedAt, remote.startedAt)
  };
}
