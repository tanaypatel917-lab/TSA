import type { Module } from "@/content/types";
import type { ProgressEvent } from "./progress";

export function describeEvent(
  event: ProgressEvent,
  moduleList: Module[]
): { role: "user" | "assistant"; content: string }[] | null {
  switch (event.type) {
    case "lesson-completed": {
      const mod = moduleList.find((m) => m.id === event.moduleId);
      const lesson = mod?.lessons.find((l) => l.id === event.lessonId);
      if (!mod || !lesson) return null;
      return [
        { role: "user", content: `I finished the lesson '${lesson.title}' in the module '${mod.title}'.` },
        { role: "assistant", content: `Nice work — keep going with '${mod.title}'.` }
      ];
    }
    case "activity-completed": {
      const mod = moduleList.find((m) => m.id === event.moduleId);
      if (!mod) return null;
      return [
        { role: "user", content: `I completed the activity '${mod.activity.title}' in the module '${mod.title}'.` },
        { role: "assistant", content: `Great — hands-on practice in '${mod.title}' is done.` }
      ];
    }
    case "quiz-completed": {
      const mod = moduleList.find((m) => m.id === event.moduleId);
      if (!mod) return null;
      const score = Math.round(event.scorePct);
      return [
        { role: "user", content: `I scored ${score}% on the '${mod.title}' quiz.` },
        score >= 70
          ? { role: "assistant", content: `Great — you understand ${mod.title} well.` }
          : { role: "assistant", content: `You struggled with ${mod.title}, worth reviewing.` }
      ];
    }
    case "daily-challenge-completed":
      return [
        { role: "user", content: `I completed today's Compass Check with ${event.correct} correct answer${event.correct === 1 ? "" : "s"}.` },
        { role: "assistant", content: "Good habit — daily checks keep your skills sharp." }
      ];
    case "onboarding-completed": {
      if (event.skipped) return null;
      const mod = moduleList.find((m) => m.id === event.startModule || m.slug === event.startModule);
      const goal = `${event.dailyGoal} lesson${event.dailyGoal === 1 ? "" : "s"} per day`;
      return [
        { role: "user", content: `I set a daily goal of ${goal}${mod ? ` and want to start with the module '${mod.title}'` : ""}.` },
        { role: "assistant", content: `Got it — I'll help you stick to ${goal}.` }
      ];
    }
    default:
      return null;
  }
}
