import { describe, expect, it } from "vitest";
import { evaluateBadges } from "./badges";
import { initialState } from "./progress";
import { foundations } from "@/content/modules/foundations";
import { tools } from "@/content/modules/tools";

describe("badges", () => {
  it("evaluates quiz badges", () => {
    const state = { ...initialState, completedLessons: ["foundations/what-is-ai"], quizBest: { foundations: 100, ethics: 90 } };
    expect(evaluateBadges(state, [foundations, tools])).toEqual(expect.arrayContaining(["first-steps", "perfect-quiz", "myth-buster", "ethics-champion"]));
  });

  it("evaluates a completed module and all modules", () => {
    const complete = {
      ...initialState,
      completedLessons: foundations.lessons.map((lesson) => `foundations/${lesson.id}`),
      completedActivities: ["foundations"],
      quizBest: { foundations: 70 }
    };
    expect(evaluateBadges(complete, [foundations])).toContain("module-foundations");
    expect(evaluateBadges(complete, [foundations])).toContain("ai-ally");
  });
});
