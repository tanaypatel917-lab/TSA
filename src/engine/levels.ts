export const LEVELS = [
  { name: "Novice", minXp: 0 },
  { name: "Explorer", minXp: 100 },
  { name: "Practitioner", minXp: 250 },
  { name: "Ethicist", minXp: 450 },
  { name: "AI Ally", minXp: 700 }
] as const;

export function levelFor(xp: number) {
  return [...LEVELS].reverse().find((level) => xp >= level.minXp) ?? LEVELS[0];
}

export function nextLevel(xp: number) {
  return LEVELS.find((level) => level.minXp > xp) ?? null;
}

export function progressToNext(xp: number): number {
  const current = levelFor(xp);
  const next = nextLevel(xp);
  if (!next) return 1;
  return Math.max(0, Math.min(1, (xp - current.minXp) / (next.minXp - current.minXp)));
}
