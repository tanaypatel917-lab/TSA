import { describe, expect, it } from "vitest";
import { FOUND_KEY, loadFound, saveFound } from "./lostTokens";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }
  };
}

describe("lost token storage", () => {
  it("round trips versioned found-token data", () => {
    const storage = memoryStorage();
    expect(saveFound(["bos", "mask"], storage)).toBe(true);
    expect(storage.getItem(FOUND_KEY)).toBe(JSON.stringify({ version: 1, ids: ["bos", "mask"] }));
    expect(loadFound(storage)).toEqual({ ids: ["bos", "mask"], ok: true });
  });

  it("filters IDs that are not known collectibles", () => {
    const storage = memoryStorage();
    storage.setItem(FOUND_KEY, JSON.stringify({ version: 1, ids: ["bos", "unknown", "eos"] }));
    expect(loadFound(storage)).toEqual({ ids: ["bos", "eos"], ok: true });
  });

  it("reports corrupt JSON as a failed empty result", () => {
    const storage = memoryStorage();
    storage.setItem(FOUND_KEY, "{not-json");
    expect(loadFound(storage)).toEqual({ ids: [], ok: false });
  });

  it("deduplicates found IDs in saved data", () => {
    const storage = memoryStorage();
    storage.setItem(FOUND_KEY, JSON.stringify({ version: 1, ids: ["subword", "subword", "pad"] }));
    expect(loadFound(storage)).toEqual({ ids: ["subword", "pad"], ok: true });
  });
});
