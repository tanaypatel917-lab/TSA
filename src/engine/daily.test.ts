import { describe, expect, it } from "vitest";
import { pickDailyQuestions } from "./daily";
import { modules } from "@/content";

describe("daily challenge picking", () => {
  it("is deterministic for the same day", () => {
    expect(pickDailyQuestions("2027-03-01", modules)).toEqual(pickDailyQuestions("2027-03-01", modules));
  });

  it("picks 3 distinct questions", () => {
    const picked = pickDailyQuestions("2027-03-01", modules);
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((entry) => entry.question.id)).size).toBe(3);
  });

  it("prefers distinct modules when possible", () => {
    const picked = pickDailyQuestions("2027-03-02", modules);
    expect(new Set(picked.map((entry) => entry.moduleId)).size).toBe(3);
  });

  it("differs across days", () => {
    const base = pickDailyQuestions("2027-03-01", modules).map((entry) => entry.question.id);
    const others = ["2027-03-02", "2027-03-03", "2027-03-04", "2027-03-05", "2027-03-06"];
    const different = others.some((day) => {
      const ids = pickDailyQuestions(day, modules).map((entry) => entry.question.id);
      return ids.join() !== base.join();
    });
    expect(different).toBe(true);
  });
});
