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
