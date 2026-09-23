import { afterEach, describe, expect, it, vi } from "vitest";
import { exportProgress, importProgress, loadProgress, PROGRESS_KEY, saveProgress } from "./storage";
import { initialState } from "./progress";

afterEach(() => { vi.unstubAllGlobals(); });

describe("progress storage", () => {
  it("saves and loads progress under the Wordplay key", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } } });
    expect(loadProgress()).toEqual(initialState);
    saveProgress({ ...initialState, xp: 30 });
    expect(loadProgress().xp).toBe(30);
    expect([...values.keys()]).toEqual([PROGRESS_KEY]);
  });
});

describe("storage serialization", () => {
  it("rejects garbage and wrong versions", () => {
    expect(importProgress("nope")).toBeNull();
    expect(importProgress(JSON.stringify({ ...initialState, version: 2 }))).toBeNull();
  });
  it("round trips valid progress", () => {
    const original = { ...initialState, xp: 20, completedLessons: ["foundations/data-and-bias"], completedActivities: ["tools"], quizBest: { foundations: 80 }, badges: ["first-steps", "prompt-engineer"] };
    expect(importProgress(exportProgress(original))).toEqual(original);
  });
  it("rejects malformed nested collections and nonfinite or negative values", () => {
    const invalid = [
      { completedLessons: [null] }, { completedActivities: [{}] }, { badges: [1] },
      { quizBest: [] }, { quizBest: { foundations: "100" } }, { quizBest: { foundations: 101 } },
      { xp: -1 }, { xp: Infinity }, { streak: { count: -2, lastDay: "" } }
    ];
    for (const change of invalid) expect(importProgress(JSON.stringify({ ...initialState, ...change }))).toBeNull();
    expect(importProgress('{"version":1,"xp":1e400,"completedLessons":[],"completedActivities":[],"quizBest":{},"badges":[],"streak":{"count":0,"lastDay":""},"startedAt":null}')).toBeNull();
  });
  it("retains unknown string IDs for v1 compatibility without adding XP", () => {
    expect(importProgress(exportProgress({ ...initialState, completedLessons: ["legacy/lesson"] }))).toMatchObject({ xp: 0, completedLessons: ["legacy/lesson"] });
  });
});
