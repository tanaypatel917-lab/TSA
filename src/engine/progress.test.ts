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

describe("Wordplay World progress", () => {
  it("awards word and station XP once and keeps them in the world record", () => {
    const word = apply(initialState, { type: "word-collected", term: "Token", day: "2027-01-01" }, [foundations]);
    const again = apply(word.state, { type: "word-collected", term: "Token", day: "2027-01-01" }, [foundations]);
    const stamp = apply(again.state, { type: "station-stamped", moduleId: "foundations", day: "2027-01-01" }, [foundations]);
    expect([word.xpGained, again.xpGained, stamp.xpGained]).toEqual([2, 0, 10]);
    expect(stamp.state.world).toMatchObject({ words: ["Token"], stamps: ["foundations"] });
    expect(initialState.world).toEqual({ words: [], stamps: [] });
  });

  it("accepts saved progress from before the world existed", () => {
    const { world: _unused, ...older } = initialState;
    const result = apply(older, { type: "word-collected", term: "Model", day: "2027-01-01" }, [foundations]);
    expect(result.state.world?.words).toEqual(["Model"]);
  });
});

describe("mission results", () => {
  it("keeps the best score and stars, stamps on one star, and adds a first perfect bonus once", () => {
    const miss = apply(initialState, { type: "mission-finished", moduleId: "tools", score: 300, stars: 0, day: "2027-01-01" }, [foundations]);
    expect([miss.xpGained, miss.state.world?.stamps]).toEqual([0, []]);
    const star = apply(miss.state, { type: "mission-finished", moduleId: "tools", score: 900, stars: 1, day: "2027-01-01" }, [foundations]);
    expect([star.xpGained, star.state.world?.stamps]).toEqual([10, ["tools"]]);
    const perfect = apply(star.state, { type: "mission-finished", moduleId: "tools", score: 2400, stars: 3, day: "2027-01-01" }, [foundations]);
    const again = apply(perfect.state, { type: "mission-finished", moduleId: "tools", score: 1200, stars: 3, day: "2027-01-01" }, [foundations]);
    expect([perfect.xpGained, again.xpGained]).toEqual([5, 0]);
    expect(again.state.world?.best).toEqual({ tools: 2400 });
    expect(again.state.world?.stars).toEqual({ tools: 3 });
  });
});
