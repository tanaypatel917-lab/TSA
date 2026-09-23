import { describe, expect, it } from "vitest";
import { modules } from "@/content";
import { foundations } from "@/content/modules/foundations";
import { chapterMinutes, chapterProgress } from "./chapters";
import { lessonsForTerm } from "./glossary";
import { initialState } from "./progress";

const allLessons = foundations.lessons.map((lesson) => `foundations/${lesson.id}`);

describe("chapter progress", () => {
  it("starts new learners on the first lesson", () => {
    expect(chapterProgress(initialState, foundations)).toMatchObject({ status: "new", label: "Not started", started: false, next: { href: "/modules/ai-foundations/lessons/what-is-ai", label: "Lesson 1: What AI is (and is not)" } });
  });

  it("points at the next unread lesson, then the activity, then the quiz", () => {
    expect(chapterProgress({ ...initialState, completedLessons: allLessons.slice(0, 2) }, foundations)).toMatchObject({ status: "progress", label: "2 of 5 lessons read", next: { label: "Lesson 3: How language models predict text" } });
    expect(chapterProgress({ ...initialState, completedLessons: allLessons }, foundations).next).toEqual({ href: "/modules/ai-foundations/activity", label: foundations.activity.title });
    expect(chapterProgress({ ...initialState, completedLessons: allLessons, completedActivities: ["foundations"], quizBest: { foundations: 60 } }, foundations).next).toEqual({ href: "/modules/ai-foundations/quiz", label: "Knowledge check" });
  });

  it("completes a chapter only with every lesson, the activity and a 70% quiz", () => {
    const done = chapterProgress({ ...initialState, completedLessons: allLessons, completedActivities: ["foundations"], quizBest: { foundations: 80 } }, foundations);
    expect(done).toMatchObject({ status: "complete", label: "Complete", complete: true, next: null });
    expect(chapterMinutes(foundations)).toBe(38);
  });
});

describe("glossary lesson links", () => {
  it("prefers lessons that name the term in their title", () => {
    expect(lessonsForTerm("Hallucination", modules)[0]).toEqual({ href: "/modules/ai-foundations/lessons/strengths-and-limits", title: "Strengths, limits, and hallucinations" });
    expect(lessonsForTerm("Token", modules).map((lesson) => lesson.title)).toContain("How language models predict text");
    expect(lessonsForTerm("Bias", modules)).toHaveLength(2);
  });

  it("returns nothing for terms the lessons never use", () => {
    expect(lessonsForTerm("Prompt injection", modules)).toEqual([]);
  });
});
