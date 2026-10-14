import { describe, expect, it } from "vitest";
import { modules } from "@/content";
import { initialState } from "./progress";
import { wrapped } from "./wrapped";

describe("wrapped", () => {
  it("starts empty for a new learner", () => {
    const recap = wrapped(initialState, modules);
    expect(recap).toMatchObject({ persona: "The Curious Starter", minutes: 0, lessons: 0, quizzes: 0, average: 0, best: null, words: 0, days: null, complete: false });
    expect(recap.totalLessons).toBe(modules.reduce((sum, module) => sum + module.lessons.length, 0));
  });

  it("adds up reading minutes, quiz scores and days since starting", () => {
    const [first, second] = modules;
    const state = { ...initialState, startedAt: "2026-10-01T12:00:00.000Z", completedLessons: [`${first.id}/${first.lessons[0].id}`, `${first.id}/${first.lessons[1].id}`], quizBest: { [first.id]: 80, [second.id]: 100 } };
    const recap = wrapped(state, modules, new Date("2026-10-04T12:00:00.000Z"));
    expect(recap.minutes).toBe(first.lessons[0].minutes + first.lessons[1].minutes);
    expect(recap.lessons).toBe(2);
    expect(recap.quizzes).toBe(2);
    expect(recap.average).toBe(90);
    expect(recap.best).toEqual({ title: second.title, score: 100 });
    expect(recap.days).toBe(3);
    expect(recap.persona).toBe("The Fact-Checker");
  });

  it("names word hunters from the island", () => {
    const state = { ...initialState, world: { words: Array.from({ length: 20 }, (_, index) => `word-${index}`), stamps: [] } };
    expect(wrapped(state, modules).persona).toBe("The Word Hunter");
  });
});
