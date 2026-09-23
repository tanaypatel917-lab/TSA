import { describe, expect, it } from "vitest";
import { clearDraft, DRAFT_KEY, DRAFT_LIMIT, loadDraft, saveDraft } from "./drafts";

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("local activity drafts", () => {
  it("round trips text separately from progress and clears only the selected draft", () => {
    const storage = memoryStorage();
    storage.setItem("wordplay:progress:v1", "original-progress");
    expect(saveDraft("tools/prompt-lab", "A teacher explains climate", storage)).toBe(true);
    saveDraft("other", "Keep this", storage);
    expect(loadDraft("tools/prompt-lab", storage)).toEqual({ text: "A teacher explains climate", ok: true });
    expect(clearDraft("tools/prompt-lab", storage)).toBe(true);
    expect(loadDraft("tools/prompt-lab", storage)).toEqual({ text: "", ok: true });
    expect(loadDraft("other", storage).text).toBe("Keep this");
    expect(storage.getItem("wordplay:progress:v1")).toBe("original-progress");
  });
  it("reports read/write failures without throwing", () => {
    const storage = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("quota"); } };
    expect(loadDraft("tools/prompt-lab", storage).ok).toBe(false);
    expect(saveDraft("tools/prompt-lab", "draft", storage)).toBe(false);
    expect(clearDraft("tools/prompt-lab", storage)).toBe(false);
  });
  it("does not overwrite malformed drafts and bounds text size", () => {
    const storage = memoryStorage();
    expect(saveDraft("tools/prompt-lab", "x".repeat(DRAFT_LIMIT + 1), storage)).toBe(false);
    storage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, activities: { broken: [] } }));
    expect(loadDraft("tools/prompt-lab", storage).ok).toBe(false);
    expect(saveDraft("tools/prompt-lab", "draft", storage)).toBe(false);
    expect(storage.getItem(DRAFT_KEY)).toContain("broken");
  });
});
