import { describe, expect, it } from "vitest";
import { modules } from "@/content";
import { glossary } from "@/content/glossary";
import { foundations } from "@/content/modules/foundations";
import { badgeProgress } from "./badges";
import { chapterSteps, overallProgress } from "./chapters";
import { markClues, tallyClues } from "./clues";
import { chapterTerms, lessonTerms, termSlug } from "./glossary";
import { initialState } from "./progress";

describe("chapter steps and overall progress", () => {
  it("lists every lesson, the practice and the quiz as steps", () => {
    const state = { ...initialState, completedLessons: ["foundations/what-is-ai"], quizBest: { foundations: 60 } };
    const steps = chapterSteps(state, foundations);
    expect(steps.map((step) => step.kind)).toEqual(["lesson", "lesson", "lesson", "lesson", "lesson", "practice", "quiz"]);
    expect(steps[0]).toMatchObject({ done: true, detail: "Lesson 1, 7 min", href: "/modules/ai-foundations/lessons/what-is-ai" });
    expect(steps[6]).toMatchObject({ done: false, detail: "Quiz, best 60%" });
  });

  it("counts a quiz once it reaches the 70% completion mark", () => {
    const total = modules.reduce((sum, module) => sum + module.lessons.length + 2, 0);
    expect(overallProgress(initialState, modules)).toBe(0);
    expect(overallProgress({ ...initialState, completedLessons: ["foundations/what-is-ai"], quizBest: { foundations: 70 } }, modules)).toBe(Math.round((2 / total) * 100));
  });
});

describe("badge progress", () => {
  it("describes how close each locked badge is", () => {
    const state = { ...initialState, completedLessons: ["foundations/what-is-ai", "foundations/rules-and-learning"], quizBest: { ethics: 60 }, streak: { count: 2, lastDay: "2026-09-22" } };
    expect(badgeProgress("module-foundations", state, modules)).toEqual({ value: 2 / 7, label: "2 of 7 steps done" });
    expect(badgeProgress("ethics-champion", state, modules)).toEqual({ value: 60 / 90, label: "Best 60%, needs 90%" });
    expect(badgeProgress("streak-7", state, modules)).toEqual({ value: 2 / 7, label: "2 of 7 days in a row" });
    expect(badgeProgress("perfect-quiz", state, modules)).toEqual({ value: 0.6, label: "Best quiz 60%, needs 100%" });
    expect(badgeProgress("ai-ally", state, modules)).toEqual({ value: 0, label: "0 of 5 chapters complete" });
    expect(badgeProgress("first-steps", initialState, modules)).toEqual({ value: 0, label: "Read any lesson" });
  });
});

describe("lesson glossary terms", () => {
  it("marks the first use of each term, preferring longer terms", () => {
    const terms = lessonTerms(["A prompt injection hides a prompt.", "Then the prompt changes."], [{ term: "Prompt", definition: "p" }, { term: "Prompt injection", definition: "pi" }]);
    expect(terms.map(({ term, paragraph, start, end }) => ({ term, paragraph, start, end }))).toEqual([{ term: "Prompt injection", paragraph: 0, start: 2, end: 18 }, { term: "Prompt", paragraph: 0, start: 27, end: 33 }]);
  });

  it("finds real terms in the lessons and skips the word AI", () => {
    const lesson = foundations.lessons.find((item) => item.id === "language-models")!;
    const terms = lessonTerms(lesson.body, glossary).map((term) => term.term);
    expect(terms).toEqual(expect.arrayContaining(["LLM", "Token", "Context"]));
    expect(terms).not.toContain("AI");
    expect(chapterTerms(foundations.lessons, glossary).map((term) => term.slug)).toContain("training-data");
    expect(termSlug("Human oversight")).toBe("human-oversight");
  });
});

describe("classifier clues", () => {
  const activity = foundations.activity.kind === "classifier" ? foundations.activity : null;

  it("tallies which clues appear in messages the learner labeled", () => {
    const tally = tallyClues(activity!.items, activity!.items.map((item) => item.label), activity!.clues!);
    expect(tally.find((row) => row.label === "A link to click")).toEqual({ label: "A link to click", spam: 2, notSpam: 0 });
    expect(tally.find((row) => row.label === "Everyday plans")).toEqual({ label: "Everyday plans", spam: 0, notSpam: 6 });
    expect(tallyClues(activity!.items.slice(0, 2), ["spam", "spam"], activity!.clues!).find((row) => row.label === "Everyday plans")?.spam).toBe(1);
  });

  it("splits a message into plain text and clue highlights", () => {
    expect(markClues("WIN a free phone now!!! Click this strange link.", activity!.clues!).filter((part) => part.clue).map((part) => part.text)).toEqual(["WIN", "free", "now", "!!!", "link"]);
    expect(markClues("Plain words", [])).toEqual([{ text: "Plain words", clue: false }]);
  });
});
