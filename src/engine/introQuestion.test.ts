import { describe, expect, it } from "vitest";
import { galaxyClusters, introSuggestions } from "@/content/galaxy";
import { contentWords, galaxy, land, lookup, recommend } from "./introQuestion";

describe("the traveling question", () => {
  it("keeps the meaningful words, drops small ones, and normalizes AI names", () => {
    expect(contentWords("Can AI be wrong about my homework?")).toEqual(["ai", "wrong", "homework"]);
    expect(contentWords("How does Chat GPT learn things?")).toEqual(["chatgpt", "learn"]);
    expect(contentWords("the the and")).toEqual([]);
  });

  it("recommends a real lesson for every suggestion, and What AI is when nothing matches", () => {
    expect(recommend("Will AI take my job?").href).toBe("/modules/ai-in-the-real-world/lessons/careers");
    expect(recommend("Is it cheating to use AI for homework?").lesson).toBe("Learning honestly with AI");
    expect(recommend("Can AI be wrong?").href).toBe("/modules/ai-foundations/lessons/strengths-and-limits");
    expect(recommend("How does ChatGPT learn?").href).toBe("/modules/ai-foundations/lessons/language-models");
    expect(recommend("zzz")).toMatchObject({ href: "/modules/ai-foundations/lessons/what-is-ai", matched: false });
    for (const suggestion of introSuggestions) expect(recommend(suggestion).matched).toBe(true);
  });
});

describe("the word galaxy", () => {
  it("places every word once, inside the map, grouped by cluster", () => {
    const count = galaxyClusters.reduce((total, cluster) => total + cluster.words.length, 0);
    expect(galaxy).toHaveLength(count);
    expect(new Set(galaxy.map((point) => point.word)).size).toBe(count);
    for (const point of galaxy) expect(Math.hypot(point.x, point.y)).toBeLessThan(0.85);
  });

  it("lands known words next to neighbors from the same group, and matches simple word forms", () => {
    const wrong = land("wrong");
    expect(wrong.known).toBe(true);
    expect(wrong.neighbors).toHaveLength(3);
    expect(wrong.neighbors.every((word) => lookup(word)?.cluster === "truth")).toBe(true);
    expect(lookup("teachers")?.word).toBe("teacher");
    expect(lookup("learning")?.word).toBe("learn");
  });

  it("floats unknown words at the edge with no invented neighbors", () => {
    const odd = land("xylophonics");
    expect(odd).toMatchObject({ known: false, cluster: "new", neighbors: [] });
    expect(Math.hypot(odd.x, odd.y)).toBeCloseTo(0.95);
  });
});
