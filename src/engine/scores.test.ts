import { describe, expect, it } from "vitest";
import { boardKey, readBoard, recordScore, SCORES_KEY } from "./scores";

function memory() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("local scoreboard", () => {
  it("keeps the top five runs per board, ranked by score, and reports the new rank", () => {
    const storage = memory();
    const key = boardKey("tools", "expert");
    for (const [index, score] of [300, 900, 500, 100, 700, 200].entries()) recordScore(key, { score, stars: 1, day: "2027-01-01", at: index }, storage);
    expect(readBoard(key, storage).map((entry) => entry.score)).toEqual([900, 700, 500, 300, 200]);
    expect(recordScore(key, { score: 800, stars: 2, day: "2027-01-02", at: 9 }, storage).rank).toBe(2);
    expect(recordScore(key, { score: 50, stars: 0, day: "2027-01-02", at: 10 }, storage).rank).toBeNull();
    expect(readBoard(boardKey("tools", "standard"), storage)).toEqual([]);
  });

  it("survives corrupt storage", () => {
    const storage = memory();
    storage.setItem(SCORES_KEY, "not json");
    expect(readBoard("x", storage)).toEqual([]);
    expect(recordScore("x", { score: 10, stars: 0, day: "d", at: 1 }, storage).rank).toBe(1);
  });
});
