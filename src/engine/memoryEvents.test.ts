import { describe, expect, it } from "vitest";
import { foundations } from "@/content/modules/foundations";
import { describeEvent } from "./memoryEvents";

const day = "2027-01-01";

describe("describeEvent", () => {
  it("describes a completed lesson", () => {
    const messages = describeEvent(
      { type: "lesson-completed", moduleId: "foundations", lessonId: "what-is-ai", day },
      [foundations]
    );
    expect(messages).not.toBeNull();
    expect(messages![0]).toEqual({
      role: "user",
      content: "I finished the lesson 'What AI is (and is not)' in the module 'AI Foundations'."
    });
    expect(messages![1].role).toBe("assistant");
  });

  it("describes a completed activity", () => {
    const messages = describeEvent(
      { type: "activity-completed", moduleId: "foundations", day },
      [foundations]
    );
    expect(messages).not.toBeNull();
    expect(messages![0].content).toContain("Train a tiny message classifier");
    expect(messages![0].content).toContain("AI Foundations");
  });

  it("describes a passing quiz", () => {
    const messages = describeEvent(
      { type: "quiz-completed", moduleId: "foundations", scorePct: 80, day },
      [foundations]
    );
    expect(messages![0].content).toBe("I scored 80% on the 'AI Foundations' quiz.");
    expect(messages![1].content).toContain("understand AI Foundations well");
  });

  it("describes a struggling quiz", () => {
    const messages = describeEvent(
      { type: "quiz-completed", moduleId: "foundations", scorePct: 40, day },
      [foundations]
    );
    expect(messages![1].content).toContain("struggled with AI Foundations");
  });

  it("describes a daily challenge", () => {
    const messages = describeEvent(
      { type: "daily-challenge-completed", day, correct: 3 },
      [foundations]
    );
    expect(messages![0].content).toContain("3 correct answers");
  });

  it("describes onboarding with goal and start module", () => {
    const messages = describeEvent(
      { type: "onboarding-completed", day, dailyGoal: 2, startModule: "foundations", correct: 4 },
      [foundations]
    );
    expect(messages![0].content).toContain("2 lessons per day");
    expect(messages![0].content).toContain("AI Foundations");
  });

  it("returns null for skipped onboarding", () => {
    expect(
      describeEvent(
        { type: "onboarding-completed", day, dailyGoal: 2, startModule: "foundations", correct: 0, skipped: true },
        [foundations]
      )
    ).toBeNull();
  });

  it("returns null for an unknown module", () => {
    expect(
      describeEvent({ type: "lesson-completed", moduleId: "nope", lessonId: "x", day }, [foundations])
    ).toBeNull();
    expect(
      describeEvent({ type: "quiz-completed", moduleId: "nope", scorePct: 90, day }, [foundations])
    ).toBeNull();
  });
});
