import { glossary } from "@/content/glossary";

export const TRAY_KEY = "wordplay:tray:v1";
export const TRAY_LIMIT = 60;

type TrayStorage = Pick<Storage, "getItem" | "setItem">;
type StoredTray = { version: 1; terms: string[] };
const knownTerms = new Set(glossary.map(({ term }) => term));

function cleanTerms(terms: readonly string[]) {
  return [...new Set(terms.filter((term) => knownTerms.has(term)))].slice(0, TRAY_LIMIT);
}

export function loadTray(storage?: TrayStorage): { terms: string[]; ok: boolean } {
  try {
    const raw = (storage ?? window.localStorage).getItem(TRAY_KEY);
    if (raw === null) return { terms: [], ok: true };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") throw new Error("Invalid tray");
    const tray = value as Partial<StoredTray>;
    if (tray.version !== 1 || !Array.isArray(tray.terms) || !tray.terms.every((term) => typeof term === "string")) throw new Error("Invalid tray");
    return { terms: cleanTerms(tray.terms), ok: true };
  } catch {
    return { terms: [], ok: false };
  }
}

export function saveTray(terms: string[], storage?: TrayStorage): boolean {
  try {
    (storage ?? window.localStorage).setItem(TRAY_KEY, JSON.stringify({ version: 1, terms: [...new Set(terms)].slice(0, TRAY_LIMIT) }));
    return true;
  } catch {
    return false;
  }
}

export function toggleTerm(terms: readonly string[], term: string): string[] {
  const current = [...new Set(terms)].slice(0, TRAY_LIMIT);
  if (current.includes(term)) return current.filter((saved) => saved !== term);
  if (current.length >= TRAY_LIMIT) return current;
  return [...current, term];
}
