import { describe, expect, it } from "vitest";
import {
  checkPrompt,
  diceAudiences,
  diceConstraints,
  diceMeterText,
  diceTasks,
  rollDice,
  type DiceRoll
} from "./promptDice";

const initialRoll: DiceRoll = { task: 0, audience: 0, constraint: 0 };
const completePrompt = "Act as a friendly tutor. Explain photosynthesis to a 10-year-old in 3 sentences using simple words.";

describe("prompt challenge dice", () => {
  it("provides six choices for each die", () => {
    expect(diceTasks).toHaveLength(6);
    expect(diceAudiences).toHaveLength(6);
    expect(diceConstraints).toHaveLength(6);
  });

  it("always changes at least one die, even when the random faces repeat", () => {
    const next = rollDice(initialRoll, () => 0);
    expect(next).not.toEqual(initialRoll);
    expect(next).toEqual({ task: 1, audience: 0, constraint: 0 });
  });

  it("passes all five checks for a complete prompt", () => {
    const checks = checkPrompt(completePrompt, initialRoll);
    expect(checks).toHaveLength(5);
    expect(checks.every(({ passed }) => passed)).toBe(true);
  });

  it("matches only the task for a single task word", () => {
    const checks = checkPrompt("photosynthesis", initialRoll);
    expect(checks.filter(({ passed }) => passed).map(({ id }) => id)).toEqual(["task"]);
  });

  it("does not let 100 match the audience token 10", () => {
    const checks = checkPrompt("explain to 100 people", initialRoll);
    expect(checks.find(({ id }) => id === "audience")?.passed).toBe(false);
  });

  it("matches keywords regardless of case and collapses spaces in phrases", () => {
    expect(checkPrompt(completePrompt.toUpperCase(), initialRoll).every(({ passed }) => passed)).toBe(true);
    const roll = { task: 1, audience: 0, constraint: 0 };
    expect(checkPrompt("Summarize the causes of WORLD   WAR I", roll)[0].passed).toBe(true);
  });

  it("uses the required meter copy at each score", () => {
    expect(diceMeterText(2)).toBe("Vague: the AI has to guess.");
    expect(diceMeterText(3)).toBe("Better: say who it's for and set a limit.");
    expect(diceMeterText(5)).toBe("Specific: a challenge you can check.");
  });
});
