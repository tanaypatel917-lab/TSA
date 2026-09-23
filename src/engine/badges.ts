import type { Module } from "@/content/types";
import { chapterProgress, chapterSteps } from "./chapters";
import { glossary } from "@/content/glossary";
import { worldOf, type ProgressState } from "./progress";

export const BADGES = [
  { id: "first-steps", name: "First Steps", description: "Complete your first lesson.", mark: "1st" },
  { id: "module-foundations", name: "Foundation Builder", description: "Complete AI Foundations.", mark: "?" },
  { id: "module-tools", name: "Tool Tinkerer", description: "Complete AI Tools & Techniques.", mark: "[ ]" },
  { id: "module-ethics", name: "Ethical Explorer", description: "Complete Ethical & Responsible Use.", mark: "&" },
  { id: "module-real-world", name: "World Watcher", description: "Complete AI in the Real World.", mark: "↗" },
  { id: "module-capstone", name: "Project Pilot", description: "Complete the Wordplay Capstone.", mark: "*" },
  { id: "perfect-quiz", name: "Perfect Quiz", description: "Score 100% on any quiz.", mark: "100" },
  { id: "prompt-engineer", name: "Prompt Engineer", description: "Complete the prompt lab.", mark: "{ }" },
  { id: "ethics-champion", name: "Ethics Champion", description: "Score at least 90% on ethics.", mark: "=" },
  { id: "myth-buster", name: "Myth Buster", description: "Score at least 90% on foundations.", mark: "?!" },
  { id: "streak-3", name: "Three-Day Spark", description: "Build a three-day streak.", mark: "3" },
  { id: "streak-7", name: "Week of Wonder", description: "Build a seven-day streak.", mark: "7" },
  { id: "world-explorer", name: "World Explorer", description: "Stamp all five stations in Wordplay World.", mark: "@" },
  { id: "word-collector", name: "Word Collector", description: "Collect every word in Wordplay World.", mark: "Aa" },
  { id: "ai-ally", name: "AI Ally", description: "Complete every module.", mark: "AI" }
] as const;

export function badgeProgress(id: string, state: ProgressState, modules: Module[]): { value: number; label: string } {
  const measure = (value: number, label: string) => ({ value: Math.max(0, Math.min(1, value)), label });
  const chapter = modules.find((module) => id === `module-${module.id}`);
  if (chapter) {
    const steps = chapterSteps(state, chapter);
    const done = steps.filter((step) => step.done).length;
    return measure(done / steps.length, `${done} of ${steps.length} steps done`);
  }
  if (id === "first-steps") return measure(state.completedLessons.length, state.completedLessons.length ? "First lesson read" : "Read any lesson");
  if (id === "perfect-quiz") {
    const top = Math.max(0, ...Object.values(state.quizBest));
    return measure(top / 100, top ? `Best quiz ${top}%, needs 100%` : "No quiz taken yet");
  }
  if (id === "prompt-engineer") return measure(state.completedActivities.includes("tools") ? 1 : 0, state.completedActivities.includes("tools") ? "Prompt Lab complete" : "Prompt Lab not finished");
  if (id === "ethics-champion" || id === "myth-buster") {
    const score = state.quizBest[id === "ethics-champion" ? "ethics" : "foundations"] ?? 0;
    return measure(score / 90, score ? `Best ${score}%, needs 90%` : "Quiz not taken yet");
  }
  if (id === "streak-3" || id === "streak-7") {
    const goal = id === "streak-3" ? 3 : 7;
    const days = Math.min(state.streak.count, goal);
    return measure(days / goal, `${days} of ${goal} days in a row`);
  }
  if (id === "world-explorer") {
    const done = modules.filter((module) => worldOf(state).stamps.includes(module.id)).length;
    return measure(done / modules.length, `${done} of ${modules.length} stations stamped`);
  }
  if (id === "word-collector") {
    const done = glossary.filter((entry) => worldOf(state).words.includes(entry.term)).length;
    return measure(done / glossary.length, `${done} of ${glossary.length} words collected`);
  }
  if (id === "ai-ally") {
    const done = modules.filter((module) => chapterProgress(state, module).complete).length;
    return measure(done / modules.length, `${done} of ${modules.length} chapters complete`);
  }
  return measure(0, "");
}

export function evaluateBadges(state: ProgressState, modules: Module[]): string[] {
  const earned = new Set(state.badges);
  if (state.completedLessons.length > 0) earned.add("first-steps");
  if (Object.values(state.quizBest).some((score) => score >= 100)) earned.add("perfect-quiz");
  if (state.completedActivities.includes("tools")) earned.add("prompt-engineer");
  if ((state.quizBest.ethics ?? 0) >= 90) earned.add("ethics-champion");
  if ((state.quizBest.foundations ?? 0) >= 90) earned.add("myth-buster");
  if (state.streak.count >= 3) earned.add("streak-3");
  if (state.streak.count >= 7) earned.add("streak-7");
  for (const currentModule of modules) {
    if (currentModule.lessons.every((lesson) => state.completedLessons.includes(`${currentModule.id}/${lesson.id}`))
      && state.completedActivities.includes(currentModule.id) && (state.quizBest[currentModule.id] ?? 0) >= 70) {
      earned.add(`module-${currentModule.id}`);
    }
  }
  const world = worldOf(state);
  if (modules.every((module) => world.stamps.includes(module.id))) earned.add("world-explorer");
  if (glossary.every((entry) => world.words.includes(entry.term))) earned.add("word-collector");
  const allComplete = modules.every((module) => earned.has(`module-${module.id}`));
  if (allComplete) earned.add("ai-ally");
  return [...earned];
}
