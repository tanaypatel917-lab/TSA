import { describe, expect, it } from "vitest";
import { getModule } from "./index";
import { referenceById } from "./references";
import { timelineEras } from "./timeline";

describe("AI timeline content", () => {
  it("has six Past, three Now, and three Next entries", () => {
    expect(timelineEras.map(({ id, entries }) => [id, entries.length])).toEqual([
      ["past", 6],
      ["now", 3],
      ["next", 3]
    ]);
  });

  it("keeps Past and Now years in strictly increasing order", () => {
    const entries = timelineEras.filter(({ id }) => id !== "next").flatMap(({ entries }) => entries);
    const years = entries.map(({ year }) => year);
    expect(years.every((year) => typeof year === "number")).toBe(true);
    expect(years).toEqual([...years].sort((a, b) => Number(a) - Number(b)));
    expect(new Set(years).size).toBe(years.length);
  });

  it("points each sourced entry to a known reference", () => {
    for (const { entries } of timelineEras) {
      for (const { refId } of entries) if (refId) expect(referenceById(refId), refId).toBeDefined();
    }
  });

  it("uses lesson links that resolve to existing module lessons", () => {
    for (const { entries } of timelineEras) {
      for (const { lesson } of entries) {
        if (!lesson) continue;
        const match = lesson.href.match(/^\/modules\/([^/]+)\/lessons\/([^/]+)\/$/);
        expect(match, lesson.href).not.toBeNull();
        const [, slug, lessonId] = match!;
        expect(getModule(slug)?.lessons.some(({ id }) => id === lessonId), lesson.href).toBe(true);
      }
    }
  });
});
