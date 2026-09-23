import { describe, expect, it } from "vitest";
import { tools } from "@/content/modules/tools";
import { evaluatePrompt } from "./prompt";

const rubric = tools.activity.kind === "prompt-lab" ? tools.activity.rubric : [];

describe("shared prompt rubric", () => {
  it("reports missing terms for an empty prompt", () => {
    const result = evaluatePrompt("", rubric);
    expect(result.score).toBe(0);
    expect(result.ready).toBe(false);
    expect(result.checks.every((check) => !check.ok)).toBe(true);
  });
  it("preserves case-insensitive keyword matching and the four-term threshold", () => {
    expect(evaluatePrompt("TEACHER explain climate in a table", rubric)).toMatchObject({ score: 4, ready: true });
    expect(evaluatePrompt("teacher explain climate", rubric)).toMatchObject({ score: 3, ready: false });
    expect(evaluatePrompt("teacher explain climate in a table with sources", rubric)).toMatchObject({ score: 5, ready: true });
  });
  it("uses the actual content rubric without mutating it", () => {
    const before = JSON.stringify(rubric);
    expect(evaluatePrompt("Tell me about climate change for school.", rubric).checks.find((check) => check.id === "context")?.ok).toBe(true);
    expect(JSON.stringify(rubric)).toBe(before);
  });
});
