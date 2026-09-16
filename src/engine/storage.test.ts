import { describe, expect, it } from "vitest";
import { exportProgress, importProgress } from "./storage";
import { initialState } from "./progress";

describe("storage serialization", () => {
  it("rejects garbage and wrong versions", () => {
    expect(importProgress("nope")).toBeNull();
    expect(importProgress(JSON.stringify({ ...initialState, version: 2 }))).toBeNull();
  });
  it("round trips valid progress", () => {
    expect(importProgress(exportProgress({ ...initialState, xp: 20 }))).toMatchObject({ xp: 20, version: 1 });
  });
});

describe("normalizeState via import", () => {
  it("fills defaults for a bare v1 save", () => {
    const old = {
      version: 1, xp: 40, completedLessons: ["foundations/what-is-ai"],
      completedActivities: [], quizBest: {}, badges: [],
      streak: { count: 2, lastDay: "2027-01-01" }, startedAt: "2027-01-01T12:00:00.000Z"
    };
    const imported = importProgress(JSON.stringify(old));
    expect(imported).not.toBeNull();
    expect(imported).toMatchObject({
      xp: 40,
      streak: { count: 2, lastDay: "2027-01-01", shields: 0, longest: 2 },
      daysActive: 0,
      dailyChallenge: { lastDay: "", completed: 0 },
      onboarding: { done: true, dailyGoal: 2, startModule: null }
    });
  });

  it("sends brand-new users through onboarding", () => {
    const old = {
      version: 1, xp: 0, completedLessons: [], completedActivities: [],
      quizBest: {}, badges: [],
      streak: { count: 0, lastDay: "" }, startedAt: null
    };
    const imported = importProgress(JSON.stringify(old));
    expect(imported).not.toBeNull();
    expect(imported).toMatchObject({
      streak: { count: 0, lastDay: "", shields: 0, longest: 0 },
      onboarding: { done: false, dailyGoal: 2, startModule: null }
    });
  });
});
