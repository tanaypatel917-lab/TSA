import { describe, expect, it } from "vitest";
import type { QuizQuestion } from "../content/types";
import { estimateChoice } from "./estimate";

const question: QuizQuestion = {
  id: "estimate",
  prompt: "About how many tokens?",
  choices: ["About 100", "About 225", "About 400", "About 900"],
  answerIndex: 2,
  explanation: "A short explanation.",
  estimate: { min: 100, max: 1000, step: 10, answer: 400, tolerance: 60, unit: "tokens" }
};

describe("estimateChoice", () => {
  it("accepts guesses within the tolerance", () => {
    expect(estimateChoice(question, 450)).toBe(question.answerIndex);
  });

  it("maps a guess just below tolerance to the closest wrong bucket", () => {
    expect(estimateChoice(question, 339)).toBe(1);
  });

  it("maps far guesses to the nearest wrong bucket", () => {
    expect(estimateChoice(question, 850)).toBe(3);
  });

  it("parses commas in choice numbers", () => {
    const commaChoices = { ...question, choices: ["About 100", "About 225", "About 400", "About 1,000"] };
    expect(estimateChoice(commaChoices, 900)).toBe(3);
  });

  it("rejects questions without an estimate", () => {
    const regularQuestion: QuizQuestion = {
      id: "regular",
      prompt: "Which one?",
      choices: ["First", "Second"],
      answerIndex: 0,
      explanation: "A short explanation."
    };
    expect(() => estimateChoice(regularQuestion, 100)).toThrow("does not have an estimate slider");
  });
});
