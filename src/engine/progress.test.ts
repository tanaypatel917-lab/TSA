import { describe, expect, it } from "vitest";
import { apply, initialState } from "./progress";
import { foundations } from "@/content/modules/foundations";

describe("progress engine", () => {
  it("awards lesson XP only once", () => {
    const event = { type: "lesson-completed" as const, moduleId: "foundations", lessonId: "what-is-ai", day: "2027-01-01" };
    const first = apply(initialState, event, [foundations]);
    const second = apply(first.state, event, [foundations]);
    expect(first.xpGained).toBe(10);
    expect(second.xpGained).toBe(0);
  });

  it("awards quiz score deltas", () => {
    const first = apply(initialState, { type: "quiz-completed", moduleId: "foundations", scorePct: 70, day: "2027-01-01" }, [foundations]);
    const second = apply(first.state, { type: "quiz-completed", moduleId: "foundations", scorePct: 90, day: "2027-01-01" }, [foundations]);
    expect(first.xpGained).toBe(35);
    expect(second.xpGained).toBe(10);
    expect(second.state.quizBest.foundations).toBe(90);
  });

  it("increments and resets streaks", () => {
    const first = apply(initialState, { type: "lesson-completed", moduleId: "foundations", lessonId: "what-is-ai", day: "2027-01-01" }, [foundations]);
    const second = apply(first.state, { type: "activity-completed", moduleId: "foundations", day: "2027-01-02" }, [foundations]);
    const reset = apply(second.state, { type: "quiz-completed", moduleId: "foundations", scorePct: 70, day: "2027-01-05" }, [foundations]);
    expect(second.state.streak.count).toBe(2);
    expect(second.xpGained).toBe(30);
    expect(reset.state.streak.count).toBe(1);
  });
});

describe("tier 1 engagement", () => {
  const day = (n: number) => `2027-02-${String(n).padStart(2, "0")}`;
  const lesson = (d: string) => ({ type: "lesson-completed" as const, moduleId: "foundations", lessonId: `l-${d}`, day: d });

  it("daily challenge awards 15 XP once per day", () => {
    const first = apply(initialState, { type: "daily-challenge-completed", day: day(1), correct: 2 }, [foundations]);
    const second = apply(first.state, { type: "daily-challenge-completed", day: day(1), correct: 3 }, [foundations]);
    expect(first.xpGained).toBe(15);
    expect(second.xpGained).toBe(0);
    expect(second.state.dailyChallenge.completed).toBe(1);
    const nextDay = apply(second.state, { type: "daily-challenge-completed", day: day(2), correct: 0 }, [foundations]);
    expect(nextDay.state.dailyChallenge.completed).toBe(2);
  });

  it("earns shields every 5 streak days, capped at 2", () => {
    let state = initialState;
    for (let n = 1; n <= 10; n += 1) state = apply(state, lesson(day(n)), [foundations]).state;
    expect(state.streak.count).toBe(10);
    expect(state.streak.shields).toBe(2);
    expect(state.streak.longest).toBe(10);
    expect(state.daysActive).toBe(10);
  });

  it("consumes a shield across a gap and keeps the streak", () => {
    let state = initialState;
    for (let n = 1; n <= 5; n += 1) state = apply(state, lesson(day(n)), [foundations]).state;
    const result = apply(state, lesson(day(7)), [foundations]);
    expect(result.shieldUsed).toBe(true);
    expect(result.state.streak.count).toBe(6);
    expect(result.state.streak.shields).toBe(0);
    expect(result.state.daysActive).toBe(6);
  });

  it("resets the streak on a gap with no shields", () => {
    let state = initialState;
    for (let n = 1; n <= 3; n += 1) state = apply(state, lesson(day(n)), [foundations]).state;
    const result = apply(state, lesson(day(6)), [foundations]);
    expect(result.shieldUsed).toBe(false);
    expect(result.state.streak.count).toBe(1);
    expect(result.state.streak.longest).toBe(3);
  });

  it("onboarding awards 10 XP once and none when skipped", () => {
    const event = { type: "onboarding-completed" as const, day: day(1), dailyGoal: 2 as const, startModule: "foundations", correct: 4 };
    const first = apply(initialState, event, [foundations]);
    expect(first.xpGained).toBe(10);
    const second = apply(first.state, event, [foundations]);
    expect(second.xpGained).toBe(0);
    const skipped = apply(initialState, { ...event, skipped: true }, [foundations]);
    expect(skipped.xpGained).toBe(0);
    expect(skipped.state.onboarding.done).toBe(true);
  });

  it("flags leveledUp when crossing 100 XP", () => {
    const rich = { ...initialState, xp: 95 };
    const result = apply(rich, lesson(day(1)), [foundations]);
    expect(result.leveledUp).toBe(true);
    const poor = apply(initialState, lesson(day(1)), [foundations]);
    expect(poor.leveledUp).toBe(false);
  });
});

describe("streak shield coverage", () => {
  const day = (n: number) => `2027-04-${String(n).padStart(2, "0")}`;
  const lesson = (d: string) => ({ type: "lesson-completed" as const, moduleId: "foundations", lessonId: `l-${d}`, day: d });
  const withShields = (shields: number) => ({
    ...initialState,
    streak: { count: 5, lastDay: day(1), shields, longest: 5 }
  });

  it("one shield covers one missed day", () => {
    const result = apply(withShields(1), lesson(day(3)), [foundations]);
    expect(result.shieldUsed).toBe(true);
    expect(result.state.streak).toMatchObject({ count: 6, shields: 0, lastDay: day(3) });
  });

  it("one shield does not cover two missed days", () => {
    const result = apply(withShields(1), lesson(day(4)), [foundations]);
    expect(result.shieldUsed).toBe(false);
    expect(result.state.streak).toMatchObject({ count: 1, shields: 0, lastDay: day(4) });
  });

  it("two shields cover two missed days", () => {
    const result = apply(withShields(2), lesson(day(4)), [foundations]);
    expect(result.shieldUsed).toBe(true);
    expect(result.state.streak).toMatchObject({ count: 6, shields: 0, lastDay: day(4) });
  });
});
