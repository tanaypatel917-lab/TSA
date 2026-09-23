import { describe, expect, it } from "vitest";
import { modules } from "./index";
import { formatCitation, referenceGroups, referenceKinds, referenceNumber, referencesForLesson } from "./references";

const references = referenceGroups.flatMap((group) => group.references);
const lessonKeys = modules.flatMap((module) => module.lessons.map((lesson) => `${module.id}/${lesson.id}`));

describe("references", () => {
  it("cites at least one source for every lesson", () => {
    const uncited = modules.flatMap((module) => module.lessons.filter((lesson) => !referencesForLesson(module.id, lesson.id).length).map((lesson) => `${module.id}/${lesson.id}`));
    expect(uncited).toEqual([]);
  });

  it("only links to lessons that exist", () => {
    expect(references.flatMap((reference) => reference.lessons).filter((key) => !lessonKeys.includes(key))).toEqual([]);
  });

  it("uses unique ids, secure links and continuous numbering", () => {
    expect(new Set(references.map((reference) => reference.id)).size).toBe(references.length);
    expect(references.every((reference) => reference.url.startsWith("https://"))).toBe(true);
    expect(references.map((reference) => referenceNumber(reference.id))).toEqual(references.map((_, index) => index + 1));
  });

  it("labels every source with a known type, a publisher and a short name", () => {
    expect(references.every((reference) => reference.kind in referenceKinds && reference.publisher.trim() && reference.short.trim())).toBe(true);
    expect(Object.keys(referenceKinds).every((kind) => references.some((reference) => reference.kind === kind))).toBe(true);
  });

  it("formats a plain-text APA citation for copying", () => {
    const dastin = references.find((reference) => reference.id === "dastin-2018")!;
    expect(formatCitation(dastin)).toBe("Dastin, J. (2018, October 10). Amazon scraps secret AI recruiting tool that showed bias against women. Reuters. https://www.reuters.com/article/world/amazon-scraps-secret-ai-recruiting-tool-that-showed-bias-against-women-idUSKCN1MK08J/");
    expect(formatCitation({ authors: "UNESCO", date: "2021", title: "Recommendation on the ethics of artificial intelligence", url: "https://www.unesco.org/" })).toBe("UNESCO (2021). Recommendation on the ethics of artificial intelligence. https://www.unesco.org/");
  });
});
