import { describe, expect, it } from "vitest";
import { modules } from "./index";
import { bigIdeas, chapterPlans } from "./toolkit";

describe("teacher toolkit", () => {
  it("has one plan per chapter, in course order", () => {
    expect(chapterPlans.map((plan) => plan.moduleId)).toEqual(modules.map((module) => module.id));
  });

  it("only maps to real Big Ideas and real lessons", () => {
    for (const plan of chapterPlans) {
      const chapter = modules.find((item) => item.id === plan.moduleId)!;
      expect(plan.bigIdeas.every((id) => bigIdeas.some((idea) => idea.id === id))).toBe(true);
      expect(plan.worksheet).toHaveLength(6);
      for (const item of plan.worksheet) expect(chapter.lessons.some((lesson) => lesson.id === item.lessonId), item.lessonId).toBe(true);
    }
  });
});
