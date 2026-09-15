import type { Module } from "@/content/types";
import type { ProgressState } from "./progress";

export const BADGES = [
  { id: "first-steps", name: "First Steps", description: "Complete your first lesson.", icon: "🌱" },
  { id: "module-foundations", name: "Foundation Builder", description: "Complete AI Foundations.", icon: "🧭" },
  { id: "module-tools", name: "Tool Tinkerer", description: "Complete AI Tools & Techniques.", icon: "🛠️" },
  { id: "module-ethics", name: "Ethical Explorer", description: "Complete Ethical & Responsible Use.", icon: "🫶" },
  { id: "module-real-world", name: "World Watcher", description: "Complete AI in the Real World.", icon: "🌍" },
  { id: "module-capstone", name: "Project Pilot", description: "Complete the AI Compass Capstone.", icon: "🚀" },
  { id: "perfect-quiz", name: "Perfect Quiz", description: "Score 100% on any quiz.", icon: "💯" },
  { id: "prompt-engineer", name: "Prompt Engineer", description: "Complete the prompt lab.", icon: "🧪" },
  { id: "ethics-champion", name: "Ethics Champion", description: "Score at least 90% on ethics.", icon: "⚖️" },
  { id: "myth-buster", name: "Myth Buster", description: "Score at least 90% on foundations.", icon: "🔎" },
  { id: "streak-3", name: "Three-Day Spark", description: "Build a three-day streak.", icon: "🔥" },
  { id: "streak-7", name: "Week of Wonder", description: "Build a seven-day streak.", icon: "🌟" },
  { id: "ai-ally", name: "AI Ally", description: "Complete every module.", icon: "🏆" }
] as const;

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
  const allComplete = modules.every((module) => earned.has(`module-${module.id}`));
  if (allComplete) earned.add("ai-ally");
  return [...earned];
}
