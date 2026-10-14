import { describe, expect, it } from "vitest";
import { glossary } from "./glossary";
import { WORD_MAP_GROUPS } from "./wordMap";

describe("Word Map groups", () => {
  it("covers every glossary term exactly once", () => {
    const terms = WORD_MAP_GROUPS.flatMap((group) => group.terms);

    expect(terms).toHaveLength(20);
    expect(new Set(terms).size).toBe(terms.length);
    expect([...terms].sort()).toEqual(glossary.map((entry) => entry.term).sort());
  });
});
