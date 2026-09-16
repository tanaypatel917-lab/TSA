import type { Module, QuizQuestion } from "@/content/types";

export function hashDay(day: string): number {
  let hash = 5381;
  for (let index = 0; index < day.length; index += 1) {
    hash = ((hash << 5) + hash + day.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickDailyQuestions(day: string, moduleList: Module[], count = 3): { moduleId: string; question: QuizQuestion }[] {
  const pool = moduleList.flatMap((module) => module.quiz.map((question) => ({ moduleId: module.id, question })));
  const random = mulberry32(hashDay(day));
  const picked: { moduleId: string; question: QuizQuestion }[] = [];
  const usedIndexes = new Set<number>();
  const usedModules = new Set<string>();
  let attempts = 0;
  while (picked.length < count && attempts < pool.length * 20) {
    attempts += 1;
    const index = Math.floor(random() * pool.length);
    if (usedIndexes.has(index)) continue;
    const entry = pool[index];
    if (usedModules.has(entry.moduleId) && moduleList.length >= count && attempts < pool.length * 10) continue;
    usedIndexes.add(index);
    usedModules.add(entry.moduleId);
    picked.push(entry);
  }
  return picked;
}
