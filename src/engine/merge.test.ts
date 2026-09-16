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
      { ...initialState, streak: { count: 2, lastDay: "2027-01-03" } },
      { ...initialState, streak: { count: 7, lastDay: "2027-01-02" } }
    ).streak).toEqual({ count: 2, lastDay: "2027-01-03" });
    expect(mergeProgress(
      { ...initialState, streak: { count: 2, lastDay: "2027-01-03" } },
      { ...initialState, streak: { count: 7, lastDay: "2027-01-03" } }
    ).streak).toEqual({ count: 7, lastDay: "2027-01-03" });
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
