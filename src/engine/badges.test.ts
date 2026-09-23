import { describe, expect, it } from "vitest";
import { badgeProgress, evaluateBadges } from "./badges";
import { glossary } from "@/content/glossary";
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

describe("world badges", () => {
  it("awards World Explorer for every stamp and Word Collector for every glossary word", () => {
    const words = glossary.map((entry) => entry.term);
    const state = { ...initialState, world: { words, stamps: ["foundations", "tools"] } };
    expect(evaluateBadges(state, [foundations, tools])).toEqual(expect.arrayContaining(["world-explorer", "word-collector"]));
    const partial = { ...initialState, world: { words: words.slice(1), stamps: ["foundations"] } };
    expect(evaluateBadges(partial, [foundations, tools])).not.toContain("world-explorer");
    expect(evaluateBadges(partial, [foundations, tools])).not.toContain("word-collector");
    expect(badgeProgress("word-collector", partial, [foundations, tools]).label).toBe(`${words.length - 1} of ${words.length} words collected`);
    expect(badgeProgress("world-explorer", partial, [foundations, tools]).label).toBe("1 of 2 stations stamped");
  });
});
