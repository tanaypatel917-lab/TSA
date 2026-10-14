import { LOST_TOKENS } from "@/content/lostTokens";

export const FOUND_KEY = "wordplay:found:v1";

type FoundStorage = Pick<Storage, "getItem" | "setItem">;
type StoredFound = { version: 1; ids: string[] };
const knownIds = new Set<string>(LOST_TOKENS.map(({ id }) => id));

function cleanIds(ids: readonly string[]) {
  return [...new Set(ids.filter((id) => knownIds.has(id)))];
}

export function loadFound(storage?: FoundStorage): { ids: string[]; ok: boolean } {
  try {
    const raw = (storage ?? window.localStorage).getItem(FOUND_KEY);
    if (raw === null) return { ids: [], ok: true };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") throw new Error("Invalid found tokens");
    const found = value as Partial<StoredFound>;
    if (found.version !== 1 || !Array.isArray(found.ids) || !found.ids.every((id) => typeof id === "string")) throw new Error("Invalid found tokens");
    return { ids: cleanIds(found.ids), ok: true };
  } catch {
    return { ids: [], ok: false };
  }
}

export function saveFound(ids: readonly string[], storage?: FoundStorage): boolean {
  try {
    (storage ?? window.localStorage).setItem(FOUND_KEY, JSON.stringify({ version: 1, ids: cleanIds(ids) }));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("wordplay:found"));
    return true;
  } catch {
    return false;
  }
}
