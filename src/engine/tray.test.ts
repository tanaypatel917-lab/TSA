import { describe, expect, it } from "vitest";
import { loadTray, saveTray, toggleTerm, TRAY_KEY, TRAY_LIMIT } from "./tray";

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("word tray storage", () => {
  it("adds and removes a term in saved order", () => {
    expect(toggleTerm([], "Token")).toEqual(["Token"]);
    expect(toggleTerm(["Token", "Model"], "Token")).toEqual(["Model"]);
  });

  it("deduplicates terms and drops words outside the glossary", () => {
    const storage = memoryStorage();
    storage.setItem(TRAY_KEY, JSON.stringify({ version: 1, terms: ["Token", "Token", "unknown", "Model"] }));
    expect(loadTray(storage)).toEqual({ terms: ["Token", "Model"], ok: true });
  });

  it("never adds beyond the 60-term limit", () => {
    const full = Array.from({ length: TRAY_LIMIT }, (_, index) => `Term ${index}`);
    expect(toggleTerm(full, "One more")).toEqual(full);
    expect(toggleTerm(full, full[0])).toHaveLength(TRAY_LIMIT - 1);
  });

  it("returns an empty failed result for invalid JSON or storage shape", () => {
    const storage = memoryStorage();
    storage.setItem(TRAY_KEY, "{not-json");
    expect(loadTray(storage)).toEqual({ terms: [], ok: false });
    storage.setItem(TRAY_KEY, JSON.stringify({ version: 1, terms: ["Token", 12] }));
    expect(loadTray(storage)).toEqual({ terms: [], ok: false });
  });

  it("round trips versioned tray data", () => {
    const storage = memoryStorage();
    expect(saveTray(["Token", "Model"], storage)).toBe(true);
    expect(storage.getItem(TRAY_KEY)).toBe(JSON.stringify({ version: 1, terms: ["Token", "Model"] }));
    expect(loadTray(storage)).toEqual({ terms: ["Token", "Model"], ok: true });
  });
});
