import { describe, expect, it } from "vitest";
import { initialState } from "./progress";
import { mergeProgress } from "./merge";

describe("progress merge", () => {
  it("unions and deduplicates arrays with local values first", () => {
    const merged = mergeProgress(
      { ...initialState, completedLessons: ["a", "shared"], completedActivities: ["one"], badges: ["first"] },
      { ...initialState, completedLessons: ["shared", "b"], completedActivities: ["one", "two"], badges: ["first", "second"] }
    );
    expect(merged.completedLessons).toEqual(["a", "shared", "b"]);
    expect(merged.completedActivities).toEqual(["one", "two"]);
    expect(merged.badges).toEqual(["first", "second"]);
  });

  it("keeps the maximum quiz score per module", () => {
    const merged = mergeProgress(
      { ...initialState, quizBest: { foundations: 70, tools: 90 } },
      { ...initialState, quizBest: { foundations: 85, ethics: 80 } }
    );
    expect(merged.quizBest).toEqual({ foundations: 85, tools: 90, ethics: 80 });
  });

  it("chooses the later streak and breaks ties with the higher count", () => {
    expect(mergeProgress(
      { ...initialState, streak: { count: 2, lastDay: "2027-01-03", shields: 0, longest: 2 } },
      { ...initialState, streak: { count: 7, lastDay: "2027-01-02", shields: 0, longest: 7 } }
    ).streak).toEqual({ count: 2, lastDay: "2027-01-03", shields: 0, longest: 7 });
    expect(mergeProgress(
      { ...initialState, streak: { count: 2, lastDay: "2027-01-03", shields: 0, longest: 2 } },
      { ...initialState, streak: { count: 7, lastDay: "2027-01-03", shields: 0, longest: 7 } }
    ).streak).toEqual({ count: 7, lastDay: "2027-01-03", shields: 0, longest: 7 });
  });

  it("keeps the earliest non-null start time", () => {
    expect(mergeProgress(
      { ...initialState, startedAt: "2027-01-03T00:00:00.000Z" },
      { ...initialState, startedAt: "2027-01-01T00:00:00.000Z" }
    ).startedAt).toBe("2027-01-01T00:00:00.000Z");
    expect(mergeProgress(initialState, { ...initialState, startedAt: "2027-01-01T00:00:00.000Z" }).startedAt).toBe("2027-01-01T00:00:00.000Z");
  });

  it("merging initial state with itself is an identity", () => {
    expect(mergeProgress(initialState, initialState)).toEqual(initialState);
  });
});

describe("tier 1 fields", () => {
  it("keeps max shields and longest regardless of which streak wins", () => {
    const merged = mergeProgress(
      { ...initialState, streak: { count: 9, lastDay: "2027-01-09", shields: 2, longest: 9 } },
      { ...initialState, streak: { count: 3, lastDay: "2027-01-10", shields: 1, longest: 12 } }
    );
    expect(merged.streak).toEqual({ count: 3, lastDay: "2027-01-10", shields: 2, longest: 12 });
  });

  it("takes max daysActive and merges the daily challenge", () => {
    const merged = mergeProgress(
      { ...initialState, daysActive: 14, dailyChallenge: { lastDay: "2027-01-09", completed: 4 } },
      { ...initialState, daysActive: 9, dailyChallenge: { lastDay: "2027-01-10", completed: 7 } }
    );
    expect(merged.daysActive).toBe(14);
    expect(merged.dailyChallenge).toEqual({ lastDay: "2027-01-10", completed: 7 });
  });

  it("prefers a completed onboarding", () => {
    const done = { done: true, dailyGoal: 3 as const, startModule: "tools" };
    const notDone = { done: false, dailyGoal: 2 as const, startModule: null };
    expect(mergeProgress({ ...initialState, onboarding: done }, { ...initialState, onboarding: notDone }).onboarding).toEqual(done);
    expect(mergeProgress({ ...initialState, onboarding: notDone }, { ...initialState, onboarding: done }).onboarding).toEqual(done);
    expect(mergeProgress({ ...initialState, onboarding: notDone }, initialState).onboarding).toEqual(notDone);
  });
});
