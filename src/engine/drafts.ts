export const DRAFT_KEY = "wordplay:drafts:v1";
export const DRAFT_LIMIT = 20000;
type Drafts = { version: 1; activities: Record<string, string> };
type DraftStorage = Pick<Storage, "getItem" | "setItem">;

function readAll(storage: DraftStorage): Drafts {
  const raw = storage.getItem(DRAFT_KEY);
  if (!raw) return { version: 1, activities: {} };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") throw new Error("Invalid drafts");
  const draft = value as Partial<Drafts>;
  if (draft.version !== 1 || !draft.activities || typeof draft.activities !== "object" || Array.isArray(draft.activities)
    || !Object.values(draft.activities).every((text) => typeof text === "string" && text.length <= DRAFT_LIMIT)) throw new Error("Invalid drafts");
  return { version: 1, activities: draft.activities };
}

export function loadDraft(id: string, storage?: DraftStorage): { text: string; ok: boolean } {
  try { return { text: readAll(storage ?? window.localStorage).activities[id] ?? "", ok: true }; }
  catch { return { text: "", ok: false }; }
}

export function saveDraft(id: string, text: string, storage?: DraftStorage): boolean {
  try {
    if (text.length > DRAFT_LIMIT) return false;
    const target = storage ?? window.localStorage;
    const drafts = readAll(target);
    target.setItem(DRAFT_KEY, JSON.stringify({ version: 1, activities: { ...drafts.activities, [id]: text } }));
    return true;
  } catch { return false; }
}

export function clearDraft(id: string, storage?: DraftStorage): boolean {
  try {
    const target = storage ?? window.localStorage;
    const drafts = readAll(target);
    const activities = Object.fromEntries(Object.entries(drafts.activities).filter(([key]) => key !== id));
    target.setItem(DRAFT_KEY, JSON.stringify({ version: 1, activities }));
    return true;
  } catch { return false; }
}
